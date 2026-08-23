package notifications

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/Filip2k03/labar-backend/internal/platform/push"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Worker struct {
	db   *pgxpool.Pool
	fcm  push.Provider
	apns push.Provider
}

type liveActivitySender interface {
	SendLiveActivity(context.Context, push.LiveActivityUpdate) (string, error)
}

func NewWorker(db *pgxpool.Pool, fcm, apns push.Provider) *Worker {
	return &Worker{db: db, fcm: fcm, apns: apns}
}
func (w *Worker) ProcessOne(ctx context.Context) (bool, error) {
	tx, err := w.db.Begin(ctx)
	if err != nil {
		return false, err
	}
	defer tx.Rollback(ctx)
	var deliveryID uuid.UUID
	var platform, token, category, title, body, channel string
	var liveSessionID *uuid.UUID
	var raw json.RawMessage
	err = tx.QueryRow(ctx, `SELECT nd.id,d.platform,CASE WHEN nd.channel='live_activity' THEN las.push_token ELSE d.push_token END,n.category,n.title,n.body,n.data,nd.channel,nd.live_activity_session_id FROM notification_deliveries nd JOIN notifications n ON n.id=nd.notification_id JOIN devices d ON d.id=nd.device_id LEFT JOIN live_activity_sessions las ON las.id=nd.live_activity_session_id WHERE nd.status='pending' AND nd.next_attempt_at<=now() AND (d.push_token IS NOT NULL OR las.push_token IS NOT NULL) ORDER BY nd.next_attempt_at FOR UPDATE OF nd SKIP LOCKED LIMIT 1`).Scan(&deliveryID, &platform, &token, &category, &title, &body, &raw, &channel, &liveSessionID)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if _, err = tx.Exec(ctx, `UPDATE notification_deliveries SET status='sending',attempts=attempts+1 WHERE id=$1`, deliveryID); err != nil {
		return false, err
	}
	if err = tx.Commit(ctx); err != nil {
		return false, err
	}
	data := map[string]string{}
	var values map[string]any
	if json.Unmarshal(raw, &values) == nil {
		for key, value := range values {
			if text, ok := value.(string); ok {
				data[key] = text
			}
		}
	}
	data["category"] = category
	provider := w.fcm
	if platform == "ios" {
		provider = w.apns
	}
	if provider == nil {
		return true, w.fail(ctx, deliveryID, push.ErrNotConfigured)
	}
	var reference string
	var sendErr error
	if channel == "live_activity" {
		sender, ok := w.apns.(liveActivitySender)
		if !ok {
			return true, w.fail(ctx, deliveryID, push.ErrNotConfigured)
		}
		state := make(map[string]any, len(values)+1)
		for key, value := range values {
			state[key] = value
		}
		state["category"] = category
		event := "update"
		if category == "trip_completed" {
			event = "end"
		}
		reference, sendErr = sender.SendLiveActivity(ctx, push.LiveActivityUpdate{Token: token, Event: event, State: state, AlertTitle: title, AlertBody: body})
	} else {
		reference, sendErr = provider.Send(ctx, push.Message{Token: token, Category: category, Title: title, Body: body, Data: data, HighPriority: category == "ride_request" || category == "safety"})
	}
	if sendErr != nil {
		return true, w.fail(ctx, deliveryID, sendErr)
	}
	_, err = w.db.Exec(ctx, `UPDATE notification_deliveries SET status='delivered',provider_reference=$2,delivered_at=now(),last_error=NULL WHERE id=$1`, deliveryID, reference)
	if err == nil && liveSessionID != nil && category == "trip_completed" {
		_, err = w.db.Exec(ctx, `UPDATE live_activity_sessions SET status='ended' WHERE id=$1`, *liveSessionID)
	}
	return true, err
}
func (w *Worker) fail(ctx context.Context, id uuid.UUID, cause error) error {
	_, err := w.db.Exec(ctx, `UPDATE notification_deliveries SET status=CASE WHEN attempts>=8 THEN 'failed' ELSE 'pending' END,last_error=$2,next_attempt_at=now()+make_interval(secs=>least(300,power(2,attempts)::int)) WHERE id=$1`, id, cause.Error())
	return err
}
func (w *Worker) Run(ctx context.Context) error {
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()
	for {
		processed, err := w.ProcessOne(ctx)
		if err != nil {
			return err
		}
		if processed {
			continue
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}
