# REST & WebSocket API Reference

The LaBar Taxi Platform exposes high-throughput, low-latency REST endpoints (JSON over HTTP/2) and real-time WebSockets over TLS 1.3.

---

## 1. Authentication & Session Endpoints

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

## 2. Fare Quote and Ride Booking

### `GET /api/v1/fares/policy`

Returns the active versioned public fare constants.

```json
{
  "version": "MM-2026-08-v1",
  "minimum_transport_fare_mmk": 5000,
  "included_distance_km": 2,
  "distance_step_km": 0.1,
  "distance_step_fare_mmk": 150,
  "service_fee_mmk": 1500,
  "cash_rounding_unit_mmk": 500,
  "promo_credit_value_mmk": 10
}
```

### `POST /api/v1/fares/quote`

Calculates the authoritative payable amount. `/api/v1/rides/quote` remains a compatibility alias.

Request:

```json
{
  "distance_km": 2.1,
  "payment_method": "CASH",
  "promo_credits": 0
}
```

Response `200 OK`:

```json
{
  "quote_id": "ddf64f1d-0a77-45e2-a9da-fcf32f774ed3",
  "policy_version": "MM-2026-08-v1",
  "requested_distance_km": 2.1,
  "billable_distance_km": 2.1,
  "payment_method": "CASH",
  "currency": "MMK",
  "breakdown": {
    "transport_fare_mmk": 5150,
    "extra_distance_steps": 1,
    "extra_distance_fare_mmk": 150,
    "service_fee_mmk": 1500,
    "promo_credits_applied": 0,
    "promo_discount_mmk": 0,
    "subtotal_mmk": 6650,
    "cash_rounding_mmk": 350,
    "payable_mmk": 7000
  },
  "expires_at": "2026-08-24T08:05:00Z"
}
```

The 5,000 MMK transport minimum includes up to 2 km. Every started 0.1 km after that costs 150 MMK. The 1,500 MMK service fee is added once to every route. Cash rounds upward to the next 500 MMK; digital payments remain exact. One promo credit equals 10 MMK and cannot remove the service fee.

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
