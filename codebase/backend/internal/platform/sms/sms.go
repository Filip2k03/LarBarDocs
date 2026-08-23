package sms

import (
	"context"
	"errors"
	"log/slog"
)

var ErrProviderUnavailable = errors.New("SMS provider unavailable")

type Provider interface {
	SendOTP(context.Context, string, string) error
}
type Development struct{ enabled bool }

func NewDevelopment(enabled bool) *Development { return &Development{enabled: enabled} }
func (d *Development) SendOTP(ctx context.Context, phone, code string) error {
	if !d.enabled {
		return ErrProviderUnavailable
	}
	slog.WarnContext(ctx, "development OTP generated", "phone_suffix", suffix(phone), "otp", code)
	return nil
}
func suffix(value string) string {
	if len(value) <= 4 {
		return "redacted"
	}
	return "***" + value[len(value)-4:]
}
