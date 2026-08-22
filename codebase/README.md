# 💻 LarBar Platform Monorepo Codebase

Welcome to the **LarBar Taxi & Dual Safety Platform** development codebase.

---

## 📁 Repository Structure

```text
codebase/
├── backend/                             # Golang 1.22 Clean Architecture API & Real-time Services
│   ├── cmd/
│   │   └── api/                         # HTTP & WebSocket Entrypoint (main.go)
│   ├── internal/
│   │   ├── domain/                      # Core Business Entities & Interfaces (Ride, SOS, Driver, Wallet)
│   │   ├── usecase/                     # Application Business Logic (Dispatch, Safety, Settlement)
│   │   ├── delivery/                    # Delivery Layers (HTTP Chi Router, WebSocket Handlers)
│   │   └── repository/                  # Infrastructure Data Persistence (PostgreSQL, Redis 7)
│   ├── pkg/                             # Reusable Packages (Config, Logger, JWT, Spatial)
│   ├── Dockerfile                       # Multi-stage lean production Docker image
│   └── docker-compose.cpx22.yml         # Optimized deployment for Hetzner CPX22 (2 vCPU, 4GB RAM)
│
└── frontend/                            # React Native (iOS & Android) Modular Mobile Workspace
    ├── apps/
    │   ├── passenger/                   # Passenger Mobile App (Multi-Stop, 15s Radar, KBZPay)
    │   ├── driver/                      # Driver Mobile App (In-Car CCTV Meter, 1km SOS Radar, Payout)
    │   └── guardian-plugin/             # Dynamic On-Demand Guardian Safety Module (~3.8MB)
    └── packages/
        ├── ui-tokens/                   # Red & Gold Design System Tokens (Colors, Typography, Spacing)
        └── api-client/                  # Typed REST & 60fps WebSocket Client
```

---

## ⚡ Quick Start Local Development

### 1. Run Go Backend
```bash
cd codebase/backend
go mod download
go run ./cmd/api
```

### 2. Run with Docker (Single-Node Hetzner CPX22 Profile)
```bash
cd codebase/backend
docker-compose -f docker-compose.cpx22.yml up -d
```
