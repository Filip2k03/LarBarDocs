#!/usr/bin/env bash
# ==============================================================================
# LaBar Production Backup Script — PostgreSQL & S3 Object Snapshots
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/opt/labar/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "[INFO] Starting database backup from db.reiwasakura.tech..."
# Extract database connection string from .env.production
ENV_FILE="/opt/labar/server/vps/.env.production"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

DUMP_FILE="$BACKUP_DIR/labar_db_backup_${DATE}.sql.gz"

if [ -n "${DATABASE_URL:-}" ]; then
  docker run --rm -v "$BACKUP_DIR:/backup" postgres:16-alpine \
    pg_dump "$DATABASE_URL" | gzip > "$DUMP_FILE"
  echo "[SUCCESS] Database dump saved: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"
fi

# Clean up older backups
find "$BACKUP_DIR" -type f -name "labar_db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[SUCCESS] Old backups purged (retention: $RETENTION_DAYS days)."
