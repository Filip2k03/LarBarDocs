package middleware

import (
	"context"
	"github.com/Filip2k03/labar-backend/api/response"
	"github.com/Filip2k03/labar-backend/internal/auth"
	"github.com/google/uuid"
	"net/http"
	"strings"
)

type principalKey struct{}
type Principal struct {
	UserID    uuid.UUID
	SessionID uuid.UUID
	Roles     []string
}

func Authenticate(service *auth.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				response.Error(w, r, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.")
				return
			}
			claims, err := service.ParseAccess(strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")))
			if err != nil {
				response.Error(w, r, http.StatusUnauthorized, "UNAUTHORIZED", "The access token is invalid or expired.")
				return
			}
			userID, err := uuid.Parse(claims.Subject)
			if err != nil {
				response.Error(w, r, http.StatusUnauthorized, "UNAUTHORIZED", "The access token is invalid.")
				return
			}
			sessionID, err := uuid.Parse(claims.SessionID)
			if err != nil {
				response.Error(w, r, http.StatusUnauthorized, "UNAUTHORIZED", "The access token is invalid.")
				return
			}
			ctx := context.WithValue(r.Context(), principalKey{}, Principal{UserID: userID, SessionID: sessionID, Roles: claims.Roles})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
func RequireRoles(roles ...string) func(http.Handler) http.Handler {
	allowed := map[string]bool{}
	for _, role := range roles {
		allowed[role] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			p, ok := PrincipalFrom(r.Context())
			if !ok {
				response.Error(w, r, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.")
				return
			}
			for _, role := range p.Roles {
				if allowed[role] {
					next.ServeHTTP(w, r)
					return
				}
			}
			response.Error(w, r, http.StatusForbidden, "FORBIDDEN", "You do not have permission for this action.")
		})
	}
}
func PrincipalFrom(ctx context.Context) (Principal, bool) {
	p, ok := ctx.Value(principalKey{}).(Principal)
	return p, ok
}
