package dispatch

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/Filip2k03/labar-backend/internal/rides"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	redisv9 "github.com/redis/go-redis/v9"
)

var (
	ErrNoCandidates = errors.New("no eligible drivers")
	ErrOfferExpired = errors.New("offer expired")
	ErrOfferTaken   = errors.New("offer already accepted")
)

type Service struct {
	db       *pgxpool.Pool
	redis    *redisv9.Client
	offerTTL time.Duration
	radii    []float64
	now      func() time.Time
}

func NewService(db *pgxpool.Pool, redis *redisv9.Client) *Service {
	return &Service{db: db, redis: redis, offerTTL: 15 * time.Second, radii: []float64{1.5, 3, 5, 8}, now: time.Now}
}

type Offer struct {
	ID                   uuid.UUID `json:"id"`
	RideID               uuid.UUID `json:"ride_id"`
	DriverID             uuid.UUID `json:"driver_id"`
	PickupDistanceMeters float64   `json:"pickup_distance_meters"`
	EstimatedFareMMK     int64     `json:"estimated_fare_mmk"`
	ExpiresAt            time.Time `json:"expires_at"`
	Status               string    `json:"status"`
}

func (s *Service) Dispatch(ctx context.Context, rideID uuid.UUID) error {
	var pickupLng, pickupLat float64
	var cityID uuid.UUID
	var rideTypeID uuid.UUID
	var status rides.Status
	err := s.db.QueryRow(ctx, `SELECT ST_X(pickup::geometry),ST_Y(pickup::geometry),city_id,ride_type_id,status FROM rides WHERE id=$1`, rideID).Scan(&pickupLng, &pickupLat, &cityID, &rideTypeID, &status)
	if err != nil {
		return err
	}
	if status != rides.Searching {
		return nil
	}
	for _, radius := range s.radii {
		results, err := s.redis.GeoSearchLocation(ctx, "drivers:geo:"+cityID.String(), &redisv9.GeoSearchLocationQuery{GeoSearchQuery: redisv9.GeoSearchQuery{Longitude: pickupLng, Latitude: pickupLat, Radius: radius, RadiusUnit: "km", Sort: "ASC", Count: 50}, WithDist: true}).Result()
		if err != nil {
			return fmt.Errorf("driver GEO search: %w", err)
		}
		for _, candidate := range results {
			driverID, parseErr := uuid.Parse(candidate.Name)
			if parseErr != nil {
				continue
			}
			created, createErr := s.createOffer(ctx, rideID, rideTypeID, driverID, candidate.Dist*1000)
			if createErr != nil {
				continue
			}
			if created {
				return nil
			}
		}
	}
	_, err = s.transitionNoDriver(ctx, rideID)
	return err
}
func (s *Service) createOffer(ctx context.Context, rideID, rideTypeID, driverID uuid.UUID, distanceMeters float64) (bool, error) {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var eligible bool
	err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers d JOIN vehicles v ON v.driver_id=d.id AND v.active AND v.status='approved' WHERE d.id=$1 AND d.status='approved' AND d.availability='available' AND d.last_heartbeat_at>now()-interval '45 seconds' AND $2=ANY(SELECT ride_type_id FROM fare_plans WHERE ride_type_id=$2) AND NOT EXISTS(SELECT 1 FROM ride_offers WHERE driver_id=d.id AND status='pending') AND NOT EXISTS(SELECT 1 FROM rides WHERE driver_id=d.id AND status IN ('driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress')))`, driverID, rideTypeID).Scan(&eligible)
	if err != nil || !eligible {
		return false, err
	}
	var sequence int64
	var fare int64
	err = tx.QueryRow(ctx, `SELECT coalesce(max(e.sequence),0),(SELECT estimated_total_mmk FROM rides WHERE id=$1) FROM ride_events e WHERE e.ride_id=$1 GROUP BY e.ride_id`, rideID).Scan(&sequence, &fare)
	if errors.Is(err, pgx.ErrNoRows) {
		sequence = 2
		err = tx.QueryRow(ctx, `SELECT estimated_total_mmk FROM rides WHERE id=$1`, rideID).Scan(&fare)
	}
	if err != nil {
		return false, err
	}
	offerID := uuid.New()
	expires := s.now().UTC().Add(s.offerTTL)
	tag, err := tx.Exec(ctx, `INSERT INTO ride_offers(id,ride_id,driver_id,expires_at) SELECT $1,$2,$3,$4 WHERE EXISTS(SELECT 1 FROM rides WHERE id=$2 AND status='searching') ON CONFLICT DO NOTHING`, offerID, rideID, driverID, expires)
	if err != nil || tag.RowsAffected() == 0 {
		return false, err
	}
	_, err = tx.Exec(ctx, `UPDATE rides SET status='driver_offered',updated_at=now(),version=version+1 WHERE id=$1 AND status='searching';UPDATE drivers SET availability='offered' WHERE id=$2 AND availability='available';INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,metadata) VALUES($1,$3,'ride.offer','system',jsonb_build_object('offer_id',$4::text,'driver_id',$2::text,'expires_at',$5,'pickup_distance_meters',$6));INSERT INTO jobs(type,payload,run_at) VALUES('dispatch.offer_timeout',jsonb_build_object('offer_id',$4::text),$5);INSERT INTO notifications(user_id,category,title,body,data) SELECT user_id,'ride_request','New ride request','A ride offer is ready',jsonb_build_object('offer_id',$4::text,'ride_id',$1::text,'estimated_fare_mmk',$7,'expires_at',$5) FROM drivers WHERE id=$2`, rideID, driverID, sequence+1, offerID, expires, distanceMeters, fare)
	if err != nil {
		return false, err
	}
	return true, tx.Commit(ctx)
}
func (s *Service) Accept(ctx context.Context, userID, offerID uuid.UUID) (uuid.UUID, error) {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return uuid.Nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var rideID, driverID, vehicleID uuid.UUID
	var expires time.Time
	var offerStatus string
	var rideStatus rides.Status
	err = tx.QueryRow(ctx, `SELECT o.ride_id,o.driver_id,o.expires_at,o.status,r.status,(SELECT id FROM vehicles WHERE driver_id=o.driver_id AND active AND status='approved') FROM ride_offers o JOIN rides r ON r.id=o.ride_id JOIN drivers d ON d.id=o.driver_id WHERE o.id=$1 AND d.user_id=$2 FOR UPDATE OF o,r,d`, offerID, userID).Scan(&rideID, &driverID, &expires, &offerStatus, &rideStatus, &vehicleID)
	if errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, ErrOfferTaken
	}
	if err != nil {
		return uuid.Nil, err
	}
	if offerStatus != "pending" || rideStatus != rides.DriverOffered {
		return uuid.Nil, ErrOfferTaken
	}
	if !s.now().Before(expires) {
		return uuid.Nil, ErrOfferExpired
	}
	var sequence int64
	err = tx.QueryRow(ctx, `SELECT coalesce(max(sequence),0) FROM ride_events WHERE ride_id=$1`, rideID).Scan(&sequence)
	if err != nil {
		return uuid.Nil, err
	}
	tag, err := tx.Exec(ctx, `UPDATE ride_offers SET status='accepted' WHERE id=$1 AND status='pending';UPDATE ride_offers SET status='cancelled' WHERE ride_id=$2 AND id<>$1 AND status='pending';UPDATE rides SET driver_id=$3,vehicle_id=$4,status='driver_assigned',updated_at=now(),version=version+1 WHERE id=$2 AND status='driver_offered';UPDATE drivers SET availability='enroute_pickup' WHERE id=$3;INSERT INTO ride_events(ride_id,sequence,event_type,actor_type,actor_id,metadata) VALUES($2,$5,'ride.accepted','driver',$3,jsonb_build_object('offer_id',$1::text));INSERT INTO jobs(type,payload) VALUES('notification.ride_assigned',jsonb_build_object('ride_id',$2::text))`, offerID, rideID, driverID, vehicleID, sequence+1)
	if err != nil || tag.RowsAffected() == 0 {
		return uuid.Nil, ErrOfferTaken
	}
	if err = tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	}
	return rideID, nil
}
func (s *Service) Reject(ctx context.Context, userID, offerID uuid.UUID, reason string) error {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var rideID, driverID uuid.UUID
	err = tx.QueryRow(ctx, `UPDATE ride_offers o SET status='rejected' FROM drivers d WHERE o.id=$1 AND o.driver_id=d.id AND d.user_id=$2 AND o.status='pending' RETURNING o.ride_id,o.driver_id`, offerID, userID).Scan(&rideID, &driverID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrOfferTaken
	}
	if err != nil {
		return err
	}
	payload, _ := json.Marshal(map[string]any{"ride_id": rideID, "reason": reason})
	_, err = tx.Exec(ctx, `UPDATE drivers SET availability='available' WHERE id=$1;UPDATE rides SET status='searching',updated_at=now(),version=version+1 WHERE id=$2 AND status='driver_offered';INSERT INTO jobs(type,payload) VALUES('ride.dispatch',$3)`, driverID, rideID, payload)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Service) Current(ctx context.Context, userID uuid.UUID) (Offer, error) {
	var o Offer
	err := s.db.QueryRow(ctx, `SELECT o.id,o.ride_id,o.driver_id,0::float8,r.estimated_total_mmk,o.expires_at,o.status FROM ride_offers o JOIN drivers d ON d.id=o.driver_id JOIN rides r ON r.id=o.ride_id WHERE d.user_id=$1 AND o.status='pending' AND o.expires_at>now() ORDER BY o.offered_at DESC LIMIT 1`, userID).Scan(&o.ID, &o.RideID, &o.DriverID, &o.PickupDistanceMeters, &o.EstimatedFareMMK, &o.ExpiresAt, &o.Status)
	if err != nil {
		return Offer{}, err
	}
	return o, nil
}
func (s *Service) ExpireOffer(ctx context.Context, offerID uuid.UUID) error {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var rideID, driverID uuid.UUID
	err = tx.QueryRow(ctx, `UPDATE ride_offers SET status='expired' WHERE id=$1 AND status='pending' AND expires_at<=now() RETURNING ride_id,driver_id`, offerID).Scan(&rideID, &driverID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `UPDATE drivers SET availability='available' WHERE id=$1 AND availability='offered';UPDATE rides SET status='searching',updated_at=now(),version=version+1 WHERE id=$2 AND status='driver_offered';INSERT INTO jobs(type,payload) VALUES('ride.dispatch',jsonb_build_object('ride_id',$2::text))`, driverID, rideID)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Service) transitionNoDriver(ctx context.Context, rideID uuid.UUID) (bool, error) {
	tag, err := s.db.Exec(ctx, `WITH changed AS(UPDATE rides SET status='no_driver_found',updated_at=now(),version=version+1 WHERE id=$1 AND status='searching' RETURNING passenger_id),seq AS(SELECT coalesce(max(sequence),0)+1 n FROM ride_events WHERE ride_id=$1) INSERT INTO ride_events(ride_id,sequence,event_type,actor_type) SELECT $1,seq.n,'ride.no_driver_found','system' FROM changed,seq`, rideID)
	return tag.RowsAffected() > 0, err
}
