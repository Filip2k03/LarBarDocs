# LaBar Backend

LaBar has one authoritative Go backend for the Passenger, Driver and Driver Registration React Native applications, the Astro public website, the Admin Panel and operations tooling. It is a modular monolith: PostgreSQL is authoritative, Redis supplies ephemeral dispatch and presence state, and workers perform delivery and timeout work outside HTTP requests.

## Requirements

- Go 1.24 or newer
- Docker with Compose
- PostgreSQL 16 with PostGIS 3.5
- Redis 7 or newer
- S3-compatible object storage; local development uses MinIO
- A real routing service compatible with OSRM

## Local setup

```bash
cp .env.example .env
docker compose up -d
set -a; source .env; set +a
go run ./cmd/migrate up
go run ./cmd/api
```

Run `go run ./cmd/worker` in a second terminal with the same environment. The API is at `http://localhost:8080`, MinIO is at `http://localhost:9000`, and its console is at `http://localhost:9001`. Configure `MAP_BASE_URL` to an actual OSRM instance; no straight-line or synthetic route is accepted as an authoritative fare route.

The local SMS provider prints OTP codes only when `APP_ENV=local`, `SMS_PROVIDER=development`, and `DEVELOPMENT_OTP_ENABLED=true`. Validation prevents that mode outside local development.

## Commands

```bash
make dev
make migrate-up
make api
make worker
make test
make test-race
make vet
make build
make docker
```

Migrations are never run by API startup.

After applying migrations, provision a registration center and its first staff account without putting the password in shell history:

```bash
export LABAR_STAFF_PASSWORD='replace-with-a-long-unique-password'
make staff-create ARGS="--staff-id MKT-0001 --phone +959123456789 --display-name 'Registration Staff' --role marketer --center-code YGN-01 --center-name 'Yangon Registration Center'"
unset LABAR_STAFF_PASSWORD
```

Allowed provisioning roles are `marketer`, `driver_registrar`, and `registration_manager`. DriverReg uses password-based staff authentication at `POST /api/v1/auth/staff/login`; applicant OTP is not part of registration. The Driver app retains phone OTP only for an already approved driver account.

## Architecture and pricing

HTTP handlers decode and authorize. Module services own rules and transactions. Explicit SQL through `pgx` owns persistence. Provider packages isolate maps, SMS, object storage, FCM and APNs. PostgreSQL durable jobs are claimed with row locks; Redis provides driver GEO search, presence, rate limits and WebSocket fan-out.

The active seed fare is versioned in PostgreSQL: 5,000 MMK includes 3 km, additional distance is 1,500 MMK/km, and low-speed time at 10 km/h or below is 150 MMK per started minute. Fare handlers contain no business pricing constants. Historical rides retain `pricing_version_id`.

## Client integration

All routes are under `/api/v1`. Passenger and approved Driver accounts use phone OTP; DriverReg uses scoped staff credentials. Send `Authorization: Bearer <token>`, register installations through `POST /devices/register`, and connect authenticated clients to `GET /realtime`. Persist each `Idempotency-Key` until its command succeeds.

Passenger clients use `/passenger/profile`, `/passenger/places`, `/passenger/rides/quote`, `/passenger/rides`, ride receipt/rating/share/SOS routes, Live Activities and widget data. Driver clients use dashboard, availability, heartbeat, location, offers and arrived/PIN/start/complete/cancel commands. DriverReg uses `/driver-registration/staff/cases/*`; the backend derives the staff actor from the session and stores a separate applicant identity. Astro uses `/public/*`; admin and operations use role-protected `/admin/*` and `/operations/*`.

## Push and production

The worker sends FCM HTTP v1 messages when a Google service account is configured and APNs token-authenticated messages when the team, key, bundle and `.p8` settings are configured. Live Activity tokens are separate from ordinary device tokens. Swift ActivityKit UI and Android foreground services remain client responsibilities. Production OTP and digital capture use configurable authenticated HTTPS provider endpoints; a missing or rejected provider response never becomes a successful OTP delivery or paid transaction.

Build the non-root image with `make docker`. Terminate TLS at a trusted edge, use private object buckets, restrict `/metrics`, set explicit CORS origins, inject secrets at deployment, and run API, worker and migration tasks separately. No external provider should be considered operational until its real credentials and production callback behavior are verified.

See [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API.md](docs/API.md), [DATABASE.md](docs/DATABASE.md), [SECURITY.md](docs/SECURITY.md), and [DEPLOYMENT.md](docs/DEPLOYMENT.md).
