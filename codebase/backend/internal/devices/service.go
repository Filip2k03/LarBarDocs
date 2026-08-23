package devices

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("device not found")

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type Device struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Platform     string    `json:"platform"`
	DeviceID     string    `json:"device_id"`
	PushToken    *string   `json:"push_token,omitempty"`
	PushProvider *string   `json:"push_provider,omitempty"`
	AppType      string    `json:"app_type"`
	AppVersion   string    `json:"app_version"`
	OSVersion    string    `json:"os_version"`
	Locale       string    `json:"locale"`
	Timezone     string    `json:"timezone"`
	LastSeenAt   time.Time `json:"last_seen_at"`
}

func (s *Service) Register(ctx context.Context, userID uuid.UUID, d Device) (Device, error) {
	d.ID = uuid.New()
	d.UserID = userID
	err := s.db.QueryRow(ctx, `INSERT INTO devices(id,user_id,platform,device_id,push_token,push_provider,app_type,app_version,os_version,locale,timezone) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(user_id,device_id,app_type) DO UPDATE SET platform=excluded.platform,push_token=excluded.push_token,push_provider=excluded.push_provider,app_version=excluded.app_version,os_version=excluded.os_version,locale=excluded.locale,timezone=excluded.timezone,last_seen_at=now() RETURNING id,last_seen_at`, d.ID, userID, d.Platform, d.DeviceID, d.PushToken, d.PushProvider, d.AppType, d.AppVersion, d.OSVersion, d.Locale, d.Timezone).Scan(&d.ID, &d.LastSeenAt)
	return d, err
}
func (s *Service) Delete(ctx context.Context, userID, deviceID uuid.UUID) error {
	tag, err := s.db.Exec(ctx, `DELETE FROM devices WHERE id=$1 AND user_id=$2`, deviceID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
func (s *Service) RegisterLiveActivity(ctx context.Context, userID, rideID, deviceID uuid.UUID, activityType, pushToken string, expiresAt time.Time) (uuid.UUID, error) {
	id := uuid.New()
	tag, err := s.db.Exec(ctx, `INSERT INTO live_activity_sessions(id,user_id,ride_id,device_id,activity_type,push_token,expires_at) SELECT $1,$2,$3,$4,$5,$6,$7 WHERE EXISTS(SELECT 1 FROM devices WHERE id=$4 AND user_id=$2)`, id, userID, rideID, deviceID, activityType, pushToken, expiresAt)
	if err != nil {
		return uuid.Nil, err
	}
	if tag.RowsAffected() == 0 {
		return uuid.Nil, pgx.ErrNoRows
	}
	return id, nil
}
