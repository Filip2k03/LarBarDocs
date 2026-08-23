# LaBar Go Backend

LaBar's backend is a Go 1.22 HTTP service organized around domain types, application use cases, and transport adapters. The current foundation includes health probes, versioned APIs, the authoritative Myanmar fare engine, Passenger screen metadata, and the existing plugin manifest.

## Run locally

```bash
go mod download
go run ./cmd/api
```

The API listens on `:8080` by default. Override it with `PORT`.

For the Compose staging profile, copy `.env.example` to `.env`, replace every placeholder with a generated secret, and then run:

```bash
docker compose -f docker-compose.cpx22.yml up --build
```

Do not commit `.env` or production credentials.

## Validate

```bash
gofmt -w ./cmd ./internal
go test ./...
go vet ./...
```

## Package layout

```text
cmd/api/                         process bootstrap and graceful shutdown
internal/domain/                 business types and invariants
internal/usecase/                application behavior and fare policy
internal/transport/httpapi/      routes, request decoding and responses
```

Dependencies such as PostgreSQL, Redis, object storage, notification providers, and OCR/liveness services should be introduced behind narrow interfaces in `internal/port` and implemented in `internal/adapter`. Domain and use-case packages must not import infrastructure packages.

## Fare policy

Policy version: `MM-2026-08-v1`.

| Rule | Amount |
|---|---:|
| Transport minimum, including up to 2.0 km | 5,000 MMK |
| LaBar service fee on every route | 1,500 MMK |
| Minimum customer subtotal | 6,500 MMK |
| Distance after 2.0 km | 150 MMK per started 0.1 km |
| Equivalent distance rate | 1,500 MMK per km |
| Cash payment rounding | Up to the next 500 MMK |
| Promo-credit value | 1 credit = 10 MMK |

Promo credits discount the transport portion and cannot remove the mandatory service fee. Digital payments use the exact subtotal. Cash payments round upward only after credits and service fee are applied.

Examples:

| Distance | Payment | Credits | Calculation | Payable |
|---:|---|---:|---|---:|
| 1.0 km | KBZPay | 0 | 5,000 + 1,500 | 6,500 MMK |
| 2.1 km | KBZPay | 0 | 5,000 + 150 + 1,500 | 6,650 MMK |
| 2.1 km | Cash | 0 | 6,650 rounded upward | 7,000 MMK |
| 2.1 km | KBZPay | 100 | 5,150 - 1,000 + 1,500 | 5,650 MMK |

## HTTP endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health/live` | Process liveness |
| `GET` | `/health/ready` | Dependency readiness |
| `GET` | `/api/v1/fares/policy` | Active public fare constants |
| `POST` | `/api/v1/fares/quote` | Authoritative quote calculation |
| `POST` | `/api/v1/rides/quote` | Compatibility alias for quote clients |
| `GET` | `/api/v1/passenger/screens` | Passenger information architecture |
| `GET` | `/api/v1/plugins/manifest` | Available dynamic plugins |

Example:

```bash
curl -s http://localhost:8080/api/v1/fares/quote \
  -H 'Content-Type: application/json' \
  -d '{"distance_km":2.1,"payment_method":"CASH","promo_credits":0}'
```

## Next backend milestones

1. Configuration validation and secrets management.
2. PostgreSQL migrations for passengers, driver registration, rides, fare policies, wallets, credits, receipts, staff RBAC, and audit events.
3. Redis-backed dispatch and idempotent ride command handlers.
4. JWT/passkey authentication and authorization middleware.
5. DriverReg OCR/liveness provider ports and encrypted document storage.
6. WebSocket trip, driver, Guardian, and safety event streams.
7. Payment adapters, double-entry wallet ledger, receipts, refunds, and reconciliation.
8. OpenAPI generation, contract tests, observability, rate limiting, and deployment probes.

The implementation roadmap is maintained in [`../../guide/backend-implementation-plan.md`](../../guide/backend-implementation-plan.md).
