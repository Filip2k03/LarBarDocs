package push

import (
	"context"
	"crypto/ecdsa"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var ErrNotConfigured = errors.New("push provider not configured")

type Message struct {
	Token        string
	Category     string
	Title        string
	Body         string
	Data         map[string]string
	HighPriority bool
}
type LiveActivityUpdate struct {
	Token         string
	ActivityTopic string
	Event         string
	State         map[string]any
	AlertTitle    string
	AlertBody     string
	StaleAt       *time.Time
	DismissalAt   *time.Time
}
type Provider interface {
	Send(context.Context, Message) (string, error)
}

type FCM struct {
	projectID   string
	credentials serviceAccount
	key         *rsa.PrivateKey
	client      *http.Client
	mu          sync.Mutex
	accessToken string
	tokenExpiry time.Time
}
type serviceAccount struct {
	ClientEmail string `json:"client_email"`
	PrivateKey  string `json:"private_key"`
	TokenURI    string `json:"token_uri"`
}

func NewFCM(projectID, credentialsFile string) (*FCM, error) {
	if projectID == "" || credentialsFile == "" {
		return nil, ErrNotConfigured
	}
	raw, err := os.ReadFile(credentialsFile)
	if err != nil {
		return nil, err
	}
	var account serviceAccount
	if err = json.Unmarshal(raw, &account); err != nil {
		return nil, err
	}
	block, _ := pem.Decode([]byte(account.PrivateKey))
	if block == nil {
		return nil, errors.New("FCM private key PEM invalid")
	}
	parsed, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	key, ok := parsed.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("FCM key must be RSA")
	}
	if account.TokenURI == "" {
		account.TokenURI = "https://oauth2.googleapis.com/token"
	}
	return &FCM{projectID: projectID, credentials: account, key: key, client: &http.Client{Timeout: 10 * time.Second}}, nil
}
func (f *FCM) Send(ctx context.Context, message Message) (string, error) {
	token, err := f.token(ctx)
	if err != nil {
		return "", err
	}
	payload := map[string]any{"message": map[string]any{"token": message.Token, "notification": map[string]string{"title": message.Title, "body": message.Body}, "data": message.Data, "android": map[string]any{"priority": map[bool]string{true: "HIGH", false: "NORMAL"}[message.HighPriority], "notification": map[string]string{"channel_id": message.Category, "tag": message.Category}}}}
	raw, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://fcm.googleapis.com/v1/projects/"+url.PathEscape(f.projectID)+"/messages:send", strings.NewReader(string(raw)))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	response, err := f.client.Do(req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if response.StatusCode/100 != 2 {
		return "", fmt.Errorf("FCM status %d: %s", response.StatusCode, string(body))
	}
	var result struct {
		Name string `json:"name"`
	}
	if err = json.Unmarshal(body, &result); err != nil {
		return "", err
	}
	return result.Name, nil
}
func (f *FCM) token(ctx context.Context) (string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.accessToken != "" && time.Now().Before(f.tokenExpiry.Add(-time.Minute)) {
		return f.accessToken, nil
	}
	now := time.Now()
	claims := jwt.MapClaims{"iss": f.credentials.ClientEmail, "scope": "https://www.googleapis.com/auth/firebase.messaging", "aud": f.credentials.TokenURI, "iat": now.Unix(), "exp": now.Add(time.Hour).Unix()}
	assertion, err := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(f.key)
	if err != nil {
		return "", err
	}
	form := url.Values{"grant_type": {"urn:ietf:params:oauth:grant-type:jwt-bearer"}, "assertion": {assertion}}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, f.credentials.TokenURI, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := f.client.Do(req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if response.StatusCode/100 != 2 {
		return "", fmt.Errorf("FCM OAuth status %d", response.StatusCode)
	}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		return "", err
	}
	f.accessToken = result.AccessToken
	f.tokenExpiry = now.Add(time.Duration(result.ExpiresIn) * time.Second)
	return result.AccessToken, nil
}

type APNS struct {
	teamID, keyID, bundleID, host string
	key                           *ecdsa.PrivateKey
	client                        *http.Client
	mu                            sync.Mutex
	providerToken                 string
	tokenIssued                   time.Time
}

func NewAPNS(teamID, keyID, bundleID, keyFile string, production bool) (*APNS, error) {
	if teamID == "" || keyID == "" || bundleID == "" || keyFile == "" {
		return nil, ErrNotConfigured
	}
	raw, err := os.ReadFile(keyFile)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(raw)
	if block == nil {
		return nil, errors.New("APNs key PEM invalid")
	}
	parsed, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	key, ok := parsed.(*ecdsa.PrivateKey)
	if !ok {
		return nil, errors.New("APNs key must be EC")
	}
	host := "https://api.sandbox.push.apple.com"
	if production {
		host = "https://api.push.apple.com"
	}
	return &APNS{teamID: teamID, keyID: keyID, bundleID: bundleID, key: key, host: host, client: &http.Client{Timeout: 10 * time.Second}}, nil
}
func (a *APNS) Send(ctx context.Context, message Message) (string, error) {
	providerToken, err := a.token()
	if err != nil {
		return "", err
	}
	aps := map[string]any{"alert": map[string]string{"title": message.Title, "body": message.Body}, "sound": "default", "category": message.Category}
	payload := map[string]any{"aps": aps, "category": message.Category, "data": message.Data}
	raw, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.host+"/3/device/"+url.PathEscape(message.Token), strings.NewReader(string(raw)))
	if err != nil {
		return "", err
	}
	req.Header.Set("authorization", "bearer "+providerToken)
	req.Header.Set("apns-topic", a.bundleID)
	req.Header.Set("apns-push-type", "alert")
	req.Header.Set("apns-priority", map[bool]string{true: "10", false: "5"}[message.HighPriority])
	req.Header.Set("content-type", "application/json")
	response, err := a.client.Do(req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode/100 != 2 {
		body, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		return "", fmt.Errorf("APNs status %d: %s", response.StatusCode, string(body))
	}
	return response.Header.Get("apns-id"), nil
}
func (a *APNS) SendLiveActivity(ctx context.Context, update LiveActivityUpdate) (string, error) {
	providerToken, err := a.token()
	if err != nil {
		return "", err
	}
	aps := map[string]any{"timestamp": time.Now().Unix(), "event": update.Event, "content-state": update.State, "alert": map[string]string{"title": update.AlertTitle, "body": update.AlertBody}}
	if update.StaleAt != nil {
		aps["stale-date"] = update.StaleAt.Unix()
	}
	if update.DismissalAt != nil {
		aps["dismissal-date"] = update.DismissalAt.Unix()
	}
	raw, _ := json.Marshal(map[string]any{"aps": aps})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.host+"/3/device/"+url.PathEscape(update.Token), strings.NewReader(string(raw)))
	if err != nil {
		return "", err
	}
	req.Header.Set("authorization", "bearer "+providerToken)
	activityTopic := update.ActivityTopic
	if activityTopic == "" {
		activityTopic = a.bundleID
	}
	req.Header.Set("apns-topic", activityTopic+".push-type.liveactivity")
	req.Header.Set("apns-push-type", "liveactivity")
	req.Header.Set("apns-priority", "10")
	req.Header.Set("content-type", "application/json")
	response, err := a.client.Do(req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode/100 != 2 {
		body, _ := io.ReadAll(io.LimitReader(response.Body, 4096))
		return "", fmt.Errorf("APNs Live Activity status %d: %s", response.StatusCode, string(body))
	}
	return response.Header.Get("apns-id"), nil
}
func (a *APNS) token() (string, error) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.providerToken != "" && time.Since(a.tokenIssued) < 50*time.Minute {
		return a.providerToken, nil
	}
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodES256, jwt.MapClaims{"iss": a.teamID, "iat": now.Unix()})
	token.Header["kid"] = a.keyID
	signed, err := token.SignedString(a.key)
	if err != nil {
		return "", err
	}
	a.providerToken = signed
	a.tokenIssued = now
	return signed, nil
}
