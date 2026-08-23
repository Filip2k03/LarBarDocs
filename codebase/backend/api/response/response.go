package response

import (
	"encoding/json"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
)

type Meta struct {
	RequestID string `json:"request_id"`
}
type Success struct {
	Success bool `json:"success"`
	Data    any  `json:"data"`
	Meta    Meta `json:"meta"`
}
type ErrorBody struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}
type Failure struct {
	Success bool      `json:"success"`
	Error   ErrorBody `json:"error"`
	Meta    Meta      `json:"meta"`
}

func JSON(w http.ResponseWriter, r *http.Request, status int, data any) {
	write(w, status, Success{Success: true, Data: data, Meta: Meta{RequestID: middleware.GetReqID(r.Context())}})
}
func Error(w http.ResponseWriter, r *http.Request, status int, code, message string) {
	write(w, status, Failure{Success: false, Error: ErrorBody{Code: code, Message: message}, Meta: Meta{RequestID: middleware.GetReqID(r.Context())}})
}
func Validation(w http.ResponseWriter, r *http.Request, fields map[string]string) {
	write(w, http.StatusUnprocessableEntity, Failure{Success: false, Error: ErrorBody{Code: "VALIDATION_ERROR", Message: "Please check the submitted fields.", Fields: fields}, Meta: Meta{RequestID: middleware.GetReqID(r.Context())}})
}
func write(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
