# Guardian Safety Shield Wireframes & UX Flow

The **LaBar Guardian Safety Plugin Ecosystem** provides an on-demand, lightweight safety layer (~3.8MB) for passengers, driver families (spouses/parents), and rapid emergency response teams.

---

## Screen 1: Passenger Family Guardian Live Route Shield
<span class="badge-gold">Guardian Screen 01</span> • 60fps real-time route tracking, cross-track deviation meter ($d_{xt} > 300\text{m}$ alarm), and remote emergency siren trigger.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/guardian_01_passenger_shield.svg" alt="Passenger Guardian Shield Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/guardian_01_passenger_shield.svg)
- **UX & Functional Specification**:
  - **Live Status Header**: Confirms ride state (` RIDE IN PROGRESS`), passenger name (*Ma Thiri*), driver details (*U Aung Kyaw, Toyota Fielder 3A-8492*), and active CCTV status.
  - **Real-Time 60fps Route HUD**: Vector polyline rendering current position between Pickup (*Sule*) and Destination (*Junction City*).
  - **Telemetry Floating Pill**: Live calculation of cross-track deviation (*$d_{xt} = 12\text{m}$ - SAFE*), vehicle speed (*38 km/h*), and heading.
  - **DND-Override Emergency Siren**: Remote panic trigger button that sounds a high-decibel alarm on the passenger's phone even if set to silent or Do Not Disturb.
  - **Direct Contacts**: 1-Tap quick dials to Driver and Local Police (199).

---

## Screen 2: Driver Family Guardian Status & Shift Shield
<span class="badge-red">Guardian Screen 02</span> • Real-time telemetry monitoring for driver spouses and parents, shift health, battery/5G status, and remote alarm.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/guardian_02_driver_family_shield.svg" alt="Driver Family Guardian Shield Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/guardian_02_driver_family_shield.svg)
- **UX & Functional Specification**:
  - **Driver Shift Health Card**: Shows driver status (` STATUS: ON-DUTY`), driver name (*Ko Aung Kyaw - Husband*), vehicle plate (*3A-8492*), and phone battery level (*86% with strong 5G signal*).
  - **Live Shift Tracking Map**: Visual marker showing vehicle moving on Pyay Road at 38 km/h with 1-second GPS breadcrumb refresh.
  - **Shift Metrics**: Elapsed shift time (*4 hours 20 mins*) and GPS accuracy (*2.8m*).
  - **Remote Emergency Alarm**: 1-Tap trigger **"အရေးပေါ် အချက်ပြသံ မြည်စေမည် (SOS SIREN)"** to alert the driver in critical danger.
  - **Direct Call Action**: Royal Gold button **"ခင်ပွန်းထံ ဖုန်းတိုက်ရိုက်ခေါ်ဆိုမည်"** for instant voice communication.

---

## Screen 3: Family Mesh QR Code Pairing & Token Sync
<span class="badge-gold">Guardian Screen 03</span> • Instant family guardian linking via high-contrast QR code scanner and 6-digit OTP security token.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/guardian_03_pairing_qr_mesh.svg" alt="Family Mesh QR Pairing Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- [View High-Resolution Vector SVG](/wireframes/guardian_03_pairing_qr_mesh.svg)
- **UX & Functional Specification**:
  - **High-Contrast QR Code Card**: Center-shielded QR code for camera scanning.
  - **6-Digit OTP Token Display**: Large formatted security PIN (`8 4 9 2 0 1`) valid for 10 minutes.
  - **3-Step Setup Instructions**:
    1. Install lightweight LaBar Guardian dynamic plugin package (~3.8MB).
    2. Scan QR code or enter code `849201`.
    3. Enjoy 24/7 live GPS telemetry and high-priority safety notifications.
  - **Share Action**: 1-Tap **"မိသားစုထံ ဖိတ်ခေါ်လင့်ခ် ပေးပို့မည် (SHARE LINK)"** to dispatch an instant SMS/Viber/Telegram invitation link.
