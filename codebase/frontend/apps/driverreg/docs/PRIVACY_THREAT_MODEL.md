# DriverReg Privacy Threat Model

| Threat | Control | Residual verification |
|---|---|---|
| Lost or stolen device | Device-only secure token storage, remote session revocation, no evidence in preferences | Test locked-device and revoked-session behavior |
| Registrar misuse | Separate applicant/actor IDs, least privilege, purpose/audit logging, separation of duties | Backend assisted-case contract still required |
| Signed document URL leakage | Short expiry, no logging/analytics/push persistence, scoped object key | Verify storage policy and server logs |
| Log or crash leakage | Redaction and no request bodies, headers, OCR text, file paths, or screenshots | Review each crash/analytics SDK configuration |
| Screenshot/app switcher leakage | Android `FLAG_SECURE`; iOS inactive-window cover | Test capture and app switcher on physical devices |
| Clipboard or photo backup | No clipboard use; camera output stays in temporary app storage | Confirm provider SDK behavior |
| Token theft/session hijack | Keychain/Keystore, refresh rotation, device sessions, TLS | Add certificate strategy only with safe rotation |
| Upload replay or duplication | Upload identity, expiry, SHA-256, owner/document validation, completion idempotency | Backend must enforce replay prevention |
| Malicious deep link | Allow-listed scheme, host, screen, and parameters; fixed activation destination | Fuzz route parameters |
| Forged OCR/liveness response | Server-to-provider verification; client display is non-authoritative | Provider endpoints and signed callbacks required |
| Duplicate submission | Disabled pending action, idempotency key, fetch state after ambiguous failure | Backend must persist idempotency result |
| Offline overwrite | Revision/ETag conflict instead of last-write-wins | Backend revision contract required |

Admin verification is independent. Biometrics, OCR confidence, document quality, device risk, and capture failures are evidence or review signals—not final decisions about an applicant.
