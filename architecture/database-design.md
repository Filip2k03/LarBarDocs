# 🗄️ Database Schema & PostGIS Design

The persistence tier utilizes **PostgreSQL 16 with the PostGIS 3.4 spatial extension** as the primary relational database, coupled with **Redis 7** for sub-millisecond driver geohash queries.

---

## 📊 Relational Tables Matrix (16 Connected Tables)

```text
┌──────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│    USERS     │───────│  FAVORITE_LOCATIONS  │       │ GUARDIAN_RELATIONSHIPS │
└──────┬───────┘       └──────────────────────┘       └────────────────────────┘
       │
       ├───────────────► DRIVERS ───┬───► VEHICLES
       │                            ├───► DRIVER_STATUS_LOGS
       │                            ├───► DRIVER_WALLETS ───► DRIVER_PAYOUTS
       │                            └───► GPS_TELEMETRY_LOGS
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
   - Nearby drivers within 3.0km are queried in $< 5\text{ms}$:
   ```bash
   GEORADIUS drivers:available 96.1561 16.8661 3 km WITHCOORD WITHDIST ASC COUNT 10
   ```
