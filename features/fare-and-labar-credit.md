# Fare, Cash Rounding, and LaBar Credit

The fare engine uses one versioned policy for estimates, booking snapshots, payment, and final receipts. All money is integer MMK.

## Active policy

Policy ID: `MM-2026-08-v1`.

1. The minimum transport fare is 5,000 MMK and includes travel up to 2.0 km.
2. LaBar adds one 1,500 MMK service fee to every route.
3. The minimum subtotal is therefore 6,500 MMK.
4. After 2.0 km, every started 0.1 km costs 150 MMK, equivalent to 1,500 MMK per kilometre.
5. Digital payments use the exact subtotal.
6. Cash payments round upward to the next 500 MMK after discounts and the service fee.
7. One LaBar promo credit equals 10 MMK.
8. Promo credits discount transport fare and cannot remove the service fee.

## Formula

```text
extra_steps = ceil(max(distance_km - 2.0, 0) / 0.1)
transport = 5,000 + extra_steps * 150
promo_discount = min(transport, credits * 10)
subtotal = transport - promo_discount + 1,500
digital_payable = subtotal
cash_payable = ceil(subtotal / 500) * 500
```

## Examples

| Distance | Method | Credits | Transport | Service | Discount | Rounding | Payable |
|---:|---|---:|---:|---:|---:|---:|---:|
| 0.1 km | Digital | 0 | 5,000 | 1,500 | 0 | 0 | 6,500 |
| 1.0 km | Digital | 0 | 5,000 | 1,500 | 0 | 0 | 6,500 |
| 2.0 km | Cash | 0 | 5,000 | 1,500 | 0 | 0 | 6,500 |
| 2.1 km | Digital | 0 | 5,150 | 1,500 | 0 | 0 | 6,650 |
| 2.1 km | Cash | 0 | 5,150 | 1,500 | 0 | 350 | 7,000 |
| 2.4 km | Cash | 0 | 5,600 | 1,500 | 0 | 400 | 7,500 |
| 2.9 km | Cash | 0 | 6,350 | 1,500 | 0 | 150 | 8,000 |
| 2.1 km | Digital | 100 | 5,150 | 1,500 | 1,000 | 0 | 5,650 |

The Passenger Route & Fees page shows transport and service separately. The Payment page adds promo credit and cash rounding. Trip Complete repeats the final server receipt with policy version, quote ID, payment state, and any adjustment.

## API

- `GET /api/v1/fares/policy`
- `POST /api/v1/fares/quote`
- Compatibility alias: `POST /api/v1/rides/quote`

The Go implementation and tests are in `codebase/backend/internal/usecase/fare_calculator.go`. The frontend reference implementation is in `codebase/frontend/apps/passenger/src/fare.ts`.
