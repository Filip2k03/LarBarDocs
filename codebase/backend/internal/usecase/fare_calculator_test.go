package usecase

import (
	"github.com/Filip2k03/labar-backend/internal/domain"
	"testing"
)

func TestFareQuotePolicyExamples(t *testing.T) {
	calculator := NewFareCalculator(DefaultFarePolicy())
	tests := []struct {
		name                                             string
		distance                                         float64
		method                                           domain.PaymentMethod
		credits                                          int64
		transport, service, discount, cashRound, payable domain.MoneyMMK
	}{
		{"minimum route digital", 1.0, domain.PaymentMethodKBZPay, 0, 5000, 1500, 0, 0, 6500},
		{"two kilometres included", 2.0, domain.PaymentMethodAYAPay, 0, 5000, 1500, 0, 0, 6500},
		{"one distance step digital", 2.1, domain.PaymentMethodWavePay, 0, 5150, 1500, 0, 0, 6650},
		{"cash rounds upward to 500", 2.4, domain.PaymentMethodCash, 0, 5600, 1500, 0, 400, 7500},
		{"cash rounds upward to 1000 boundary", 2.9, domain.PaymentMethodCash, 0, 6350, 1500, 0, 150, 8000},
		{"promo credit is ten kyats", 2.1, domain.PaymentMethodKBZPay, 100, 5150, 1500, 1000, 0, 5650},
		{"credits cannot remove service fee", 1.0, domain.PaymentMethodKBZPay, 9999, 5000, 1500, 5000, 0, 1500},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			quote, err := calculator.Quote(domain.FareQuoteRequest{DistanceKm: tt.distance, PaymentMethod: tt.method, PromoCredits: tt.credits})
			if err != nil {
				t.Fatalf("Quote() error = %v", err)
			}
			got := quote.Breakdown
			if got.TransportFareMMK != tt.transport || got.ServiceFeeMMK != tt.service || got.PromoDiscountMMK != tt.discount || got.CashRoundingMMK != tt.cashRound || got.PayableMMK != tt.payable {
				t.Fatalf("breakdown = %+v", got)
			}
		})
	}
}

func TestFareQuoteValidation(t *testing.T) {
	c := NewFareCalculator(DefaultFarePolicy())
	if _, err := c.Quote(domain.FareQuoteRequest{DistanceKm: 0, PaymentMethod: domain.PaymentMethodCash}); err != ErrInvalidDistance {
		t.Fatalf("expected distance error, got %v", err)
	}
	if _, err := c.Quote(domain.FareQuoteRequest{DistanceKm: 1, PaymentMethod: "CARD"}); err != ErrInvalidPayment {
		t.Fatalf("expected payment error, got %v", err)
	}
	if _, err := c.Quote(domain.FareQuoteRequest{DistanceKm: 1, PaymentMethod: domain.PaymentMethodCash, PromoCredits: -1}); err != ErrInvalidCredits {
		t.Fatalf("expected credits error, got %v", err)
	}
}
