package pricing

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/Filip2k03/labar-backend/internal/domain"
	"github.com/Filip2k03/labar-backend/internal/platform/maps"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrCityNotSupported = errors.New("city not supported")
	ErrNoPricing        = errors.New("pricing unavailable")
	ErrQuoteExpired     = errors.New("quote expired")
)

type Service struct {
	db   *pgxpool.Pool
	maps maps.Provider
	now  func() time.Time
}

func NewService(db *pgxpool.Pool, provider maps.Provider) *Service {
	return &Service{db: db, maps: provider, now: time.Now}
}

type QuoteRequest struct {
	Pickup        maps.Point `json:"pickup"`
	Destination   maps.Point `json:"destination"`
	City          string     `json:"city"`
	ScheduledAt   *time.Time `json:"scheduled_at,omitempty"`
	Passengers    int        `json:"passengers"`
	PromoCode     string     `json:"promo_code,omitempty"`
	PaymentMethod string     `json:"payment_method,omitempty"`
}
type Breakdown struct {
	BaseFareMMK            domain.MoneyMMK `json:"base_fare_mmk"`
	IncludedDistanceMeters int64           `json:"included_distance_meters"`
	ExtraDistanceMeters    int64           `json:"extra_distance_meters"`
	DistanceFareMMK        domain.MoneyMMK `json:"distance_fare_mmk"`
	LowSpeedFareMMK        domain.MoneyMMK `json:"low_speed_fare_mmk"`
	BookingFeeMMK          domain.MoneyMMK `json:"booking_fee_mmk"`
	ServiceFeeMMK          domain.MoneyMMK `json:"service_fee_mmk"`
	SurchargeMMK           domain.MoneyMMK `json:"surcharge_mmk"`
	DiscountMMK            domain.MoneyMMK `json:"discount_mmk"`
	TotalMMK               domain.MoneyMMK `json:"total_mmk"`
}
type RideOption struct {
	RideTypeID                    uuid.UUID       `json:"ride_type_id"`
	Code                          string          `json:"code"`
	Name                          string          `json:"name"`
	Capacity                      int             `json:"capacity"`
	EstimatedDriverArrivalSeconds *int            `json:"estimated_driver_arrival_seconds"`
	Fare                          domain.MoneyMMK `json:"fare"`
	Currency                      string          `json:"currency"`
	PricingBreakdown              Breakdown       `json:"pricing_breakdown"`
}
type Quote struct {
	QuoteID          uuid.UUID    `json:"quote_id"`
	PricingVersionID uuid.UUID    `json:"pricing_version_id"`
	ExpiresAt        time.Time    `json:"expires_at"`
	DistanceMeters   int64        `json:"distance_meters"`
	DurationSeconds  int64        `json:"duration_seconds"`
	RouteGeometry    string       `json:"route_geometry,omitempty"`
	RideOptions      []RideOption `json:"ride_options"`
}

func (s *Service) Quote(ctx context.Context, passengerID *uuid.UUID, request QuoteRequest) (Quote, error) {
	if request.City == "" {
		request.City = "yangon"
	}
	if request.Passengers <= 0 {
		request.Passengers = 1
	}
	if request.Passengers > 8 {
		return Quote{}, errors.New("passengers exceeds supported capacity")
	}
	route, err := s.maps.Route(ctx, request.Pickup, request.Destination)
	if err != nil {
		return Quote{}, err
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Quote{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var cityID, versionID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT c.id,fv.id FROM cities c JOIN fare_versions fv ON fv.city_id=c.id AND fv.status='active' AND fv.effective_from<=now() AND (fv.effective_to IS NULL OR fv.effective_to>now()) WHERE c.slug=$1 AND c.active`, request.City).Scan(&cityID, &versionID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Quote{}, ErrCityNotSupported
	}
	if err != nil {
		return Quote{}, err
	}
	var promoID *uuid.UUID
	var promoRideTypeID *uuid.UUID
	var promoService *string
	var promoMinimum domain.MoneyMMK
	var promoPercent *float64
	var promoFixed, promoMax domain.MoneyMMK
	if request.PromoCode != "" {
		var id uuid.UUID
		var percent *float64
		var fixed, max *int64
		err = tx.QueryRow(ctx, `SELECT pc.id,p.discount_percent,p.discount_fixed_mmk,p.maximum_discount_mmk,p.ride_type_id,p.service,p.minimum_fare_mmk FROM promo_codes pc JOIN promotions p ON p.id=pc.promotion_id WHERE upper(pc.code)=upper($1) AND pc.active AND p.status='active' AND now() BETWEEN p.starts_at AND p.ends_at AND (p.city_id IS NULL OR p.city_id=$2) AND (p.max_redemptions IS NULL OR (SELECT count(*) FROM promo_redemptions pr WHERE pr.promotion_id=p.id)<p.max_redemptions) AND (NOT p.new_user_only OR ($3::uuid IS NOT NULL AND NOT EXISTS(SELECT 1 FROM rides WHERE passenger_id=$3 AND status='completed'))) AND ($3::uuid IS NULL OR (SELECT count(*) FROM promo_redemptions pr WHERE pr.promotion_id=p.id AND pr.user_id=$3)<p.per_user_limit)`, request.PromoCode, cityID, passengerID).Scan(&id, &percent, &fixed, &max, &promoRideTypeID, &promoService, &promoMinimum)
		if errors.Is(err, pgx.ErrNoRows) {
			return Quote{}, errors.New("promo invalid or expired")
		}
		if err != nil {
			return Quote{}, err
		}
		promoID = &id
		promoPercent = percent
		if fixed != nil {
			promoFixed = domain.MoneyMMK(*fixed)
		}
		if max != nil {
			promoMax = domain.MoneyMMK(*max)
		}
	}
	expires := s.now().UTC().Add(5 * time.Minute)
	quoteID := uuid.New()
	_, err = tx.Exec(ctx, `INSERT INTO fare_quotes(id,passenger_id,city_id,pricing_version_id,pickup,destination,distance_meters,duration_seconds,route_geometry,scheduled_at,promo_code_id,expires_at) VALUES($1,$2,$3,$4,ST_SetSRID(ST_MakePoint($5,$6),4326)::geography,ST_SetSRID(ST_MakePoint($7,$8),4326)::geography,$9,$10,$11,$12,$13,$14)`, quoteID, passengerID, cityID, versionID, request.Pickup.Longitude, request.Pickup.Latitude, request.Destination.Longitude, request.Destination.Latitude, route.DistanceMeters, route.DurationSeconds, route.EncodedGeometry, request.ScheduledAt, promoID, expires)
	if err != nil {
		return Quote{}, err
	}
	rows, err := tx.Query(ctx, `SELECT rt.id,rt.code,rt.name,rt.capacity,fp.base_fare_mmk,fp.included_distance_meters,fp.per_km_mmk,fp.low_speed_per_minute_mmk,fp.minimum_fare_mmk,fp.booking_fee_mmk,fp.service_fee_mmk,fp.airport_surcharge_mmk,fp.night_surcharge_mmk,fp.multiplier FROM fare_plans fp JOIN ride_types rt ON rt.id=fp.ride_type_id WHERE fp.fare_version_id=$1 AND rt.active AND rt.capacity >= $2 ORDER BY rt.display_order`, versionID, request.Passengers)
	if err != nil {
		return Quote{}, err
	}
	defer rows.Close()
	quote := Quote{QuoteID: quoteID, PricingVersionID: versionID, ExpiresAt: expires, DistanceMeters: route.DistanceMeters, DurationSeconds: route.DurationSeconds, RouteGeometry: route.EncodedGeometry}
	for rows.Next() {
		var option RideOption
		var base, perKM, lowSpeed, minimum, booking, service, airport, night int64
		var included int64
		var multiplier float64
		if err = rows.Scan(&option.RideTypeID, &option.Code, &option.Name, &option.Capacity, &base, &included, &perKM, &lowSpeed, &minimum, &booking, &service, &airport, &night, &multiplier); err != nil {
			return Quote{}, err
		}
		extra := max64(0, route.DistanceMeters-included)
		distanceFare := int64(math.Ceil(float64(extra*perKM) / 1000))
		transport := domain.MoneyMMK(math.Ceil(float64(base+distanceFare) * multiplier))
		if transport < domain.MoneyMMK(minimum) {
			transport = domain.MoneyMMK(minimum)
		}
		subtotal := transport + domain.MoneyMMK(booking+service)
		discount := domain.MoneyMMK(0)
		if promoPercent != nil {
			if (promoRideTypeID == nil || *promoRideTypeID == option.RideTypeID) && (promoService == nil || *promoService == "ride") && subtotal >= promoMinimum {
				discount = domain.MoneyMMK(math.Floor(float64(transport) * (*promoPercent) / 100))
			}
		}
		promoApplies := (promoRideTypeID == nil || *promoRideTypeID == option.RideTypeID) && (promoService == nil || *promoService == "ride") && subtotal >= promoMinimum
		if promoApplies && promoFixed > discount {
			discount = promoFixed
		}
		if promoMax > 0 && discount > promoMax {
			discount = promoMax
		}
		if discount > transport {
			discount = transport
		}
		total := subtotal - discount
		option.Fare = total
		option.Currency = "MMK"
		option.PricingBreakdown = Breakdown{BaseFareMMK: domain.MoneyMMK(base), IncludedDistanceMeters: included, ExtraDistanceMeters: extra, DistanceFareMMK: domain.MoneyMMK(distanceFare), LowSpeedFareMMK: 0, BookingFeeMMK: domain.MoneyMMK(booking), ServiceFeeMMK: domain.MoneyMMK(service), SurchargeMMK: 0, DiscountMMK: discount, TotalMMK: total}
		breakdown := option.PricingBreakdown
		_, err = tx.Exec(ctx, `INSERT INTO fare_quote_options(quote_id,ride_type_id,transport_fare_mmk,low_speed_fare_mmk,booking_fee_mmk,service_fee_mmk,surcharge_mmk,discount_mmk,total_mmk,breakdown) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, quoteID, option.RideTypeID, transport, 0, booking, service, 0, discount, total, breakdown)
		if err != nil {
			return Quote{}, fmt.Errorf("store quote option: %w", err)
		}
		quote.RideOptions = append(quote.RideOptions, option)
	}
	if err = rows.Err(); err != nil {
		return Quote{}, err
	}
	if len(quote.RideOptions) == 0 {
		return Quote{}, ErrNoPricing
	}
	if err = tx.Commit(ctx); err != nil {
		return Quote{}, err
	}
	return quote, nil
}
func (s *Service) LoadOption(ctx context.Context, quoteID, rideTypeID uuid.UUID) (Quote, RideOption, error) {
	var q Quote
	var o RideOption
	var expires time.Time
	var breakdown Breakdown
	err := s.db.QueryRow(ctx, `SELECT q.id,q.pricing_version_id,q.expires_at,q.distance_meters,q.duration_seconds,coalesce(q.route_geometry,''),rt.id,rt.code,rt.name,rt.capacity,fqo.total_mmk,fqo.currency,fqo.breakdown FROM fare_quotes q JOIN fare_quote_options fqo ON fqo.quote_id=q.id JOIN ride_types rt ON rt.id=fqo.ride_type_id WHERE q.id=$1 AND rt.id=$2`, quoteID, rideTypeID).Scan(&q.QuoteID, &q.PricingVersionID, &expires, &q.DistanceMeters, &q.DurationSeconds, &q.RouteGeometry, &o.RideTypeID, &o.Code, &o.Name, &o.Capacity, &o.Fare, &o.Currency, &breakdown)
	if err != nil {
		return Quote{}, RideOption{}, err
	}
	if !s.now().Before(expires) {
		return Quote{}, RideOption{}, ErrQuoteExpired
	}
	q.ExpiresAt = expires
	o.PricingBreakdown = breakdown
	return q, o, nil
}
func max64(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}
