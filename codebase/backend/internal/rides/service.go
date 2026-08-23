package rides

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/Filip2k03/labar-backend/internal/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrIdempotencyConflict = errors.New("idempotency key reused with different request")
	ErrRideNotFound        = errors.New("ride not found")
)

type Service struct {
	db  *pgxpool.Pool
	now func() time.Time
}

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db, now: time.Now} }

type CreateRequest struct {
	QuoteID       uuid.UUID `json:"quote_id"`
	RideTypeID    uuid.UUID `json:"ride_type_id"`
	PaymentMethod string    `json:"payment_method"`
	Notes         string    `json:"notes"`
}
type Ride struct {
	ID                uuid.UUID        `json:"id"`
	PassengerID       uuid.UUID        `json:"passenger_id"`
	DriverID          *uuid.UUID       `json:"driver_id,omitempty"`
	VehicleID         *uuid.UUID       `json:"vehicle_id,omitempty"`
	QuoteID           uuid.UUID        `json:"quote_id"`
	RideTypeID        uuid.UUID        `json:"ride_type_id"`
	Status            Status           `json:"status"`
	PickupLat         float64          `json:"pickup_lat"`
	PickupLng         float64          `json:"pickup_lng"`
	DestinationLat    float64          `json:"destination_lat"`
	DestinationLng    float64          `json:"destination_lng"`
	PaymentMethod     string           `json:"payment_method"`
	EstimatedTotalMMK domain.MoneyMMK  `json:"estimated_total_mmk"`
	FinalTotalMMK     *domain.MoneyMMK `json:"final_total_mmk,omitempty"`
	RequestedAt       time.Time        `json:"requested_at"`
	StartedAt         *time.Time       `json:"started_at,omitempty"`
	CompletedAt       *time.Time       `json:"completed_at,omitempty"`
	Version           int64            `json:"version"`
}
type Event struct {
	ID        uuid.UUID      `json:"id"`
	Sequence  int64          `json:"sequence"`
	EventType string         `json:"event_type"`
	ActorType string         `json:"actor_type"`
	ActorID   *uuid.UUID     `json:"actor_id,omitempty"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"created_at"`
}

func (s *Service) Create(ctx context.Context, passengerID uuid.UUID, idempotencyKey string, request CreateRequest) (Ride, bool, error) {
	if idempotencyKey == "" {
		return Ride{}, false, errors.New("Idempotency-Key required")
	}
	if !validPayment(request.PaymentMethod) {
		return Ride{}, false, errors.New("unsupported payment method")
	}
	payload, _ := json.Marshal(request)
	requestHash := sha256.Sum256(payload)
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Ride{}, false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `INSERT INTO idempotency_keys(scope,actor_id,key,request_hash,expires_at) VALUES('ride.create',$1,$2,$3,now()+interval '24 hours') ON CONFLICT DO NOTHING`, passengerID, idempotencyKey, requestHash[:])
	if err != nil {
		return Ride{}, false, err
	}
	if tag.RowsAffected() == 0 {
		var storedHash []byte
		var response []byte
		err = tx.QueryRow(ctx, `SELECT request_hash,response_body FROM idempotency_keys WHERE scope='ride.create' AND actor_id=$1 AND key=$2`, passengerID, idempotencyKey).Scan(&storedHash, &response)
		if err != nil {
			return Ride{}, false, err
		}
		if !equal(storedHash, requestHash[:]) {
			return Ride{}, false, ErrIdempotencyConflict
		}
		if len(response) == 0 {
			return Ride{}, false, ErrIdempotencyConflict
		}
		var ride Ride
		if err = json.Unmarshal(response, &ride); err != nil {
			return Ride{}, false, err
		}
		return ride, true, nil
	}
	var cityID, versionID uuid.UUID
	var pickupLng, pickupLat, destLng, destLat float64
	var total int64
	var expires time.Time
	err = tx.QueryRow(ctx, `SELECT q.city_id,q.pricing_version_id,ST_X(q.pickup::geometry),ST_Y(q.pickup::geometry),ST_X(q.destination::geometry),ST_Y(q.destination::geometry),o.total_mmk,q.expires_at FROM fare_quotes q JOIN fare_quote_options o ON o.quote_id=q.id AND o.ride_type_id=$2 WHERE q.id=$1 AND (q.passenger_id IS NULL OR q.passenger_id=$3)`, request.QuoteID, request.RideTypeID, passengerID).Scan(&cityID, &versionID, &pickupLng, &pickupLat, &destLng, &destLat, &total, &expires)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ride{}, false, ErrRideNotFound
	}
	if err != nil {
		return Ride{}, false, err
	}
	if !s.now().Before(expires) {
		return Ride{}, false, errors.New("quote expired")
	}
	ride := Ride{ID: uuid.New(), PassengerID: passengerID, QuoteID: request.QuoteID, RideTypeID: request.RideTypeID, Status: Searching, PickupLat: pickupLat, PickupLng: pickupLng, DestinationLat: destLat, DestinationLng: destLng, PaymentMethod: request.PaymentMethod, EstimatedTotalMMK: domain.MoneyMMK(total), RequestedAt: s.now().UTC(), Version: 2}
	_, err = tx.Exec(ctx, `INSERT INTO rides(id,passenger_id,quote_id,ride_type_id,city_id,pricing_version_id,status,pickup,destination,notes,payment_method,estimated_total_mmk,requested_at,version) VALUES($1,$2,$3,$4,$5,$6,$7,ST_SetSRID(ST_MakePoint($8,$9),4326)::geography,ST_SetSRID(ST_MakePoint($10,$11),4326)::geography,$12,$13,$14,$15,2)`, ride.ID, passengerID, request.QuoteID, request.RideTypeID, cityID, versionID, Searching, pickupLng, pickupLat, destLng, destLat, request.Notes, request.PaymentMethod, total, ride.RequestedAt)
	if err != nil {
		return Ride{}, false, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id) VALUES($1,1,'ride.requested','passenger',$2),($1,2,'ride.searching','system',NULL)`, ride.ID, passengerID)
	if err != nil {
		return Ride{}, false, err
	}
	jobPayload, _ := json.Marshal(map[string]any{"ride_id": ride.ID})
	_, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('ride.dispatch',$1)`, jobPayload)
	if err != nil {
		return Ride{}, false, err
	}
	encoded, _ := json.Marshal(ride)
	_, err = tx.Exec(ctx, `UPDATE idempotency_keys SET response_status=201,response_body=$1 WHERE scope='ride.create' AND actor_id=$2 AND key=$3`, encoded, passengerID, idempotencyKey)
	if err != nil {
		return Ride{}, false, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Ride{}, false, err
	}
	return ride, false, nil
}
func (s *Service) Get(ctx context.Context, rideID, userID uuid.UUID, roles []string) (Ride, error) {
	query := `SELECT id,passenger_id,driver_id,vehicle_id,quote_id,ride_type_id,status,ST_Y(pickup::geometry),ST_X(pickup::geometry),ST_Y(destination::geometry),ST_X(destination::geometry),payment_method,estimated_total_mmk,final_total_mmk,requested_at,started_at,completed_at,version FROM rides WHERE id=$1 AND (passenger_id=$2 OR driver_id IN(SELECT id FROM drivers WHERE user_id=$2)`
	args := []any{rideID, userID}
	if privileged(roles) {
		query = `SELECT id,passenger_id,driver_id,vehicle_id,quote_id,ride_type_id,status,ST_Y(pickup::geometry),ST_X(pickup::geometry),ST_Y(destination::geometry),ST_X(destination::geometry),payment_method,estimated_total_mmk,final_total_mmk,requested_at,started_at,completed_at,version FROM rides WHERE id=$1`
		args = []any{rideID}
	} else {
		query += `)`
	}
	var r Ride
	err := s.db.QueryRow(ctx, query, args...).Scan(&r.ID, &r.PassengerID, &r.DriverID, &r.VehicleID, &r.QuoteID, &r.RideTypeID, &r.Status, &r.PickupLat, &r.PickupLng, &r.DestinationLat, &r.DestinationLng, &r.PaymentMethod, &r.EstimatedTotalMMK, &r.FinalTotalMMK, &r.RequestedAt, &r.StartedAt, &r.CompletedAt, &r.Version)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ride{}, ErrRideNotFound
	}
	return r, err
}
func (s *Service) Transition(ctx context.Context, rideID uuid.UUID, to Status, actorType string, actorID *uuid.UUID, metadata map[string]any) (Ride, error) {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Ride{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var from Status
	var sequence, version int64
	err = tx.QueryRow(ctx, `SELECT status,version,coalesce((SELECT max(sequence) FROM ride_events WHERE ride_id=$1),0) FROM rides WHERE id=$1 FOR UPDATE`, rideID).Scan(&from, &version, &sequence)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ride{}, ErrRideNotFound
	}
	if err != nil {
		return Ride{}, err
	}
	if err = ValidateTransition(from, to); err != nil {
		return Ride{}, err
	}
	encoded, _ := json.Marshal(metadata)
	_, err = tx.Exec(ctx, `UPDATE rides SET status=$1,version=version+1,updated_at=now(),started_at=CASE WHEN $1='in_progress' THEN now() ELSE started_at END,completed_at=CASE WHEN $1='completed' THEN now() ELSE completed_at END WHERE id=$2`, to, rideID)
	if err != nil {
		return Ride{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id,metadata) VALUES($1,$2,$3,$4,$5,$6)`, rideID, sequence+1, "ride."+string(to), actorType, actorID, encoded)
	if err != nil {
		return Ride{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Ride{}, err
	}
	return s.Get(ctx, rideID, actor(actorID), []string{"admin"})
}
func (s *Service) Events(ctx context.Context, rideID uuid.UUID, after int64, limit int) ([]Event, error) {
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	rows, err := s.db.Query(ctx, `SELECT id,sequence,event_type,actor_type,actor_id,metadata,created_at FROM ride_events WHERE ride_id=$1 AND sequence>$2 ORDER BY sequence LIMIT $3`, rideID, after, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Event
	for rows.Next() {
		var e Event
		var raw []byte
		if err = rows.Scan(&e.ID, &e.Sequence, &e.EventType, &e.ActorType, &e.ActorID, &raw, &e.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &e.Metadata)
		out = append(out, e)
	}
	return out, rows.Err()
}
func validPayment(method string) bool {
	switch method {
	case "cash", "wallet", "kbzpay", "wavepay", "ayapay":
		return true
	}
	return false
}
func equal(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	var diff byte
	for i := range a {
		diff |= a[i] ^ b[i]
	}
	return diff == 0
}
func privileged(roles []string) bool {
	for _, role := range roles {
		if role == "admin" || role == "super_admin" || role == "dispatcher" || role == "operations_manager" {
			return true
		}
	}
	return false
}
func actor(id *uuid.UUID) uuid.UUID {
	if id == nil {
		return uuid.Nil
	}
	return *id
}
func (s *Service) Cancel(ctx context.Context, rideID, userID uuid.UUID, actorType, reason string) (Ride, error) {
	target := PassengerCancelled
	if actorType == "driver" {
		target = DriverCancelled
	}
	return s.Transition(ctx, rideID, target, actorType, &userID, map[string]any{"reason": reason})
}
func (s *Service) Receipt(ctx context.Context, rideID, passengerID uuid.UUID) (map[string]any, error) {
	var result map[string]any
	var raw []byte
	err := s.db.QueryRow(ctx, `SELECT jsonb_build_object('ride_id',r.id,'pricing_version_id',r.pricing_version_id,'distance_meters',r.trip_distance_meters,'duration_seconds',r.trip_duration_seconds,'low_speed_seconds',r.low_speed_seconds,'estimated_total_mmk',r.estimated_total_mmk,'final_total_mmk',r.final_total_mmk,'payment_method',r.payment_method,'payment_status',p.status,'requested_at',r.requested_at,'started_at',r.started_at,'completed_at',r.completed_at,'breakdown',fqo.breakdown) FROM rides r JOIN fare_quote_options fqo ON fqo.quote_id=r.quote_id AND fqo.ride_type_id=r.ride_type_id LEFT JOIN payments p ON p.ride_id=r.id WHERE r.id=$1 AND r.passenger_id=$2`, rideID, passengerID).Scan(&raw)
	if err != nil {
		return nil, fmt.Errorf("receipt: %w", err)
	}
	if err = json.Unmarshal(raw, &result); err != nil {
		return nil, err
	}
	return result, nil
}
func (s *Service) DriverTransition(ctx context.Context, userID, rideID uuid.UUID, to Status) (Ride, error) {
	ride, err := s.Get(ctx, rideID, userID, nil)
	if err != nil {
		return Ride{}, err
	}
	if ride.DriverID == nil {
		return Ride{}, ErrRideNotFound
	}
	if to == DriverArrived {
		var near bool
		err = s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM rides r JOIN drivers d ON d.id=r.driver_id JOIN LATERAL(SELECT location FROM trip_location_samples WHERE ride_id=r.id ORDER BY created_at DESC LIMIT 1) l ON true WHERE r.id=$1 AND d.user_id=$2 AND ST_DWithin(r.pickup,l.location,250))`, rideID, userID).Scan(&near)
		if err != nil {
			return Ride{}, err
		}
		if !near {
			return Ride{}, errors.New("driver is outside pickup geofence")
		}
	}
	return s.Transition(ctx, rideID, to, "driver", ride.DriverID, nil)
}
func (s *Service) Complete(ctx context.Context, userID, rideID uuid.UUID) (Ride, error) {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return Ride{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var driverID, passengerID, rideTypeID, versionID uuid.UUID
	var status Status
	var distance, duration, lowSpeed int64
	var method string
	err = tx.QueryRow(ctx, `SELECT r.driver_id,r.passenger_id,r.ride_type_id,r.pricing_version_id,r.status,r.trip_distance_meters,r.trip_duration_seconds,r.low_speed_seconds,r.payment_method FROM rides r JOIN drivers d ON d.id=r.driver_id WHERE r.id=$1 AND d.user_id=$2 FOR UPDATE OF r`, rideID, userID).Scan(&driverID, &passengerID, &rideTypeID, &versionID, &status, &distance, &duration, &lowSpeed, &method)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ride{}, ErrRideNotFound
	}
	if err != nil {
		return Ride{}, err
	}
	if err = ValidateTransition(status, Completed); err != nil {
		return Ride{}, err
	}
	var base, included, perKM, lowPerMinute, minimum, booking, service, commissionBPS int64
	var multiplier float64
	err = tx.QueryRow(ctx, `SELECT base_fare_mmk,included_distance_meters,per_km_mmk,low_speed_per_minute_mmk,minimum_fare_mmk,booking_fee_mmk,service_fee_mmk,multiplier,driver_commission_bps FROM fare_plans WHERE fare_version_id=$1 AND ride_type_id=$2`, versionID, rideTypeID).Scan(&base, &included, &perKM, &lowPerMinute, &minimum, &booking, &service, &multiplier, &commissionBPS)
	if err != nil {
		return Ride{}, err
	}
	extra := distance - included
	if extra < 0 {
		extra = 0
	}
	distanceFare := int64(math.Ceil(float64(extra*perKM) / 1000))
	lowFare := int64(math.Ceil(float64(lowSpeed)/60)) * lowPerMinute
	transport := int64(math.Ceil(float64(base+distanceFare+lowFare) * multiplier))
	if transport < minimum {
		transport = minimum
	}
	total := transport + booking + service
	paymentStatus := "pending"
	provider := method
	if method == "cash" {
		paymentStatus = "cash_due"
		provider = "cash"
	}
	paymentID := uuid.New()
	gross := total
	commission := gross * commissionBPS / 10000
	net := gross - commission
	var sequence int64
	if err = tx.QueryRow(ctx, `SELECT coalesce(max(sequence),0) FROM ride_events WHERE ride_id=$1`, rideID).Scan(&sequence); err != nil {
		return Ride{}, err
	}
	_, err = tx.Exec(ctx, `UPDATE rides SET status='completed',final_total_mmk=$1,completed_at=now(),updated_at=now(),version=version+1 WHERE id=$2;UPDATE drivers SET availability='available',completed_rides=completed_rides+1 WHERE id=$3;UPDATE passenger_profiles SET completed_trip_count=completed_trip_count+1 WHERE user_id=$4;INSERT INTO payments(id,ride_id,user_id,method,provider,amount_mmk,status,idempotency_key) VALUES($5,$2,$4,$6,$7,$1,$8,'ride-complete-'||$2::text);INSERT INTO driver_earnings(driver_id,ride_id,gross_mmk,commission_mmk,net_mmk,pricing_version_id) VALUES($3,$2,$9,$10,$11,$12);INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id,metadata) VALUES($2,$13,'ride.completed','driver',$3,jsonb_build_object('distance_meters',$14,'duration_seconds',$15,'low_speed_seconds',$16,'final_total_mmk',$1,'payment_id',$5::text));INSERT INTO jobs(type,payload) VALUES('notification.trip_completed',jsonb_build_object('ride_id',$2::text,'payment_id',$5::text)),('receipt.create',jsonb_build_object('ride_id',$2::text))`, total, rideID, driverID, passengerID, paymentID, method, provider, paymentStatus, gross, commission, net, versionID, sequence+1, distance, duration, lowSpeed)
	if err != nil {
		return Ride{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Ride{}, err
	}
	return s.Get(ctx, rideID, userID, []string{"admin"})
}
