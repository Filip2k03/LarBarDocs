# 🏗️ Clean Architecture in Go (Golang)

The backend follows Uncle Bob's **Clean Architecture** (Hexagonal / Ports & Adapters) principles. The codebase maintains strict unidirectional dependency boundaries where core business domain logic has zero dependencies on external frameworks, databases, or transport layers.

---

## 🏛️ Package Layer Structure

```text
backend/
├── cmd/
│   └── api/                    # Application Entrypoint (main.go, wire_gen.go)
├── internal/
│   ├── domain/                 # 1. Enterprise Business Entities & Structs
│   │   ├── user.go             # User & Guardian models
│   │   ├── driver.go           # Driver, Shift status, Wallet
│   │   ├── ride.go             # Ride order, Waypoints, State machine
│   │   └── safety.go           # CCTV session, Deviation alerts
│   ├── usecase/                # 2. Application Business Rules & Interfaces
│   │   ├── ride_usecase.go     # Booking, 15s Cascading Dispatch
│   │   ├── safety_usecase.go   # Live GPS streaming, Geofence alert
│   │   └── payment_usecase.go  # Deep-link checkout, Webhook HMAC
│   ├── repository/             # 3. Persistence Adapters (Database)
│   │   ├── postgres/           # PostgreSQL 16 + PostGIS implementations
│   │   └── redis/              # Redis 7 GEORADIUS & PubSub broker
│   └── delivery/               # 4. Transports & Protocols
│       ├── http/               # REST API Handlers & Router (Gin/Chi)
│       ├── ws/                 # Gorilla/Nhooyr WebSocket Hub
│       └── grpc/               # High-speed gRPC Driver Telemetry Stream
└── pkg/
    ├── crypto/                 # SHA-256 HMAC & CCTV integrity tools
    ├── geocalc/                # Spherical cross-track deviation algorithms
    └── plugin/                 # Dynamic Plugin Manifest & Delivery Hub
```

---

## 🔒 Concurrency & Distributed Lock Pattern (Redlock)

When dispatching an offer to a driver, Redis distributed locking prevents double-booking race conditions:

```go
func (uc *RideUseCase) ClaimOffer(ctx context.Context, rideID, driverID uuid.UUID) error {
    lockKey := fmt.Sprintf("lock:ride:%s", rideID.String())
    
    // Acquire distributed lock for 500ms
    mutex := uc.redsync.NewMutex(lockKey)
    if err := mutex.LockContext(ctx); err != nil {
        return domain.ErrRideAlreadyClaimed
    }
    defer mutex.UnlockContext(ctx)

    // Atomically transition state in PostgreSQL
    return uc.rideRepo.UpdateStatus(ctx, rideID, domain.StatusAccepted, driverID)
}
```
