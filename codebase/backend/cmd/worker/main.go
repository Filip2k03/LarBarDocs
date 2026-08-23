package main

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Filip2k03/labar-backend/internal/dispatch"
	"github.com/Filip2k03/labar-backend/internal/notifications"
	paymentservice "github.com/Filip2k03/labar-backend/internal/payments"
	"github.com/Filip2k03/labar-backend/internal/platform/config"
	"github.com/Filip2k03/labar-backend/internal/platform/database"
	platformpayments "github.com/Filip2k03/labar-backend/internal/platform/payments"
	"github.com/Filip2k03/labar-backend/internal/platform/push"
	platformredis "github.com/Filip2k03/labar-backend/internal/platform/redis"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

type job struct {
	ID       uuid.UUID
	Type     string
	Payload  json.RawMessage
	Attempts int
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("invalid configuration")
	}
	ctx, cancel := context.WithCancel(context.Background())
	db, err := database.Open(ctx, cfg.DatabaseURL, cfg.EncryptionKey)
	if err != nil {
		log.Fatal().Err(err).Msg("database unavailable")
	}
	defer db.Close()
	redisClient, err := platformredis.Open(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Redis unavailable")
	}
	defer redisClient.Close()
	dispatcher := dispatch.NewService(db, redisClient)
	var fcmProvider push.Provider
	if cfg.FCMProjectID != "" && cfg.FCMCredentials != "" {
		fcmProvider, err = push.NewFCM(cfg.FCMProjectID, cfg.FCMCredentials)
		if err != nil {
			log.Fatal().Err(err).Msg("FCM configuration invalid")
		}
	}
	var apnsProvider push.Provider
	if cfg.APNSTeamID != "" && cfg.APNSKeyID != "" && cfg.APNSBundleID != "" && cfg.APNSKeyFile != "" {
		apnsProvider, err = push.NewAPNS(cfg.APNSTeamID, cfg.APNSKeyID, cfg.APNSBundleID, cfg.APNSKeyFile, cfg.Environment == "production")
		if err != nil {
			log.Fatal().Err(err).Msg("APNs configuration invalid")
		}
	}
	notificationWorker := notifications.NewWorker(db, fcmProvider, apnsProvider)
	var paymentProvider platformpayments.Provider
	if cfg.PaymentProvider != "" {
		paymentProvider, err = platformpayments.NewHTTP(cfg.PaymentEndpoint, cfg.PaymentAPIKey)
		if err != nil {
			log.Fatal().Err(err).Msg("payment provider configuration invalid")
		}
	}
	paymentService := paymentservice.NewService(db, paymentProvider)
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
	go func() { <-signals; cancel() }()
	workerID := uuid.NewString()
	for ctx.Err() == nil {
		j, claimErr := claim(ctx, db, workerID)
		if errors.Is(claimErr, pgx.ErrNoRows) {
			processed, deliveryErr := notificationWorker.ProcessOne(ctx)
			if deliveryErr != nil {
				log.Error().Err(deliveryErr).Msg("push delivery failed")
			}
			if processed {
				continue
			}
			select {
			case <-ctx.Done():
			case <-time.After(500 * time.Millisecond):
			}
			continue
		}
		if claimErr != nil {
			log.Error().Err(claimErr).Msg("claim job failed")
			time.Sleep(time.Second)
			continue
		}
		processErr := process(ctx, db, dispatcher, paymentService, j)
		if finishErr := finish(ctx, db, j, processErr); finishErr != nil {
			log.Error().Err(finishErr).Str("job_id", j.ID.String()).Msg("finish job failed")
		}
	}
}
func claim(ctx context.Context, db *pgxpool.Pool, workerID string) (job, error) {
	tx, err := db.Begin(ctx)
	if err != nil {
		return job{}, err
	}
	defer tx.Rollback(ctx)
	var j job
	err = tx.QueryRow(ctx, `SELECT id,type,payload,attempts FROM jobs WHERE status='pending' AND run_at<=now() ORDER BY run_at,created_at FOR UPDATE SKIP LOCKED LIMIT 1`).Scan(&j.ID, &j.Type, &j.Payload, &j.Attempts)
	if err != nil {
		return job{}, err
	}
	_, err = tx.Exec(ctx, `UPDATE jobs SET status='running',locked_at=now(),locked_by=$1,attempts=attempts+1 WHERE id=$2`, workerID, j.ID)
	if err != nil {
		return job{}, err
	}
	return j, tx.Commit(ctx)
}
func process(ctx context.Context, db *pgxpool.Pool, dispatcher *dispatch.Service, paymentService *paymentservice.Service, j job) error {
	var payload struct {
		RideID    uuid.UUID `json:"ride_id"`
		OfferID   uuid.UUID `json:"offer_id"`
		PaymentID uuid.UUID `json:"payment_id"`
	}
	if err := json.Unmarshal(j.Payload, &payload); err != nil {
		return err
	}
	switch j.Type {
	case "ride.dispatch":
		return dispatcher.Dispatch(ctx, payload.RideID)
	case "dispatch.offer_timeout":
		return dispatcher.ExpireOffer(ctx, payload.OfferID)
	case "payment.capture":
		return paymentService.Capture(ctx, payload.PaymentID)
	case "notification.ride_assigned":
		_, err := db.Exec(ctx, `INSERT INTO notifications(user_id,category,title,body,data) SELECT passenger_id,'driver_arriving','Driver assigned','Your driver is on the way',jsonb_build_object('ride_id',id::text) FROM rides WHERE id=$1`, payload.RideID)
		return err
	case "notification.trip_completed":
		_, err := db.Exec(ctx, `INSERT INTO notifications(user_id,category,title,body,data) SELECT passenger_id,'trip_completed','Trip completed','Your receipt is ready',jsonb_build_object('ride_id',id::text) FROM rides WHERE id=$1`, payload.RideID)
		return err
	case "notification.driver_application_submitted":
		_, err := db.Exec(ctx, `INSERT INTO notifications(user_id,category,title,body,data) SELECT user_id,'driver_registration','Application submitted','We received your driver application',jsonb_build_object('application_id',id::text) FROM driver_applications WHERE id=(($1::jsonb->>'application_id')::uuid)`, string(j.Payload))
		return err
	case "notification.driver_approved":
		_, err := db.Exec(ctx, `INSERT INTO notifications(user_id,category,title,body,data) SELECT user_id,'driver_registration','Application approved','Your LaBar driver application was approved',jsonb_build_object('application_id',id::text) FROM driver_applications WHERE id=(($1::jsonb->>'application_id')::uuid)`, string(j.Payload))
		return err
	case "receipt.create":
		// Receipts are immutable projections of ride, pricing and payment rows and are served on demand.
		return nil
	default:
		return errors.New("unsupported job type: " + j.Type)
	}
}
func finish(ctx context.Context, db *pgxpool.Pool, j job, processErr error) error {
	if processErr == nil {
		_, err := db.Exec(ctx, `UPDATE jobs SET status='completed',completed_at=now(),locked_at=NULL,locked_by=NULL WHERE id=$1`, j.ID)
		return err
	}
	delay := time.Duration(1<<min(j.Attempts, 8)) * time.Second
	_, err := db.Exec(ctx, `UPDATE jobs SET status=CASE WHEN attempts>=max_attempts THEN 'failed' ELSE 'pending' END,last_error=$2,run_at=now()+$3::interval,locked_at=NULL,locked_by=NULL WHERE id=$1`, j.ID, processErr.Error(), delay.String())
	return err
}
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
