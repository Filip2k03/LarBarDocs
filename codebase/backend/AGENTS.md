# Backend Agent Instructions

These instructions apply to every file under `codebase/backend`.

## Architecture

- Preserve dependency direction: transport and adapters may depend on use cases and domain; domain must not import infrastructure.
- Keep business rules deterministic and testable. Monetary values are integer MMK, never floating-point.
- Treat the fare policy in `internal/usecase/fare_calculator.go` as the executable source of truth until a versioned policy repository replaces it.
- Introduce PostgreSQL, Redis, object storage, OCR, biometric, payment, and notification integrations behind interfaces.
- Require idempotency keys for externally retried commands that create rides, payments, payouts, KYC decisions, or safety incidents.
- Use structured logs without raw NRC, licence, biometric, token, password, payment-account, or precise-location data.

## API conventions

- Version public routes under `/api/v1`.
- Return JSON error envelopes with stable machine codes and safe messages.
- Reject unknown request fields and enforce request-size limits.
- Use UTC timestamps in RFC 3339 form and UUIDs for externally visible entity IDs.
- Preserve backward compatibility or introduce a new endpoint/version with migration notes.

## Security and privacy

- Default to least privilege and deny access when authorization evidence is missing.
- A driver registrar cannot approve the same KYC case.
- Staff registrars cannot grant executive, administrator, security, or auditor roles.
- Store only encrypted references to identity and biometric media; mask identity numbers outside authorized detail views.
- Record sensitive document views, decisions, role changes, exports, and session revocations in immutable audit events.

## Completion protocol

- Run `gofmt`, `go test ./...`, and `go vet ./...` for backend changes.
- Update `codebase/backend/README.md`, API documentation, architecture documentation, and any affected feature Markdown in the same change.
- Update examples whenever a request, response, policy value, endpoint, or state transition changes.
- Do not add emoji to source logs, documentation headings, navigation, or UI labels. Use the LaBar SVG icon set for visual symbols.
- Report assumptions explicitly when product rules are ambiguous; encode the accepted rule in tests.
