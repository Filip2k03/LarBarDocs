# Payments, E-Wallets & Driver Financial Settlement

The financial engine handles dual payment modes: **Cash Settlements** and **Cashless Mobile E-Wallets (KBZPay, AYAPay, WavePay)** with OS deep-linking and SHA-256 HMAC webhook verification.

---

## E-Wallet Deep-Linking Sequence

```text
┌───────────────┐        ┌────────────────┐        ┌──────────────────┐
│ Passenger App │───────►│ Go API Gateway │───────►│ Bank Gateway API │
└───────┬───────┘        └────────────────┘        └─────────┬────────┘
        │                                                    │
        │ 1. Deep-Link URL ('kbzpay://pay?orderId=...')      │
        ▼                                                    │
┌───────────────┐                                            │
│ E-Wallet App  │─── 2. PIN / Biometric Auth ────────────────┤
└───────┬───────┘                                            │
        │                                                    │
        │ 3. Deep-Link Return to Taxi App                    ▼
        ▼                                          ┌──────────────────┐
┌───────────────┐                                  │ Webhook Callback │
│ Ride Complete │◄────── 4. Credit Driver Wallet ──│ (HMAC Signature) │
└───────────────┘                                  └──────────────────┘
```

---

## Driver Wallet & Instant Payouts

1. **Double-Entry Ledger**:
   - Every completed ride creates an immutable ledger entry.
   - Platform commission (e.g. 15%) is split atomically from driver earnings (85%).
2. **On-Demand Sales Transfer**:
   - Drivers can view daily sales summaries and trigger an instant payout transfer to their personal bank account or KBZPay/AYAPay wallet.
