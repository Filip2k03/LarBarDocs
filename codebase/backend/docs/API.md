# API

Every endpoint uses `/api/v1`, JSON, UUID identifiers and UTC timestamps. Success responses contain `success`, `data` and `meta.request_id`; errors contain a stable code, safe message and the same request ID. Clients should send `X-Request-ID` and persist `Idempotency-Key` for critical commands.

Route groups are `/public`, `/auth`, `/passenger`, `/driver`, `/driver-registration`, `/admin` and `/operations`. Access tokens are short-lived JWTs. Refresh tokens are opaque, hashed at rest and rotated on refresh.

Ride state is forward-only: searching, offered, assigned, enroute, arrived, pickup confirmed, in progress and completed, with explicit cancellation and no-driver terminal states. Clients render server state and never calculate authoritative fares or force transitions. See [openapi.yaml](openapi.yaml).

Cash rides create a `cash_due` payment that the assigned driver confirms after completion. Digital rides require a registered `payment_method_id`; the durable worker submits an idempotent capture to the configured payment gateway and records each attempt. Missing payment credentials never produce a paid result.
