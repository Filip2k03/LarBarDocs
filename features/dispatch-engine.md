# 15-Second Cascading Dispatch Engine

The dispatch engine matches ride requests with optimal candidate drivers within milliseconds, utilizing a timed cascading waterfall strategy.

---

## Cascading Offer State Diagram

```text
┌──────────────┐     Spatial Match      ┌───────────────────────┐
│ SEARCHING    │───────────────────────►│ OFFER_SENT (Driver 1)  │
└──────────────┘                        └──────────┬────────────┘
       ▲                                           │
       │ Timeout (15s) or Explicit Reject          │ Driver 1 Accepts
       │                                           ▼
┌──────┴───────────────┐                ┌───────────────────────┐
│ OFFER_SENT (Driver 2)│                │ ASSIGNED & EN ROUTE   │
└──────────────────────┘                └───────────────────────┘
```

1. **Redis GEORADIUS Search**:
   - Queries `drivers:available` within a 3.0km radius.
   - Filters drivers by current status (`AVAILABLE`, not on `BREAK` or `ON_DUTY`).
2. **Ranked Candidate Queue**:
   - Scores drivers based on estimated pickup duration (driving time), driver acceptance rating, and customer satisfaction score.
3. **15-Second Offer Window**:
   - High-priority push sent to Driver 1 with audio cue.
   - If Driver 1 rejects or timer reaches 15 seconds, the offer automatically cascades to Driver 2 without cancelling the passenger's search.
