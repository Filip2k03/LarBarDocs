# Notifications

Domain operations insert durable jobs or notifications. A database trigger expands notifications into device-specific delivery rows. The worker claims work with `SKIP LOCKED`, sends through FCM or APNs and records sent, retry or failed state outside HTTP requests.

Payload categories cover ride requests and state, payment, safety, promotion, support and registration. Payload data contains identifiers and state, not identity documents or sensitive profile fields.
