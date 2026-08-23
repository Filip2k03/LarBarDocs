# REST & WebSocket API Reference

The LaBar Taxi Platform exposes high-throughput, low-latency REST endpoints (JSON over HTTP/2) and real-time WebSockets over TLS 1.3.

---

## 1. Authentication & Session Endpoints

### `POST /api/v1/auth/otp/request`
Creates a shared phone OTP challenge for Passenger, Driver, or Driver Registration clients.

- **Request Body**:
```json
{
  "phone": "+959123456789",
  "purpose": "login"
}
```
- **Response `202 Accepted`**:
```json
{
  "success": true,
  "data": {"challenge_id": "uuid", "expires_at": "2026-08-24T08:05:00Z"},
  "meta": {"request_id": "uuid"}
}
```

---

## 2. Fare Quote and Ride Booking

### `GET /api/v1/public/fares`

Returns the active versioned public fare constants.

```json
{
  "version": 1,
  "base_fare_mmk": 5000,
  "included_distance_meters": 3000,
  "per_km_mmk": 1500,
  "low_speed_threshold_kph": 10,
  "low_speed_per_minute_mmk": 150
}
```

### `POST /api/v1/passenger/rides/quote`

Calculates an authoritative, expiring route quote using the configured routing provider and active PostgreSQL pricing version.

Request:

```json
{
  "pickup": {"lat": 16.8661, "lng": 96.1561},
  "destination": {"lat": 16.8053, "lng": 96.1561},
  "city": "yangon",
  "passengers": 1
}
```

Response `200 OK`:

```json
{
  "success": true,
  "data": {
    "quote_id": "ddf64f1d-0a77-45e2-a9da-fcf32f774ed3",
    "pricing_version_id": "uuid",
    "distance_meters": 7200,
    "duration_seconds": 1440,
    "ride_options": []
  },
  "expires_at": "2026-08-24T08:05:00Z"
}
```

The current production reference is 5,000 MMK including 3 km, then 1,500 MMK/km, plus 150 MMK per started low-speed minute at 10 km/h or below. Values are active versioned database records, not handler constants.

---

### `POST /api/v1/passenger/rides`
Submits ride request and triggers 15-second cascading dispatch in Redis.

- **Request Body**:
```json
{
  "quote_id": "uuid",
  "ride_type_id": "uuid",
  "payment_method": "cash",
  "notes": "Gate B"
}
```

---

## 3. Driver Emergency SOS & Mesh Broadcast

### `POST /api/v1/driver/emergency/sos`
Triggered by driver panic action. Initiates a **1.0 km to 3.0 km tiered proximity broadcast** to fellow drivers and driver family guardians.

- **Headers**: `Authorization: Bearer <driver_jwt>`
- **Request Body**:
```json
{
  "trigger_type": "HARDWARE_KEY_TRIPLE_TAP",
  "current_lat": 16.8661,
  "current_lng": 96.1561,
  "current_heading": 182.5,
  "speed_kmh": 34.0,
  "lock_cctv_buffer": true
}
```
- **Response `201 Created`**:
```json
{
  "status": "emergency_active",
  "data": {
    "incident_id": "sos-7712-4411",
    "broadcast_tier": "TIER_1_1KM",
    "drivers_notified_count": 8,
    "guardians_notified_count": 2,
    "escalation_timer_sec": 30
  }
}
```

---

### `POST /api/v1/driver/emergency/respond`
Allows nearby drivers to accept and intercept the victim driver.

- **Request Body**:
```json
{
  "incident_id": "sos-7712-4411",
  "response_status": "EN_ROUTE",
  "eta_seconds": 90
}
```

---

## 4. Dynamic Plugin Delivery & Family Mesh WebSockets

### `GET /api/v1/plugins/manifest`
Delivers available on-demand plugins for dynamic download (~3.8MB).

```json
{
  "plugins": [
    {
      "id": "com.labar.plugin.guardian.passenger",
      "version": "1.4.0",
      "download_url": "https://cdn.labartaxi.com/plugins/guardian_passenger_v140.apk.split",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "size_bytes": 3984512
    },
    {
      "id": "com.labar.plugin.guardian.driver",
      "version": "1.2.0",
      "download_url": "https://cdn.labartaxi.com/plugins/guardian_driver_v120.apk.split",
      "sha256": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      "size_bytes": 3355443
    }
  ]
}
```

---

### `WSS /ws/v1/telemetry/stream`
High-frequency 60fps bidirectional telemetry channel.

- **Client Message (Driver App - 1Hz)**:
```json
{
  "type": "DRIVER_GPS_PING",
  "driver_id": "d-9912",
  "lat": 16.8661,
  "lng": 96.1561,
  "heading": 90.0,
  "speed_kmh": 42.5,
  "accuracy_m": 4.2
}
```
- **Server Broadcast (Family Guardian Client)**:
```json
{
  "type": "GUARDIAN_TELEMETRY_UPDATE",
  "cross_track_deviation_m": 14.2,
  "route_status": "ON_TRACK",
  "cctv_protecting_mode": "ACTIVE"
}
```
