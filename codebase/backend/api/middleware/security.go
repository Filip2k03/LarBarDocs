package middleware

import (
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus"
	"net/http"
	"time"
)

var requests = prometheus.NewCounterVec(prometheus.CounterOpts{Name: "labar_http_requests_total", Help: "Total API requests."}, []string{"method", "route", "status"})
var duration = prometheus.NewHistogramVec(prometheus.HistogramOpts{Name: "labar_http_request_duration_seconds", Help: "API request duration.", Buckets: prometheus.DefBuckets}, []string{"method", "route"})

func init() { prometheus.MustRegister(requests, duration) }
func SecureHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}
func Metrics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		wrapped := chimiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrapped, r)
		route := "unmatched"
		if context := chiRouteContext(r); context != "" {
			route = context
		}
		requests.WithLabelValues(r.Method, route, http.StatusText(wrapped.Status())).Inc()
		duration.WithLabelValues(r.Method, route).Observe(time.Since(started).Seconds())
	})
}
func chiRouteContext(r *http.Request) string {
	ctx := chi.RouteContext(r.Context())
	if ctx == nil {
		return ""
	}
	return ctx.RoutePattern()
}
