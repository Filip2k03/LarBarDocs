# 🌐 REST & WebSocket API Reference

The LarBar Taxi Platform exposes high-throughput, low-latency REST endpoints (JSON over HTTP/2) and real-time WebSockets over TLS 1.3.

---

## 🔐 1. Authentication & Session Endpoints

### `POST /api/v1/auth/passenger/otp`
Initiates mobile number OTP verification for passengers.

- **Request Body**:
```json
{
  "phone_number": "+959123456789",
  "device_id": "uuid-v4-device-token",
  "app_version": "1.0.0"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "data": {
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in_sec": 300,
    "otp_length": 6
  }
}
```

---

## 🚖 2. Ride Dispatch & Multi-Stop Bookings

### `POST /api/v1/rides/quote`
Calculates dynamic multi-stop route estimation, distance, and tiered fares.

- **Request Body**:
```json
{
  "pickup": { "lat": 16.8661, "lng": 96.1561, "address": "Sule Square, Yangon" },
  "waypoints": [
    { "stop_order": 1, "lat": 16.7800, "lng": 96.1600, "address": "Bogyoke Market" }
  ],
  "destination": { "lat": 16.8052, "lng": 96.1554, "address": "Junction City" },
  "vehicle_class": "STANDARD_SEDAN"
}
```
- **Response `200 OK`**:
```json
{
  "status": "success",
  "data": {
    "quote_id": "q-8849-ab12",
    "distance_km": 6.8,
    "duration_min": 18,
    "estimated_fare": 3800.00,
    "currency": "MMK",
    "surge_multiplier": 1.0,
    "expires_at": "2026-08-20T16:45:00Z"
  }
}
```

---

### `POST /api/v1/rides/book`
Submits ride request and triggers 15-second cascading dispatch in Redis.

- **Request Body**:
```json
{
  "quote_id": "q-8849-ab12",
  "payment_method": "KBZPAY",
  "enable_guardian_stream": true
}
```

---

## 🚨 3. Driver Emergency SOS & Mesh Broadcast

### `POST /api/v1/driver/emergency/sos`
Triggered by driver panic action. Initiates **1.0 km ➔ 3.0 km tiered proximity broadcast** to fellow drivers and driver family guardians.

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

## 🛡️ 4. Dynamic Plugin Delivery & Family Mesh WebSockets

### `GET /api/v1/plugins/manifest`
Delivers available on-demand plugins for dynamic download (~3.8MB).

```json
{
  "plugins": [
    {
      "id": "com.larbar.plugin.guardian.passenger",
      "version": "1.4.0",
      "download_url": "https://cdn.larbartaxi.com/plugins/guardian_passenger_v140.apk.split",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "size_bytes": 3984512
    },
    {
      "id": "com.larbar.plugin.guardian.driver",
      "version": "1.2.0",
      "download_url": "https://cdn.larbartaxi.com/plugins/guardian_driver_v120.apk.split",
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
