package sms

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"
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

type HTTP struct {
	endpoint string
	apiKey   string
	sender   string
	client   *http.Client
}

func NewHTTP(endpoint, apiKey, sender string) (*HTTP, error) {
	if endpoint == "" || apiKey == "" || sender == "" {
		return nil, errors.New("SMS endpoint, API key and sender are required")
	}
	return &HTTP{endpoint: endpoint, apiKey: apiKey, sender: sender, client: &http.Client{Timeout: 10 * time.Second}}, nil
}

func (p *HTTP) SendOTP(ctx context.Context, phone, code string) error {
	payload, err := json.Marshal(map[string]string{"to": phone, "sender": p.sender, "message": "Your LaBar verification code is " + code + ". It expires in 5 minutes."})
	if err != nil {
		return err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, p.endpoint, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	request.Header.Set("Authorization", "Bearer "+p.apiKey)
	request.Header.Set("Content-Type", "application/json")
	response, err := p.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode/100 != 2 {
		return errors.New("SMS provider rejected request")
	}
	return nil
}
