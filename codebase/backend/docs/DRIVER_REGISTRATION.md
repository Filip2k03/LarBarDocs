# Driver Registration

Applicants use shared OTP identity and resume one application. Draft steps cover personal, identity, driving licence, vehicle, photos, documents and agreement. Files upload directly through short-lived presigned URLs; completion verifies object metadata and SHA-256.

Submission requires completed steps and documents. Admin decisions require reviewer, reason, timestamp and audit. Approval creates the driver and role atomically. A registrar cannot approve their own application.

OCR and liveness require real integrations before automated verification is enabled. This backend stores evidence and review state but does not claim an unconfigured provider verified a driver.
