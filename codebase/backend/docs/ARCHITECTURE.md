# Architecture

LaBar is a modular monolith with a single REST and WebSocket edge. PostgreSQL is authoritative for identities, quotes, rides, events, offers, payments, ledgers, documents, content and audit. Redis data is rebuildable and contains active driver GEO entries, presence, rate limits, OTP controls and realtime fan-out. Object metadata becomes trusted only after size and SHA-256 verification.

```text
Mobile apps / Astro / Admin
            |
       REST + WebSocket
            |
      Go API processes
       |      |      |
 PostgreSQL Redis  Object storage
       |      |
   durable jobs / pub-sub
            |
        Go workers
       |          |
      FCM        APNs
```

Ride and application state changes are explicit. Offer acceptance uses serializable transactions and row locks. Durable jobs use `FOR UPDATE SKIP LOCKED`. External providers remain behind interfaces so deployment is not tied to one cloud.
