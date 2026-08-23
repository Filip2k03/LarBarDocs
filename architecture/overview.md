# System Architecture Overview

The **Yamato Taxi Engine** follows a modern **5-Tier Microservices Architecture** designed for high throughput, sub-50ms dispatch cycles, real-time safety streaming, and resilient financial ledger processing.

---

## 5-Tier Component Topology

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             TIER 1: NATIVE CLIENT & MODULAR PLUGINS                              │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────────────────────────┐  │
│  │ Passenger Native App  │   │ Driver Native App      │   │ Guardian Plugin Module (~3.8MB)   │  │
│  │ (SwiftUI / Compose)   │   │ (CCTV & Digital Meter) │   │ (On-Demand Dynamic Package)       │  │
│  └───────────┬───────────┘   └───────────┬────────────┘   └─────────────────┬─────────────────┘  │
│  │ DriverReg KYC App     │   │ Admin Control Center   │   │ Staff RBAC + Audit                │  │
│  │ (OCR/Face/Vehicle)    │   │ (Review & Provision)   │   │ (Least Privilege)                 │  │
└──────────────┼───────────────────────────┼──────────────────────────────────┼────────────────────┘
               │                           │                                  │
               │ HTTPS / WSS               │ HTTPS / WSS / gRPC               │ Dynamic Sync
               ▼                           ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               TIER 2: EDGE & API GATEWAY TIER                                    │
│   - TLS 1.3 Termination | JWT Claims Validation | IP Rate Limiting | WebSocket Multiplexing     │
└──────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                           │ Internal gRPC / HTTP2
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         TIER 3: GO APPLICATION CORE (CLEAN ARCHITECTURE)                         │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────────┐  │
│  │ Auth & User Service │ │ Dispatch Engine     │ │ Real-Time Hub       │ │ Payment & Wallet   │  │
│  │ (Profiles, Drivers) │ │ (15s Cascade, Fare) │ │ (Chat, Live GPS)    │ │ (KBZPay, Ledger)   │  │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ └────────────────────┘  │
└──────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        TIER 4: PERSISTENCE, CACHE & ENCRYPTED VAULT                              │
│  ┌───────────────────────────────┐ ┌──────────────────────────────┐ ┌─────────────────────────┐  │
│  │ PostgreSQL 16 + PostGIS       │ │ Redis 7 Cluster              │ │ Encrypted S3 Media Vault│  │
│  │ (Master Relational Schema)    │ │ (GEORADIUS Driver Index)     │ │ (CCTV Videos, Plugins)  │  │
│  └───────────────────────────────┘ └──────────────────────────────┘ └─────────────────────────┘  │
└──────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              TIER 5: EXTERNAL INTEGRATIONS & TELCO                               │
│  ┌───────────────────────────────┐ ┌──────────────────────────────┐ ┌─────────────────────────┐  │
│  │ OSRM / Mapbox Routing Engine  │ │ Bank Gateways (KBZ/AYAPay)   │ │ Apple APNs / Google FCM │  │
│  └───────────────────────────────┘ └──────────────────────────────┘ └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Operational Capabilities

1. **Intelligent Matchmaking**:
   - Nearby available drivers are indexed in Redis using geohash coordinates (`GEOADD`).
   - The engine searches a 3km radius (`GEORADIUS`), sorts candidates by driving ETA and driver ratings, and dispatches a 15-second timed offer.
2. **Dynamic Route Recalculation**:
   - Supports extra waypoints/stops with real-time polyline recalculation and fare breakdown.
3. **Dual-Shield Safety Synchronization**:
   - Driver CCTV is recorded in local rolling 60-second chunks, hashed via SHA-256, and synced to S3.
   - Guardian Live Stream relays vehicle coordinates to family devices via WebSockets, alerting family members if $d_{xt} > 300\text{m}$.
4. **Driver Identity & Activation Pipeline**:
   - DriverReg creates consented KYC cases with NRC/licence media, confidence-aware OCR, liveness/face evidence, and commercial vehicle records.
   - An independent reviewer decides the case before the Driver App account can activate.
5. **Staff Identity & Authorization**:
   - `GOD_ADMIN` is break-glass only; `CEO`, `CTO`, and `PSO` share `EXEC_SUPERADMIN`; operational roles use explicit least-privilege scopes and immutable audit logs.
6. **Versioned Fare and Receipt Contract**:
   - The Go fare use case calculates integer-MMK transport, service fee, credit discount, cash rounding, and payable values.
   - Every booking and receipt retains the quote ID and policy version so later policy changes cannot rewrite history.
