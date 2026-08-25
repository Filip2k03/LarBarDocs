package config

import (
	"strings"
	"testing"
)

func TestProductionRejectsDevelopmentOTP(t *testing.T) {
	cfg := Config{Environment: "production", HTTPAddr: ":8080", DatabaseURL: "postgres://db", RedisURL: "redis://cache", PublicWebOrigins: []string{"https://labartaxi.com", "https://www.labartaxi.com"}, JWTSecret: strings.Repeat("j", 32), OTPSecret: strings.Repeat("o", 32), EncryptionKey: strings.Repeat("e", 32), SMSProvider: "development", DevelopmentOTP: true}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected production development OTP rejection")
	}
}
func TestWildcardCORSRejected(t *testing.T) {
	cfg := Config{Environment: "local", HTTPAddr: ":8080", DatabaseURL: "postgres://db", RedisURL: "redis://cache", PublicWebOrigins: []string{"*"}, JWTSecret: strings.Repeat("j", 32), OTPSecret: strings.Repeat("o", 32), EncryptionKey: strings.Repeat("e", 32), SMSProvider: "development", DevelopmentOTP: true}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected wildcard CORS rejection")
	}
}
