package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	apimiddleware "github.com/Filip2k03/labar-backend/api/middleware"
	"github.com/Filip2k03/labar-backend/api/response"
	"github.com/Filip2k03/labar-backend/api/validation"
	"github.com/Filip2k03/labar-backend/internal/admin"
	"github.com/Filip2k03/labar-backend/internal/auth"
	"github.com/Filip2k03/labar-backend/internal/content"
	"github.com/Filip2k03/labar-backend/internal/devices"
	"github.com/Filip2k03/labar-backend/internal/dispatch"
	"github.com/Filip2k03/labar-backend/internal/driverreg"
	"github.com/Filip2k03/labar-backend/internal/drivers"
	"github.com/Filip2k03/labar-backend/internal/notifications"
	"github.com/Filip2k03/labar-backend/internal/passengers"
	"github.com/Filip2k03/labar-backend/internal/payments"
	platformmaps "github.com/Filip2k03/labar-backend/internal/platform/maps"
	"github.com/Filip2k03/labar-backend/internal/platform/storage"
	"github.com/Filip2k03/labar-backend/internal/pricing"
	"github.com/Filip2k03/labar-backend/internal/realtime"
	"github.com/Filip2k03/labar-backend/internal/rides"
	"github.com/Filip2k03/labar-backend/internal/safety"
	"github.com/Filip2k03/labar-backend/internal/support"
	"github.com/Filip2k03/labar-backend/internal/tracking"
	"github.com/Filip2k03/labar-backend/internal/wallet"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	redisv9 "github.com/redis/go-redis/v9"
)

type Dependencies struct {
	DB            *pgxpool.Pool
	Redis         *redisv9.Client
	Origins       []string
	Auth          *auth.Service
	Devices       *devices.Service
	Pricing       *pricing.Service
	Rides         *rides.Service
	Drivers       *drivers.Service
	Passengers    *passengers.Service
	Dispatch      *dispatch.Service
	Tracking      *tracking.Service
	DriverReg     *driverreg.Service
	Storage       *storage.Service
	Safety        *safety.Service
	Support       *support.Service
	Content       *content.Service
	Admin         *admin.Service
	Realtime      *realtime.Gateway
	Maps          platformmaps.Provider
	Geocoder      platformmaps.Geocoder
	Wallet        *wallet.Service
	Payments      *payments.Service
	Notifications *notifications.Service
}
type API struct{ deps Dependencies }

func NewRouter(deps Dependencies) http.Handler {
	api := API{deps: deps}
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID, chimiddleware.RealIP, requestLogger, chimiddleware.Recoverer, apimiddleware.SecureHeaders, apimiddleware.Metrics)
	r.Use(chimiddleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{AllowedOrigins: deps.Origins, AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}, AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "Idempotency-Key", "X-Request-ID"}, ExposedHeaders: []string{"X-Request-ID"}, MaxAge: 300}))
	r.Get("/", api.root)
	r.Get("/health", api.live)
	r.Get("/health/live", api.live)
	r.Get("/ready", api.ready)
	r.Get("/health/ready", api.ready)
	r.Handle("/metrics", promhttp.Handler())
	r.Route("/api/v1", func(r chi.Router) {
		api.publicRoutes(r)
		api.authRoutes(r)
		r.Group(func(r chi.Router) { r.Use(apimiddleware.Authenticate(deps.Auth)); api.authenticatedRoutes(r) })
	})
	return r
}
func (api API) publicRoutes(r chi.Router) {
	r.Route("/public", func(r chi.Router) {
		r.Get("/config", api.publicConfig)
		r.Get("/cities", api.cities)
		r.Get("/cities/{slug}", api.city)
		r.Get("/ride-types", api.rideTypes)
		r.Get("/fares", api.fares)
		r.With(api.rateLimit("public_quote", 30, time.Minute)).Post("/fares/estimate", api.publicQuote)
		r.With(api.rateLimit("public_quote", 30, time.Minute)).Post("/bookings/quote", api.publicQuote)
		r.With(apimiddleware.Authenticate(api.deps.Auth), apimiddleware.RequireRoles("passenger", "admin", "super_admin")).Post("/bookings", api.createRide)
		r.Get("/promotions", api.promotions)
		r.Get("/faqs", api.faqs)
		r.Get("/help/categories", api.helpCategories)
		r.Get("/help/articles", api.helpArticles)
		r.Get("/help/articles/{slug}", api.helpArticle)
		r.Get("/help/search", api.helpSearch)
		r.Get("/status", api.publicStatus)
		r.Get("/app-version", api.mobileConfig)
		r.Get("/trip-share/{token}", api.publicTripShare)
		r.With(api.rateLimit("public_support", 5, time.Hour)).Post("/support/tickets", api.publicSupport)
		r.With(api.rateLimit("public_contact", 5, time.Hour)).Post("/contact", api.publicSupport)
		r.With(api.rateLimit("public_driver_application", 5, time.Hour)).Post("/driver-applications", api.publicSupport)
		r.With(api.rateLimit("public_business", 5, time.Hour)).Post("/business/inquiries", api.publicSupport)
	})
	r.Get("/mobile/config", api.mobileConfig)
}
func (api API) authRoutes(r chi.Router) {
	r.Route("/auth", func(r chi.Router) {
		r.Post("/otp/request", api.requestOTP)
		r.Post("/otp/verify", api.verifyOTP)
		r.With(api.rateLimit("staff_login", 10, 15*time.Minute)).Post("/staff/login", api.staffLogin)
		r.Post("/refresh", api.refresh)
		r.Group(func(r chi.Router) {
			r.Use(apimiddleware.Authenticate(api.deps.Auth))
			r.Post("/logout", api.logout)
			r.Get("/me", api.me)
		})
	})
}
func (api API) authenticatedRoutes(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(api.rateLimit("locations", 120, time.Minute))
		r.Get("/locations/search", api.locationSearch)
		r.Get("/locations/reverse-geocode", api.reverseGeocode)
		r.Post("/routes/estimate", api.routeEstimate)
	})
	r.Post("/devices/register", api.registerDevice)
	r.Delete("/devices/{id}", api.deleteDevice)
	r.Get("/realtime", api.realtime)
	r.Get("/notifications", api.userNotifications)
	r.Post("/notifications/{id}/read", api.readNotification)
	r.Route("/passenger", func(r chi.Router) {
		r.Use(apimiddleware.RequireRoles("passenger", "admin", "super_admin"))
		r.Get("/profile", api.passengerProfile)
		r.Get("/wallet", api.passengerWallet)
		r.Get("/wallet/transactions", api.passengerWalletTransactions)
		r.Get("/payment-methods", api.paymentMethods)
		r.Post("/payment-methods", api.registerPaymentMethod)
		r.Delete("/payment-methods/{id}", api.deletePaymentMethod)
		r.Patch("/profile", api.patchPassengerProfile)
		r.Get("/places", api.passengerPlaces)
		r.Post("/places", api.createPassengerPlace)
		r.Patch("/places/{id}", api.updatePassengerPlace)
		r.Delete("/places/{id}", api.deletePassengerPlace)
		r.Post("/rides/quote", api.passengerQuote)
		r.Post("/rides", api.createRide)
		r.Get("/rides", api.passengerRideHistory)
		r.Get("/rides/{id}", api.getRide)
		r.Post("/rides/{id}/cancel", api.cancelPassengerRide)
		r.Get("/rides/{id}/receipt", api.receipt)
		r.Post("/rides/{id}/rating", api.rateDriver)
		r.Post("/rides/{id}/share", api.shareRide)
		r.Post("/rides/{id}/sos", api.sos)
		r.Post("/live-activities/register", api.liveActivity)
		r.Get("/widget/current-ride", api.passengerWidget)
		r.Get("/support/tickets", api.supportTickets)
		r.Post("/support/tickets", api.supportTicket)
	})
	r.Route("/driver", func(r chi.Router) {
		r.Use(apimiddleware.RequireRoles("driver", "admin", "super_admin"))
		r.Get("/dashboard", api.driverDashboard)
		r.Get("/rides", api.driverRideHistory)
		r.Get("/rides/{id}", api.getRide)
		r.Post("/availability", api.driverAvailability)
		r.Post("/heartbeat", api.driverHeartbeat)
		r.Post("/location", api.driverLocation)
		r.Get("/offers/current", api.currentOffer)
		r.Post("/offers/{id}/accept", api.acceptOffer)
		r.Post("/offers/{id}/reject", api.rejectOffer)
		r.Post("/rides/{id}/enroute", api.driverEnroute)
		r.Post("/rides/{id}/arrived", api.driverArrived)
		r.Post("/rides/{id}/pickup-pin", api.pickupConfirmed)
		r.Post("/rides/{id}/start", api.startTrip)
		r.Post("/rides/{id}/complete", api.completeTrip)
		r.Post("/rides/{id}/cash-collected", api.cashCollected)
		r.Post("/rides/{id}/cancel", api.cancelDriverRide)
		r.Post("/rides/{id}/sos", api.sos)
		r.Get("/earnings/today", api.earningsToday)
		r.Get("/widget/status", api.driverDashboard)
		r.Get("/widget/earnings-today", api.earningsToday)
		r.Post("/live-activities/register", api.liveActivity)
	})
	r.Route("/driver-registration", func(r chi.Router) {
		r.Use(apimiddleware.RequireRoles("marketer", "driver_registrar", "registration_manager"))
		r.Route("/staff/cases", func(r chi.Router) {
			r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.read")).Get("/", api.staffCases)
			r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.create")).Post("/", api.createStaffCase)
			r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.read")).Get("/{case_id}", api.staffCase)
			r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.edit")).Put("/{case_id}/steps/{step}", api.saveStaffCaseStep)
			r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.submit")).Post("/{case_id}/submit", api.submitStaffCase)
		})
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.edit")).Post("/uploads/presign", api.presignStaffUpload)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.registration.edit")).Post("/uploads/{id}/complete", api.completeUpload)
	})
	r.Route("/admin", func(r chi.Router) {
		r.Use(apimiddleware.RequireRoles("super_admin", "admin", "operations_manager", "driver_verifier", "dispatcher"))
		r.Get("/dashboard", api.adminDashboard)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "ride.read")).Get("/rides", api.adminRides)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "ride.read")).Get("/rides/{id}", api.getRide)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "ride.cancel")).Post("/rides/{id}/cancel", api.adminCancelRide)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.approve")).Get("/driver-applications", api.adminApplications)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.approve")).Get("/driver-applications/{id}", api.adminApplicationDetail)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.approve")).Post("/driver-applications/{id}/request-documents", api.adminRequestDocuments)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.approve")).Post("/driver-applications/{id}/documents/{document_id}/decision", api.adminDocumentDecision)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.approve")).Post("/driver-applications/{id}/approve", api.adminApprove)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "driver.approve")).Post("/driver-applications/{id}/reject", api.adminReject)
		r.With(apimiddleware.RequirePermission(api.deps.DB, "audit.read")).Get("/audit-logs", api.auditLogs)
	})
	r.Route("/operations", func(r chi.Router) {
		r.Use(apimiddleware.RequireRoles("super_admin", "admin", "operations_manager", "dispatcher"))
		r.Get("/dashboard", api.adminDashboard)
	})
}

func (api API) userNotifications(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Notifications.List(r.Context(), principal(r).UserID, 50)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}

func (api API) readNotification(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	if err := api.deps.Notifications.MarkRead(r.Context(), principal(r).UserID, id); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]bool{"read": true})
}

func (api API) rateLimit(scope string, limit int64, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			identity := r.RemoteAddr
			if p, ok := apimiddleware.PrincipalFrom(r.Context()); ok {
				identity = p.UserID.String()
			}
			key := "rate:" + scope + ":" + identity
			count, err := api.deps.Redis.Incr(r.Context(), key).Result()
			if err != nil {
				response.Error(w, r, http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", "Rate-limit service is unavailable.")
				return
			}
			if count == 1 {
				_ = api.deps.Redis.Expire(r.Context(), key, window).Err()
			}
			if count > limit {
				response.Error(w, r, http.StatusTooManyRequests, "RATE_LIMITED", "Try again later.")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (api API) locationSearch(w http.ResponseWriter, r *http.Request) {
	places, err := api.deps.Geocoder.Search(r.Context(), r.URL.Query().Get("q"), 5)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, places)
}

func (api API) reverseGeocode(w http.ResponseWriter, r *http.Request) {
	lat, latErr := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lng, lngErr := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	if latErr != nil || lngErr != nil {
		response.Error(w, r, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Valid lat and lng values are required.")
		return
	}
	place, err := api.deps.Geocoder.Reverse(r.Context(), platformmaps.Point{Latitude: lat, Longitude: lng})
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, place)
}

func (api API) routeEstimate(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Pickup      platformmaps.Point `json:"pickup"`
		Destination platformmaps.Point `json:"destination"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	route, err := api.deps.Maps.Route(r.Context(), body.Pickup, body.Destination)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, route)
}
func requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		wrapped := chimiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrapped, r)
		slog.InfoContext(r.Context(), "http request", "request_id", chimiddleware.GetReqID(r.Context()), "method", r.Method, "path", r.URL.Path, "status", wrapped.Status(), "bytes", wrapped.BytesWritten(), "duration_ms", time.Since(started).Milliseconds())
	})
}
func (api API) root(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, r, 200, map[string]any{"service": "labar-api", "version": "1.0.0", "api": "/api/v1"})
}
func (api API) live(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, r, 200, map[string]any{"status": "ok", "time": time.Now().UTC()})
}
func (api API) ready(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	checks := map[string]string{"postgres": "ready", "redis": "ready"}
	status := http.StatusOK
	if err := api.deps.DB.Ping(ctx); err != nil {
		checks["postgres"] = "unavailable"
		status = http.StatusServiceUnavailable
	}
	if err := api.deps.Redis.Ping(ctx).Err(); err != nil {
		checks["redis"] = "unavailable"
		status = http.StatusServiceUnavailable
	}
	response.JSON(w, r, status, map[string]any{"status": map[bool]string{true: "ready", false: "not_ready"}[status == 200], "dependencies": checks})
}
func (api API) requestOTP(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Phone   string `json:"phone"`
		Purpose string `json:"purpose"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	id, expires, err := api.deps.Auth.RequestOTP(r.Context(), body.Phone, body.Purpose)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 202, map[string]any{"challenge_id": id, "expires_at": expires})
}
func (api API) verifyOTP(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ChallengeID uuid.UUID `json:"challenge_id"`
		Phone       string    `json:"phone"`
		Code        string    `json:"code"`
		DeviceName  string    `json:"device_name"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	tokens, err := api.deps.Auth.VerifyOTP(r.Context(), body.ChallengeID, body.Phone, body.Code, body.DeviceName)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, tokens)
}
func (api API) staffLogin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		StaffID    string `json:"staff_id"`
		Password   string `json:"password"`
		AppType    string `json:"app_type"`
		DeviceName string `json:"device_name"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if body.AppType != "driverreg" {
		response.Error(w, r, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "The staff application type is invalid.")
		return
	}
	tokens, err := api.deps.Auth.StaffLogin(r.Context(), body.StaffID, body.Password, body.DeviceName)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, tokens)
}
func (api API) refresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	tokens, err := api.deps.Auth.Refresh(r.Context(), body.RefreshToken)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, tokens)
}
func (api API) logout(w http.ResponseWriter, r *http.Request) {
	p := principal(r)
	if err := api.deps.Auth.Logout(r.Context(), p.UserID, p.SessionID); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]bool{"revoked": true})
}
func (api API) me(w http.ResponseWriter, r *http.Request) {
	user, err := api.deps.Auth.User(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, user)
}
func (api API) registerDevice(w http.ResponseWriter, r *http.Request) {
	var body devices.Device
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	device, err := api.deps.Devices.Register(r.Context(), principal(r).UserID, body)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, device)
}
func (api API) deleteDevice(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	if err := api.deps.Devices.Delete(r.Context(), principal(r).UserID, id); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]bool{"deleted": true})
}
func (api API) publicConfig(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, r, 200, map[string]any{"name": "LaBar", "currency": "MMK", "locale": "my-MM", "api_version": "v1"})
}
func (api API) cities(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.Cities(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) city(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.City(r.Context(), chi.URLParam(r, "slug"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) rideTypes(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.RideTypes(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) fares(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.Fares(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) promotions(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.Promotions(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) faqs(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.FAQs(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) helpCategories(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.HelpCategories(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) helpArticles(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.HelpArticles(r.Context(), r.URL.Query().Get("category"), "")
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) helpSearch(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.HelpArticles(r.Context(), "", r.URL.Query().Get("q"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) helpArticle(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.HelpArticle(r.Context(), chi.URLParam(r, "slug"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) publicStatus(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, r, 200, map[string]any{"operational": true, "checked_at": time.Now().UTC()})
}
func (api API) mobileConfig(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Content.RemoteConfig(r.Context(), r.URL.Query().Get("app"), r.URL.Query().Get("platform"), r.URL.Query().Get("version"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) publicQuote(w http.ResponseWriter, r *http.Request) { api.quote(w, r, nil) }
func (api API) passengerQuote(w http.ResponseWriter, r *http.Request) {
	p := principal(r)
	api.quote(w, r, &p.UserID)
}
func (api API) quote(w http.ResponseWriter, r *http.Request, userID *uuid.UUID) {
	var body pricing.QuoteRequest
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	quote, err := api.deps.Pricing.Quote(r.Context(), userID, body)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, quote)
}
func (api API) createRide(w http.ResponseWriter, r *http.Request) {
	var body rides.CreateRequest
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	ride, replayed, err := api.deps.Rides.Create(r.Context(), principal(r).UserID, r.Header.Get("Idempotency-Key"), body)
	if err != nil {
		handle(w, r, err)
		return
	}
	status := http.StatusCreated
	if replayed {
		status = http.StatusOK
	}
	response.JSON(w, r, status, map[string]any{"ride": ride, "idempotent_replay": replayed})
}
func (api API) getRide(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	p := principal(r)
	ride, err := api.deps.Rides.Get(r.Context(), id, p.UserID, p.Roles)
	if err != nil {
		handle(w, r, err)
		return
	}
	events, err := api.deps.Rides.Events(r.Context(), id, parseInt(r.URL.Query().Get("after_sequence")), 100)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]any{"ride": ride, "events": events})
}
func (api API) passengerRideHistory(w http.ResponseWriter, r *http.Request) {
	api.rideHistory(w, r, false)
}
func (api API) driverRideHistory(w http.ResponseWriter, r *http.Request) {
	api.rideHistory(w, r, true)
}
func (api API) rideHistory(w http.ResponseWriter, r *http.Request, driver bool) {
	items, next, more, err := api.deps.Rides.History(r.Context(), principal(r).UserID, driver, r.URL.Query().Get("cursor"), int(parseInt(r.URL.Query().Get("limit"))))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]any{"items": items, "next_cursor": next, "has_more": more})
}

func (api API) passengerProfile(w http.ResponseWriter, r *http.Request) {
	profile, err := api.deps.Passengers.Profile(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, profile)
}
func (api API) passengerWallet(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Wallet.Summary(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) passengerWalletTransactions(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Wallet.Transactions(r.Context(), principal(r).UserID, 50)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) paymentMethods(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Payments.Methods(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) registerPaymentMethod(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Type              string `json:"type"`
		ProviderReference string `json:"provider_reference"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	method, err := api.deps.Payments.RegisterMethod(r.Context(), principal(r).UserID, body.Type, body.ProviderReference)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusCreated, method)
}
func (api API) deletePaymentMethod(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	if err := api.deps.Payments.DeleteMethod(r.Context(), principal(r).UserID, id); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]bool{"deleted": true})
}

func (api API) patchPassengerProfile(w http.ResponseWriter, r *http.Request) {
	var input passengers.ProfilePatch
	if err := validation.Decode(w, r, &input); err != nil {
		badJSON(w, r, err)
		return
	}
	profile, err := api.deps.Passengers.PatchProfile(r.Context(), principal(r).UserID, input)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, profile)
}

func (api API) passengerPlaces(w http.ResponseWriter, r *http.Request) {
	places, err := api.deps.Passengers.Places(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, places)
}

func (api API) createPassengerPlace(w http.ResponseWriter, r *http.Request) {
	var input passengers.PlaceInput
	if err := validation.Decode(w, r, &input); err != nil {
		badJSON(w, r, err)
		return
	}
	place, err := api.deps.Passengers.CreatePlace(r.Context(), principal(r).UserID, input)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusCreated, place)
}

func (api API) updatePassengerPlace(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var input passengers.PlaceInput
	if err := validation.Decode(w, r, &input); err != nil {
		badJSON(w, r, err)
		return
	}
	place, err := api.deps.Passengers.UpdatePlace(r.Context(), principal(r).UserID, id, input)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, place)
}

func (api API) deletePassengerPlace(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	if err := api.deps.Passengers.DeletePlace(r.Context(), principal(r).UserID, id); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]bool{"deleted": true})
}

func (api API) rateDriver(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var input struct {
		Stars   int      `json:"stars"`
		Tags    []string `json:"tags"`
		Comment string   `json:"comment"`
	}
	if err := validation.Decode(w, r, &input); err != nil {
		badJSON(w, r, err)
		return
	}
	if err := api.deps.Passengers.RateDriver(r.Context(), principal(r).UserID, id, input.Stars, input.Tags, input.Comment); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusCreated, map[string]bool{"recorded": true})
}
func (api API) cancelPassengerRide(w http.ResponseWriter, r *http.Request) {
	api.cancelRide(w, r, "passenger")
}
func (api API) cancelDriverRide(w http.ResponseWriter, r *http.Request) {
	api.cancelRide(w, r, "driver")
}
func (api API) cancelRide(w http.ResponseWriter, r *http.Request, actor string) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		Reason string `json:"reason"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	ride, err := api.deps.Rides.Cancel(r.Context(), id, principal(r).UserID, actor, body.Reason)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, ride)
}
func (api API) receipt(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	data, err := api.deps.Rides.Receipt(r.Context(), id, principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) shareRide(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	token, expires, err := api.deps.Safety.Share(r.Context(), principal(r).UserID, id, 24*time.Hour)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 201, map[string]any{"token": token, "path": "/api/v1/public/trip-share/" + token, "expires_at": expires})
}
func (api API) publicTripShare(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Safety.PublicShare(r.Context(), chi.URLParam(r, "token"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) sos(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		DeviceID *uuid.UUID `json:"device_id"`
		Lat      *float64   `json:"lat"`
		Lng      *float64   `json:"lng"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	eventID, err := api.deps.Safety.SOS(r.Context(), principal(r).UserID, id, body.DeviceID, body.Lat, body.Lng)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 202, map[string]any{"safety_event_id": eventID, "status": "operations_notified"})
}
func (api API) driverDashboard(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Drivers.Dashboard(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) driverAvailability(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Status string `json:"status"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	status, err := api.deps.Drivers.SetAvailability(r.Context(), principal(r).UserID, body.Status)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]string{"status": status})
}
func (api API) driverHeartbeat(w http.ResponseWriter, r *http.Request) {
	if err := api.deps.Drivers.Heartbeat(r.Context(), principal(r).UserID); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]any{"received_at": time.Now().UTC()})
}
func (api API) driverLocation(w http.ResponseWriter, r *http.Request) {
	var body tracking.Sample
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	flags, err := api.deps.Tracking.Record(r.Context(), principal(r).UserID, body)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 202, map[string]any{"accepted": true, "risk_flags": flags})
}
func (api API) currentOffer(w http.ResponseWriter, r *http.Request) {
	offer, err := api.deps.Dispatch.Current(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, offer)
}
func (api API) acceptOffer(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	rideID, err := api.deps.Dispatch.Accept(r.Context(), principal(r).UserID, id)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]any{"ride_id": rideID, "status": "driver_assigned"})
}
func (api API) rejectOffer(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		Reason string `json:"reason"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if err := api.deps.Dispatch.Reject(r.Context(), principal(r).UserID, id, body.Reason); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]bool{"rejected": true})
}
func (api API) driverArrived(w http.ResponseWriter, r *http.Request) {
	api.driverTransition(w, r, rides.DriverArrived)
}
func (api API) driverEnroute(w http.ResponseWriter, r *http.Request) {
	api.driverTransition(w, r, rides.DriverEnroute)
}
func (api API) pickupConfirmed(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		PIN string `json:"pin"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	ride, err := api.deps.Rides.VerifyPickupPIN(r.Context(), principal(r).UserID, id, body.PIN)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, ride)
}
func (api API) startTrip(w http.ResponseWriter, r *http.Request) {
	api.driverTransition(w, r, rides.InProgress)
}
func (api API) driverTransition(w http.ResponseWriter, r *http.Request, to rides.Status) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	ride, err := api.deps.Rides.DriverTransition(r.Context(), principal(r).UserID, id, to)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, ride)
}
func (api API) completeTrip(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	ride, err := api.deps.Rides.Complete(r.Context(), principal(r).UserID, id, r.Header.Get("Idempotency-Key"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, ride)
}
func (api API) cashCollected(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	if err := api.deps.Rides.ConfirmCashCollected(r.Context(), principal(r).UserID, id); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]string{"payment_status": "paid"})
}
func (api API) earningsToday(w http.ResponseWriter, r *http.Request) {
	now := time.Now().In(time.FixedZone("MMT", 6*3600+30*60))
	from := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	items, err := api.deps.Drivers.Earnings(r.Context(), principal(r).UserID, from, from.Add(24*time.Hour))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, items)
}
func (api API) staffCases(w http.ResponseWriter, r *http.Request) {
	p := principal(r)
	data, err := api.deps.DriverReg.StaffCases(r.Context(), p.UserID, hasRole(p.Roles, "registration_manager"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) createStaffCase(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ApplicantName  string     `json:"applicant_name"`
		ApplicantPhone string     `json:"applicant_phone"`
		BranchID       *uuid.UUID `json:"branch_id"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	data, err := api.deps.DriverReg.CreateStaffCase(r.Context(), principal(r).UserID, body.ApplicantName, body.ApplicantPhone, body.BranchID, chimiddleware.GetReqID(r.Context()))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusCreated, data)
}
func (api API) staffCase(w http.ResponseWriter, r *http.Request) {
	id, ok := namedPathID(w, r, "case_id")
	if !ok {
		return
	}
	p := principal(r)
	data, err := api.deps.DriverReg.StaffApplication(r.Context(), p.UserID, id, hasRole(p.Roles, "registration_manager"))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) saveStaffCaseStep(w http.ResponseWriter, r *http.Request) {
	id, ok := namedPathID(w, r, "case_id")
	if !ok {
		return
	}
	var body struct {
		Data       map[string]any `json:"data"`
		Complete   bool           `json:"complete"`
		SourceMode string         `json:"source_mode"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if body.SourceMode != "staff_assisted" {
		response.Error(w, r, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "The registration source mode is invalid.")
		return
	}
	raw, _ := jsonMarshal(body.Data)
	p := principal(r)
	data, err := api.deps.DriverReg.SaveStaffStep(r.Context(), p.UserID, id, hasRole(p.Roles, "registration_manager"), chi.URLParam(r, "step"), raw, body.Complete, chimiddleware.GetReqID(r.Context()))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) submitStaffCase(w http.ResponseWriter, r *http.Request) {
	id, ok := namedPathID(w, r, "case_id")
	if !ok {
		return
	}
	idempotencyKey := strings.TrimSpace(r.Header.Get("Idempotency-Key"))
	if len(idempotencyKey) < 8 || len(idempotencyKey) > 255 {
		response.Error(w, r, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "A valid Idempotency-Key header is required.")
		return
	}
	p := principal(r)
	data, err := api.deps.DriverReg.SubmitStaffCase(r.Context(), p.UserID, id, hasRole(p.Roles, "registration_manager"), idempotencyKey, chimiddleware.GetReqID(r.Context()))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) presignStaffUpload(w http.ResponseWriter, r *http.Request) {
	var body storage.PresignRequest
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if body.ApplicationID == nil || body.SourceMode != "staff_assisted" {
		response.Error(w, r, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "A staff-assisted application ID is required.")
		return
	}
	p := principal(r)
	if err := api.deps.DriverReg.CanAccessCase(r.Context(), p.UserID, *body.ApplicationID, hasRole(p.Roles, "registration_manager")); err != nil {
		handle(w, r, err)
		return
	}
	data, err := api.deps.Storage.Presign(r.Context(), p.UserID, body)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 201, data)
}
func (api API) completeUpload(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	p := principal(r)
	applicationID, err := api.deps.Storage.ApplicationForUpload(r.Context(), p.UserID, id)
	if err != nil {
		handle(w, r, err)
		return
	}
	if err = api.deps.DriverReg.CanAccessCase(r.Context(), p.UserID, applicationID, hasRole(p.Roles, "registration_manager")); err != nil {
		handle(w, r, err)
		return
	}
	key, err := api.deps.Storage.Complete(r.Context(), p.UserID, id)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]any{"completed": true, "object_key": key})
}
func (api API) adminDashboard(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Admin.Dashboard(r.Context())
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) adminRides(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Admin.Rides(r.Context(), r.URL.Query().Get("status"), int(parseInt(r.URL.Query().Get("limit"))))
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) adminCancelRide(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		Reason string `json:"reason"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if err := api.deps.Admin.CancelRide(r.Context(), principal(r).UserID, id, body.Reason, chimiddleware.GetReqID(r.Context())); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "system_cancelled"})
}
func (api API) adminApplications(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.DriverReg.List(r.Context(), r.URL.Query().Get("status"), 50)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) adminApplicationDetail(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	data, err := api.deps.DriverReg.Detail(r.Context(), id)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, data)
}
func (api API) adminRequestDocuments(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		Reason        string   `json:"reason"`
		DocumentTypes []string `json:"document_types"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if err := api.deps.DriverReg.RequestDocuments(r.Context(), principal(r).UserID, id, body.Reason, body.DocumentTypes, chimiddleware.GetReqID(r.Context())); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]string{"status": "documents_requested"})
}
func (api API) adminApprove(w http.ResponseWriter, r *http.Request) {
	api.adminDecision(w, r, "approve")
}
func (api API) adminReject(w http.ResponseWriter, r *http.Request) { api.adminDecision(w, r, "reject") }
func (api API) adminDocumentDecision(w http.ResponseWriter, r *http.Request) {
	applicationID, ok := pathID(w, r)
	if !ok {
		return
	}
	documentID, err := uuid.Parse(chi.URLParam(r, "document_id"))
	if err != nil {
		response.Error(w, r, http.StatusBadRequest, "VALIDATION_ERROR", "The document ID is invalid.")
		return
	}
	var body struct {
		Verified bool   `json:"verified"`
		Reason   string `json:"reason"`
	}
	if err = validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	if err = api.deps.DriverReg.VerifyDocument(r.Context(), principal(r).UserID, applicationID, documentID, body.Verified, body.Reason, chimiddleware.GetReqID(r.Context())); err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, http.StatusOK, map[string]any{"document_id": documentID, "verified": body.Verified})
}
func (api API) adminDecision(w http.ResponseWriter, r *http.Request, decision string) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var body struct {
		Reason string `json:"reason"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	var err error
	if decision == "approve" {
		err = api.deps.DriverReg.Approve(r.Context(), principal(r).UserID, id, body.Reason, chimiddleware.GetReqID(r.Context()))
	} else {
		err = api.deps.DriverReg.Reject(r.Context(), principal(r).UserID, id, body.Reason, chimiddleware.GetReqID(r.Context()))
	}
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]string{"status": map[string]string{"approve": "approved", "reject": "rejected"}[decision]})
}
func (api API) auditLogs(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Admin.Audit(r.Context(), 100)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) liveActivity(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RideID       uuid.UUID `json:"ride_id"`
		DeviceID     uuid.UUID `json:"device_id"`
		ActivityType string    `json:"activity_type"`
		PushToken    string    `json:"push_token"`
		ExpiresAt    time.Time `json:"expires_at"`
	}
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	id, err := api.deps.Devices.RegisterLiveActivity(r.Context(), principal(r).UserID, body.RideID, body.DeviceID, body.ActivityType, body.PushToken, body.ExpiresAt)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 201, map[string]any{"live_activity_session_id": id})
}
func (api API) passengerWidget(w http.ResponseWriter, r *http.Request) {
	p := principal(r)
	var id uuid.UUID
	err := api.deps.DB.QueryRow(r.Context(), `SELECT id FROM rides WHERE passenger_id=$1 AND status IN ('searching','driver_offered','driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress') ORDER BY requested_at DESC LIMIT 1`, p.UserID).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		response.JSON(w, r, 200, nil)
		return
	}
	if err != nil {
		handle(w, r, err)
		return
	}
	ride, err := api.deps.Rides.Get(r.Context(), id, p.UserID, p.Roles)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, map[string]any{"id": ride.ID, "status": ride.Status, "estimated_total_mmk": ride.EstimatedTotalMMK})
}
func (api API) supportTicket(w http.ResponseWriter, r *http.Request) {
	var body support.CreateRequest
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	id := principal(r).UserID
	ticket, err := api.deps.Support.Create(r.Context(), &id, body)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 201, ticket)
}
func (api API) publicSupport(w http.ResponseWriter, r *http.Request) {
	var body support.CreateRequest
	if err := validation.Decode(w, r, &body); err != nil {
		badJSON(w, r, err)
		return
	}
	ticket, err := api.deps.Support.Create(r.Context(), nil, body)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 201, ticket)
}
func (api API) supportTickets(w http.ResponseWriter, r *http.Request) {
	data, err := api.deps.Support.List(r.Context(), principal(r).UserID)
	if err != nil {
		handle(w, r, err)
		return
	}
	response.JSON(w, r, 200, data)
}
func (api API) realtime(w http.ResponseWriter, r *http.Request) {
	api.deps.Realtime.ServeHTTP(w, r, principal(r).UserID)
}
func principal(r *http.Request) apimiddleware.Principal {
	p, _ := apimiddleware.PrincipalFrom(r.Context())
	return p
}
func pathID(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	return namedPathID(w, r, "id")
}
func namedPathID(w http.ResponseWriter, r *http.Request, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(chi.URLParam(r, name))
	if err != nil {
		response.Error(w, r, 400, "VALIDATION_ERROR", "The resource ID is invalid.")
		return uuid.Nil, false
	}
	return id, true
}
func hasRole(roles []string, wanted string) bool {
	for _, role := range roles {
		if role == wanted {
			return true
		}
	}
	return false
}
func parseInt(value string) int64 { parsed, _ := strconv.ParseInt(value, 10, 64); return parsed }
func badJSON(w http.ResponseWriter, r *http.Request, err error) {
	response.Error(w, r, 400, "VALIDATION_ERROR", "Invalid JSON request: "+err.Error())
}
func handle(w http.ResponseWriter, r *http.Request, err error) {
	status := 500
	code := "INTERNAL_ERROR"
	message := "The request could not be completed."
	switch {
	case errors.Is(err, auth.ErrInvalidPhone):
		status = 422
		code = "VALIDATION_ERROR"
		message = err.Error()
	case errors.Is(err, auth.ErrRateLimited):
		status = 429
		code = "RATE_LIMITED"
		message = "Try again later."
	case errors.Is(err, auth.ErrOTPInvalid):
		status = 401
		code = "OTP_INVALID"
		message = "The OTP is invalid."
	case errors.Is(err, auth.ErrOTPExpired):
		status = 401
		code = "OTP_EXPIRED"
		message = "The OTP has expired."
	case errors.Is(err, auth.ErrSessionInvalid):
		status = 401
		code = "UNAUTHORIZED"
		message = "The session is invalid or expired."
	case errors.Is(err, auth.ErrStaffLogin):
		status = http.StatusUnauthorized
		code = "STAFF_CREDENTIALS_INVALID"
		message = "The staff ID or password is invalid."
	case errors.Is(err, auth.ErrStaffLocked):
		status = http.StatusTooManyRequests
		code = "STAFF_ACCOUNT_LOCKED"
		message = "This staff account is temporarily locked. Try again later."
	case errors.Is(err, driverreg.ErrCaseAccess):
		status = http.StatusForbidden
		code = "CASE_ACCESS_DENIED"
		message = "You do not have access to this registration case."
	case errors.Is(err, driverreg.ErrCaseConflict):
		status = http.StatusConflict
		code = "APPLICATION_ALREADY_EXISTS"
		message = "This applicant already has a registration case."
	case errors.Is(err, driverreg.ErrRegistrationCenter):
		status = http.StatusForbidden
		code = "REGISTRATION_CENTER_REQUIRED"
		message = "An active registration-center assignment is required."
	case errors.Is(err, pricing.ErrCityNotSupported):
		status = 422
		code = "CITY_NOT_SUPPORTED"
		message = err.Error()
	case errors.Is(err, pricing.ErrQuoteExpired):
		status = 409
		code = "QUOTE_EXPIRED"
		message = err.Error()
	case errors.Is(err, dispatch.ErrNoCandidates):
		status = 409
		code = "NO_DRIVER_AVAILABLE"
		message = err.Error()
	case errors.Is(err, dispatch.ErrOfferExpired):
		status = 409
		code = "OFFER_EXPIRED"
		message = err.Error()
	case errors.Is(err, dispatch.ErrOfferTaken):
		status = 409
		code = "OFFER_ALREADY_ACCEPTED"
		message = err.Error()
	case errors.Is(err, drivers.ErrNotApproved):
		status = 409
		code = "DRIVER_NOT_APPROVED"
		message = err.Error()
	case errors.Is(err, drivers.ErrUnavailable):
		status = 409
		code = "DRIVER_OFFLINE"
		message = err.Error()
	case errors.Is(err, rides.ErrInvalidTransition):
		status = 409
		code = "RIDE_STATE_INVALID"
		message = err.Error()
	case errors.Is(err, rides.ErrIdempotencyConflict):
		status = http.StatusConflict
		code = "IDEMPOTENCY_CONFLICT"
		message = err.Error()
	case errors.Is(err, rides.ErrRideNotFound), errors.Is(err, pgx.ErrNoRows):
		status = 404
		code = "NOT_FOUND"
		message = "The resource was not found."
	case errors.Is(err, passengers.ErrNotFound):
		status = http.StatusNotFound
		code = "NOT_FOUND"
		message = "The resource was not found."
	case errors.Is(err, platformmaps.ErrRouteUnavailable):
		status = http.StatusServiceUnavailable
		code = "SERVICE_UNAVAILABLE"
		message = "Map routing is temporarily unavailable."
	case errors.Is(err, driverreg.ErrDocumentsRequired):
		status = 422
		code = "DOCUMENT_REQUIRED"
		message = err.Error()
	case errors.Is(err, driverreg.ErrApplicationState):
		status = 409
		code = "APPLICATION_STATE_INVALID"
		message = err.Error()
	case strings.Contains(err.Error(), "required") || strings.Contains(err.Error(), "invalid") || strings.Contains(err.Error(), "unsupported"):
		status = 422
		code = "VALIDATION_ERROR"
		message = err.Error()
	case strings.Contains(err.Error(), "wallet balance") || strings.Contains(err.Error(), "payment provider"):
		status = http.StatusPaymentRequired
		code = "PAYMENT_FAILED"
		message = err.Error()
	}
	if status == 500 {
		slog.ErrorContext(r.Context(), "request failed", "request_id", chimiddleware.GetReqID(r.Context()), "error", err)
	}
	response.Error(w, r, status, code, message)
}
func jsonMarshal(value any) ([]byte, error) { return json.Marshal(value) }
