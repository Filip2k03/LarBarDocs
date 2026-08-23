package admin

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/Filip2k03/labar-backend/internal/rides"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }
func (s *Service) Dashboard(ctx context.Context) (map[string]any, error) {
	var raw []byte
	err := s.db.QueryRow(ctx, `SELECT jsonb_build_object('rides_today',(SELECT count(*) FROM rides WHERE requested_at>=date_trunc('day',now())),'completed',(SELECT count(*) FROM rides WHERE status='completed' AND completed_at>=date_trunc('day',now())),'cancelled',(SELECT count(*) FROM rides WHERE status IN ('passenger_cancelled','driver_cancelled','system_cancelled') AND updated_at>=date_trunc('day',now())),'active',(SELECT count(*) FROM rides WHERE status IN ('searching','driver_offered','driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress')),'available_drivers',(SELECT count(*) FROM drivers WHERE availability='available'),'online_drivers',(SELECT count(*) FROM drivers WHERE availability<>'offline' AND last_heartbeat_at>now()-interval '45 seconds'),'gmv_mmk',(SELECT coalesce(sum(amount_mmk),0) FROM payments WHERE status='paid' AND created_at>=date_trunc('day',now())),'cash_mmk',(SELECT coalesce(sum(amount_mmk),0) FROM payments WHERE status IN ('cash_due','paid') AND method='cash' AND created_at>=date_trunc('day',now())),'digital_mmk',(SELECT coalesce(sum(amount_mmk),0) FROM payments WHERE status='paid' AND method<>'cash' AND created_at>=date_trunc('day',now())),'new_passengers',(SELECT count(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.name='passenger' WHERE u.created_at>=date_trunc('day',now())),'driver_applications',(SELECT count(*) FROM driver_applications WHERE status IN ('submitted','under_review','verification','documents_requested')),'support_tickets',(SELECT count(*) FROM support_tickets WHERE status NOT IN ('resolved','closed')),'safety_incidents',(SELECT count(*) FROM safety_events WHERE status='open'))`).Scan(&raw)
	if err != nil {
		return nil, err
	}
	var result map[string]any
	if err = json.Unmarshal(raw, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (s *Service) Rides(ctx context.Context, status string, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	rows, err := s.db.Query(ctx, `SELECT r.id,r.status,r.passenger_id,r.driver_id,r.estimated_total_mmk,r.final_total_mmk,r.requested_at,r.completed_at FROM rides r WHERE ($1='' OR r.status=$1) ORDER BY r.requested_at DESC LIMIT $2`, status, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []map[string]any
	for rows.Next() {
		var id, passengerID uuid.UUID
		var driverID *uuid.UUID
		var rideStatus string
		var estimate int64
		var final *int64
		var requested time.Time
		var completed *time.Time
		if err = rows.Scan(&id, &rideStatus, &passengerID, &driverID, &estimate, &final, &requested, &completed); err != nil {
			return nil, err
		}
		result = append(result, map[string]any{"id": id, "status": rideStatus, "passenger_id": passengerID, "driver_id": driverID, "estimated_total_mmk": estimate, "final_total_mmk": final, "requested_at": requested, "completed_at": completed})
	}
	return result, rows.Err()
}

func (s *Service) CancelRide(ctx context.Context, adminID, rideID uuid.UUID, reason, requestID string) error {
	if reason == "" {
		return errors.New("cancellation reason required")
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var from rides.Status
	var driverID *uuid.UUID
	var sequence int64
	err = tx.QueryRow(ctx, `SELECT status,driver_id,coalesce((SELECT max(sequence) FROM ride_events WHERE ride_id=$1),0) FROM rides WHERE id=$1 FOR UPDATE`, rideID).Scan(&from, &driverID, &sequence)
	if errors.Is(err, pgx.ErrNoRows) {
		return pgx.ErrNoRows
	}
	if err != nil {
		return err
	}
	if err = rides.ValidateTransition(from, rides.SystemCancelled); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE rides SET status='system_cancelled',updated_at=now(),version=version+1 WHERE id=$1`, rideID); err != nil {
		return err
	}
	if driverID != nil {
		if _, err = tx.Exec(ctx, `UPDATE drivers SET availability='available' WHERE id=$1`, *driverID); err != nil {
			return err
		}
	}
	if _, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id,metadata) VALUES($1,$2,'ride.system_cancelled','admin',$3,jsonb_build_object('reason',$4))`, rideID, sequence+1, adminID, reason); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,before_data,after_data,request_id) VALUES($1,'admin','ride.cancel','ride',$2::text,jsonb_build_object('status',$3),jsonb_build_object('status','system_cancelled','reason',$4),$5)`, adminID, rideID, from, reason, requestID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Service) Audit(ctx context.Context, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	rows, err := s.db.Query(ctx, `SELECT id,actor_id,actor_type,action,resource_type,resource_id,before_data,after_data,request_id,created_at FROM audit_logs ORDER BY created_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id string
		var actorID *string
		var actorType, action, resourceType, resourceID, requestID string
		var before, after json.RawMessage
		var created any
		if err = rows.Scan(&id, &actorID, &actorType, &action, &resourceType, &resourceID, &before, &after, &requestID, &created); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "actor_id": actorID, "actor_type": actorType, "action": action, "resource_type": resourceType, "resource_id": resourceID, "before": before, "after": after, "request_id": requestID, "created_at": created})
	}
	return out, rows.Err()
}
