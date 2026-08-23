package main

import (
	"context"
	"errors"
	"github.com/Filip2k03/labar-backend/internal/admin"
	"github.com/Filip2k03/labar-backend/internal/auth"
	"github.com/Filip2k03/labar-backend/internal/content"
	"github.com/Filip2k03/labar-backend/internal/devices"
	"github.com/Filip2k03/labar-backend/internal/dispatch"
	"github.com/Filip2k03/labar-backend/internal/driverreg"
	"github.com/Filip2k03/labar-backend/internal/drivers"
	"github.com/Filip2k03/labar-backend/internal/passengers"
	"github.com/Filip2k03/labar-backend/internal/payments"
	"github.com/Filip2k03/labar-backend/internal/platform/config"
	"github.com/Filip2k03/labar-backend/internal/platform/database"
	"github.com/Filip2k03/labar-backend/internal/platform/maps"
	platformredis "github.com/Filip2k03/labar-backend/internal/platform/redis"
	"github.com/Filip2k03/labar-backend/internal/platform/sms"
	"github.com/Filip2k03/labar-backend/internal/platform/storage"
	"github.com/Filip2k03/labar-backend/internal/pricing"
	"github.com/Filip2k03/labar-backend/internal/realtime"
	"github.com/Filip2k03/labar-backend/internal/rides"
	"github.com/Filip2k03/labar-backend/internal/safety"
	"github.com/Filip2k03/labar-backend/internal/support"
	"github.com/Filip2k03/labar-backend/internal/tracking"
	"github.com/Filip2k03/labar-backend/internal/transport/httpapi"
	"github.com/Filip2k03/labar-backend/internal/wallet"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	if len(os.Args) == 2 && os.Args[1] == "--healthcheck" {
		healthcheck()
		return
	}
	zerolog.TimeFieldFormat = time.RFC3339Nano
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Str("service", "labar-api").Logger()
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("invalid configuration")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	db, err := database.Open(ctx, cfg.DatabaseURL, cfg.EncryptionKey)
	if err != nil {
		cancel()
		log.Fatal().Err(err).Msg("database unavailable")
	}
	redisClient, err := platformredis.Open(ctx, cfg.RedisURL)
	cancel()
	if err != nil {
		db.Close()
		log.Fatal().Err(err).Msg("Redis unavailable")
	}
	defer db.Close()
	defer redisClient.Close()
	minioClient, err := minio.New(cfg.StorageEndpoint, &minio.Options{Creds: credentials.NewStaticV4(cfg.StorageAccessKey, cfg.StorageSecretKey, ""), Secure: cfg.StorageUseTLS})
	if err != nil {
		log.Fatal().Err(err).Msg("object storage configuration invalid")
	}
	storageService := storage.NewService(db, minioClient, cfg.StorageBucket)
	bucketCtx, bucketCancel := context.WithTimeout(context.Background(), 10*time.Second)
	err = storageService.EnsureBucket(bucketCtx)
	bucketCancel()
	if err != nil {
		log.Fatal().Err(err).Msg("object storage unavailable")
	}
	var smsProvider sms.Provider
	if cfg.SMSProvider == "development" {
		smsProvider = sms.NewDevelopment(cfg.DevelopmentOTP)
	} else {
		smsProvider, err = sms.NewHTTP(cfg.SMSEndpoint, cfg.SMSAPIKey, cfg.SMSSender)
		if err != nil {
			log.Fatal().Err(err).Msg("SMS provider configuration invalid")
		}
	}
	authService := auth.NewService(db, redisClient, smsProvider, cfg.JWTSecret, cfg.OTPSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	routeProvider := maps.NewOSRM(cfg.MapBaseURL)
	deps := httpapi.Dependencies{DB: db, Redis: redisClient, Origins: cfg.PublicWebOrigins, Auth: authService, Devices: devices.NewService(db), Pricing: pricing.NewService(db, routeProvider), Rides: rides.NewService(db), Drivers: drivers.NewService(db), Passengers: passengers.NewService(db), Dispatch: dispatch.NewService(db, redisClient), Tracking: tracking.NewService(db, redisClient), DriverReg: driverreg.NewService(db), Storage: storageService, Safety: safety.NewService(db), Support: support.NewService(db), Content: content.NewService(db), Admin: admin.NewService(db), Realtime: realtime.NewGateway(db, redisClient), Maps: routeProvider, Geocoder: maps.NewNominatim(cfg.GeocodeBaseURL), Wallet: wallet.NewService(db), Payments: payments.NewService(db, nil)}
	server := &http.Server{Addr: cfg.HTTPAddr, Handler: httpapi.NewRouter(deps), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 75 * time.Second, MaxHeaderBytes: 1 << 20}
	go func() {
		log.Info().Str("addr", cfg.HTTPAddr).Str("environment", cfg.Environment).Msg("API listening")
		if serveErr := server.ListenAndServe(); serveErr != nil && !errors.Is(serveErr, http.ErrServerClosed) {
			log.Fatal().Err(serveErr).Msg("API stopped unexpectedly")
		}
	}()
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGTERM, syscall.SIGINT)
	<-signals
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()
	if err = server.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown failed")
	}
	log.Info().Msg("API stopped")
}
func healthcheck() {
	addr := os.Getenv("HTTP_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	if addr[0] == ':' {
		addr = "127.0.0.1" + addr
	}
	client := http.Client{Timeout: 2 * time.Second}
	response, err := client.Get("http://" + addr + "/health")
	if err != nil {
		os.Exit(1)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		os.Exit(1)
	}
}
