package drivers

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotDriver   = errors.New("driver profile not found")
	ErrNotApproved = errors.New("driver not approved")
	ErrUnavailable = errors.New("driver cannot become available")
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type Dashboard struct {
	DriverID         uuid.UUID  `json:"driver_id"`
	Status           string     `json:"status"`
	Availability     string     `json:"availability"`
	Rating           float64    `json:"rating"`
	TodayEarningsMMK int64      `json:"today_earnings_mmk"`
	TodayTripCount   int        `json:"today_trip_count"`
	CurrentRideID    *uuid.UUID `json:"current_ride_id,omitempty"`
	CurrentOfferID   *uuid.UUID `json:"current_offer_id,omitempty"`
	VehicleStatus    string     `json:"vehicle_status"`
	DocumentWarnings []string   `json:"document_warnings"`
}

func (s *Service) SetAvailability(ctx context.Context, userID uuid.UUID, target string) (string, error) {
	if target != "available" && target != "offline" && target != "paused" {
		return "", errors.New("unsupported availability")
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return "", err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var driverID uuid.UUID
	var status, current string
	err = tx.QueryRow(ctx, `SELECT id,status,availability FROM drivers WHERE user_id=$1 FOR UPDATE`, userID).Scan(&driverID, &status, &current)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotDriver
	}
	if err != nil {
		return "", err
	}
	if target == "available" {
		if status != "approved" {
			return "", ErrNotApproved
		}
		var eligible bool
		err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM vehicles v WHERE v.driver_id=$1 AND v.active AND v.status='approved') AND NOT EXISTS(SELECT 1 FROM driver_documents d JOIN driver_applications a ON a.id=d.application_id WHERE a.user_id=$2 AND d.status IN ('expired','rejected') OR (d.expires_on IS NOT NULL AND d.expires_on<CURRENT_DATE)) AND NOT EXISTS(SELECT 1 FROM rides WHERE driver_id=$1 AND status IN ('driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress'))`, driverID, userID).Scan(&eligible)
		if err != nil {
			return "", err
		}
		if !eligible {
			return "", ErrUnavailable
		}
	}
	_, err = tx.Exec(ctx, `UPDATE drivers SET availability=$1,last_heartbeat_at=CASE WHEN $1='available' THEN now() ELSE last_heartbeat_at END WHERE id=$2`, target, driverID)
	if err != nil {
		return "", err
	}
	if err = tx.Commit(ctx); err != nil {
		return "", err
	}
	return target, nil
}
func (s *Service) Heartbeat(ctx context.Context, userID uuid.UUID) error {
	tag, err := s.db.Exec(ctx, `UPDATE drivers SET last_heartbeat_at=now() WHERE user_id=$1 AND availability<>'offline'`, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrUnavailable
	}
	return nil
}
func (s *Service) Dashboard(ctx context.Context, userID uuid.UUID) (Dashboard, error) {
	var d Dashboard
	err := s.db.QueryRow(ctx, `SELECT dr.id,dr.status,dr.availability,dr.rating,coalesce((SELECT sum(net_mmk) FROM driver_earnings WHERE driver_id=dr.id AND created_at>=date_trunc('day',now() AT TIME ZONE 'Asia/Yangon') AT TIME ZONE 'Asia/Yangon'),0),coalesce((SELECT count(*) FROM rides WHERE driver_id=dr.id AND status='completed' AND completed_at>=date_trunc('day',now() AT TIME ZONE 'Asia/Yangon') AT TIME ZONE 'Asia/Yangon'),0),(SELECT id FROM rides WHERE driver_id=dr.id AND status IN ('driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress') LIMIT 1),(SELECT id FROM ride_offers WHERE driver_id=dr.id AND status='pending' AND expires_at>now() LIMIT 1),coalesce((SELECT status FROM vehicles WHERE driver_id=dr.id AND active LIMIT 1),'unavailable') FROM drivers dr WHERE dr.user_id=$1`, userID).Scan(&d.DriverID, &d.Status, &d.Availability, &d.Rating, &d.TodayEarningsMMK, &d.TodayTripCount, &d.CurrentRideID, &d.CurrentOfferID, &d.VehicleStatus)
	if errors.Is(err, pgx.ErrNoRows) {
		return Dashboard{}, ErrNotDriver
	}
	if err != nil {
		return Dashboard{}, err
	}
	rows, err := s.db.Query(ctx, `SELECT type||' expires '||expires_on::text FROM driver_documents dd JOIN driver_applications da ON da.id=dd.application_id WHERE da.user_id=$1 AND dd.expires_on BETWEEN CURRENT_DATE AND CURRENT_DATE+30 ORDER BY expires_on`, userID)
	if err != nil {
		return Dashboard{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var warning string
		if err = rows.Scan(&warning); err != nil {
			return Dashboard{}, err
		}
		d.DocumentWarnings = append(d.DocumentWarnings, warning)
	}
	return d, rows.Err()
}
func (s *Service) Earnings(ctx context.Context, userID uuid.UUID, from, to time.Time) ([]map[string]any, error) {
	rows, err := s.db.Query(ctx, `SELECT de.id,de.ride_id,de.gross_mmk,de.commission_mmk,de.net_mmk,de.created_at FROM driver_earnings de JOIN drivers d ON d.id=de.driver_id WHERE d.user_id=$1 AND de.created_at>=$2 AND de.created_at<$3 ORDER BY de.created_at DESC LIMIT 200`, userID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id, rideID uuid.UUID
		var gross, commission, net int64
		var created time.Time
		if err = rows.Scan(&id, &rideID, &gross, &commission, &net, &created); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "ride_id": rideID, "gross_mmk": gross, "commission_mmk": commission, "net_mmk": net, "created_at": created})
	}
	return out, rows.Err()
}
