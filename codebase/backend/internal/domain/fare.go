package domain

import "time"

// MoneyMMK is an integer amount in Myanmar kyats. The backend never uses
// floating-point values for money.
type MoneyMMK int64

type FarePolicy struct {
	Version                 string   `json:"version"`
	MinimumTransportFareMMK MoneyMMK `json:"minimum_transport_fare_mmk"`
	IncludedDistanceKm      float64  `json:"included_distance_km"`
	DistanceStepKm          float64  `json:"distance_step_km"`
	DistanceStepFareMMK     MoneyMMK `json:"distance_step_fare_mmk"`
	ServiceFeeMMK           MoneyMMK `json:"service_fee_mmk"`
	CashRoundingUnitMMK     MoneyMMK `json:"cash_rounding_unit_mmk"`
	PromoCreditValueMMK     MoneyMMK `json:"promo_credit_value_mmk"`
}

type FareQuoteRequest struct {
	DistanceKm    float64       `json:"distance_km"`
	PaymentMethod PaymentMethod `json:"payment_method"`
	PromoCredits  int64         `json:"promo_credits"`
}

type FareBreakdown struct {
	TransportFareMMK     MoneyMMK `json:"transport_fare_mmk"`
	ExtraDistanceSteps   int64    `json:"extra_distance_steps"`
	ExtraDistanceFareMMK MoneyMMK `json:"extra_distance_fare_mmk"`
	ServiceFeeMMK        MoneyMMK `json:"service_fee_mmk"`
	PromoCreditsApplied  int64    `json:"promo_credits_applied"`
	PromoDiscountMMK     MoneyMMK `json:"promo_discount_mmk"`
	SubtotalMMK          MoneyMMK `json:"subtotal_mmk"`
	CashRoundingMMK      MoneyMMK `json:"cash_rounding_mmk"`
	PayableMMK           MoneyMMK `json:"payable_mmk"`
}

type FareQuote struct {
	QuoteID             string        `json:"quote_id"`
	PolicyVersion       string        `json:"policy_version"`
	RequestedDistanceKm float64       `json:"requested_distance_km"`
	BillableDistanceKm  float64       `json:"billable_distance_km"`
	PaymentMethod       PaymentMethod `json:"payment_method"`
	Currency            string        `json:"currency"`
	Breakdown           FareBreakdown `json:"breakdown"`
	ExpiresAt           time.Time     `json:"expires_at"`
}

type PassengerScreen struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Stage       string   `json:"stage"`
	Description string   `json:"description"`
	Next        []string `json:"next,omitempty"`
}
