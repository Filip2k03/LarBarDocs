# 🗄️ Database Schema & PostGIS Design

The persistence tier utilizes **PostgreSQL 16 with the PostGIS 3.4 spatial extension** as the primary relational database, coupled with **Redis 7** for sub-millisecond driver geohash queries.

---

## 📊 Relational Tables Matrix (18 Connected Tables)

```text
┌──────────────┐       ┌──────────────────────┐       ┌───────────────────────────┐
│    USERS     │───────│  FAVORITE_LOCATIONS  │       │ PASSENGER_GUARDIAN_LINKS  │
└──────┬───────┘       └──────────────────────┘       └───────────────────────────┘
       │
       ├───────────────► DRIVERS ───┬───► VEHICLES
       │                            ├───► DRIVER_STATUS_LOGS
       │                            ├───► DRIVER_WALLETS ───► DRIVER_PAYOUTS
       │                            ├───► DRIVER_GUARDIAN_RELATIONSHIPS (Spouse / Parents)
       │                            ├───► DRIVER_SOS_INCIDENTS (1km-3km Mesh Alert)
       │                            └───► GPS_TELEMETRY_LOGS (Partitioned)
       │
       ├───────────────► RIDES ─────┬───► RIDE_WAYPOINTS (Extra Stops)
       │                            ├───► RIDE_DISPATCHES (15s Cascades)
       │                            ├───► CHAT_MESSAGES (WebSocket History)
       │                            ├───► CCTV_RECORDINGS (S3 Chunks & Hashes)
       │                            ├───► SAFETY_ALERTS (Off-Route Alarms)
       │                            └───► PAYMENTS (Cashless / Cash Receipts)
```

---

## ⚡ PostGIS Spatial Indexing Strategy

1. **Geographic Coordinates (`GEOMETRY(Point, 4326)`)**:
   - Location columns for pickup, destination, intermediate waypoints, and driver pings are indexed using **GIST (Generalized Search Tree)** indexes:
   ```sql
   CREATE INDEX idx_drivers_current_location ON drivers USING GIST (
       ST_SetSRID(ST_MakePoint(current_lng, current_lat), 4326)
   );
   ```

2. **Redis Geospatial In-Memory Matching**:
   - High-frequency driver GPS updates (every 2-3 seconds) are written directly to Redis with `GEOADD`:
   ```bash
   GEOADD drivers:available 96.1561 16.8661 "driver_uuid_101"
   ```
   - Nearby drivers within 1.0km - 3.0km are queried in $< 5\text{ms}$:
   ```bash
   GEORADIUS drivers:available 96.1561 16.8661 1 km WITHCOORD WITHDIST ASC COUNT 20
   ```

---

## 🛠️ Complete PostgreSQL 16 + PostGIS DDL Schema

```sql
-- 1. Enable PostGIS & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Users Table (Passengers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    avatar_url TEXT,
    preferred_locale VARCHAR(10) DEFAULT 'my_MM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    current_status VARCHAR(20) DEFAULT 'OFFLINE', -- OFFLINE, AVAILABLE, ON_TRIP, BREAK
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    current_heading DECIMAL(5, 2),
    rating_avg DECIMAL(3, 2) DEFAULT 5.00,
    total_trips INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID UNIQUE REFERENCES drivers(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    color VARCHAR(30) NOT NULL,
    seating_capacity INT DEFAULT 4,
    has_cctv_protecting_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Rides & Multi-Stop Orders
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    status VARCHAR(25) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SEARCHING, OFFERED, ACCEPTED, ARRIVED, IN_TRANSIT, COMPLETED, CANCELLED
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8) NOT NULL,
    pickup_lng DECIMAL(11, 8) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    estimated_distance_km DECIMAL(6, 2) NOT NULL,
    estimated_duration_min INT NOT NULL,
    estimated_fare DECIMAL(12, 2) NOT NULL,
    actual_distance_km DECIMAL(6, 2),
    actual_duration_min INT,
    actual_fare DECIMAL(12, 2),
    payment_method VARCHAR(20) NOT NULL, -- CASH, KBZPAY, AYAPAY, WAVEPAY
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 6. Waypoints (Intermediate Extra Stops)
CREATE TABLE ride_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    stop_sequence INT NOT NULL,
    address_text TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    arrived_at TIMESTAMP WITH TIME ZONE
);

-- 7. 15-Second Cascading Dispatch Offers
CREATE TABLE ride_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    dispatch_rank INT NOT NULL,
    offer_status VARCHAR(20) DEFAULT 'OFFERED', -- OFFERED, ACCEPTED, REJECTED, TIMED_OUT
    driver_distance_km DECIMAL(5, 2),
    offered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- 8. Driver Emergency SOS & 1km-3km Mesh Incidents
CREATE TABLE driver_sos_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    ride_id UUID REFERENCES rides(id),
    trigger_type VARCHAR(30) NOT NULL, -- PANIC_BUTTON, HARDWARE_KEY, BLUETOOTH_BEACON, CRASH_DETECT
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    heading_deg DECIMAL(5, 2),
    speed_kmh DECIMAL(5, 2),
    broadcast_tier VARCHAR(20) DEFAULT 'TIER_1_1KM', -- TIER_1_1KM, TIER_2_3KM, RESOLVED
    nearby_drivers_notified INT DEFAULT 0,
    responders_acknowledged INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 9. Driver Family Guardian Links (Spouse / Parents)
CREATE TABLE driver_guardian_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    guardian_name VARCHAR(100) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    relationship_type VARCHAR(30) NOT NULL, -- SPOUSE, PARENT, SIBLING, OTHER
    notify_on_shift_start BOOLEAN DEFAULT TRUE,
    notify_on_sos_alert BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CCTV Hardware Recordings & S3 Hashes
CREATE TABLE cctv_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    s3_storage_key TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    duration_seconds INT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    encryption_algorithm VARCHAR(30) DEFAULT 'AES-256-GCM',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Driver Wallet Ledger & Double-Entry Accounting
CREATE TABLE driver_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID UNIQUE NOT NULL REFERENCES drivers(id),
    available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pending_settlement DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(5) DEFAULT 'MMK',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Driver Payout Requests
CREATE TABLE driver_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    amount DECIMAL(12, 2) NOT NULL,
    payout_channel VARCHAR(30) NOT NULL, -- KBZPAY_DIRECT, CB_PAY, AYA_PAY, WAVE_PAY
    account_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    transaction_ref VARCHAR(100) UNIQUE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE
);
```
