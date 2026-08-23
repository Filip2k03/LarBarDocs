package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/Filip2k03/labar-backend/internal/platform/sms"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	redisv9 "github.com/redis/go-redis/v9"
)

var (
	ErrInvalidPhone   = errors.New("valid E.164 phone number required")
	ErrRateLimited    = errors.New("OTP request rate limited")
	ErrOTPInvalid     = errors.New("OTP invalid")
	ErrOTPExpired     = errors.New("OTP expired")
	ErrSessionInvalid = errors.New("session invalid")
)

type Service struct {
	db         *pgxpool.Pool
	redis      *redisv9.Client
	sms        sms.Provider
	jwtSecret  []byte
	otpSecret  []byte
	accessTTL  time.Duration
	refreshTTL time.Duration
	now        func() time.Time
}
type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
	User         User   `json:"user"`
}
type User struct {
	ID          uuid.UUID `json:"id"`
	Phone       string    `json:"phone"`
	DisplayName string    `json:"display_name"`
	Locale      string    `json:"locale"`
	Status      string    `json:"status"`
	Roles       []string  `json:"roles"`
}
type Claims struct {
	SessionID string   `json:"sid"`
	Roles     []string `json:"roles"`
	jwt.RegisteredClaims
}

func NewService(db *pgxpool.Pool, redis *redisv9.Client, provider sms.Provider, jwtSecret, otpSecret string, accessTTL, refreshTTL time.Duration) *Service {
	return &Service{db: db, redis: redis, sms: provider, jwtSecret: []byte(jwtSecret), otpSecret: []byte(otpSecret), accessTTL: accessTTL, refreshTTL: refreshTTL, now: time.Now}
}
func NormalizePhone(phone string) (string, error) {
	phone = strings.TrimSpace(phone)
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")
	if strings.HasPrefix(phone, "09") {
		phone = "+95" + phone[1:]
	}
	if len(phone) < 10 || len(phone) > 16 || phone[0] != '+' {
		return "", ErrInvalidPhone
	}
	for _, r := range phone[1:] {
		if r < '0' || r > '9' {
			return "", ErrInvalidPhone
		}
	}
	return phone, nil
}
func (s *Service) RequestOTP(ctx context.Context, phone, purpose string) (uuid.UUID, time.Time, error) {
	phone, err := NormalizePhone(phone)
	if err != nil {
		return uuid.Nil, time.Time{}, err
	}
	if purpose == "" {
		purpose = "login"
	}
	key := "otp:request:" + phone
	count, err := s.redis.Incr(ctx, key).Result()
	if err != nil {
		return uuid.Nil, time.Time{}, fmt.Errorf("OTP rate limit: %w", err)
	}
	if count == 1 {
		_ = s.redis.Expire(ctx, key, 10*time.Minute).Err()
	}
	if count > 5 {
		return uuid.Nil, time.Time{}, ErrRateLimited
	}
	id := uuid.New()
	code, err := numericCode()
	if err != nil {
		return uuid.Nil, time.Time{}, err
	}
	expires := s.now().UTC().Add(5 * time.Minute)
	_, err = s.db.Exec(ctx, `INSERT INTO otp_challenges(id,phone,purpose,code_hash,expires_at) VALUES($1,$2,$3,$4,$5)`, id, phone, purpose, s.hashOTP(id, code), expires)
	if err != nil {
		return uuid.Nil, time.Time{}, fmt.Errorf("store OTP: %w", err)
	}
	if err = s.sms.SendOTP(ctx, phone, code); err != nil {
		_, _ = s.db.Exec(ctx, `DELETE FROM otp_challenges WHERE id=$1`, id)
		return uuid.Nil, time.Time{}, err
	}
	return id, expires, nil
}
func (s *Service) VerifyOTP(ctx context.Context, challengeID uuid.UUID, phone, code, deviceName string) (Tokens, error) {
	phone, err := NormalizePhone(phone)
	if err != nil {
		return Tokens{}, err
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Tokens{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var hash []byte
	var attempts, maxAttempts int
	var expires time.Time
	var consumed *time.Time
	err = tx.QueryRow(ctx, `SELECT code_hash,attempts,max_attempts,expires_at,consumed_at FROM otp_challenges WHERE id=$1 AND phone=$2 FOR UPDATE`, challengeID, phone).Scan(&hash, &attempts, &maxAttempts, &expires, &consumed)
	if errors.Is(err, pgx.ErrNoRows) {
		return Tokens{}, ErrOTPInvalid
	}
	if err != nil {
		return Tokens{}, err
	}
	if consumed != nil || attempts >= maxAttempts {
		return Tokens{}, ErrOTPInvalid
	}
	if !s.now().Before(expires) {
		return Tokens{}, ErrOTPExpired
	}
	if !hmac.Equal(hash, s.hashOTP(challengeID, code)) {
		_, _ = tx.Exec(ctx, `UPDATE otp_challenges SET attempts=attempts+1 WHERE id=$1`, challengeID)
		_ = tx.Commit(ctx)
		return Tokens{}, ErrOTPInvalid
	}
	if _, err = tx.Exec(ctx, `UPDATE otp_challenges SET consumed_at=now() WHERE id=$1`, challengeID); err != nil {
		return Tokens{}, err
	}
	var user User
	err = tx.QueryRow(ctx, `INSERT INTO users(phone,last_login_at) VALUES($1,now()) ON CONFLICT(phone) DO UPDATE SET last_login_at=now(),updated_at=now() RETURNING id,phone,display_name,locale,status`, phone).Scan(&user.ID, &user.Phone, &user.DisplayName, &user.Locale, &user.Status)
	if err != nil {
		return Tokens{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO user_roles(user_id,role_id) SELECT $1,id FROM roles WHERE name='passenger' ON CONFLICT DO NOTHING`, user.ID)
	if err != nil {
		return Tokens{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO passenger_profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING`, user.ID); err != nil {
		return Tokens{}, err
	}
	rows, err := tx.Query(ctx, `SELECT r.name FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=$1 ORDER BY r.name`, user.ID)
	if err != nil {
		return Tokens{}, err
	}
	for rows.Next() {
		var role string
		if err = rows.Scan(&role); err != nil {
			rows.Close()
			return Tokens{}, err
		}
		user.Roles = append(user.Roles, role)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return Tokens{}, err
	}
	rows.Close()
	refresh, refreshHash, err := randomToken()
	if err != nil {
		return Tokens{}, err
	}
	sessionID := uuid.New()
	sessionExpires := s.now().UTC().Add(s.refreshTTL)
	_, err = tx.Exec(ctx, `INSERT INTO sessions(id,user_id,refresh_token_hash,device_name,expires_at) VALUES($1,$2,$3,$4,$5)`, sessionID, user.ID, refreshHash, deviceName, sessionExpires)
	if err != nil {
		return Tokens{}, err
	}
	access, err := s.signAccess(user, sessionID)
	if err != nil {
		return Tokens{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Tokens{}, err
	}
	return Tokens{AccessToken: access, RefreshToken: refresh, TokenType: "Bearer", ExpiresIn: int64(s.accessTTL.Seconds()), User: user}, nil
}
func (s *Service) Refresh(ctx context.Context, token string) (Tokens, error) {
	hash := sha256.Sum256([]byte(token))
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Tokens{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var oldID uuid.UUID
	var user User
	var expires time.Time
	var revoked *time.Time
	err = tx.QueryRow(ctx, `SELECT s.id,s.expires_at,s.revoked_at,u.id,u.phone,u.display_name,u.locale,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.refresh_token_hash=$1 FOR UPDATE`, hash[:]).Scan(&oldID, &expires, &revoked, &user.ID, &user.Phone, &user.DisplayName, &user.Locale, &user.Status)
	if errors.Is(err, pgx.ErrNoRows) || revoked != nil || !s.now().Before(expires) || user.Status != "active" {
		return Tokens{}, ErrSessionInvalid
	}
	if err != nil {
		return Tokens{}, err
	}
	rows, err := tx.Query(ctx, `SELECT r.name FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=$1 ORDER BY r.name`, user.ID)
	if err != nil {
		return Tokens{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var role string
		if err = rows.Scan(&role); err != nil {
			return Tokens{}, err
		}
		user.Roles = append(user.Roles, role)
	}
	refresh, refreshHash, err := randomToken()
	if err != nil {
		return Tokens{}, err
	}
	newID := uuid.New()
	newExpires := s.now().UTC().Add(s.refreshTTL)
	if _, err = tx.Exec(ctx, `INSERT INTO sessions(id,user_id,refresh_token_hash,device_name,expires_at) SELECT $1,user_id,$2,device_name,$3 FROM sessions WHERE id=$4`, newID, refreshHash, newExpires, oldID); err != nil {
		return Tokens{}, err
	}
	if _, err = tx.Exec(ctx, `UPDATE sessions SET revoked_at=now(),replaced_by=$1 WHERE id=$2`, newID, oldID); err != nil {
		return Tokens{}, err
	}
	access, err := s.signAccess(user, newID)
	if err != nil {
		return Tokens{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Tokens{}, err
	}
	return Tokens{AccessToken: access, RefreshToken: refresh, TokenType: "Bearer", ExpiresIn: int64(s.accessTTL.Seconds()), User: user}, nil
}
func (s *Service) Logout(ctx context.Context, userID, sessionID uuid.UUID) error {
	tag, err := s.db.Exec(ctx, `UPDATE sessions SET revoked_at=now() WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL`, sessionID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrSessionInvalid
	}
	return nil
}
func (s *Service) User(ctx context.Context, id uuid.UUID) (User, error) {
	var u User
	err := s.db.QueryRow(ctx, `SELECT id,phone,display_name,locale,status FROM users WHERE id=$1`, id).Scan(&u.ID, &u.Phone, &u.DisplayName, &u.Locale, &u.Status)
	if err != nil {
		return User{}, err
	}
	rows, err := s.db.Query(ctx, `SELECT r.name FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=$1 ORDER BY r.name`, id)
	if err != nil {
		return User{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var role string
		if err = rows.Scan(&role); err != nil {
			return User{}, err
		}
		u.Roles = append(u.Roles, role)
	}
	return u, rows.Err()
}
func (s *Service) ParseAccess(token string) (Claims, error) {
	var claims Claims
	parsed, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (any, error) {
		if t.Method != jwt.SigningMethodHS256 {
			return nil, ErrSessionInvalid
		}
		return s.jwtSecret, nil
	}, jwt.WithExpirationRequired(), jwt.WithIssuedAt())
	if err != nil || !parsed.Valid {
		return Claims{}, ErrSessionInvalid
	}
	return claims, nil
}
func (s *Service) signAccess(user User, sessionID uuid.UUID) (string, error) {
	now := s.now().UTC()
	claims := Claims{SessionID: sessionID.String(), Roles: user.Roles, RegisteredClaims: jwt.RegisteredClaims{Subject: user.ID.String(), IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTTL)), Issuer: "labar-api", Audience: jwt.ClaimStrings{"labar-clients"}}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}
func (s *Service) hashOTP(id uuid.UUID, code string) []byte {
	mac := hmac.New(sha256.New, s.otpSecret)
	_, _ = mac.Write([]byte(id.String() + ":" + code))
	return mac.Sum(nil)
}
func numericCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}
func randomToken() (string, []byte, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", nil, err
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	hash := sha256.Sum256([]byte(token))
	return token, hash[:], nil
}
