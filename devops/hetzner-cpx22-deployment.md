# ☁️ Hetzner CPX22 Lean Single-Node Production Deployment Guide

This guide provides the complete, production-hardened blueprint for running the entire **LaBar Taxi Platform (Go API Core, PostgreSQL 16 + PostGIS, Redis 7 Spatial, OSRM Myanmar Router, and Caddy 2 SSL Edge)** on a single **Hetzner CPX22 Cloud VPS** (€5.80 / month).

---

## 🖥️ Target Server Hardware & Cost Breakdown

| Parameter | Specification | Purpose & Allocation |
|---|---|---|
| **VPS Model** | **Hetzner Cloud CPX22** (Falkenstein / Nuremberg / Helsinki) | Single-Node Lean Production Instance |
| **Processor** | **2 vCPU AMD EPYC™ 7002/7003** (3.4 GHz Boost) | High concurrency Go goroutines & OSRM routing |
| **Memory** | **4 GB DDR4 ECC RAM** (Tuned container limits) | PostgreSQL (1.4GB) + OSRM (1.2GB) + Redis (450MB) + Go (400MB) |
| **Storage** | **80 GB NVMe SSD** (PCIe Gen 4) | Fast PostGIS GIST indexes & append-only Redis AOF |
| **Bandwidth** | **20 TB / month** (10 Gbps Uplink) | Millions of 1-second GPS breadcrumbs & 60fps WebSockets |
| **Base Price** | **€5.80 / month (~$6.30 USD / mo)** | Ultra cost-effective startup deployment |

---

## 📊 Memory Budget & Container Allocation

To prevent Linux Out-Of-Memory (`OOMKilled`) panics on a 4GB RAM node, all container memory limits are strictly capped:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ HETZNER CPX22 TOTAL PHYSICAL RAM: 4,096 MB                             │
├───────────────────────┬─────────────┬─────────────┬────────────────────┤
│ Service               │ Min Memory  │ Max Limit   │ CPU Quota          │
├───────────────────────┼─────────────┼─────────────┼────────────────────┤
│ 🗄️ PostgreSQL 16 PostGIS │ 512 MB      │ 1,400 MB    │ 0.80 vCPU          │
│ 🛣️ OSRM Myanmar Router  │ 600 MB      │ 1,200 MB    │ 0.70 vCPU          │
│ ⚡ Redis 7 Spatial      │ 128 MB      │ 450 MB      │ 0.40 vCPU          │
│ 🚀 Go Core API Binary   │ 64 MB       │ 400 MB      │ 0.80 vCPU          │
│ 🔒 Caddy 2 HTTPS Edge   │ 30 MB       │ 150 MB      │ 0.30 vCPU          │
│ 🐧 Linux OS & Buffers │ 256 MB      │ 496 MB      │ Shared             │
├───────────────────────┴─────────────┴─────────────┴────────────────────┤
│ TOTAL PEAK COMMITTED: ~3,600 MB (Preserves 500MB headroom + 2GB Swap)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Step-by-Step Production Setup

### 1. Provision Ubuntu 24.04 LTS & Enable 2GB Swap Headroom
```bash
# Update base system packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban htop docker.io docker-compose

# Create 2GB NVMe Swapfile to prevent OOM spikes
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Configure Host Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt challenge)
sudo ufw allow 443/tcp   # HTTPS & WSS WebSockets
sudo ufw enable
```

### 3. Clone Repository & Deploy Docker Compose
```bash
# Clone the repository
git clone https://github.com/Filip2k03/LaBarDocs.git /opt/labar
cd /opt/labar/codebase/backend

# Launch all production containers
docker-compose -f docker-compose.cpx22.yml up -d --build
```

### 4. Verify Service Health
```bash
# Check running containers and memory usage
docker stats --no-stream
curl https://api.yourdomain.com/health
```
