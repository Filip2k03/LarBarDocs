# Realtime

Authenticated clients connect to `GET /api/v1/realtime`. The gateway subscribes only to the user's channel and active rides in which they participate. Messages include event ID, type and server timestamp. Redis carries live fan-out; PostgreSQL ride-event sequence is the authoritative reconnect source.

Driver coordinates update Redis GEO and are persisted only for active rides. Clients reconnect with backoff and reload the current ride snapshot after disconnect.
