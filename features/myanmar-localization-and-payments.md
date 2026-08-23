# 🇲🇲 Myanmar (Burmese) Localization, E-Wallets & Compliance

LaBar is custom-engineered for Myanmar's urban transport ecosystem, supporting local Burmese Unicode typography, regional e-wallets, driver regulatory KYC verification, and city-specific road restrictions (e.g. Yangon municipal motorbike bans).

---

## 🇲🇲 1. Burmese Language & Unicode Typography

The mobile and web interfaces utilize **Pyidaungsu Unicode / Myanmar3** with automated legacy Zawgyi detection and real-time font rendering.

### Key Burmese UI Localization Strings:

| UI Key | English Text | Burmese Localization (Unicode) | Usage Context |
|---|---|---|---|
| `btn_call_taxi` | Call Taxi Now | **ခရီးစဥ် အခုပဲ ခေါ်ယူမည်** | Primary Royal Gold CTA |
| `label_pickup` | Pickup Location | **စတင်ထွက်ခွာမည့်နေရာ** | Multi-stop booking header |
| `label_destination` | Destination | **သွားရောက်မည့်နေရာ** | Destination field |
| `label_add_waypoint` | Add Extra Stop | **အပိုမှတ်တိုင် ထည့်သွင်းမည်** | Multi-waypoint stop |
| `btn_driver_sos` | Emergency SOS | **ယာဥ်မောင်း အရေးပေါ် အချက်ပြ** | 1km-3km Driver Mesh Alert |
| `label_guardian_shield`| Family Guardian Shield | **မိသားစု အကာအကွယ် စနစ်** | Live Telemetry & Siren HUD |
| `label_protecting_cctv`| CCTV Protecting Active | **လုံခြုံရေး CCTV မှတ်တမ်းတင်နေသည်** | In-Car Video Recording HUD |
| `label_meter_fare` | Total Fare | **ကျသင့်ငွေ စုစုပေါင်း** | Dynamic Fare Meter |
| `btn_transfer_sales` | Payout / Transfer Sales | **ဝင်ငွေငွေထုတ်ယူမည်** | Driver Daily Wallet Payout |

---

## 💳 2. Myanmar Payment Gateways & E-Wallet Deep-Linking

LaBar supports both **Cash Settlement (ငွေသားပေးချေမှု)** and **Cashless Mobile E-Wallets (ဒစ်ဂျစ်တယ် ပိုက်ဆံအိတ်)** via native OS deep-linking and SHA-256 HMAC webhook verification.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             MYANMAR E-WALLET DEEP-LINKING FLOW                                   │
│                                                                                                  │
│  [ Passenger App ] ──► [ Go Payments Hub ] ──► [ E-Wallet Mobile App ] (KBZPay / WavePay)        │
│          │                                                │                                      │
│          │ (Deep-link URI redirect)                       │ (PIN / Biometric Auth)               │
│          ▼                                                ▼                                      │
│  [ Bank App Opens ] ──────────────────────────► [ Bank Gateway Core ]                            │
│                                                           │                                      │
│                                                           ▼ (Server-to-Server HMAC SHA-256)      │
│  [ LaBar Double-Entry Ledger ] ◄────────────── [ Webhook Listener ]                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Supported Payment Channels:

1. **KBZPay (KBZ Bank)**:
   - Deep-link URI: `kbzpay://pay?appId=...&orderInfo=...&sign=...`
   - Real-time P2P instant driver settlement via KBZPay Partner API.
2. **WavePay (Wave Money)**:
   - Deep-link URI: `wavemoney://payment?transactionId=...`
   - Fast driver wallet disbursement across 60,000+ Wave shops in Myanmar.
3. **AYAPay (AYA Bank)** & **CB Pay (CB Bank)**:
   - QR Pay (MMQR Standard) & In-app Web-view checkout.
4. **Cash on Trip Completion**:
   - Driver marks cash collected, system issues digital receipt via SMS/App notification.

---

## 🪪 3. Driver Regulatory Compliance & KYC Standards

Drivers operating on LaBar undergo strict verification meeting the standards of the **Road Transport Administration Department (RTAD / ကညန)** and local municipal taxi authorities:

1. **National Registration Card (NRC / နိုင်ငံသားစိစစ်ရေးကတ်ပြား)**:
   - Structured format: `[State_Code]/[Township_Code](N)[6_Digits]` (e.g. `12/DAGAMA(N)123456`).
   - OCR scanning + Automated facial match with selfie check.
2. **Commercial Driving License (ကခန - ယာဉ်မောင်းလိုင်စင်)**:
   - Professional Grade: 'Ga' (ဃ) or 'Gha' (င) commercial taxi license with valid expiration date.
3. **Vehicle Commercial Registration (ကညန တက္ကစီ မှတ်ပုံတင်)**:
   - Red Plate Commercial Taxi certification (`Ka-Nya-Na` inspection pass & City Wheel Tax sticker).
   - In-car CCTV Protecting Mode hardware pairing.

---

## 🗺️ 4. Yangon City Traffic Rules & Motorbike Restriction Geofencing

- **Yangon Municipal Motorbike Ban**: Motorbikes are strictly prohibited in the 33 municipal townships of Yangon. The routing engine defaults to 4-wheel Standard Sedans and Gold VIP VIP taxis.
- **One-Way Downtown Grid Optimization**: Downtown Yangon (Pabedan, Kyauktada, Latha, Lanmadaw) contains strict one-way avenues (e.g. Anawrahta Rd, Maha Bandula Rd, Merchant Rd, Strand Rd). Our self-hosted OSRM router enforces directional penalties to eliminate illegal U-turns and dead-ends.
- **Expressway Tolls**: Automated toll calculation for intercity trips on the Yangon-Mandalay Expressway (*115 Miles / Phyu* toll plazas).
