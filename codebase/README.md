# LaBar Monorepo Codebase

Welcome to the **LaBar Taxi Platform & Dual-Shield Safety Ecosystem** monorepo. This repository contains the complete production codebase spanning the high-performance **Golang backend**, **React Native mobile applications**, and the **Vite + React Enterprise Admin Control Center**.

---

## Monorepo Structure

```text
codebase/
├── backend/                              # Golang 1.22 High-Performance Core API & WS Gateway
│   ├── cmd/api/main.go                   # Process bootstrap and graceful shutdown
│   ├── internal/domain/                  # Ride, fare, safety, and plugin domain types
│   ├── internal/usecase/                 # Versioned fare engine and application rules
│   ├── internal/transport/httpapi/       # Strict JSON API routes and contract tests
│   ├── README.md                         # Local setup, policy, endpoints, and roadmap
│   ├── AGENTS.md                         # Codex and contributor implementation rules
│   ├── Dockerfile                        # Multi-stage lean Alpine container
│   ├── docker-compose.cpx22.yml          # Tuned Hetzner CPX22 deployment profile
│   └── go.mod                            # Go module dependencies
│
└── frontend/                             # React Native & Vite React Web Workspace
    ├── apps/
    │   ├── passenger/                    # React Native Passenger Booking App
    │   ├── driver/                       # React Native Driver Turn Navigation & CCTV App
    │   ├── guardian-plugin/              # On-demand Dynamic Guardian Safety Shield Plugin
    │   ├── driverreg/                    # Staff-Assisted Driver KYC Registration Mobile App
    │   └── admin-portal/                 # Vite + React Enterprise KYC & Operations Web Portal
    │
    └── packages/
        ├── ui-tokens/                    # Red & Gold Design System & Typography Tokens
        └── api-client/                   # Typed REST & Realtime WebSocket Client Gateway
```

---

## Applications & Ports

| Application | Technology | Primary Role | Default Port |
|---|---|---|---|
| **Core API & Gateway** | Golang 1.22 / Chi | High-concurrency matching, 15s cascading dispatch, Redis 7 spatial, WebSocket gateway | `8080` |
| **Admin Control Center** | Vite 5 + React 18 (TS) | Operations dashboard, Driver KYC case reviewer, Staff accounts & RBAC, Immutable audit log | `3000` |
| **Passenger App** | React Native 0.74+ | Nineteen-page booking, dispatch, trip, receipt, credit, Guardian, support, and account lifecycle | Mobile |
| **Driver App** | React Native 0.74+ | Shift management, 1080p CCTV recording HUD, 1.0 km emergency SOS intercept radar | Mobile |
| **DriverReg App** | React Native / React | Staff-assisted licence camera scan, assistive OCR verification, liveness capture | Mobile |
| **Guardian Plugin** | React Native Module | Dynamic on-demand 60fps route telemetry, $d_{xt} > 300\text{m}$ anomaly siren alarms | Dynamic Plugin (~3.8MB) |

---

## Quick Start

### 1. Run and test the Go API

```bash
cd codebase/backend
go mod download
go test ./...
go run ./cmd/api
```

The active fare policy is available at `/api/v1/fares/policy`; calculate a quote with `/api/v1/fares/quote`.

### 2. Run Backend Services (Docker Compose)
```bash
cd codebase/backend
docker compose -f docker-compose.cpx22.yml up -d
```

### 3. Run Admin Control Center (Vite + React)
```bash
cd codebase/frontend/apps/admin-portal
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Open interactive product references

- Passenger v2: `/prototypes/passenger-v2.html`
- DriverReg: `/prototypes/driverreg-app.html`
- Admin Control Center: `/prototypes/admin-control-center.html`
