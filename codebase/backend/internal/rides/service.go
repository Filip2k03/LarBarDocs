package rides

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"math/big"
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
	QuoteID         uuid.UUID  `json:"quote_id"`
	RideTypeID      uuid.UUID  `json:"ride_type_id"`
	PaymentMethod   string     `json:"payment_method"`
	PaymentMethodID *uuid.UUID `json:"payment_method_id,omitempty"`
	Notes           string     `json:"notes"`
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
	PickupPIN         string           `json:"pickup_pin,omitempty"`
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
	if request.PaymentMethod != "cash" && request.PaymentMethod != "wallet" {
		if request.PaymentMethodID == nil {
			return Ride{}, false, errors.New("payment_method_id required for digital payments")
		}
		var valid bool
		if err := s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM payment_methods WHERE id=$1 AND user_id=$2 AND type=$3 AND status='active')`, *request.PaymentMethodID, passengerID, request.PaymentMethod).Scan(&valid); err != nil {
			return Ride{}, false, err
		}
		if !valid {
			return Ride{}, false, errors.New("invalid payment method")
		}
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
		if ride.Status != PickupConfirmed && ride.Status != InProgress && ride.Status != Completed {
			_ = tx.QueryRow(ctx, `SELECT pgp_sym_decrypt(pickup_pin_ciphertext,current_setting('app.encryption_key')) FROM rides WHERE id=$1 AND passenger_id=$2`, ride.ID, passengerID).Scan(&ride.PickupPIN)
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
	pin, err := newPickupPIN()
	if err != nil {
		return Ride{}, false, err
	}
	pinHash := sha256.Sum256([]byte(pin))
	ride := Ride{ID: uuid.New(), PassengerID: passengerID, QuoteID: request.QuoteID, RideTypeID: request.RideTypeID, Status: Searching, PickupLat: pickupLat, PickupLng: pickupLng, DestinationLat: destLat, DestinationLng: destLng, PaymentMethod: request.PaymentMethod, EstimatedTotalMMK: domain.MoneyMMK(total), RequestedAt: s.now().UTC(), Version: 2, PickupPIN: pin}
	_, err = tx.Exec(ctx, `INSERT INTO rides(id,passenger_id,quote_id,ride_type_id,city_id,pricing_version_id,status,pickup,destination,notes,payment_method,payment_method_id,estimated_total_mmk,requested_at,version,pickup_pin_hash,pickup_pin_ciphertext) VALUES($1,$2,$3,$4,$5,$6,$7,ST_SetSRID(ST_MakePoint($8,$9),4326)::geography,ST_SetSRID(ST_MakePoint($10,$11),4326)::geography,$12,$13,$14,$15,$16,2,$17,pgp_sym_encrypt($18,current_setting('app.encryption_key')))`, ride.ID, passengerID, request.QuoteID, request.RideTypeID, cityID, versionID, Searching, pickupLng, pickupLat, destLng, destLat, request.Notes, request.PaymentMethod, request.PaymentMethodID, total, ride.RequestedAt, pinHash[:], pin)
	if err != nil {
		return Ride{}, false, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id) VALUES($1,1,'ride.requested','passenger',$2),($1,2,'ride.searching','system',NULL)`, ride.ID, passengerID)
	if err != nil {
		return Ride{}, false, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO promo_redemptions(promotion_id,promo_code_id,user_id,quote_id,ride_id,discount_mmk) SELECT pc.promotion_id,q.promo_code_id,$2,q.id,$1,o.discount_mmk FROM fare_quotes q JOIN promo_codes pc ON pc.id=q.promo_code_id JOIN fare_quote_options o ON o.quote_id=q.id AND o.ride_type_id=$3 WHERE q.id=$4 AND q.promo_code_id IS NOT NULL AND o.discount_mmk>0`, ride.ID, passengerID, request.RideTypeID, request.QuoteID)
	if err != nil {
		return Ride{}, false, err
	}
	jobPayload, _ := json.Marshal(map[string]any{"ride_id": ride.ID})
	_, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('ride.dispatch',$1)`, jobPayload)
	if err != nil {
		return Ride{}, false, err
	}
	storedRide := ride
	storedRide.PickupPIN = ""
	encoded, _ := json.Marshal(storedRide)
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
	if err == nil && r.PassengerID == userID && r.Status != PickupConfirmed && r.Status != InProgress && r.Status != Completed {
		_ = s.db.QueryRow(ctx, `SELECT pgp_sym_decrypt(pickup_pin_ciphertext,current_setting('app.encryption_key')) FROM rides WHERE id=$1 AND passenger_id=$2`, rideID, userID).Scan(&r.PickupPIN)
	}
	return r, err
}

func (s *Service) VerifyPickupPIN(ctx context.Context, userID, rideID uuid.UUID, pin string) (Ride, error) {
	if len(pin) != 4 {
		return Ride{}, errors.New("pickup PIN must contain four digits")
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Ride{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var stored []byte
	var from Status
	var driverID uuid.UUID
	var sequence int64
	err = tx.QueryRow(ctx, `SELECT r.pickup_pin_hash,r.status,r.driver_id,coalesce((SELECT max(sequence) FROM ride_events WHERE ride_id=r.id),0) FROM rides r JOIN drivers d ON d.id=r.driver_id WHERE r.id=$1 AND d.user_id=$2 FOR UPDATE OF r`, rideID, userID).Scan(&stored, &from, &driverID, &sequence)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ride{}, ErrRideNotFound
	}
	if err != nil {
		return Ride{}, err
	}
	if err = ValidateTransition(from, PickupConfirmed); err != nil {
		return Ride{}, err
	}
	digest := sha256.Sum256([]byte(pin))
	if subtle.ConstantTimeCompare(stored, digest[:]) != 1 {
		return Ride{}, errors.New("invalid pickup PIN")
	}
	if _, err = tx.Exec(ctx, `UPDATE rides SET status='pickup_confirmed',pickup_pin_ciphertext=NULL,version=version+1,updated_at=now() WHERE id=$1`, rideID); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id) VALUES($1,$2,'ride.pickup_confirmed','driver',$3)`, rideID, sequence+1, driverID); err != nil {
		return Ride{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Ride{}, err
	}
	return s.Get(ctx, rideID, userID, nil)
}

func newPickupPIN() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(9000))
	if err != nil {
		return "", fmt.Errorf("generate pickup PIN: %w", err)
	}
	return fmt.Sprintf("%04d", n.Int64()+1000), nil
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
	if actorType == "driver" && actorID != nil {
		availability := ""
		switch to {
		case DriverEnroute:
			availability = "enroute_pickup"
		case DriverArrived, PickupConfirmed:
			availability = "waiting_passenger"
		case InProgress:
			availability = "on_trip"
		}
		if availability != "" {
			if _, err = tx.Exec(ctx, `UPDATE drivers SET availability=$1 WHERE id=$2`, availability, *actorID); err != nil {
				return Ride{}, err
			}
		}
		category, title, body := "", "", ""
		switch to {
		case DriverEnroute:
			category, title, body = "driver_arriving", "Driver on the way", "Your driver is travelling to the pickup."
		case DriverArrived:
			category, title, body = "driver_arrived", "Driver arrived", "Your driver is waiting at the pickup."
		case InProgress:
			category, title, body = "trip_started", "Trip started", "Your LaBar trip is in progress."
		}
		if category != "" {
			if _, err = tx.Exec(ctx, `INSERT INTO notifications(user_id,category,title,body,data) SELECT passenger_id,$2,$3,$4,jsonb_build_object('ride_id',id::text,'status',$5) FROM rides WHERE id=$1`, rideID, category, title, body, to); err != nil {
				return Ride{}, err
			}
		}
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
	ownership := `passenger_id=$2`
	if actorType == "driver" {
		target = DriverCancelled
		ownership = `driver_id IN(SELECT id FROM drivers WHERE user_id=$2)`
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Ride{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var from Status
	var driverID *uuid.UUID
	var sequence int64
	err = tx.QueryRow(ctx, `SELECT status,driver_id,coalesce((SELECT max(sequence) FROM ride_events WHERE ride_id=$1),0) FROM rides WHERE id=$1 AND `+ownership+` FOR UPDATE`, rideID, userID).Scan(&from, &driverID, &sequence)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ride{}, ErrRideNotFound
	}
	if err != nil {
		return Ride{}, err
	}
	if err = ValidateTransition(from, target); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `UPDATE rides SET status=$1,updated_at=now(),version=version+1 WHERE id=$2`, target, rideID); err != nil {
		return Ride{}, err
	}
	if driverID != nil {
		if _, err = tx.Exec(ctx, `UPDATE drivers SET availability='available' WHERE id=$1`, *driverID); err != nil {
			return Ride{}, err
		}
	}
	if _, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id,metadata) VALUES($1,$2,$3,$4,$5,jsonb_build_object('reason',$6))`, rideID, sequence+1, "ride."+string(target), actorType, userID, reason); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO notifications(user_id,category,title,body,data) SELECT passenger_id,'ride_cancelled','Ride cancelled','The ride was cancelled.',jsonb_build_object('ride_id',id::text,'status',$2,'reason',$3) FROM rides WHERE id=$1`, rideID, target, reason); err != nil {
		return Ride{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Ride{}, err
	}
	return s.Get(ctx, rideID, userID, nil)
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
func (s *Service) Complete(ctx context.Context, userID, rideID uuid.UUID, idempotencyKey string) (Ride, error) {
	if idempotencyKey == "" {
		return Ride{}, errors.New("Idempotency-Key required")
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return Ride{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	requestHash := sha256.Sum256([]byte(rideID.String()))
	tag, err := tx.Exec(ctx, `INSERT INTO idempotency_keys(scope,actor_id,key,request_hash,expires_at) VALUES('ride.complete',$1,$2,$3,now()+interval '7 days') ON CONFLICT DO NOTHING`, userID, idempotencyKey, requestHash[:])
	if err != nil {
		return Ride{}, err
	}
	if tag.RowsAffected() == 0 {
		var storedHash []byte
		var completed bool
		if err = tx.QueryRow(ctx, `SELECT ik.request_hash,EXISTS(SELECT 1 FROM rides r JOIN drivers d ON d.id=r.driver_id WHERE r.id=$3 AND d.user_id=$1 AND r.status='completed') FROM idempotency_keys ik WHERE ik.scope='ride.complete' AND ik.actor_id=$1 AND ik.key=$2`, userID, idempotencyKey, rideID).Scan(&storedHash, &completed); err != nil {
			return Ride{}, err
		}
		if !equal(storedHash, requestHash[:]) || !completed {
			return Ride{}, ErrIdempotencyConflict
		}
		return s.Get(ctx, rideID, userID, nil)
	}
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
	} else if method == "wallet" {
		paymentStatus = "paid"
		provider = "wallet"
	}
	paymentID := uuid.New()
	gross := total
	commission := gross * commissionBPS / 10000
	net := gross - commission
	var sequence int64
	if err = tx.QueryRow(ctx, `SELECT coalesce(max(sequence),0) FROM ride_events WHERE ride_id=$1`, rideID).Scan(&sequence); err != nil {
		return Ride{}, err
	}
	tag, err = tx.Exec(ctx, `UPDATE rides SET status='completed',final_total_mmk=$1,completed_at=now(),updated_at=now(),version=version+1 WHERE id=$2 AND status='in_progress'`, total, rideID)
	if err != nil {
		return Ride{}, err
	}
	if tag.RowsAffected() != 1 {
		return Ride{}, ErrInvalidTransition
	}
	if _, err = tx.Exec(ctx, `UPDATE drivers SET availability='available',completed_rides=completed_rides+1 WHERE id=$1`, driverID); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `UPDATE passenger_profiles SET completed_trip_count=completed_trip_count+1 WHERE user_id=$1`, passengerID); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO payments(id,ride_id,user_id,method,provider,amount_mmk,status,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,'ride-complete-'||$2::text)`, paymentID, rideID, passengerID, method, provider, total, paymentStatus); err != nil {
		return Ride{}, err
	}
	if method == "wallet" {
		var walletID uuid.UUID
		var balance int64
		if err = tx.QueryRow(ctx, `SELECT id,cached_balance_mmk FROM wallets WHERE user_id=$1 FOR UPDATE`, passengerID).Scan(&walletID, &balance); err != nil {
			return Ride{}, err
		}
		if balance < total {
			return Ride{}, errors.New("wallet balance is insufficient")
		}
		newBalance := balance - total
		if _, err = tx.Exec(ctx, `UPDATE wallets SET cached_balance_mmk=$1,version=version+1 WHERE id=$2`, newBalance, walletID); err != nil {
			return Ride{}, err
		}
		if _, err = tx.Exec(ctx, `INSERT INTO wallet_transactions(wallet_id,type,amount_mmk,direction,reference_type,reference_id,idempotency_key,balance_after_mmk) VALUES($1,'ride_payment',$2,-1,'ride',$3,'ride-payment-'||$3::text,$4)`, walletID, total, rideID, newBalance); err != nil {
			return Ride{}, err
		}
	}
	if _, err = tx.Exec(ctx, `INSERT INTO driver_earnings(driver_id,ride_id,gross_mmk,commission_mmk,net_mmk,pricing_version_id) VALUES($1,$2,$3,$4,$5,$6)`, driverID, rideID, gross, commission, net, versionID); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id,metadata) VALUES($1,$2,'ride.completed','driver',$3,jsonb_build_object('distance_meters',$4,'duration_seconds',$5,'low_speed_seconds',$6,'final_total_mmk',$7,'payment_id',$8::text))`, rideID, sequence+1, driverID, distance, duration, lowSpeed, total, paymentID); err != nil {
		return Ride{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('notification.trip_completed',jsonb_build_object('ride_id',$1::text,'payment_id',$2::text)),('receipt.create',jsonb_build_object('ride_id',$1::text))`, rideID, paymentID); err != nil {
		return Ride{}, err
	}
	if method != "cash" && method != "wallet" {
		if _, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('payment.capture',jsonb_build_object('payment_id',$1::text))`, paymentID); err != nil {
			return Ride{}, err
		}
	}
	if err = tx.Commit(ctx); err != nil {
		return Ride{}, err
	}
	return s.Get(ctx, rideID, userID, []string{"admin"})
}

func (s *Service) ConfirmCashCollected(ctx context.Context, userID, rideID uuid.UUID) error {
	tag, err := s.db.Exec(ctx, `UPDATE payments p SET status='paid',updated_at=now() FROM rides r JOIN drivers d ON d.id=r.driver_id WHERE p.ride_id=r.id AND r.id=$1 AND d.user_id=$2 AND r.status='completed' AND p.method='cash' AND p.status='cash_due'`, rideID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		var paid bool
		if queryErr := s.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM payments p JOIN rides r ON r.id=p.ride_id JOIN drivers d ON d.id=r.driver_id WHERE r.id=$1 AND d.user_id=$2 AND p.method='cash' AND p.status='paid')`, rideID, userID).Scan(&paid); queryErr != nil || !paid {
			return ErrRideNotFound
		}
	}
	return nil
}
