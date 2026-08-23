# Security

Production requires TLS, explicit CORS origins and independent secrets of at least 32 characters. OTPs are HMAC-hashed, expiring, single-use, attempt-limited and rate-limited. Refresh tokens are random, hashed, rotated and revocable.

Admin routes use roles; sensitive mutations are audited. SQL is parameterized. Private uploads verify size, MIME and checksum. Database sessions install the encryption key used by `pgcrypto` for sensitive ciphertext.

Do not log tokens, production OTPs, document numbers, complete phone numbers, push tokens, payment secrets or precise location payloads. Restrict `/metrics` at the network edge.
