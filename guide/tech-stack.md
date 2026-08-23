# Technology Stack & Engineering Standards

The platform adopts an enterprise-grade, high-performance technology stack designed for high throughput, sub-50ms latency, and 99.99% reliability.

---

## Technology Matrix

| Layer | Primary Technology | Version / Tooling | Purpose |
|---|---|---|---|
| **Backend Language** | **Go (Golang)** | `Go 1.24+` | Modular monolith, dispatch engine, REST, workers, WebSockets |
| **API Gateway** | **Caddy / Go Gateway** | `v2.8+` | Reverse proxy, automatic TLS 1.3, rate limiting, token introspection |
| **Primary Database** | **PostgreSQL + PostGIS** | `PostgreSQL 16` / `PostGIS 3.4` | Relational master data, transactional ledger, spatial GIST indexing |
| **In-Memory Cache & Broker** | **Redis Cluster** | `Redis 7.2+` | `GEORADIUS` driver indexing, Pub/Sub telemetry, distributed Redlock |
| **Mobile Clients** | **React Native** | Android and iOS | Passenger, Driver, and Driver Registration apps; native modules provide Live Activities and foreground notifications |
| **Map & Routing Engine** | **OSRM / Mapbox** | `v5.27+` | Multi-stop matrix routing, duration estimation, polyline generation |
| **Media & Vault Storage**| **MinIO / AWS S3** | `S3 API` | CCTV video chunk storage, SHA-256 integrity logs, plugin bundles |
| **Documentation Portal** | **VitePress** | `v1.5+` | Static documentation portal, markdown rendering, instant search |
| **UI Design System** | **Figma Tokens Studio** | `W3C Design Tokens` | Imperial Crimson & Royal Gold design tokens (100-900 scales) |

---

## Architecture Principles

1. **Clean Architecture / Hexagonal Ports & Adapters**:
   - Complete decoupling of core business domain logic (`Domain/Entities`) from external database drivers (`PostgreSQL`), network transports (`HTTP/gRPC/WSS`), and third-party APIs (`KBZPay/AYAPay`).
2. **Deterministic Concurrency & Lock Safety**:
   - Double-entry ledger for driver sales and wallet balances utilizing PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
   - Redis distributed locking (`Redlock`) to guarantee that a ride offer can only be claimed by exactly one driver in a cascading cycle.
3. **Hardware-Accelerated Native Video & Telemetry**:
   - In-car CCTV captures 1080p chunks directly to private storage using Apple `AVFoundation` hardware encoders and Android `CameraX` / `MediaCodec`, creating hardware SHA-256 checksums before uploading.
