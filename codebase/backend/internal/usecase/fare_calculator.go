package usecase

import (
	"errors"
	"math"
	"time"

	"github.com/Filip2k03/labar-backend/internal/domain"
	"github.com/google/uuid"
)

var (
	ErrInvalidDistance = errors.New("distance_km must be greater than zero")
	ErrInvalidCredits  = errors.New("promo_credits cannot be negative")
	ErrInvalidPayment  = errors.New("unsupported payment_method")
)

type FareCalculator struct {
	policy domain.FarePolicy
	now    func() time.Time
}

func NewFareCalculator(policy domain.FarePolicy) FareCalculator {
	return FareCalculator{policy: policy, now: time.Now}
}

func DefaultFarePolicy() domain.FarePolicy {
	return domain.FarePolicy{
		Version:                 "MM-2026-08-v1",
		MinimumTransportFareMMK: 5000,
		IncludedDistanceKm:      2.0,
		DistanceStepKm:          0.1,
		DistanceStepFareMMK:     150,
		ServiceFeeMMK:           1500,
		CashRoundingUnitMMK:     500,
		PromoCreditValueMMK:     10,
	}
}

func (c FareCalculator) Policy() domain.FarePolicy { return c.policy }

func (c FareCalculator) Quote(req domain.FareQuoteRequest) (domain.FareQuote, error) {
	if req.DistanceKm <= 0 || math.IsNaN(req.DistanceKm) || math.IsInf(req.DistanceKm, 0) {
		return domain.FareQuote{}, ErrInvalidDistance
	}
	if req.PromoCredits < 0 {
		return domain.FareQuote{}, ErrInvalidCredits
	}
	if !supportedPayment(req.PaymentMethod) {
		return domain.FareQuote{}, ErrInvalidPayment
	}

	policy := c.policy
	extraKm := math.Max(0, req.DistanceKm-policy.IncludedDistanceKm)
	extraSteps := int64(math.Ceil((extraKm / policy.DistanceStepKm) - 1e-9))
	extraFare := domain.MoneyMMK(extraSteps) * policy.DistanceStepFareMMK
	transportFare := policy.MinimumTransportFareMMK + extraFare

	// Promo credits discount transport only. The fixed service fee remains due.
	requestedDiscount := domain.MoneyMMK(req.PromoCredits) * policy.PromoCreditValueMMK
	promoDiscount := minMoney(requestedDiscount, transportFare)
	creditsApplied := int64(promoDiscount / policy.PromoCreditValueMMK)
	subtotal := transportFare - promoDiscount + policy.ServiceFeeMMK

	payable, rounding := subtotal, domain.MoneyMMK(0)
	if req.PaymentMethod == domain.PaymentMethodCash {
		payable = roundUp(subtotal, policy.CashRoundingUnitMMK)
		rounding = payable - subtotal
	}

	billableDistance := policy.IncludedDistanceKm + float64(extraSteps)*policy.DistanceStepKm
	if req.DistanceKm <= policy.IncludedDistanceKm {
		billableDistance = req.DistanceKm
	}
	now := c.now().UTC()
	return domain.FareQuote{
		QuoteID: uuid.NewString(), PolicyVersion: policy.Version,
		RequestedDistanceKm: round3(req.DistanceKm), BillableDistanceKm: round1(billableDistance),
		PaymentMethod: req.PaymentMethod, Currency: "MMK",
		Breakdown: domain.FareBreakdown{
			TransportFareMMK: transportFare, ExtraDistanceSteps: extraSteps,
			ExtraDistanceFareMMK: extraFare, ServiceFeeMMK: policy.ServiceFeeMMK,
			PromoCreditsApplied: creditsApplied, PromoDiscountMMK: promoDiscount,
			SubtotalMMK: subtotal, CashRoundingMMK: rounding, PayableMMK: payable,
		},
		ExpiresAt: now.Add(5 * time.Minute),
	}, nil
}

func supportedPayment(method domain.PaymentMethod) bool {
	switch method {
	case domain.PaymentMethodCash, domain.PaymentMethodKBZPay, domain.PaymentMethodWavePay, domain.PaymentMethodAYAPay:
		return true
	default:
		return false
	}
}

func roundUp(value, unit domain.MoneyMMK) domain.MoneyMMK {
	if unit <= 0 || value%unit == 0 {
		return value
	}
	return ((value / unit) + 1) * unit
}
func minMoney(a, b domain.MoneyMMK) domain.MoneyMMK {
	if a < b {
		return a
	}
	return b
}
func round1(value float64) float64 { return math.Round(value*10) / 10 }
func round3(value float64) float64 { return math.Round(value*1000) / 1000 }
