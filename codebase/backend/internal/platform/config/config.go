package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Environment      string
	HTTPAddr         string
	DatabaseURL      string
	RedisURL         string
	PublicWebOrigins []string
	JWTSecret        string
	OTPSecret        string
	EncryptionKey    string
	AccessTokenTTL   time.Duration
	RefreshTokenTTL  time.Duration
	SMSProvider      string
	DevelopmentOTP   bool
	SMSEndpoint      string
	SMSAPIKey        string
	SMSSender        string
	MapProvider      string
	MapBaseURL       string
	GeocodeBaseURL   string
	StorageProvider  string
	StorageEndpoint  string
	StorageBucket    string
	StorageAccessKey string
	StorageSecretKey string
	StorageUseTLS    bool
	FCMProjectID     string
	FCMCredentials   string
	APNSTeamID       string
	APNSKeyID        string
	APNSBundleID     string
	APNSKeyFile      string
	PaymentProvider  string
	PaymentEndpoint  string
	PaymentAPIKey    string
}

func Load() (Config, error) {
	cfg := Config{
		Environment: env("APP_ENV", "local"), HTTPAddr: env("HTTP_ADDR", ":8080"),
		DatabaseURL: os.Getenv("DATABASE_URL"), RedisURL: env("REDIS_URL", "redis://localhost:6379"),
		PublicWebOrigins: splitCSV(env("PUBLIC_WEB_ORIGINS", "http://localhost:4321")),
		JWTSecret:        os.Getenv("JWT_SECRET"), OTPSecret: os.Getenv("OTP_SECRET"), EncryptionKey: os.Getenv("ENCRYPTION_KEY"),
		AccessTokenTTL: duration("ACCESS_TOKEN_TTL", 15*time.Minute), RefreshTokenTTL: duration("REFRESH_TOKEN_TTL", 30*24*time.Hour),
		SMSProvider: env("SMS_PROVIDER", "development"), DevelopmentOTP: boolean("DEVELOPMENT_OTP_ENABLED", false),
		SMSEndpoint: os.Getenv("SMS_ENDPOINT"), SMSAPIKey: os.Getenv("SMS_API_KEY"), SMSSender: os.Getenv("SMS_SENDER"),
		MapProvider: env("MAP_PROVIDER", "osrm"), MapBaseURL: env("MAP_BASE_URL", "http://localhost:5000"), GeocodeBaseURL: env("GEOCODE_BASE_URL", "https://nominatim.openstreetmap.org"),
		StorageProvider: env("STORAGE_PROVIDER", "minio"), StorageEndpoint: env("STORAGE_ENDPOINT", "localhost:9000"),
		StorageBucket: env("STORAGE_BUCKET", "labar"), StorageAccessKey: os.Getenv("STORAGE_ACCESS_KEY"), StorageSecretKey: os.Getenv("STORAGE_SECRET_KEY"), StorageUseTLS: boolean("STORAGE_USE_TLS", false),
		FCMProjectID: os.Getenv("FCM_PROJECT_ID"), FCMCredentials: os.Getenv("FCM_CREDENTIALS_FILE"),
		APNSTeamID: os.Getenv("APNS_TEAM_ID"), APNSKeyID: os.Getenv("APNS_KEY_ID"), APNSBundleID: os.Getenv("APNS_BUNDLE_ID"), APNSKeyFile: os.Getenv("APNS_KEY_FILE"),
		PaymentProvider: os.Getenv("PAYMENT_PROVIDER"), PaymentEndpoint: os.Getenv("PAYMENT_ENDPOINT"), PaymentAPIKey: os.Getenv("PAYMENT_API_KEY"),
	}
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Validate() error {
	if c.HTTPAddr == "" || c.DatabaseURL == "" || c.RedisURL == "" {
		return errors.New("HTTP_ADDR, DATABASE_URL and REDIS_URL are required")
	}
	if len(c.JWTSecret) < 32 || len(c.OTPSecret) < 32 || len(c.EncryptionKey) < 32 {
		return errors.New("JWT_SECRET, OTP_SECRET and ENCRYPTION_KEY must each contain at least 32 characters")
	}
	if c.Environment != "local" && c.DevelopmentOTP {
		return errors.New("DEVELOPMENT_OTP_ENABLED is forbidden outside local environment")
	}
	if c.SMSProvider == "development" && !c.DevelopmentOTP {
		return errors.New("development SMS provider requires DEVELOPMENT_OTP_ENABLED=true")
	}
	if c.SMSProvider != "development" && (c.SMSEndpoint == "" || c.SMSAPIKey == "" || c.SMSSender == "") {
		return errors.New("production SMS provider requires SMS_ENDPOINT, SMS_API_KEY and SMS_SENDER")
	}
	if c.Environment != "local" && c.SMSProvider != "development" && !strings.HasPrefix(c.SMSEndpoint, "https://") {
		return errors.New("production SMS endpoint must use HTTPS")
	}
	if c.MapProvider != "osrm" {
		return errors.New("MAP_PROVIDER must be osrm for this build")
	}
	if c.StorageEndpoint == "" || c.StorageBucket == "" || c.StorageAccessKey == "" || c.StorageSecretKey == "" {
		return errors.New("object storage endpoint, bucket and credentials are required")
	}
	if c.PaymentProvider != "" && (c.PaymentEndpoint == "" || c.PaymentAPIKey == "") {
		return errors.New("configured payment provider requires PAYMENT_ENDPOINT and PAYMENT_API_KEY")
	}
	if c.Environment != "local" && c.PaymentProvider != "" && !strings.HasPrefix(c.PaymentEndpoint, "https://") {
		return errors.New("production payment endpoint must use HTTPS")
	}
	if len(c.PublicWebOrigins) == 0 {
		return errors.New("PUBLIC_WEB_ORIGINS must contain at least one explicit origin")
	}
	for _, origin := range c.PublicWebOrigins {
		if origin == "*" {
			return errors.New("wildcard CORS origin is not allowed")
		}
	}
	return nil
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}
func splitCSV(value string) []string {
	var out []string
	for _, item := range strings.Split(value, ",") {
		if item = strings.TrimSpace(item); item != "" {
			out = append(out, item)
		}
	}
	return out
}
func boolean(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}
func duration(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}
func (c Config) String() string {
	return fmt.Sprintf("environment=%s http_addr=%s sms_provider=%s map_provider=%s storage_provider=%s", c.Environment, c.HTTPAddr, c.SMSProvider, c.MapProvider, c.StorageProvider)
}
