# ☁️ Hetzner 3-Server Production & Live Map Server Setup

This production architecture separates the LaBar Taxi Platform across **3 dedicated Hetzner Cloud VPS instances** connected over a secure **Private Cloud VPC Network (`10.0.0.0/24`)** for ultra-low latency, maximum security, and sub-$65/month operating cost.

---

## 🏗️ Hetzner 3-Server Topology & Roles

```text
                                  [ Public Internet (HTTPS/WSS) ]
                                                │
                                                ▼ (Public IP: Ports 80, 443)
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ SERVER 1: API & REVERSE PROXY GATEWAY (`10.0.0.1` - Hetzner CPX31)                               │
 │ - Caddy 2 Reverse Proxy (Auto TLS 1.3 Let's Encrypt / ZeroSSL)                                   │
 │ - Go Backend Engine Core (`labar-core-api` binary in Docker)                                    │
 │ - JWT Auth, 15s Cascading Dispatch, Driver Emergency SOS Engine, FCM/APNs Notifications          │
 └───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┘
                                 │ Private VPC (`10.0.0.0/24`)      │ Private VPC (`10.0.0.0/24`)
                                 ▼                                  ▼
 ┌──────────────────────────────────────────────┐  ┌────────────────────────────────────────────────┐
 │ SERVER 2: LIVE MAP & SPATIAL ENGINE          │  │ SERVER 3: DATABASE & STORAGE VAULT             │
 │ (`10.0.0.2` - Hetzner CPX41 - 8 vCPU, 16GB)  │  │ (`10.0.0.3` - Hetzner CPX31 + Storage Box)     │
 │                                              │  │                                                │
 │ 🗺️ TileServer GL (OpenStreetMap Vector Tiles) │  │ 🗄️ PostgreSQL 16 + PostGIS 3.4 Spatial DB       │
 │ 🛣️ OSRM Myanmar Router (`myanmar-latest.osrm`) │  │ 📹 MinIO / S3 Encrypted CCTV Video Chunk Vault│
 │ ⚡ Redis 7 Spatial Cluster (1km-3km Radius)   │  │ 💾 Hourly Encrypted Automated Database Backup   │
 └──────────────────────────────────────────────┘  └────────────────────────────────────────────────┘
```

---

## 💰 3-Server Monthly Pricing Breakdown (Hetzner Cloud)

| Server Node | Spec & Resources | Hetzner Cloud Model | Monthly Cost (€) | Monthly Cost (USD) |
|---|---|---|---|---|
| **Server 1: API Gateway & Go Core** | 4 vCPU AMD EPYC, 8 GB RAM, 160 GB NVMe | **CPX31** | €13.50 / mo | ~$14.70 / mo |
| **Server 2: Live Map, OSRM & Redis** | 8 vCPU AMD EPYC, 16 GB RAM, 240 GB NVMe | **CPX41** | €26.50 / mo | ~$28.90 / mo |
| **Server 3: PostGIS DB & Storage Vault** | 4 vCPU AMD EPYC, 8 GB RAM, 160 GB NVMe + 1TB Storage Box | **CPX31 + BX11** | €13.50 + €3.80 | ~$18.80 / mo |
| **Private VPC Network (10.0.0.0/24)** | High-speed 10Gbps isolated cloud network | **Included Free** | **€0.00** | **$0.00** |
| **Outbound Traffic (20 TB / server)** | Unlimited inbound + 60 TB total outbound | **Included Free** | **€0.00** | **$0.00** |
| **TOTAL ESTIMATED MONTHLY** | — | — | **~€57.30 / mo** | **~$62.40 / mo** |

*(Compare to $280 - $450 / month on AWS EC2 or DigitalOcean for identical CPU and RAM allocations!)*

---

## 🚀 Step-by-Step Server Configurations

### 1. Server 1: API Gateway & Go Core (`docker-compose.server1.yml`)

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    container_name: labar_caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - s1_net

  labar_api:
    image: labar/taxi-backend:latest
    container_name: labar_go_api
    restart: always
    environment:
      - APP_ENV=production
      - DB_DSN=postgres://labar_admin:SecretPostgresPass123@10.0.0.3:5432/labar_prod?sslmode=disable
      - REDIS_ADDR=10.0.0.2:6379
      - REDIS_PASSWORD=RedisSecurePass123
      - OSRM_ROUTER_URL=http://10.0.0.2:5000
      - TILE_SERVER_URL=http://10.0.0.2:8080
      - S3_ENDPOINT=http://10.0.0.3:9000
      - S3_BUCKET=labar-cctv-vault
      - S3_ACCESS_KEY=MinioAdminUser123
      - S3_SECRET_KEY=MinioAdminSecretPass123
      - JWT_SECRET=super_secret_production_jwt_signing_key
    networks:
      - s1_net

networks:
  s1_net:
    driver: bridge
```

#### Server 1 `Caddyfile`:
```caddy
api.labartaxi.com {
    reverse_proxy labar_api:8080
}

maps.labartaxi.com {
    reverse_proxy 10.0.0.2:8080
}
```

---

### 2. Server 2: Live Map, OSRM & Redis Cluster (`docker-compose.server2.yml`)

```yaml
version: '3.8'

services:
  redis_cluster:
    image: redis:7-alpine
    container_name: labar_redis_spatial
    restart: always
    command: ["redis-server", "--appendonly", "yes", "--requirepass", "RedisSecurePass123", "--bind", "0.0.0.0"]
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - s2_net

  osrm_engine:
    image: osrm/osrm-backend:latest
    container_name: labar_osrm_myanmar
    restart: always
    command: ["osrm-routed", "--algorithm", "mld", "/data/myanmar-latest.osrm"]
    ports:
      - "5000:5000"
    volumes:
      - ./osrm-data:/data
    networks:
      - s2_net

  tileserver_gl:
    image: maptiler/tileserver-gl:latest
    container_name: labar_tileserver
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - ./tiles-data:/data
    networks:
      - s2_net

volumes:
  redis_data:

networks:
  s2_net:
    driver: bridge
```

#### 🇲🇲 Downloading & Compiling Myanmar OpenStreetMap Data for OSRM:
Run this on **Server 2**:
```bash
# 1. Create data directory
mkdir -p osrm-data && cd osrm-data

# 2. Download latest Myanmar OSM extract from Geofabrik
wget https://download.geofabrik.de/asia/myanmar-latest.osm.pbf

# 3. Extract and build routing graph with car profile
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/myanmar-latest.osm.pbf
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/myanmar-latest.osrm
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/myanmar-latest.osrm

# 4. Start Server 2 containers
cd .. && docker-compose -f docker-compose.server2.yml up -d
```

---

### 3. Server 3: PostgreSQL 16 + PostGIS & MinIO S3 Vault (`docker-compose.server3.yml`)

```yaml
version: '3.8'

services:
  postgres_postgis:
    image: postgis/postgis:16-3.4-alpine
    container_name: labar_postgres
    restart: always
    environment:
      POSTGRES_DB: labar_prod
      POSTGRES_USER: labar_admin
      POSTGRES_PASSWORD: SecretPostgresPass123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - s3_net

  minio_s3:
    image: minio/minio:latest
    container_name: labar_minio_vault
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: MinioAdminUser123
      MINIO_ROOT_PASSWORD: MinioAdminSecretPass123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data
    networks:
      - s3_net

volumes:
  pgdata:
  miniodata:

networks:
  s3_net:
    driver: bridge
```

---

## 🔒 Hetzner Firewall Rules

Configure the **Hetzner Cloud Firewall** in the dashboard:
- **Server 1 (Gateway)**:
  - Inbound: Allow `TCP 80` (HTTP), `TCP 443` (HTTPS), `TCP 22` (SSH from your IP).
- **Server 2 (Map & Redis)**:
  - Inbound: Allow `ANY` from `10.0.0.1` (Server 1) only. Deny all public access on 5000, 6379, 8080.
- **Server 3 (Database & Storage Vault)**:
  - Inbound: Allow `ANY` from `10.0.0.1` (Server 1) only. Deny all public access on 5432, 9000, 9001.
