package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLiveEndpointUsesVersionedEnvelope(t *testing.T) {
	router := NewRouter(Dependencies{Origins: []string{"http://localhost:4321"}})
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("status=%d body=%s", recorder.Code, recorder.Body.String())
	}
	var envelope struct {
		Success bool           `json:"success"`
		Data    map[string]any `json:"data"`
		Meta    struct {
			RequestID string `json:"request_id"`
		} `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &envelope); err != nil {
		t.Fatal(err)
	}
	if !envelope.Success || envelope.Data["status"] != "ok" || envelope.Meta.RequestID == "" {
		t.Fatalf("unexpected envelope: %+v", envelope)
	}
}
func TestUnknownRouteIsNotFound(t *testing.T) {
	router := NewRouter(Dependencies{Origins: []string{"http://localhost:4321"}})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/not-real", nil))
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("status=%d", recorder.Code)
	}
}
