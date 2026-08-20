# ☁️ VPS Server Separation Architecture

To ensure high availability, zero single-point-of-failure (SPOF), and database isolation, the production deployment is separated into **dedicated server nodes** on **Hetzner Cloud**.

---

## 🏗️ 3-Node Dedicated Production Topology

```text
                                  [ Internet Traffic ]
                                           │
                                           ▼ (Ports 80, 443)
                 ┌──────────────────────────────────────────────────┐
                 │       SERVER 1: API & REVERSE PROXY GATEWAY      │
                 │  - Caddy TLS 1.3 Auto Certificate Renewal        │
                 │  - Go Backend Engine Core (REST & WebSockets)    │
                 │  - JWT Auth, Dispatch & Driver SOS Mesh Hub      │
                 └─────────────────────────┬────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ Private VPC (`10.0.0.0/24`)         │ Private VPC (`10.0.0.0/24`)
                        ▼                                     ▼
        ┌───────────────────────────────┐     ┌───────────────────────────────┐
        │ SERVER 2: LIVE MAP & ROUTING  │     │ SERVER 3: POSTGIS & STORAGE   │
        │  - TileServer GL (OSM Vector) │     │  - PostgreSQL 16 + PostGIS    │
        │  - OSRM Myanmar Router        │     │  - MinIO S3 CCTV Video Vault  │
        │  - Redis 7 Spatial Cluster    │     │  - Automated Hourly Backups   │
        └───────────────────────────────┘     └───────────────────────────────┘
```

---

## 🔒 Security Isolation Guidelines

1. **Private VPC Network**: Servers communicate over private internal IP addresses (`10.0.0.1`, `10.0.0.2`, `10.0.0.3`). Only Server 1 has public ports 80/443 open.
2. **Database & Map Firewall**: PostgreSQL port `5432`, Redis `6379`, and OSRM `5000` only accept connections originating from the Server 1 internal IP.
3. **Automated TLS & Cert Renewal**: Caddy automatically issues and renews Let's Encrypt / ZeroSSL TLS certificates.

---

## 📖 Deep-Dive Setup Guides

- 📘 [**Full Hetzner 3-Server Production & Live Map Guide**](/devops/hetzner-3server-production)
- 💰 [**VPS Monthly Cost Calculator & Provider Benchmark**](/devops/vps-cost-calculator)
- 🐳 [**Docker Compose Single-Node Prototype Guide**](/devops/production-setup)
