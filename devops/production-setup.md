# Production Deployment & Docker Setup

Follow this step-by-step procedure to deploy the LaBar Taxi Platform services on your VPS infrastructure.

---

## Docker Compose Multi-Service Configuration

Create a `docker-compose.prod.yml` file on your application server:

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    container_name: taxi_caddy_gateway
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - taxi_net

  go_api_backend:
    image: labar/taxi-backend:latest
    container_name: taxi_go_backend
    restart: always
    environment:
      - APP_ENV=production
      - DB_DSN=postgres://taxi_admin:SecurePass123@postgres_db:5432/taxi_prod?sslmode=disable
      - REDIS_ADDR=redis_cluster:6379
      - S3_ENDPOINT=https://storage.labartaxi.com
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres_db
      - redis_cluster
    networks:
      - taxi_net

  postgres_db:
    image: postgis/postgis:16-3.4-alpine
    container_name: taxi_postgres_postgis
    restart: always
    environment:
      POSTGRES_DB: taxi_prod
      POSTGRES_USER: taxi_admin
      POSTGRES_PASSWORD: SecurePass123
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - taxi_net

  redis_cluster:
    image: redis:7-alpine
    container_name: taxi_redis_cache
    restart: always
    command: ["redis-server", "--appendonly", "yes", "--requirepass", "RedisSecurePass123"]
    volumes:
      - redisdata:/data
    networks:
      - taxi_net

  osrm_engine:
    image: osrm/osrm-backend:latest
    container_name: taxi_osrm_routing
    restart: always
    command: ["osrm-routed", "--algorithm", "mld", "/data/myanmar-latest.osrm"]
    volumes:
      - ./osrm-data:/data
    networks:
      - taxi_net

volumes:
  caddy_data:
  caddy_config:
  pgdata:
  redisdata:

networks:
  taxi_net:
    driver: bridge
```

---

## Deployment Commands

```bash
# 1. Pull latest Docker images
docker-compose -f docker-compose.prod.yml pull

# 2. Start services in detached mode
docker-compose -f docker-compose.prod.yml up -d

# 3. Check health and real-time logs
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f go_api_backend
```
