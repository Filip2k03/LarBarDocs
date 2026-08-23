package passengers

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("passenger resource not found")

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type Profile struct {
	UserID                  uuid.UUID `json:"user_id"`
	Phone                   string    `json:"phone"`
	Email                   *string   `json:"email,omitempty"`
	DisplayName             string    `json:"display_name"`
	Locale                  string    `json:"locale"`
	PhotoURL                *string   `json:"photo_url,omitempty"`
	DefaultPaymentMethod    *string   `json:"default_payment_method,omitempty"`
	EmergencyContactEnabled bool      `json:"emergency_contact_enabled"`
	Rating                  float64   `json:"rating"`
	CompletedTripCount      int64     `json:"completed_trip_count"`
}

type ProfilePatch struct {
	DisplayName             *string `json:"display_name"`
	Email                   *string `json:"email"`
	Locale                  *string `json:"locale"`
	PhotoURL                *string `json:"photo_url"`
	DefaultPaymentMethod    *string `json:"default_payment_method"`
	EmergencyContactEnabled *bool   `json:"emergency_contact_enabled"`
}

func (s *Service) Profile(ctx context.Context, userID uuid.UUID) (Profile, error) {
	var p Profile
	err := s.db.QueryRow(ctx, `SELECT u.id,u.phone,u.email,u.display_name,u.locale,p.photo_url,p.default_payment_method,p.emergency_contact_enabled,p.rating,p.completed_trip_count FROM users u JOIN passenger_profiles p ON p.user_id=u.id WHERE u.id=$1`, userID).Scan(&p.UserID, &p.Phone, &p.Email, &p.DisplayName, &p.Locale, &p.PhotoURL, &p.DefaultPaymentMethod, &p.EmergencyContactEnabled, &p.Rating, &p.CompletedTripCount)
	if errors.Is(err, pgx.ErrNoRows) {
		return Profile{}, ErrNotFound
	}
	return p, err
}

func (s *Service) PatchProfile(ctx context.Context, userID uuid.UUID, patch ProfilePatch) (Profile, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Profile{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err = tx.Exec(ctx, `UPDATE users SET display_name=coalesce($2,display_name),email=coalesce($3,email),locale=coalesce($4,locale),updated_at=now() WHERE id=$1`, userID, patch.DisplayName, patch.Email, patch.Locale); err != nil {
		return Profile{}, err
	}
	if _, err = tx.Exec(ctx, `UPDATE passenger_profiles SET photo_url=coalesce($2,photo_url),default_payment_method=coalesce($3,default_payment_method),emergency_contact_enabled=coalesce($4,emergency_contact_enabled) WHERE user_id=$1`, userID, patch.PhotoURL, patch.DefaultPaymentMethod, patch.EmergencyContactEnabled); err != nil {
		return Profile{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Profile{}, err
	}
	return s.Profile(ctx, userID)
}

type Place struct {
	ID         uuid.UUID `json:"id"`
	Type       string    `json:"type"`
	Name       string    `json:"name"`
	Address    string    `json:"address"`
	Latitude   float64   `json:"lat"`
	Longitude  float64   `json:"lng"`
	PickupNote string    `json:"pickup_note"`
	CreatedAt  time.Time `json:"created_at"`
}

type PlaceInput struct {
	Type       string  `json:"type"`
	Name       string  `json:"name"`
	Address    string  `json:"address"`
	Latitude   float64 `json:"lat"`
	Longitude  float64 `json:"lng"`
	PickupNote string  `json:"pickup_note"`
}

func validPlace(input PlaceInput) bool {
	return (input.Type == "home" || input.Type == "work" || input.Type == "custom") && input.Name != "" && input.Address != "" && input.Latitude >= -90 && input.Latitude <= 90 && input.Longitude >= -180 && input.Longitude <= 180 && !(input.Latitude == 0 && input.Longitude == 0)
}

func (s *Service) Places(ctx context.Context, userID uuid.UUID) ([]Place, error) {
	rows, err := s.db.Query(ctx, `SELECT id,type,name,address,ST_Y(location::geometry),ST_X(location::geometry),pickup_note,created_at FROM saved_places WHERE user_id=$1 ORDER BY created_at`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []Place
	for rows.Next() {
		var p Place
		if err = rows.Scan(&p.ID, &p.Type, &p.Name, &p.Address, &p.Latitude, &p.Longitude, &p.PickupNote, &p.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, rows.Err()
}

func (s *Service) CreatePlace(ctx context.Context, userID uuid.UUID, input PlaceInput) (Place, error) {
	if !validPlace(input) {
		return Place{}, errors.New("invalid saved place")
	}
	var p Place
	err := s.db.QueryRow(ctx, `INSERT INTO saved_places(user_id,type,name,address,location,pickup_note) VALUES($1,$2,$3,$4,ST_SetSRID(ST_MakePoint($5,$6),4326)::geography,$7) RETURNING id,type,name,address,ST_Y(location::geometry),ST_X(location::geometry),pickup_note,created_at`, userID, input.Type, input.Name, input.Address, input.Longitude, input.Latitude, input.PickupNote).Scan(&p.ID, &p.Type, &p.Name, &p.Address, &p.Latitude, &p.Longitude, &p.PickupNote, &p.CreatedAt)
	return p, err
}

func (s *Service) UpdatePlace(ctx context.Context, userID, id uuid.UUID, input PlaceInput) (Place, error) {
	if !validPlace(input) {
		return Place{}, errors.New("invalid saved place")
	}
	var p Place
	err := s.db.QueryRow(ctx, `UPDATE saved_places SET type=$3,name=$4,address=$5,location=ST_SetSRID(ST_MakePoint($6,$7),4326)::geography,pickup_note=$8,updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING id,type,name,address,ST_Y(location::geometry),ST_X(location::geometry),pickup_note,created_at`, id, userID, input.Type, input.Name, input.Address, input.Longitude, input.Latitude, input.PickupNote).Scan(&p.ID, &p.Type, &p.Name, &p.Address, &p.Latitude, &p.Longitude, &p.PickupNote, &p.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Place{}, ErrNotFound
	}
	return p, err
}

func (s *Service) DeletePlace(ctx context.Context, userID, id uuid.UUID) error {
	tag, err := s.db.Exec(ctx, `DELETE FROM saved_places WHERE id=$1 AND user_id=$2`, id, userID)
	if err == nil && tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return err
}

func (s *Service) RateDriver(ctx context.Context, userID, rideID uuid.UUID, stars int, tags []string, comment string) error {
	if stars < 1 || stars > 5 {
		return errors.New("rating must be between 1 and 5")
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var driverUserID, driverID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT d.user_id,d.id FROM rides r JOIN drivers d ON d.id=r.driver_id WHERE r.id=$1 AND r.passenger_id=$2 AND r.status='completed'`, rideID, userID).Scan(&driverUserID, &driverID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO ride_ratings(ride_id,rater_user_id,rated_user_id,stars,tags,comment) VALUES($1,$2,$3,$4,$5,$6)`, rideID, userID, driverUserID, stars, tags, comment); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE drivers SET rating=(SELECT avg(rr.stars)::numeric(3,2) FROM ride_ratings rr WHERE rr.rated_user_id=$1) WHERE id=$2`, driverUserID, driverID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
