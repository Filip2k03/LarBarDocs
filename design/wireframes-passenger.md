# Passenger Application Wireframes & UX Flow

The **LaBar Passenger Application** provides a seamless ride-hailing experience across Myanmar, featuring multi-waypoint route estimation, 15-second cascading dispatch matching, real-time in-trip metering, and automated KBZPay/WavePay digital settlement.

---

## Screen 1: Multi-Stop Ride Booking & Tier Selection
<span class="badge-gold">Passenger Screen 01</span> • Interactive multi-waypoint stop configuration, real-time map preview, vehicle class selection, and payment channel selector.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/passenger_01_booking_multistop.svg" alt="Passenger Multi-Stop Booking Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/passenger_01_booking_multistop.svg)
- **UX & Functional Specification**:
  - **Live Map HUD**: Shows candidate taxis cruising nearby (e.g. *3 minutes away on Sule Pagoda Road*).
  - **Multi-Waypoint Route Planner**:
    - Pickup: `Sule Square, Downtown (စတင်ရာနေရာ)`
    - Intermediate Stop: `Bogyoke Aung San Market (အပိုမှတ်တိုင်)`
    - Destination: `Junction City Mall (သွားရောက်မည့်နေရာ)`
  - **Tiered Vehicle Classes**:
    - **Standard Taxi (4 Seats)**: 2,800 MMK (Toyota Probox / Fielder)
    - **Royal Gold VIP Sedan**: 4,500 MMK (Toyota Crown / Alphard with AC & Leather Seats)
  - **Payment Selector**: Toggle between KBZPay Direct, WavePay, or Cash.
  - **Primary CTA**: Royal Gold Gradient button (`#F59E0B`) with subtle hover elevation (`translateY(-2px)`).

---

## Screen 2: 15-Second Cascading Dispatch Radar
<span class="badge-gold">Passenger Screen 02</span> • Real-time concentric radar spatial search, ranked candidate assignment, and 15-second cascading timeout countdown.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/passenger_02_cascading_search.svg" alt="Passenger Cascading Search Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/passenger_02_cascading_search.svg)
- **UX & Functional Specification**:
  - **Spatial Search Area**: Concentric animated radar searching within a 3.0 km radius via Redis 7 `GEORADIUS`.
  - **15s Cascading HUD**: Displays current assigned driver (*U Aung Kyaw, 240m away*) with real-time countdown timer (*9s left*).
  - **Failover Logic**: If the first candidate declines or times out (15s), the radar instantly cascades to Candidate #2 without user interaction.
  - **Emergency Action**: 1-Tap "မခေါ်ယူတော့ပါ (CANCEL SEARCH)" button with zero cancellation fee during search state.

---

## Screen 3: In-Trip Live Navigation & Fare Meter
<span class="badge-gold">Passenger Screen 03</span> • Real-time 60fps polyline progress, dynamic taximeter HUD, driver KYC identity card, and floating SOS trigger.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/passenger_03_intrip_live_meter.svg" alt="Passenger In-Trip Navigation Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/passenger_03_intrip_live_meter.svg)
- **UX & Functional Specification**:
  - **Live Polyline Navigation**: Displays turn directions (*Turn Right on Bogyoke Aung San Rd in 180m*), current speed (*42 km/h*), and estimated remaining time (*8 mins*).
  - **Dynamic Fare Meter HUD**: Real-time calculated fare based on distance (4.2 km) and duration (11m 40s) in Myanmar Kyat (2,350 MMK).
  - **Driver Profile Card**: Shows driver photo, name (*U Aung Kyaw*), verified rating (*4.96 across 1,420 trips*), vehicle plate (*Toyota Fielder 3A-8492*), and direct in-app chat/call pills.
  - **CCTV Protecting Mode Badge**: High-visibility green badge confirming continuous in-car 1080p video recording.
  - **Emergency SOS Shield**: Full-width Imperial Crimson button to trigger instant panic alarms to family guardians and police.

---

## Screen 4: Receipt, Payment & 5-Star Rating
<span class="badge-gold">Passenger Screen 04</span> • Post-trip fare settlement breakdown, auto-deduction confirmation, driver 5-star rating, and tipping quick chips.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/passenger_04_payment_rating.svg" alt="Passenger Payment and Rating Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/passenger_04_payment_rating.svg)
- **UX & Functional Specification**:
  - **Trip Success Header**: Green checkmark with total trip cost (2,800 MMK) and transaction reference (`#TX-98421`).
  - **E-Wallet Auto-Settle**: Confirms settlement via KBZPay Direct / WavePay.
  - **Interactive 5-Star Driver Review**: Tap-to-rate driver service quality.
  - **Driver Tipping Quick Chips**: 1-Tap additions: **+500 MMK**, **+1,000 MMK**, or **+2,000 MMK** directly credited to driver wallet with zero platform deduction.
