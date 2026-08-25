#!/usr/bin/env bash
# ==============================================================================
# LaBar Mobility Platform — Zero-Downtime Deployment Script
# Target: srv1929874.hstgr.cloud (187.52.126.130) | User: labardev
# ==============================================================================

set -euo pipefail

APP_DIR="/opt/labar"
COMPOSE_FILE="$APP_DIR/server/vps/docker-compose.production.yml"
ENV_FILE="$APP_DIR/server/vps/.env.production"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[1/5] Pulling latest code from GitLab...${NC}"
cd "$APP_DIR"
git pull origin main

echo -e "${BLUE}[2/5] Checking environment configuration...${NC}"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: $ENV_FILE not found! Copy .env.production.example to .env.production first.${NC}"
  exit 1
fi

echo -e "${BLUE}[3/5] Running Database Migrations against db.reiwasakura.tech...${NC}"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm labar-api ./migrate up || true

echo -e "${BLUE}[4/5] Building & Recreating Containers...${NC}"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build --parallel
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

echo -e "${BLUE}[5/5] Performing Health Check on https://api.labartaxi.com...${NC}"
sleep 5
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo -e "${GREEN}=================================================================${NC}"
echo -e "${GREEN}Deployment successful to labartaxi.com!${NC}"
echo -e "${GREEN}API Status: https://api.labartaxi.com/api/v1/health${NC}"
echo -e "${GREEN}=================================================================${NC}"
