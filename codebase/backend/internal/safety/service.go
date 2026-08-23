package safety

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }
func (s *Service) SOS(ctx context.Context, userID, rideID uuid.UUID, deviceID *uuid.UUID, lat, lng *float64) (uuid.UUID, error) {
	id := uuid.New()
	tag, err := s.db.Exec(ctx, `WITH created AS(INSERT INTO safety_events(id,ride_id,user_id,type,location,device_id) SELECT $1,$2,$3,'sos',CASE WHEN $5::float8 IS NULL THEN NULL ELSE ST_SetSRID(ST_MakePoint($6,$5),4326)::geography END,$4 WHERE EXISTS(SELECT 1 FROM rides WHERE id=$2 AND (passenger_id=$3 OR driver_id IN(SELECT id FROM drivers WHERE user_id=$3))) RETURNING id) INSERT INTO jobs(type,payload) SELECT 'safety.notify_operations',jsonb_build_object('safety_event_id',id::text) FROM created`, id, rideID, userID, deviceID, lat, lng)
	if err != nil {
		return uuid.Nil, err
	}
	if tag.RowsAffected() == 0 {
		return uuid.Nil, errors.New("ride not available for safety event")
	}
	return id, nil
}
func (s *Service) Share(ctx context.Context, userID, rideID uuid.UUID, ttl time.Duration) (string, time.Time, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", time.Time{}, err
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	hash := sha256.Sum256([]byte(token))
	expires := time.Now().UTC().Add(ttl)
	tag, err := s.db.Exec(ctx, `INSERT INTO trip_shares(ride_id,created_by,token_hash,expires_at) SELECT $1,$2,$3,$4 WHERE EXISTS(SELECT 1 FROM rides WHERE id=$1 AND passenger_id=$2)`, rideID, userID, hash[:], expires)
	if err != nil {
		return "", time.Time{}, err
	}
	if tag.RowsAffected() == 0 {
		return "", time.Time{}, errors.New("ride not found")
	}
	return token, expires, nil
}
func (s *Service) PublicShare(ctx context.Context, token string) (map[string]any, error) {
	hash := sha256.Sum256([]byte(token))
	var data []byte
	err := s.db.QueryRow(ctx, `SELECT jsonb_build_object('ride_id',r.id,'status',r.status,'driver_first_name',split_part(u.display_name,' ',1),'vehicle',jsonb_build_object('make',v.make,'model',v.model,'color',v.color,'plate',v.plate),'eta_seconds',NULL,'location',CASE WHEN r.status IN ('driver_enroute','driver_arrived','pickup_confirmed','in_progress') THEN (SELECT jsonb_build_object('lat',round(ST_Y(location::geometry)::numeric,3),'lng',round(ST_X(location::geometry)::numeric,3),'updated_at',created_at) FROM trip_location_samples WHERE ride_id=r.id ORDER BY created_at DESC LIMIT 1) ELSE NULL END) FROM trip_shares ts JOIN rides r ON r.id=ts.ride_id LEFT JOIN drivers d ON d.id=r.driver_id LEFT JOIN users u ON u.id=d.user_id LEFT JOIN vehicles v ON v.id=r.vehicle_id WHERE ts.token_hash=$1 AND ts.revoked_at IS NULL AND ts.expires_at>now()`, hash[:]).Scan(&data)
	if err != nil {
		return nil, err
	}
	var result map[string]any
	if err = json.Unmarshal(data, &result); err != nil {
		return nil, err
	}
	return result, nil
}
