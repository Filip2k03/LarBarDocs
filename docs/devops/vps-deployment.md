# ☁️ VPS Server Separation Architecture

To ensure high availability, zero single-point-of-failure (SPOF), and database isolation, the production deployment is separated into **dedicated server nodes**.

---

## 🏗️ Multi-Node Server Topology

```text
                                  [ Internet Traffic ]
                                           │
                                           ▼
                 ┌──────────────────────────────────────────────────┐
                 │          SERVER 1: EDGE & REVERSE PROXY          │
                 │  - Caddy / Nginx TLS 1.3 Termination             │
                 │  - IP Rate Limiting, DDoS Shield                 │
                 │  - Port 80, 443 -> Internal Docker Swarm/Network │
                 └─────────────────────────┬────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
        ┌───────────────────────────────┐     ┌───────────────────────────────┐
        │  SERVER 2: GO BACKEND CORE    │     │ SERVER 3: SPATIAL & REALTIME  │
        │  - Auth & User Service        │     │  - Redis 7 Cluster (Spatial)  │
        │  - Dispatch & Matchmaker      │     │  - OSRM Routing Engine        │
        │  - Payments & Ledger          │     │  - WebSocket Telemetry Hub    │
        └───────────────┬───────────────┘     └───────────────┬───────────────┘
                        │                                     │
                        └──────────────────┬──────────────────┘
                                           ▼
                 ┌──────────────────────────────────────────────────┐
                 │       SERVER 4: MASTER POSTGIS DATABASE          │
                 │  - PostgreSQL 16 + PostGIS 3.4                   │
                 │  - NVMe Storage, Automated Hourly Backups        │
                 │  - Encrypted WAL Logs Archive                    │
                 └──────────────────────────────────────────────────┘
                                           ▲
                                           │ Encrypted S3 API
                 ┌─────────────────────────┴────────────────────────┐
                 │       SERVER 5: MEDIA & CCTV STORAGE VAULT       │
                 │  - MinIO / Cloudflare R2 / Hetzner Storage Box   │
                 │  - CCTV MP4 Video Chunks (SHA-256 Verified)      │
                 │  - Dynamic Guardian Plugin AAB / Framework Split │
                 └──────────────────────────────────────────────────┘
```

---

## 🔒 Security Isolation Guidelines

1. **Private VPC Network**: Servers communicate over private internal IP addresses (e.g. `10.0.0.0/24`). Only Server 1 (API Gateway) has public ports 80/443 open.
2. **Database Firewall**: PostgreSQL port `5432` only accepts connections originating from the Go Backend internal IP.
3. **Automated TLS & Cert Renewal**: Caddy automatically issues and renews Let's Encrypt / ZeroSSL TLS certificates.
