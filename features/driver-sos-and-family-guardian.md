# Driver Emergency SOS & Family Guardian Shield

The **LaBar Driver Emergency Ecosystem** combines an **instant 1km to 3km tiered driver-mesh assistance network** with a **Driver Family Guardian Plugin Module**, providing complete physical protection for drivers in hazardous situations (e.g. passenger assault, robbery, hijack attempt, or medical distress).

---

## 1km to 3km Tiered Driver-Mesh Broadcast Algorithm

When a driver activates the emergency panic trigger, the backend initiates an automated, phased proximity broadcast to mobilize nearby drivers and emergency services.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            TIERED DRIVER-MESH ASSISTANCE DISPATCH                                │
│                                                                                                  │
│  [ DRIVER SOS TRIGGER ] ──► [ Go Emergency Hub ]                                                 │
│                                    │                                                             │
│         ┌──────────────────────────┴──────────────────────────┐                                  │
│         ▼                                                     ▼                                  │
│  [ TIER 1: 1.0 km RADIUS (0-30s) ]            [ DRIVER FAMILY GUARDIAN ]                         │
│  - Instant Push to Fellow Drivers             - High-Priority DND Override Siren                 │
│  - Distance, Plate & Vehicle Model            - Live 1-Second GPS Breadcrumb Stream              │
│  - 1-Tap "I Am Responding" Action             - Spouse / Parents Alert HUD                       │
│         │                                                                                        │
│         │ (If < 2 Responders in 30s or Escalated)                                                │
│         ▼                                                                                        │
│  [ TIER 2: 3.0 km RADIUS (30s+) ]                                                                │
│  - Extended Push to 50 Nearby Drivers                                                            │
│  - Automated Police Dispatch Webhook & LaBar Rapid Emergency Response Team (ERT)                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Driver SOS Panic Trigger Mechanisms

To ensure drivers can call for help even under duress, the app supports multiple trigger modes:

1. **Covert Hardware Trigger**: Triple-press of the physical volume up/down buttons (Android Foreground Service / iOS Key Interceptor).
2. **On-Screen Panic Shield**: 2-second continuous long-press on the floating emergency shield icon to prevent accidental triggers.
3. **Bluetooth Panic Beacon / Steering Wheel Button**: Wireless pairing with low-energy Bluetooth (BLE) hardware buttons mounted discreetly inside the taxi cabin.
4. **Impact / Collision Automatic Detection**: Accelerometer telemetry detecting $> 3.5\text{G}$ deceleration combined with sudden standstill.

---

## Driver Family Guardian Plugin Module (`:plugin_driver_guardian`)

Just like passengers, drivers can register their **spouse, parents, or designated next of kin** through the on-demand **Driver Guardian Plugin Package** (~3.2MB).

### Key Guardian Capabilities:
1. **Anytime Live Location & Shift Status**:
   - Family members can view the driver's real-time location, vehicle battery level, cellular signal quality, and current shift status (`AVAILABLE`, `ON_TRIP`, `BREAK`).
2. **Instant Critical Siren on SOS**:
   - When the driver presses SOS, the family guardian's smartphone rings a high-decibel alarm that **bypasses "Do Not Disturb" (DND)** using Apple Critical Alerts and Android High-Priority Alarm channels.
3. **Live Audio/Video & GPS Relay**:
   - Family guardians receive a direct live map with turn-by-turn navigation to the driver's exact coordinates and real-time streaming from the in-car CCTV camera.

---

## Database Schema Additions (DDL)

```sql
-- Driver Family Guardian Links
CREATE TABLE driver_guardian_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    guardian_name VARCHAR(100) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    relationship_type VARCHAR(30) NOT NULL, -- 'SPOUSE', 'PARENT', 'SIBLING', 'OTHER'
    notify_on_shift_start BOOLEAN DEFAULT TRUE,
    notify_on_sos_alert BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver SOS Emergency Incidents
CREATE TABLE driver_sos_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    ride_id UUID REFERENCES rides(id),
    trigger_type VARCHAR(30) NOT NULL, -- 'PANIC_BUTTON', 'HARDWARE_KEY', 'BLUETOOTH_BEACON', 'CRASH_DETECT'
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    heading_deg DECIMAL(5, 2),
    speed_kmh DECIMAL(5, 2),
    broadcast_tier VARCHAR(20) DEFAULT 'TIER_1_1KM', -- 'TIER_1_1KM', 'TIER_2_3KM', 'RESOLVED'
    nearby_drivers_notified INT DEFAULT 0,
    responders_acknowledged INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESPONDING', 'CONTAINED', 'FALSE_ALARM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

---

## Go Backend Redis 1km to 3km Spatial Broadcast Engine

```go
func (s *EmergencyService) BroadcastDriverSOS(ctx context.Context, incident *domain.DriverSOSIncident) error {
    // 1. Query Redis for drivers within 1.0 km
    drivers1km, err := s.redisClient.GeoRadius(ctx, "drivers:available",
        incident.Longitude, incident.Latitude,
        &redis.GeoRadiusQuery{
            Radius:    1.0,
            Unit:      "km",
            WithDist:  true,
            WithCoord: true,
            Sort:      "ASC",
            Count:     20,
        }).Result()
    if err != nil {
        return err
    }

    // 2. Dispatch High-Priority WebSockets & Push to 1km Cluster
    go s.notifyDriverCluster(drivers1km, incident, "TIER_1_1KM")

    // 3. Immediately Notify Driver Family Guardians (Spouse / Parents)
    go s.notifyDriverGuardians(incident.DriverID, incident)

    // 4. Schedule 30-Second Escalation to 3.0 km Tier 2
    go func() {
        time.Sleep(30 * time.Second)
        if s.isIncidentUnresolved(incident.ID) {
            drivers3km, _ := s.redisClient.GeoRadius(context.Background(), "drivers:available",
                incident.Longitude, incident.Latitude,
                &redis.GeoRadiusQuery{
                    Radius: 3.0, Unit: "km", WithDist: true, Sort: "ASC", Count: 50,
                }).Result()
            s.notifyDriverCluster(drivers3km, incident, "TIER_2_3KM")
            s.dispatchPoliceAndERT(incident)
        }
    }()

    return nil
}
```
