# 📱 Mobile Screen Wireframes & Figma Mockups

The LarBar platform UI/UX is designed with a high-contrast **Imperial Crimson Red** (`#E5252A`) and **Royal Gold** (`#F59E0B`) color system tailored for readability, rapid 1-tap actions, and high-stress emergency response.

---

## 🎨 Figma Tokens & Assets
- 📂 **Figma Tokens Studio JSON**: [`design-system/figma_tokens.json`](file:///Users/stephanfilip/Yamato_project/Labar/design-system/figma_tokens.json)
- 📐 **Vector Dimensions**: Native iPhone 15 Pro / Android viewport standard: **`390 x 844 px`**.

---

## 1. 🚖 Passenger Application Wireframes

### Screen 1.1: Multi-Stop Ride Booking & Tier Selection
<span class="badge-gold">Passenger App</span> • Multi-waypoint route planning with live taxi ETA and MMK pricing.

<div style="display: flex; justify-content: center; margin: 24px 0;">
  <img src="/wireframes/passenger_01_booking_multistop.svg" alt="Passenger Multi-Stop Booking" style="max-width: 360px; border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />
</div>

- 🖼️ [Open Fullscreen Vector SVG](/wireframes/passenger_01_booking_multistop.svg)
- **Key UX Elements**:
  - Top Live Map HUD showing real-time 3-minute driver positions.
  - Multi-waypoint draggable stop list with intermediate stops (e.g. *Bogyoke Market*).
  - Vehicle Tier Cards: **Standard Taxi (2,800 MMK)** vs **Royal Gold VIP Sedan (4,500 MMK)**.
  - Payment Selector: KBZPay / WavePay / Cash toggle.
  - Primary Royal Gold CTA Button (`#F59E0B`).

---

### Screen 1.2: 15-Second Cascading Dispatch Radar
<span class="badge-gold">Passenger App</span> • Spatial search with 15-second driver cascading timer.

<div style="display: flex; justify-content: center; margin: 24px 0;">
  <img src="/wireframes/passenger_02_cascading_search.svg" alt="Passenger Cascading Search" style="max-width: 360px; border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />
</div>

- 🖼️ [Open Fullscreen Vector SVG](/wireframes/passenger_02_cascading_search.svg)
- **Key UX Elements**:
  - Concentric radar pulse showing candidate drivers in 3.0 km radius.
  - 15s Countdown Ring HUD showing current offer assignment.
  - 1-Tap Cancel Search Action.

---

## 2. 🚗 Driver Application Wireframes

### Screen 2.1: Driver Shift Mode, Earnings & SOS Dashboard
<span class="badge-red">Driver App</span> • Instant online/offline toggle, daily earnings in MMK, and SOS panic button.

<div style="display: flex; justify-content: center; margin: 24px 0;">
  <img src="/wireframes/driver_01_shift_dashboard.svg" alt="Driver Shift Dashboard" style="max-width: 360px; border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />
</div>

- 🖼️ [Open Fullscreen Vector SVG](/wireframes/driver_01_shift_dashboard.svg)
- **Key UX Elements**:
  - Green Active Shift Switch (`ON DUTY`).
  - Daily MMK Earnings HUD (e.g. *48,500 MMK across 12 trips*).
  - Quick action buttons for KBZPay Sales Payout and CCTV Protecting Mode status.
  - **Imperial Crimson Emergency SOS Panic Button** (`#E5252A`).

---

### Screen 2.2: Fellow Driver 1.0 km SOS Mesh Intercept Alert
<span class="badge-red">Driver App</span> • Code Red distress alert with proximity intercept radar.

<div style="display: flex; justify-content: center; margin: 24px 0;">
  <img src="/wireframes/driver_02_sos_1km_mesh.svg" alt="Driver 1km SOS Mesh Alert" style="max-width: 360px; border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />
</div>

- 🖼️ [Open Fullscreen Vector SVG](/wireframes/driver_02_sos_1km_mesh.svg)
- **Key UX Elements**:
  - Pulsing Code Red Header with distance (*240m away*).
  - Radar Intercept vector connecting your vehicle to the victim driver.
  - Vehicle Details: Plate (`4B-9102`), Driver name (`U Kyaw Swar`), and trigger type.
  - Primary Red Action: **"ကူညီရန် သွားမည် (I AM RESPONDING / EN ROUTE)"**.

---

## 3. 🛡️ Guardian Plugin Shield Wireframes

### Screen 3.1: Passenger Family Guardian Live Route HUD
<span class="badge-gold">Guardian Plugin</span> • Real-time 60fps telemetry and cross-track deviation monitor.

<div style="display: flex; justify-content: center; margin: 24px 0;">
  <img src="/wireframes/guardian_01_passenger_shield.svg" alt="Passenger Guardian Shield" style="max-width: 360px; border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />
</div>

- 🖼️ [Open Fullscreen Vector SVG](/wireframes/guardian_01_passenger_shield.svg)
- **Key UX Elements**:
  - Status banner with passenger name, vehicle model, and CCTV active badge.
  - Live vector route map with real-time vehicle movement.
  - Floating Telemetry HUD: Cross-track deviation ($d_{xt} = 12\text{m}$ SAFE) and speed.
  - Remote Emergency SOS Siren Trigger with DND override.

---

### Screen 3.2: Driver Family Guardian Status & Shift Shield
<span class="badge-red">Guardian Plugin</span> • Real-time telemetry for driver spouses/parents.

<div style="display: flex; justify-content: center; margin: 24px 0;">
  <img src="/wireframes/guardian_02_driver_family_shield.svg" alt="Driver Family Guardian Shield" style="max-width: 360px; border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.6);" />
</div>

- 🖼️ [Open Fullscreen Vector SVG](/wireframes/guardian_02_driver_family_shield.svg)
- **Key UX Elements**:
  - Shift health metrics: Phone battery (86%), 5G cellular signal, and shift duration (*4h 20m*).
  - Real-time GPS location on Pyay Road at 38 km/h.
  - Direct 1-tap call to driver and remote SOS alarm trigger.
