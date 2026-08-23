package middleware

import (
	"context"
	"github.com/Filip2k03/labar-backend/api/response"
	"github.com/Filip2k03/labar-backend/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"net/http"
	"strings"
)

type principalKey struct{}
type Principal struct {
	UserID    uuid.UUID
	SessionID uuid.UUID
	Roles     []string
}

func RequirePermission(db *pgxpool.Pool, permission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			p, ok := PrincipalFrom(r.Context())
			if !ok {
				response.Error(w, r, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.")
				return
			}
			var allowed bool
			if err := db.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN role_permissions rp ON rp.role_id=ur.role_id JOIN permissions p ON p.id=rp.permission_id WHERE ur.user_id=$1 AND p.name=$2)`, p.UserID, permission).Scan(&allowed); err != nil || !allowed {
				response.Error(w, r, http.StatusForbidden, "FORBIDDEN", "You do not have permission for this action.")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
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
