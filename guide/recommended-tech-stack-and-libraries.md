# 🛠️ Recommended Production Tech Stack & Library Standards

This document establishes the definitive, benchmarked technology matrix and framework standards for developing the **LaBar Taxi Platform & Dual-Shield Safety Ecosystem**.

---

## 🏛️ 1. Backend: Golang 1.22 Ecosystem

The backend services are designed using **Go Clean Architecture** (Domain, UseCase, Delivery, Repository) to achieve sub-millisecond response times, zero-allocation spatial hashing, and high-concurrency 60fps WebSocket broadcasting.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ GOLANG BACKEND LAYERED ECOSYSTEM                                        │
├──────────────────────┬──────────────────────────────────────────────────┤
│ Layer / Function     │ Production Recommended Package / Tool            │
├──────────────────────┼──────────────────────────────────────────────────┤
│ HTTP & WS Router     │ `github.com/go-chi/chi/v5`                       │
│ PostgreSQL / PostGIS │ `github.com/jackc/pgx/v5` + `sqlc` (Type-safe)   │
│ In-Memory Spatial DB │ `github.com/redis/go-redis/v9` (Redis 7 Cluster) │
│ WebSocket Engine     │ `github.com/gorilla/websocket`                   │
│ S3 CCTV Video Vault  │ `github.com/minio/minio-go/v7`                   │
│ Security & JWT       │ `github.com/golang-jwt/jwt/v5` + `golang.org/x/crypto/argon2` │
│ Map & Route RPC      │ Self-Hosted `OSRM` (Multi-Level Dijkstra Engine) │
└──────────────────────┴──────────────────────────────────────────────────┘
```

### Why these Go packages were selected:
1. **`go-chi/chi/v5` vs `gin`**: Chi is 100% compatible with the standard `net/http` library, has zero memory overhead, and allows seamless middleware chaining without global state locks.
2. **`pgx/v5` + `sqlc` vs `gorm`**: `sqlc` compiles raw SQL queries into type-safe Go code with zero runtime reflection overhead, while `pgx/v5` supports binary PostGIS geometry decoding.
3. **`go-redis/v9` Spatial**: Leverages Redis 7 `GEOSEARCH` and `GEORADIUS` for sub-5ms driver proximity queries within 1.0 km and 3.0 km.

---

## 📱 2. Frontend: React Native 0.74+ Mobile Architecture

Both the **Passenger App**, **Driver App**, and the **On-Demand Guardian Plugin** are built with **React Native (TypeScript)** utilizing the new **Fabric Native Renderer** and **TurboModules**.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ REACT NATIVE CLIENT ECOSYSTEM                                           │
├──────────────────────┬──────────────────────────────────────────────────┤
│ Function             │ Production Recommended Package                   │
├──────────────────────┼──────────────────────────────────────────────────┤
│ Navigation           │ `@react-navigation/native` (v6/v7)               │
│ Global State         │ `zustand` (Atomic stores for Rides, Shift, SOS)  │
│ Server Cache & Sync  │ `@tanstack/react-query` (v5)                     │
│ 60fps Animations     │ `react-native-reanimated` (v3) + Gesture Handler │
│ Interactive Map      │ `react-native-maps` + Self-Hosted TileServer GL │
│ In-Car CCTV Dashcam  │ `react-native-vision-camera` (v3)                │
│ Covert BLE Panic Key │ `react-native-ble-plx` (Bluetooth Low Energy)    │
│ Dynamic Plugins      │ Android `SplitInstallManager` + iOS `NSBundleResourceRequest` │
└──────────────────────┴──────────────────────────────────────────────────┘
```

### Why these React Native libraries were selected:
1. **`zustand` vs `Redux Toolkit`**: Zustand provides atomic, boilerplate-free state stores (~1KB bundle size) with direct subscriptions that prevent unnecessary re-renders during high-frequency GPS updates.
2. **`react-native-reanimated` v3**: Runs smooth 60fps gesture animations on the UI thread without crossing the JavaScript bridge (essential for the 15s cascading countdown ring and radar sweep).
3. **`react-native-vision-camera` v3**: Directly accesses camera hardware buffers to record continuous 1080p in-car CCTV video without dropping frame rates.

---

## 💾 3. Database Schema Compiler Config (`sqlc.yaml`)

```yaml
version: "2"
sql:
  - engine: "postgresql"
    schema: "architecture/database-design.md"
    queries: "codebase/backend/internal/repository/postgres/queries.sql"
    gen:
      go:
        package: "postgres"
        out: "codebase/backend/internal/repository/postgres"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_prepared_queries: true
        emit_exact_table_names: true
```
