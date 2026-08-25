# 🚀 Hostinger KVM 4 VPS Production Deployment & Operations Runbook

Comprehensive infrastructure, deployment, and security operations manual for **LaBar Mobility Platform** on the **Hostinger KVM 4 VPS** instance located in **Kuala Lumpur, Malaysia**.

---

## 🖥️ 1. VPS Specifications & Network Topology

| Parameter | Value |
|---|---|
| **Server Location** | Malaysia - Kuala Lumpur |
| **Operating System** | Ubuntu 24.04 LTS (Noble Numbat) |
| **Hostname** | `srv1929874.hstgr.cloud` |
| **Public IPv4 Address** | `187.52.126.130` |
| **Primary Domain** | `labartaxi.com` |
| **Compute Hardware** | **4 vCPU Cores** |
| **System Memory** | **16 GB RAM** |
| **Storage** | **200 GB NVMe SSD** |
| **Monthly Bandwidth** | **16 TB** |
| **Backup Schedule** | Weekly Automated Hostinger Snapshot + Daily Local SQL Snapshots |
| **Initial Root Access** | `ssh root@187.52.126.130` |

### 🔑 Verified SSH Public Key
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIILxoUXcI4GML7Parh+bXcaY6cWMDsbjYQugf5uaz4Q3 viper41171@gmail.com
```

---

## 🌐 2. Domain & Subdomain Architecture Matrix (`labartaxi.com`)

The table below lists the primary DNS records and recommended subdomains categorized by platform role:

| Subdomain | Type | Target / Port | Purpose & Service |
|---|---|---|---|
| **`labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-public-web:8080` | Canonical Public Landing Page, Booking UI, Fares, Guardian Safety |
| **`www.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-public-web:8080` | WWW Alias (Permanent 301 Redirect to `labartaxi.com`) |
| **`api.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-api:8080` | Central Golang REST API v1 & WebSocket Dispatcher |
| **`cdn.labartaxi.com`** | `A` ➔ `187.52.126.130` | `/opt/labar/storage/cdn` | High-Speed Static Media, Vehicle 3D GLB Models, App APKs |
| **`storage.labartaxi.com`** | `A` ➔ `187.52.126.130` | `minio:9000` | S3-Compatible Object Storage (KYC Scans, NRC, CCTV Loops) |
| **`stroage.labartaxi.com`** | `A` ➔ `187.52.126.130` | `minio:9000` | User DNS Alias pointing to S3 Object Storage API |
| **`admin.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-admin-portal:80` | Internal Executive & Staff Admin Control Center (RBAC) |
| **`driverreg.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-driverreg:80` | Assisted Driver Registration Portal for Field Agents |
| **`ws.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-api:8080` | Dedicated High-Throughput 60fps Driver GPS Telemetry Stream |
| **`driver.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-driver-portal` | Driver Partner Self-Service Portal (Earnings, Shifts, Invoices) |
| **`docs.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-docs:5173` | Interactive VitePress Engineering & Architecture Documentation |
| **`status.labartaxi.com`** | `A` ➔ `187.52.126.130` | `labar-public-web` | Public Infrastructure & Gateway Uptime Telemetry Dashboard |
| **`minio-admin.labartaxi.com`** | `A` ➔ `187.52.126.130` | `minio:9001` | S3 Storage Administration Web Console |

---

## 👥 3. Linux User Management & Security Matrix

Three dedicated system users are provisioned on the Ubuntu 24.04 server with passwordless sudo and Docker privileges:

```
                      ┌─────────────────────────────────────────┐
                      │          Hostinger KVM 4 VPS            │
                      │             187.52.126.130              │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│     labardev     │             │     tapmidev     │             │   kaorinmedev    │
│  (UID/GID 1001)  │             │  (UID/GID 1002)  │             │  (UID/GID 1003)  │
│ Application Ops, │             │  Infrastructure, │             │  Central DB Ops, │
│ CI/CD & Deploy   │             │   Telemetry &    │             │   Security &     │
│  GitLab Runner   │             │    Networking    │             │  Auditing Lead   │
└──────────────────┘             └──────────────────┘             └──────────────────┘
```

### User Roles:
1. **`labardev`**:
   - Primary service owner for `/opt/labar`.
   - Clones and pulls code from `https://gitlab.reiwasakura.tech`.
   - Executes `deploy.sh` and manages Docker Compose services.
   - Login: `ssh labardev@187.52.126.130`
2. **`tapmidev`**:
   - Infrastructure, network routing, BBR optimization, and Caddy reverse proxy administrator.
   - Login: `ssh tapmidev@187.52.126.130`
3. **`kaorinmedev`**:
   - Central database coordinator connecting to `https://db.reiwasakura.tech/`.
   - Manages automated database snapshot backups (`backup.sh`) and encryption keys.
   - Login: `ssh kaorinmedev@187.52.126.130`

---

## 📦 4. GitLab Repository Integration (`gitlab.reiwasakura.tech`)

The project is hosted and synchronized with the self-hosted GitLab server at **`https://gitlab.reiwasakura.tech`**.

### 1. Add Remote & Push to GitLab
```bash
# Add GitLab remote from local workstation
git remote add gitlab https://gitlab.reiwasakura.tech/yamato/labar.git

# Push all branches and tags
git push gitlab main --tags
```

### 2. Initial Clone on VPS (under `labardev`)
```bash
# SSH into the VPS as labardev
ssh labardev@187.52.126.130

# Clone repository into /opt/labar
cd /opt
git clone https://gitlab.reiwasakura.tech/yamato/labar.git /opt/labar
cd /opt/labar
```

---

## 🗄️ 5. External Managed Database Integration (`db.reiwasakura.tech`)

The production application communicates with a high-availability PostgreSQL 16 cluster managed via **`https://db.reiwasakura.tech/`**.

### Database Configuration:
- **Host**: `db.reiwasakura.tech`
- **Port**: `5432`
- **Database Name**: `labar_production`
- **SSL Mode**: `require` / `verify-full`
- **Connection Pool**: 50 Max Connections, 10 Min Connections (pgxpool)
- **DSN Connection String**:
  ```text
  postgres://labar_app_user:YourStrongDbPassword2026!@db.reiwasakura.tech:5432/labar_production?sslmode=require&pool_max_conns=50&pool_min_conns=10
  ```

---

## ⚙️ 6. Quick Start: One-Command Server Setup & Deployment

### Step 1: Initialize the VPS (Run as `root`)
```bash
# 1. SSH into the server
ssh root@187.52.126.130

# 2. Download and execute the automated setup script
curl -fsSL https://raw.githubusercontent.com/Filip2k03/LarBarDocs/main/server/vps/init-server.sh | bash
# OR execute the local script if already cloned:
bash /opt/labar/server/vps/init-server.sh
```

### Step 2: Configure Production Environment Variables
```bash
# Switch to labardev user
su - labardev
cd /opt/labar/server/vps

# Copy environment template and fill in secrets
cp .env.production.example .env.production
nano .env.production
```

### Step 3: Launch Production Containers (Docker Compose)
```bash
cd /opt/labar/server/vps
bash deploy.sh
```

### Step 4: Verify Running Services & Health Checks
```bash
# Check container status
docker compose -f docker-compose.production.yml ps

# Verify API Health endpoint
curl -I https://api.labartaxi.com/api/v1/health

# Verify Public Website
curl -I https://labartaxi.com
```

---

## 🛡️ 7. Security Hardening & UFW Firewall

The VPS is hardened with minimal exposed surface:

```bash
# Active UFW Rules:
ufw status verbose
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp (SSH)               ALLOW IN    Anywhere
# 80/tcp (HTTP)              ALLOW IN    Anywhere
# 443/tcp (HTTPS)            ALLOW IN    Anywhere
# 443/udp (HTTP3 QUIC)       ALLOW IN    Anywhere
```

- **Fail2ban**: Automatically bans IP addresses exceeding 5 failed SSH authentication attempts within 10 minutes for 1 hour.
- **Auto-TLS**: Caddy automatically provisions and renews ECC 256-bit certificates from Let's Encrypt / ZeroSSL with OCSP stapling and HTTP/3 support.

---

## 💾 8. Automated Database & Media Backup Schedule

A cron job runs nightly under `kaorinmedev` to snapshot the database:

```bash
# View cron schedule:
crontab -l

# Daily Database Dump at 03:00 AM MMT:
0 3 * * * /bin/bash /opt/labar/server/vps/backup.sh >> /var/log/labar_backup.log 2>&1
```
