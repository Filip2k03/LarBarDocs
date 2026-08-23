package domain

import (
	"time"

	"github.com/google/uuid"
)

type PluginTargetApp string

const (
	PluginTargetPassenger PluginTargetApp = "PASSENGER"
	PluginTargetDriver    PluginTargetApp = "DRIVER"
	PluginTargetBoth      PluginTargetApp = "BOTH"
)

type PluginCategory string

const (
	PluginCategorySafety    PluginCategory = "SAFETY"
	PluginCategoryTelemetry PluginCategory = "TELEMETRY"
	PluginCategoryUtility   PluginCategory = "UTILITY"
	PluginCategoryFinance   PluginCategory = "FINANCE"
)

type PluginManifest struct {
	ID                  string          `json:"id"`           // e.g. "com.labar.plugin.guardian"
	Name                string          `json:"name"`         // e.g. "Guardian Safety Shield"
	NameMyanmar         string          `json:"name_myanmar"` // e.g. "မိသားစု အကာအကွယ် စနစ်"
	Description         string          `json:"description"`
	Category            PluginCategory  `json:"category"`
	TargetApp           PluginTargetApp `json:"target_app"`
	Version             string          `json:"version"`              // e.g. "1.4.0"
	DownloadSizeBytes   int64           `json:"download_size_bytes"`  // e.g. 3984512 (~3.8 MB)
	BundleURL           string          `json:"bundle_url"`           // CDN download link
	SHA256Hash          string          `json:"sha256_hash"`          // Integrity check
	RequiredPermissions []string        `json:"required_permissions"` // ["CAMERA", "BACKGROUND_LOCATION", "MICROPHONE"]
	IsFeatured          bool            `json:"is_featured"`
	UpdatedAt           time.Time       `json:"updated_at"`
}

type UserInstalledPlugin struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"user_id"`
	PluginID    string    `json:"plugin_id"`
	InstalledAt time.Time `json:"installed_at"`
	IsEnabled   bool      `json:"is_enabled"`
	ConfigJSON  string    `json:"config_json,omitempty"`
}
