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
	"github.com/Filip2k03/labar-backend/internal/platform/config"
	"github.com/Filip2k03/labar-backend/internal/platform/database"
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
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
	go func() { <-signals; cancel() }()
	workerID := uuid.NewString()
	for ctx.Err() == nil {
		j, claimErr := claim(ctx, db, workerID)
		if errors.Is(claimErr, pgx.ErrNoRows) {
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
		processErr := process(ctx, dispatcher, j)
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
func process(ctx context.Context, dispatcher *dispatch.Service, j job) error {
	var payload struct {
		RideID  uuid.UUID `json:"ride_id"`
		OfferID uuid.UUID `json:"offer_id"`
	}
	if err := json.Unmarshal(j.Payload, &payload); err != nil {
		return err
	}
	switch j.Type {
	case "ride.dispatch":
		return dispatcher.Dispatch(ctx, payload.RideID)
	case "dispatch.offer_timeout":
		return dispatcher.ExpireOffer(ctx, payload.OfferID)
	default:
		return nil
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
