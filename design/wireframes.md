# 📱 Master Mobile Wireframes & Figma UI/UX Prototypes

The **LaBar Taxi & Safety Ecosystem** UI/UX is designed with an **Imperial Crimson Red** (`#E5252A`) and **Royal Gold** (`#F59E0B`) color system tailored for high readability, 1-tap rapid actions, and high-stress emergency response.

---

## 🎨 Master Figma & Sketch Canvas Asset

You can import the legacy ride screens plus the DriverReg and Admin v2 frames directly into **Figma**, **Sketch**, or **Penpot**:

- 🌟 **Download Legacy 13-Screen Figma Canvas**: [`labar_master_figma_canvas.svg`](/wireframes/labar_master_figma_canvas.svg)
- 🌟 **Download v2 DriverReg + Admin Canvas**: [`labar_master_figma_canvas_v2.svg`](/wireframes/labar_master_figma_canvas_v2.svg)
- 📂 **Figma Tokens Studio JSON**: [`design-system/figma_tokens.json`](file:///Users/stephanfilip/Yamato_project/Labar/design-system/figma_tokens.json)
- 📐 **Device Frame Standard**: Native **iPhone 15 Pro / Android Viewport (`390 x 844 px`)**

---

## 🌟 Application Wireframe Breakdown

Explore the deep-dive UX flows and vector screens for each application:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin: 24px 0;">

  <div style="background: #181922; border: 1px solid #282836; border-radius: 16px; padding: 20px;">
    <h3 style="color: #F59E0B; margin-top: 0;">🚖 Passenger App</h3>
    <p style="color: #9CA3AF; font-size: 13px;">4 Production Screens: Multi-stop booking, 15s cascading radar, in-trip dynamic meter, and KBZPay MMQR payment with tipping.</p>
    <a href="/design/wireframes-passenger" class="btn-gold-action" style="display: inline-block; padding: 8px 16px; font-size: 12px;">View Passenger Wireframes ❯</a>
  </div>

  <div style="background: #181922; border: 1px solid #282836; border-radius: 16px; padding: 20px;">
    <h3 style="color: #60A5FA; margin-top: 0;">🪪 DriverReg App</h3>
    <p style="color: #9CA3AF; font-size: 13px;">10 staff-assisted KYC screens covering consent, NRC/licence camera OCR, face/liveness, vehicle compliance, review, and activation.</p>
    <a href="/design/wireframes-driverreg" class="btn-gold-action" style="display: inline-block; padding: 8px 16px; font-size: 12px;">View DriverReg Wireframes ❯</a>
  </div>

  <div style="background: #181922; border: 1px solid #282836; border-radius: 16px; padding: 20px;">
    <h3 style="color: #A78BFA; margin-top: 0;">🖥️ Admin Control Center</h3>
    <p style="color: #9CA3AF; font-size: 13px;">5 desktop frames for the KYC queue, case comparison, staff accounts, role controls, and audit log.</p>
    <a href="/design/wireframes-admin" class="btn-gold-action" style="display: inline-block; padding: 8px 16px; font-size: 12px;">View Admin Wireframes ❯</a>
  </div>

  <div style="background: #181922; border: 1px solid #282836; border-radius: 16px; padding: 20px;">
    <h3 style="color: #E5252A; margin-top: 0;">🚗 Driver App</h3>
    <p style="color: #9CA3AF; font-size: 13px;">5 Production Screens: Shift dashboard, 15s incoming offer, in-trip CCTV HUD, 1km SOS mesh intercept radar, and daily settlement payout.</p>
    <a href="/design/wireframes-driver" class="btn-red-action" style="display: inline-block; padding: 8px 16px; font-size: 12px;">View Driver Wireframes ❯</a>
  </div>

  <div style="background: #181922; border: 1px solid #282836; border-radius: 16px; padding: 20px;">
    <h3 style="color: #10B981; margin-top: 0;">🛡️ Guardian Safety App</h3>
    <p style="color: #9CA3AF; font-size: 13px;">3 Production Screens: Passenger 60fps live route HUD with $d_{xt} > 300\text{m}$ alarms, driver family shield with battery/5G, and QR mesh pairing.</p>
    <a href="/design/wireframes-guardian" class="btn-gold-action" style="display: inline-block; padding: 8px 16px; font-size: 12px;">View Guardian Wireframes ❯</a>
  </div>

</div>

---

## 🖼️ Full 12-Screen Visual Gallery

### 1. Passenger App Suite
| # | Screen Name | High-Resolution Vector Mockup | Key Features |
|---|---|---|---|
| **01** | **Multi-Stop Booking & Tier Selector** | [Open SVG](/wireframes/passenger_01_booking_multistop.svg) | Top map HUD, multi-waypoint stop list (*Bogyoke Market*), Standard (2,800 MMK) vs Gold VIP (4,500 MMK), KBZPay chip. |
| **02** | **15s Cascading Search Radar** | [Open SVG](/wireframes/passenger_02_cascading_search.svg) | Concentric spatial radar (3.0km), 15s countdown ring HUD, candidate driver markers. |
| **03** | **In-Trip Live Navigation & Meter** | [Open SVG](/wireframes/passenger_03_intrip_live_meter.svg) | Live route polyline, dynamic taximeter (2,350 MMK), driver U Aung Kyaw rating (4.96⭐), CCTV recording badge. |
| **04** | **Receipt, Payment & 5-Star Rating** | [Open SVG](/wireframes/passenger_04_payment_rating.svg) | Trip completion summary (2,800 MMK), KBZPay auto-settle, 5-star rating, driver tipping chips (+500 / +1,000 / +2,000 MMK). |

### 2. Driver App Suite
| # | Screen Name | High-Resolution Vector Mockup | Key Features |
|---|---|---|---|
| **05** | **Shift Mode & Today's Earnings** | [Open SVG](/wireframes/driver_01_shift_dashboard.svg) | Green `ON DUTY` shift switch, today's gross earnings (48,500 MMK / 12 trips), CCTV indicator, and collapsed **Safety Drawer**. |
| **06** | **15s Incoming Offer Modal** | [Open SVG](/wireframes/driver_02_15s_offer_card.svg) | 15s countdown header (11s left), fare highlight (3,800 MMK), mini route map, passenger Ma Thiri (4.95⭐), Accept/Decline. |
| **07** | **In-Trip Meter & CCTV HUD** | [Open SVG](/wireframes/driver_03_intrip_cctv_meter.svg) | Turn-by-turn navigation banner, `● REC 1080p CCTV` indicator, dynamic fare HUD (3,850 MMK), passenger call/chat pills. |
| **08** | **1km Emergency SOS Intercept Radar** | [Open SVG](/wireframes/driver_04_sos_1km_mesh.svg) | 🚨 Code Red banner, proximity intercept line (*240m away*), victim details (Plate `4B-9102`), **"ကူညီရန် သွားမည် (I AM RESPONDING)"** button. |
| **09** | **Daily Settlement & Payout** | [Open SVG](/wireframes/driver_05_daily_sales_payout.svg) | Net available balance (41,225 MMK), KBZPay vs WavePay channel selector, gross vs commission breakdown, instant transfer action. |

### 3. Guardian Safety Suite
| # | Screen Name | High-Resolution Vector Mockup | Key Features |
|---|---|---|---|
| **10** | **Passenger Live Route Shield** | [Open SVG](/wireframes/guardian_01_passenger_shield.svg) | Live 60fps route map, cross-track deviation HUD ($d_{xt} = 12\text{m}$ SAFE), remote emergency siren trigger with DND override. |
| **11** | **Driver Family Status Shield** | [Open SVG](/wireframes/guardian_02_driver_family_shield.svg) | Driver spouse/parent view: Phone battery (86%), 5G signal, real-time Pyay Road GPS speed (38 km/h), direct call button. |
| **12** | **Family Mesh QR Pairing** | [Open SVG](/wireframes/guardian_03_pairing_qr_mesh.svg) | High-contrast QR code scanner, 6-digit OTP token (`849201`), 1-tap invite link share for instant family sync. |
