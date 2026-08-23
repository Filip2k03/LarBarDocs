# 🏛️ Codebase & Monorepo Architecture

The **LaBar Platform** uses a modern, modular monorepo architecture combining a high-performance **Golang Clean Architecture** backend with a cross-platform **React Native (TypeScript)** mobile workspace.

---

## 🏗️ Architecture Blueprint

```text
                               ┌────────────────────────────────────────────────────────┐
                               │             REACT NATIVE CLIENT APPS                   │
                               ├────────────────────┬───────────────────┬───────────────┤
                               │  🚖 Passenger App  │   🚗 Driver App   │ 🛡️ Guardian  │
                               └─────────┬──────────┴─────────┬─────────┴───────┬───────┘
                                         │                    │                 │
                                         └────────────────────┼─────────────────┘
                                                              ▼
                                               [ HTTPS / WSS WebSockets ]
                                                              │
                                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GOLANG CLEAN ARCHITECTURE BACKEND CORE                                                                    │
│                                                                                                           │
│ 1. DELIVERY LAYER:  Chi HTTP Router (`/api/v1/*`), Gorilla WebSocket Pool (`/ws/v1/*`), CORS & Rate Limit │
│ 2. USECASE LAYER:   RideDispatch, DriverSOSMesh (1km➔3km), MeterCalculation, SettlementEngine, CCTVBuffer │
│ 3. DOMAIN LAYER:    Ride, DriverSOSIncident, DriverGuardianRelationship, Wallet, SpatialPoint            │
│ 4. REPOSITORY:      PostgreSQL 16 (GIST spatial indexes, JSONB, SQL Transactions) & Redis 7 Cluster      │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Monorepo Package Breakdown

### 1. Backend (`codebase/backend/`)
- **`cmd/api/main.go`**: Entrypoint initializing database connection pools, Redis spatial cluster, and starting HTTP/WS listeners with graceful shutdown.
- **`internal/domain/`**: Pure Go structs and interfaces free from external infrastructure dependencies.
- **`internal/usecase/`**: Implements core business logic:
  - **15-Second Cascading Dispatch**: Iterative driver candidate offers with automatic timeout fallback.
  - **1.0 km ➔ 3.0 km Emergency SOS Mesh**: Broadcasts distress events to neighboring drivers via Redis `GEORADIUS`.
  - **Dynamic Taximeter Calculation**: Haversine distance tracking and surge multipliers.
- **`internal/repository/`**: High-performance SQL queries with `pgx/v5` and Redis spatial commands.

### 2. Frontend (`codebase/frontend/`)
- **`apps/passenger/`**: Multi-stop routing, 15s cascading search radar, in-trip dynamic taximeter, and KBZPay/WavePay digital checkout.
- **`apps/driver/`**: Shift mode toggle (`ON DUTY`), incoming 15s offer modal, in-car 1080p CCTV recording HUD, and 1km emergency SOS intercept radar.
- **`apps/guardian-plugin/`**: Lightweight on-demand safety package (~3.8MB) providing 60fps live route telemetry and DND-override siren alarms.
- **`packages/ui-tokens/`**: Single source of truth for **Imperial Crimson Red** (`#E5252A`) and **Royal Gold** (`#F59E0B`) colors, Pyidaungsu typography, and layout spacing.
- **`packages/api-client/`**: Fully typed REST API and real-time WebSocket client.
