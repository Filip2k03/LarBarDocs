package domain

import (
	"time"

	"github.com/google/uuid"
)

type TriggerType string

const (
	TriggerTypeHardwareKey TriggerType = "HARDWARE_KEY"
	TriggerTypePanicButton TriggerType = "PANIC_BUTTON"
	TriggerTypeBluetooth   TriggerType = "BLUETOOTH_BEACON"
	TriggerTypeCrashDetect TriggerType = "CRASH_DETECT"
)

type BroadcastTier string

const (
	BroadcastTier1Km      BroadcastTier = "TIER_1_1KM"
	BroadcastTier3Km      BroadcastTier = "TIER_2_3KM"
	BroadcastTierResolved BroadcastTier = "RESOLVED"
)

type DriverSOSIncident struct {
	ID                     uuid.UUID     `json:"id"`
	DriverID               uuid.UUID     `json:"driver_id"`
	DriverName             string        `json:"driver_name"`
	VehiclePlate           string        `json:"vehicle_plate"`
	VehicleModel           string        `json:"vehicle_model"`
	RideID                 *uuid.UUID    `json:"ride_id,omitempty"`
	TriggerType            TriggerType   `json:"trigger_type"`
	Latitude               float64       `json:"lat"`
	Longitude              float64       `json:"lng"`
	HeadingDeg             float64       `json:"heading_deg"`
	SpeedKmh               float64       `json:"speed_kmh"`
	BroadcastTier          BroadcastTier `json:"broadcast_tier"`
	NearbyDriversNotified  int           `json:"nearby_drivers_notified"`
	RespondersAcknowledged int           `json:"responders_acknowledged"`
	Status                 string        `json:"status"` // ACTIVE, RESPONDING, CONTAINED
	CreatedAt              time.Time     `json:"created_at"`
	ResolvedAt             *time.Time    `json:"resolved_at,omitempty"`
}

type DriverGuardianRelationship struct {
	ID                 uuid.UUID `json:"id"`
	DriverID           uuid.UUID `json:"driver_id"`
	GuardianName       string    `json:"guardian_name"`
	GuardianPhone      string    `json:"guardian_phone"`
	RelationshipType   string    `json:"relationship_type"` // SPOUSE, PARENT, SIBLING
	NotifyOnShiftStart bool      `json:"notify_on_shift_start"`
	NotifyOnSOS        bool      `json:"notify_on_sos"`
	CreatedAt          time.Time `json:"created_at"`
}
