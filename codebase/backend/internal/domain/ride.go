package domain

import (
	"time"

	"github.com/google/uuid"
)

type RideStatus string

const (
	RideStatusDraft     RideStatus = "DRAFT"
	RideStatusSearching RideStatus = "SEARCHING"
	RideStatusOffered   RideStatus = "OFFERED"
	RideStatusAccepted  RideStatus = "ACCEPTED"
	RideStatusArrived   RideStatus = "ARRIVED"
	RideStatusInTransit RideStatus = "IN_TRANSIT"
	RideStatusCompleted RideStatus = "COMPLETED"
	RideStatusCancelled RideStatus = "CANCELLED"
)

type PaymentMethod string

const (
	PaymentMethodCash    PaymentMethod = "CASH"
	PaymentMethodKBZPay  PaymentMethod = "KBZPAY"
	PaymentMethodWavePay PaymentMethod = "WAVEPAY"
	PaymentMethodAYAPay  PaymentMethod = "AYAPAY"
)

type GeoPoint struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lng"`
	Address   string  `json:"address"`
}

type Waypoint struct {
	ID        uuid.UUID  `json:"id"`
	RideID    uuid.UUID  `json:"ride_id"`
	StopOrder int        `json:"stop_order"`
	GeoPoint  GeoPoint   `json:"geo_point"`
	IsVisited bool       `json:"is_visited"`
	VisitedAt *time.Time `json:"visited_at,omitempty"`
}

type Ride struct {
	ID                   uuid.UUID     `json:"id"`
	PassengerID          uuid.UUID     `json:"passenger_id"`
	DriverID             *uuid.UUID    `json:"driver_id,omitempty"`
	VehicleID            *uuid.UUID    `json:"vehicle_id,omitempty"`
	Status               RideStatus    `json:"status"`
	Pickup               GeoPoint      `json:"pickup"`
	Destination          GeoPoint      `json:"destination"`
	Waypoints            []Waypoint    `json:"waypoints,omitempty"`
	EstimatedDistanceKm  float64       `json:"estimated_distance_km"`
	EstimatedDurationMin int           `json:"estimated_duration_min"`
	EstimatedFareMMK     float64       `json:"estimated_fare_mmk"`
	ActualDistanceKm     float64       `json:"actual_distance_km"`
	ActualDurationMin    int           `json:"actual_duration_min"`
	ActualFareMMK        float64       `json:"actual_fare_mmk"`
	PaymentMethod        PaymentMethod `json:"payment_method"`
	PaymentStatus        string        `json:"payment_status"`
	GuardianStreamActive bool          `json:"guardian_stream_active"`
	CCTVActive           bool          `json:"cctv_active"`
	RequestedAt          time.Time     `json:"requested_at"`
	StartedAt            *time.Time    `json:"started_at,omitempty"`
	CompletedAt          *time.Time    `json:"completed_at,omitempty"`
}
