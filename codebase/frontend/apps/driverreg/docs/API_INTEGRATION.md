# DriverReg API Integration

All routes are relative to `API_BASE_URL`. Successful responses use `{ "success": true, "data": {}, "meta": { "request_id": "..." } }`. The client normalizes failures, performs one refresh attempt after `401`, and preserves server drafts when authentication ends.

## Client integration contracts

The mobile client is wired to every route below. The Go backend provides staff login, scoped registration cases, refresh/logout, identity restoration, device registration, case-bound uploads, and support. DriverReg fails closed when a required API or provider is unavailable.

The old applicant-owned `/driver-registration/application`, `/driver-registration/steps/{step}`, and `/driver-registration/submit` routes are not valid substitutes. Calling them with a staff token would bind applicant evidence to the staff identity. Production must authorize the scoped staff-case routes below, derive `actor_user_id` from the session, and persist a separate server-created `applicant_user_id`.

| Method | Route | Use |
|---|---|---|
| `GET` | `/mobile/config` | Maintenance, versions, and feature availability |
| `POST` | `/auth/staff/login` | Marketer/registrar staff session |
| `POST` | `/auth/refresh` | Refresh-token rotation |
| `POST` | `/auth/logout` | Revoke current session |
| `GET` | `/auth/me` | Restore identity and roles |
| `POST` | `/devices/register` | Register an Android/iOS `driverreg` device |
| `GET` | `/driver-registration/staff/cases` | List staff-assigned applicant cases |
| `POST` | `/driver-registration/staff/cases` | Create a case with distinct actor/applicant identities |
| `GET` | `/driver-registration/staff/cases/{id}` | Load one assigned application |
| `PUT` | `/driver-registration/staff/cases/{id}/steps/{step}` | Save a server-validated applicant step |
| `POST` | `/driver-registration/uploads/presign` | Obtain short-lived object upload URL |
| `POST` | `/driver-registration/uploads/{id}/complete` | Confirm checksum and metadata |
| `POST` | `/driver-registration/staff/cases/{id}/submit` | Submit the authoritative applicant snapshot |
| `POST` | `/support/tickets` | Driver registration support request |

## Required before production completion

- Remote required-step metadata and correction-specific completion rules; the Go service accepts the stable DriverReg step keys and retains legacy aliases only for historical records.
- Application revision or ETag concurrency contract.
- Correction request payload with exact unlocked steps and document slots.
- OCR job create/status/result endpoints.
- Liveness/face evidence create/status/result endpoints.
- Optional staff MFA and device-binding challenge policy beyond the current password, role, center, lockout, and session controls.
- Registration requirements by city and vehicle type.
- Payout provider list and token verification.
- One-time Driver app activation handoff.
- DriverReg notification inbox and read-state routes, plus FCM/APNs routing contracts.

DriverReg hides or blocks any dependent workflow until both remote config and a production build adapter enable it. No local success fallback is permitted.

## Upload contract

The client requests a presign ticket, uploads bytes directly to the signed object-storage URL, then calls completion with SHA-256, byte count, MIME type, and pixel dimensions. Only completion from the API changes the document slot to complete. Signed URLs never enter application state, analytics, logs, or push payloads.
