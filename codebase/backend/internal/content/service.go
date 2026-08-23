package content

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }
func (s *Service) Cities(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.db.Query(ctx, `SELECT id,slug,name,timezone,currency FROM cities WHERE active ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id uuid.UUID
		var slug, name, timezone, currency string
		if err = rows.Scan(&id, &slug, &name, &timezone, &currency); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "slug": slug, "name": name, "timezone": timezone, "currency": currency, "services": []string{"ride", "delivery", "airport", "scheduled"}})
	}
	return out, rows.Err()
}
func (s *Service) City(ctx context.Context, slug string) (map[string]any, error) {
	var id uuid.UUID
	var name, timezone, currency string
	err := s.db.QueryRow(ctx, `SELECT id,name,timezone,currency FROM cities WHERE slug=$1 AND active`, slug).Scan(&id, &name, &timezone, &currency)
	if err != nil {
		return nil, err
	}
	return map[string]any{"id": id, "slug": slug, "name": name, "timezone": timezone, "currency": currency}, nil
}
func (s *Service) RideTypes(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.db.Query(ctx, `SELECT id,code,name,capacity,service FROM ride_types WHERE active ORDER BY display_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id uuid.UUID
		var code, name, service string
		var capacity int
		if err = rows.Scan(&id, &code, &name, &capacity, &service); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "code": code, "name": name, "capacity": capacity, "service": service})
	}
	return out, rows.Err()
}
func (s *Service) Fares(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.db.Query(ctx, `SELECT c.slug,fv.id,fv.version,rt.code,fp.base_fare_mmk,fp.included_distance_meters,fp.per_km_mmk,fp.low_speed_threshold_kph,fp.low_speed_per_minute_mmk,fp.booking_fee_mmk,fp.service_fee_mmk FROM fare_versions fv JOIN cities c ON c.id=fv.city_id JOIN fare_plans fp ON fp.fare_version_id=fv.id JOIN ride_types rt ON rt.id=fp.ride_type_id WHERE fv.status='active' ORDER BY c.slug,rt.display_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var city, rideType string
		var versionID uuid.UUID
		var version int
		var base, included, perKM, lowSpeed, booking, service int64
		var threshold float64
		if err = rows.Scan(&city, &versionID, &version, &rideType, &base, &included, &perKM, &threshold, &lowSpeed, &booking, &service); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"city": city, "pricing_version_id": versionID, "version": version, "ride_type": rideType, "base_fare_mmk": base, "included_distance_meters": included, "per_km_mmk": perKM, "low_speed_threshold_kph": threshold, "low_speed_per_minute_mmk": lowSpeed, "booking_fee_mmk": booking, "service_fee_mmk": service})
	}
	return out, rows.Err()
}
func (s *Service) Promotions(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.db.Query(ctx, `SELECT p.id,p.name,p.starts_at,p.ends_at,p.discount_percent,p.discount_fixed_mmk,p.maximum_discount_mmk,array_remove(array_agg(pc.code),NULL) FROM promotions p LEFT JOIN promo_codes pc ON pc.promotion_id=p.id AND pc.active WHERE p.status='active' AND now() BETWEEN p.starts_at AND p.ends_at GROUP BY p.id ORDER BY p.ends_at`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id uuid.UUID
		var name string
		var starts, ends any
		var percent, fixed, max any
		var codes []string
		if err = rows.Scan(&id, &name, &starts, &ends, &percent, &fixed, &max, &codes); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "name": name, "starts_at": starts, "ends_at": ends, "discount_percent": percent, "discount_fixed_mmk": fixed, "maximum_discount_mmk": max, "codes": codes})
	}
	return out, rows.Err()
}
func (s *Service) FAQs(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.db.Query(ctx, `SELECT id,question,answer FROM faq_items WHERE status='published' ORDER BY display_order`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var id uuid.UUID
		var question string
		var answer json.RawMessage
		if err = rows.Scan(&id, &question, &answer); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{"id": id, "question": question, "answer": answer})
	}
	return out, rows.Err()
}
func (s *Service) RemoteConfig(ctx context.Context, app, platform, version string) (map[string]any, error) {
	var minimum, latest string
	var force bool
	err := s.db.QueryRow(ctx, `SELECT minimum_version,latest_version,force_update FROM app_versions WHERE app=$1 AND platform=$2`, app, platform).Scan(&minimum, &latest, &force)
	if err != nil {
		minimum = "0.0.0"
		latest = "0.0.0"
		force = false
	}
	rows, queryErr := s.db.Query(ctx, `SELECT key,enabled,config FROM feature_flags WHERE scope='global' OR(scope='platform' AND scope_value=$1) ORDER BY key`, platform)
	if queryErr != nil {
		return nil, queryErr
	}
	defer rows.Close()
	flags := map[string]any{}
	for rows.Next() {
		var key string
		var enabled bool
		var raw json.RawMessage
		if queryErr = rows.Scan(&key, &enabled, &raw); queryErr != nil {
			return nil, queryErr
		}
		flags[key] = map[string]any{"enabled": enabled, "config": raw}
	}
	return map[string]any{"app": app, "platform": platform, "current_version": version, "minimum_version": minimum, "latest_version": latest, "force_update": force, "feature_flags": flags, "support_contacts": map[string]string{}, "location_upload_interval_seconds": 5, "ride_refresh_interval_seconds": 10}, rows.Err()
}
