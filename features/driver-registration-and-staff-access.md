# DriverReg KYC, Staff Access, and Driver Activation

DriverReg is a separate staff-assisted application for collecting and reviewing driver identity and vehicle evidence. The operational Driver App does not accept a login until a registration case is approved and an activation invitation is issued.

## End-to-end flow

```text
Authorized staff + MFA
        │
        ▼
Driver consent → Personal details → NRC scan → Licence scan/OCR
        │                                      │
        │                                      └─ confidence + expiry + duplicate checks
        ▼
Selfie liveness → Face comparison → Vehicle/commercial documents
        │
        ▼
Submit case → Independent KYC review ──┬─ Request correction → Resubmit
                                      ├─ Reject with policy reason
                                      └─ Approve → Driver ID + activation invite → Driver App
```

## Trust boundaries

- Capture devices receive a short-lived, staff-bound case token.
- Documents are encrypted before durable storage and represented in the database by encrypted object keys and SHA-256 fingerprints.
- OCR is an assistive input, not the authoritative approval decision.
- Liveness runs before face similarity. A score is never the sole reason for approval or rejection.
- The staff member who registers a driver cannot approve the same case.
- Raw document views require a purpose and create an audit event.
- Driver activation is a separate, one-time handoff after approval.

## Case state machine

`DRAFT → SUBMITTED → IN_REVIEW → APPROVED`

Alternative transitions:

- `DRAFT ↔ OFFLINE_PENDING_SYNC`
- `IN_REVIEW → NEEDS_CORRECTION → SUBMITTED`
- `IN_REVIEW → REJECTED`
- `APPROVED → ACTIVATION_INVITED → ACTIVE`
- Any identity fraud or regulatory revocation can move an active driver to `SUSPENDED`, with a recorded reason and review path.

## Suggested API surface

| Method | Endpoint | Scope | Purpose |
|---|---|---|---|
| `POST` | `/api/v1/staff/sessions` | Public + MFA challenge | Staff authentication |
| `POST` | `/api/v1/driver-registration/cases` | `driver_case:create` | Create consented case |
| `PUT` | `/api/v1/driver-registration/cases/{id}/identity` | `driver_case:edit` | Personal/NRC values |
| `POST` | `/api/v1/driver-registration/cases/{id}/documents` | `driver_document:capture` | Encrypted capture upload |
| `POST` | `/api/v1/driver-registration/cases/{id}/ocr` | Service identity | OCR and normalization |
| `POST` | `/api/v1/driver-registration/cases/{id}/biometrics` | `driver_biometric:capture` | Liveness and face evidence |
| `PUT` | `/api/v1/driver-registration/cases/{id}/vehicle` | `driver_case:edit` | Vehicle/compliance values |
| `POST` | `/api/v1/driver-registration/cases/{id}/submit` | `driver_case:submit` | Lock and submit snapshot |
| `POST` | `/api/v1/driver-registration/cases/{id}/decision` | `driver_case:decide` | Approve/rework/reject |
| `POST` | `/api/v1/driver-registration/cases/{id}/activation` | `driver:activate` | Issue one-time Driver invite |
| `POST` | `/api/v1/staff/invitations` | `staff:invite_limited` or admin | Invite within grant ceiling |
| `POST` | `/api/v1/staff/{id}/role-grants` | Authorized admin | Grant a role below actor ceiling |

## OCR result contract

```json
{
  "document_type": "MYANMAR_DRIVING_LICENCE",
  "quality": { "blur": 0.06, "glare": 0.08, "cropped": false },
  "fields": {
    "licence_number": { "value": "B/00548/11", "confidence": 0.96 },
    "full_name": { "value": "MYINT KYAW", "confidence": 0.96 },
    "nrc_number": { "value": "8/MABANA(N)000903", "confidence": 0.97 },
    "date_of_birth": { "value": "1973-03-15", "confidence": 0.99 },
    "licence_class": { "value": "B", "confidence": 0.93 },
    "valid_to": { "value": "2024-11-24", "confidence": 0.98 }
  },
  "flags": ["DOCUMENT_EXPIRED", "MANUAL_REVIEW_REQUIRED"]
}
```

Production demos should use synthetic or explicitly consented records. The repository sample is suitable only for local scan-layout testing.

## Staff hierarchy

`GOD_ADMIN` is break-glass only. `CEO`, `CTO`, and `PSO` are executive titles on the same `EXEC_SUPERADMIN` permission set. Operational KYC and registration duties are separated. A marketer may create a driver lead; only a separately granted `STAFF_REGISTRAR` scope can send limited staff invitations, and it can never grant privileged roles.

See [the Figma prototype plan](/design/figma-prototype-plan) for the complete role matrix and interaction design.
