# Go Backend Implementation Plan

This roadmap turns the current Go foundation into the production backend for Passenger, Driver, Guardian, DriverReg, and Admin Control Center applications.

## Architecture target

```text
HTTP and WebSocket transport
          |
          v
Application commands and queries
          |
          v
Domain policy and state machines
          |
          v
Ports: repositories, event bus, payments, maps, OCR, liveness, media
          |
          v
Adapters: PostgreSQL, Redis, MinIO, OSRM, APNs/FCM, provider APIs
```

Domain and use-case packages remain independent from databases, HTTP frameworks, and vendors. External commands use idempotency keys, transactional outbox events, structured audit evidence, and stable error codes.

## Delivery phases

### Phase 1: Service foundation

- Typed configuration with startup validation and secret references.
- HTTP timeouts, request IDs, recovery, origin allowlist, limits, structured logs, and graceful shutdown.
- Liveness, readiness, metrics, tracing, and build information.
- Versioned error contract and OpenAPI generation.
- CI gates for formatting, tests, static analysis, migrations, and API compatibility.

Exit criteria: reproducible local startup, health probes, clean shutdown, and passing CI.

### Phase 2: Identity and staff authorization

- Passenger phone OTP and passkeys.
- Driver activation tokens created only from approved KYC cases.
- Staff passkeys, MFA, device/session management, and branch binding.
- Permission scopes, role grant ceilings, dual control, and session revocation.
- Immutable audit events with privacy-safe metadata.

Exit criteria: protected routes deny by default and all sensitive access is auditable.

### Phase 3: DriverReg and KYC

- Registration cases, consent versions, draft synchronization, and correction loops.
- Encrypted NRC/licence/vehicle document upload with fingerprints.
- OCR normalization, per-field confidence, expiry and duplicate checks.
- Liveness and face-comparison provider interfaces with manual review.
- Independent approve, rework, and reject commands.

Exit criteria: no registrar can decide its own case and activation requires approval.

### Phase 4: Passenger planning and fares

- Geocoding, saved places, pickup notes, waypoints, OSRM routes, and scheduled rides.
- Versioned fare policies and authoritative quotes.
- Cash rounding, digital totals, LaBar service fee, promo credits, and expiry.
- Quote snapshot stored with every booked ride.

Exit criteria: estimates, payment authorization, and receipts reconcile to the same policy version.

### Phase 5: Dispatch and trip lifecycle

- Driver availability in Redis and durable status snapshots in PostgreSQL.
- Candidate ranking, 15-second offers, timeout/rejection cascade, and assignment lock.
- Ride state-machine commands with optimistic concurrency.
- Driver ETA, chat, pickup code, start, route changes, arrival, and completion.
- Transactional outbox to WebSocket/push consumers.

Exit criteria: retries cannot create duplicate rides or assign two drivers.

### Phase 6: Payments, credits, receipts, and settlement

- Payment intents for cash, KBZPay, WavePay, and AYAPay.
- Signed, idempotent webhooks and reconciliation jobs.
- Double-entry customer credit and driver settlement ledgers.
- Promo-credit grants, use, reversal, expiry, and dispute records.
- Immutable itemized receipts and refund/correction documents.

Exit criteria: every balance is reconstructable from ledger entries.

### Phase 7: Safety and Guardian

- Guardian consent and pairing, live trip channels, and sharing policy.
- Discreet Safety Drawer commands, silent SOS, cancellation window, and persistent incident state.
- Nearby-driver response tiers and emergency escalation policy.
- CCTV/GPS evidence metadata, retention, legal holds, and access audit.

Exit criteria: safety events remain available under retries, reconnects, and partial provider outages.

### Phase 8: Production hardening

- Load, soak, chaos, recovery, and migration rehearsal.
- Abuse limits, fraud signals, privacy requests, retention jobs, and key rotation.
- Backup restore tests and regional incident runbooks.
- SLO dashboards for quote, dispatch, trip events, payment, KYC, and safety.

## Data ownership

| Area | Authoritative store | Cache or stream |
|---|---|---|
| Passenger, driver, staff identity | PostgreSQL | Redis session cache |
| DriverReg cases and decisions | PostgreSQL | Work queue |
| Encrypted documents and evidence | MinIO/S3 | Signed short-lived access |
| Fare policy, quotes, receipts | PostgreSQL | Redis quote TTL |
| Driver availability | PostgreSQL snapshot | Redis GEO index |
| Ride lifecycle | PostgreSQL | WebSocket and event stream |
| Wallet and settlement | PostgreSQL ledger | Read-model cache |
| Audit evidence | Append-only PostgreSQL | Search projection |

## Required test layers

- Domain table tests for every fare and state transition.
- Use-case tests with fake ports.
- HTTP contract tests for validation and error envelopes.
- PostgreSQL integration tests for constraints, locking, and migrations.
- Redis tests for dispatch atomicity and expiration.
- Provider contract tests for maps, OCR, liveness, payments, and notifications.
- End-to-end lifecycle tests from quote to receipt and KYC to activation.
- Security tests for authorization ceilings, object access, masking, and audit creation.

## Current implemented slice

The repository currently implements the HTTP foundation, health probes, fare policy endpoint, fare quote endpoint, Passenger screen catalog, plugin manifest, unit tests, and transport contract tests in `codebase/backend`.
