# Deployment

Build with `docker build -t labar/backend:<version> .`. The image is multi-stage and non-root. Deploy API and worker separately and run migrations once before rollout.

Use PostgreSQL 16 with PostGIS, Redis, a private S3/R2 bucket and a real OSRM-compatible router. Add actual SMS, payment, FCM and APNs credentials as required. Terminate TLS at a load balancer or reverse proxy.

SIGTERM/SIGINT drains HTTP requests. `/ready` checks PostgreSQL and Redis; `/health` is liveness. Restrict `/metrics`, back up PostgreSQL/object storage and test restoration before launch.
