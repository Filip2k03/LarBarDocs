package payments

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

type Charge struct {
	PaymentID        string `json:"payment_id"`
	Provider         string `json:"provider"`
	ProviderMethodID string `json:"provider_method_id"`
	AmountMMK        int64  `json:"amount_mmk"`
	IdempotencyKey   string `json:"idempotency_key"`
}

type Provider interface {
	Capture(context.Context, Charge) (string, error)
}

type HTTP struct {
	endpoint string
	apiKey   string
	client   *http.Client
}

func NewHTTP(endpoint, apiKey string) (*HTTP, error) {
	if endpoint == "" || apiKey == "" {
		return nil, errors.New("payment endpoint and API key are required")
	}
	return &HTTP{endpoint: endpoint, apiKey: apiKey, client: &http.Client{Timeout: 15 * time.Second}}, nil
}

func (p *HTTP) Capture(ctx context.Context, charge Charge) (string, error) {
	body, err := json.Marshal(charge)
	if err != nil {
		return "", err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, p.endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	request.Header.Set("Authorization", "Bearer "+p.apiKey)
	request.Header.Set("Idempotency-Key", charge.IdempotencyKey)
	request.Header.Set("Content-Type", "application/json")
	response, err := p.client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode/100 != 2 {
		return "", errors.New("payment provider rejected capture")
	}
	var result struct {
		Status    string `json:"status"`
		Reference string `json:"reference"`
	}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		return "", err
	}
	if result.Status != "paid" || result.Reference == "" {
		return "", errors.New("payment provider did not confirm payment")
	}
	return result.Reference, nil
}
