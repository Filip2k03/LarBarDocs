package tracking

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	redisv9 "github.com/redis/go-redis/v9"
	"math"
	"time"
)

var ErrLocationRejected = errors.New("location rejected")

type Service struct {
	db    *pgxpool.Pool
	redis *redisv9.Client
	now   func() time.Time
}

func NewService(db *pgxpool.Pool, redis *redisv9.Client) *Service {
	return &Service{db: db, redis: redis, now: time.Now}
}

type Sample struct {
	Latitude       float64   `json:"lat"`
	Longitude      float64   `json:"lng"`
	Heading        float64   `json:"heading"`
	SpeedKPH       float64   `json:"speed_kph"`
	AccuracyMeters float64   `json:"accuracy_meters"`
	Timestamp      time.Time `json:"timestamp"`
	MockLocation   *bool     `json:"mock_location,omitempty"`
}

func (s *Service) Record(ctx context.Context, userID uuid.UUID, p Sample) ([]string, error) {
	if p.Latitude < -90 || p.Latitude > 90 || p.Longitude < -180 || p.Longitude > 180 || p.AccuracyMeters <= 0 || p.AccuracyMeters > 1000 || p.Timestamp.After(s.now().Add(30*time.Second)) || p.Timestamp.Before(s.now().Add(-5*time.Minute)) {
		return nil, ErrLocationRejected
	}
	var driverID, cityID uuid.UUID
	var availability string
	var rideID *uuid.UUID
	err := s.db.QueryRow(ctx, `SELECT d.id,d.availability,coalesce((SELECT city_id FROM rides WHERE driver_id=d.id AND status IN ('driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress') LIMIT 1),(SELECT id FROM cities WHERE slug='yangon')),(SELECT id FROM rides WHERE driver_id=d.id AND status IN ('driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress') LIMIT 1) FROM drivers d WHERE d.user_id=$1 AND d.status='approved'`, userID).Scan(&driverID, &availability, &cityID, &rideID)
	if err != nil {
		return nil, err
	}
	if availability == "offline" {
		return nil, ErrLocationRejected
	}
	flags := []string{}
	if p.SpeedKPH > 180 {
		flags = append(flags, "impossible_speed")
	}
	if p.AccuracyMeters > 100 {
		flags = append(flags, "low_accuracy")
	}
	if p.MockLocation != nil && *p.MockLocation {
		flags = append(flags, "mock_location_signal")
	}
	key := "driver:last_location:" + driverID.String()
	var incrementMeters int64
	var incrementSeconds, lowSpeedSeconds int64
	previous, err := s.redis.Get(ctx, key).Bytes()
	if err == nil {
		var old Sample
		if json.Unmarshal(previous, &old) == nil {
			seconds := p.Timestamp.Sub(old.Timestamp).Seconds()
			if seconds > 0 {
				distance := haversine(old.Latitude, old.Longitude, p.Latitude, p.Longitude)
				if distance/seconds*3.6 > 200 {
					flags = append(flags, "impossible_jump")
				} else if p.AccuracyMeters <= 100 {
					incrementMeters = int64(distance + 0.5)
					incrementSeconds = int64(math.Min(seconds, 30))
					if p.SpeedKPH <= 10 {
						lowSpeedSeconds = incrementSeconds
					}
				}
			}
		}
	}
	encoded, _ := json.Marshal(p)
	pipe := s.redis.TxPipeline()
	pipe.Set(ctx, key, encoded, 2*time.Minute)
	pipe.GeoAdd(ctx, "drivers:geo:"+cityID.String(), &redisv9.GeoLocation{Name: driverID.String(), Longitude: p.Longitude, Latitude: p.Latitude})
	pipe.Expire(ctx, "drivers:geo:"+cityID.String(), 24*time.Hour)
	if _, err = pipe.Exec(ctx); err != nil {
		return flags, err
	}
	if rideID != nil {
		_, err = s.db.Exec(ctx, `INSERT INTO trip_location_samples(ride_id,driver_id,location,heading,speed_kph,accuracy_meters,client_timestamp,risk_flags) VALUES($1,$2,ST_SetSRID(ST_MakePoint($3,$4),4326)::geography,$5,$6,$7,$8,$9);UPDATE rides SET trip_distance_meters=trip_distance_meters+$10,trip_duration_seconds=trip_duration_seconds+$11,low_speed_seconds=low_speed_seconds+$12,updated_at=now() WHERE id=$1 AND status='in_progress';UPDATE drivers SET last_heartbeat_at=now() WHERE id=$2`, *rideID, driverID, p.Longitude, p.Latitude, p.Heading, p.SpeedKPH, p.AccuracyMeters, p.Timestamp, flags, incrementMeters, incrementSeconds, lowSpeedSeconds)
		if err != nil {
			return flags, err
		}
		event, _ := json.Marshal(map[string]any{"event_id": uuid.New(), "type": "trip.location", "ride_id": rideID, "driver_id": driverID, "lat": p.Latitude, "lng": p.Longitude, "heading": p.Heading, "server_timestamp": s.now().UTC()})
		_ = s.redis.Publish(ctx, "ride:"+rideID.String(), event).Err()
	}
	if len(flags) > 0 {
		_, _ = s.db.Exec(ctx, `INSERT INTO risk_events(driver_id,ride_id,type,severity,metadata) VALUES($1,$2,'gps_anomaly','review',jsonb_build_object('flags',$3::text[]))`, driverID, rideID, flags)
	}
	return flags, nil
}
func haversine(aLat, aLng, bLat, bLng float64) float64 {
	const radius = 6371000.
	toRad := math.Pi / 180
	dLat := (bLat - aLat) * toRad
	dLng := (bLng - aLng) * toRad
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(aLat*toRad)*math.Cos(bLat*toRad)*math.Sin(dLng/2)*math.Sin(dLng/2)
	return radius * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}
