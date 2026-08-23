# 🚗 Driver Application Wireframes & UX Flow

The **LaBar Driver Application** empowers professional taxi drivers across Myanmar with shift mode management, real-time 15-second cascading offer acceptance, in-trip protecting CCTV recording, **1.0 km ➔ 3.0 km fellow driver emergency assistance radar**, and instant KBZPay/WavePay sales payout.

---

## Screen 1: Driver Shift Mode, Earnings & Safety Dashboard
<span class="badge-red">Driver Screen 01</span> • Online shift status toggle (`ON DUTY`), gross daily earnings in MMK, trip counters, and collapsed Safety Drawer.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/driver_01_shift_dashboard.svg" alt="Driver Shift Dashboard Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- 🖼️ [View High-Resolution Vector SVG](/wireframes/driver_01_shift_dashboard.svg)
- **UX & Functional Specification**:
  - **Shift Switch**: Instant toggle between `ON DUTY` (green active state) and `OFFLINE` / `BREAK TIME`.
  - **Today's Earnings Card**: Shows gross sales (*48,500 MMK*), completed trips (*12 trips*), online hours (*5.4h*), and driver rating (*4.96⭐*).
  - **Quick Action Grid**:
    - 💳 **ငွေထုတ်ယူမည် (Sales Payout)**: Direct transfer to driver's personal KBZPay / WavePay account.
    - 📹 **CCTV Protecting**: Real-time status showing active 1080p camera recording.
  - **Discreet Safety Drawer**: Collapsed in normal operation; one deliberate tap reveals call, location sharing, evidence recording, and two-second-hold silent SOS actions.
  - **Recent Trips Feed**: Shows individual fare receipts and payment channels (Cashless vs Cash).

---

## Screen 2: 15-Second Incoming Ride Offer Modal
<span class="badge-red">Driver Screen 02</span> • Timed dispatch modal showing fare, pickup distance, passenger rating, mini route map, and swipe to accept/decline.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/driver_02_15s_offer_card.svg" alt="Driver 15s Offer Modal Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- 🖼️ [View High-Resolution Vector SVG](/wireframes/driver_02_15s_offer_card.svg)
- **UX & Functional Specification**:
  - **15s Countdown Header**: Animated Gold bar counting down (*11s left*).
  - **Guaranteed Fare Highlight**: Bold MMK fare display (*3,800 MMK*) with payment type tag (*KBZPay Direct*).
  - **Route & Proximity Preview**: Pickup address (*Sule Square, 450m • 2 mins away*) and destination (*Junction City, 5.4 km*).
  - **Passenger Identity**: Passenger name (*Ma Thiri*), rating (*4.95⭐ across 148 trips*).
  - **Large Touch Targets**: 60px height **"လက်ခံမည် (ACCEPT RIDE OFFER)"** button.

---

## Screen 3: In-Trip Turn Navigation & CCTV Protecting HUD
<span class="badge-red">Driver Screen 03</span> • Turn-by-turn driving directions, live dynamic taximeter, CCTV hardware status, and waypoint completion.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/driver_03_intrip_cctv_meter.svg" alt="Driver In-Trip CCTV Meter Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- 🖼️ [View High-Resolution Vector SVG](/wireframes/driver_03_intrip_cctv_meter.svg)
- **UX & Functional Specification**:
  - **CCTV Active Indicator**: Red pulsing `● REC 1080p CCTV PROTECTING MODE ACTIVE` banner.
  - **Navigation HUD**: Displays upcoming maneuvers (*Turn Left on Bogyoke Aung San Rd in 220m*), driving speed (*38 km/h*), and remaining distance.
  - **Live Dynamic Taximeter**: Shows real-time fare accumulation (*3,850 MMK*), elapsed duration (*14m 20s*), and waypoint sequence status (*Waypoint 1 of 2: Bogyoke Visited ✓*).
  - **Primary Arrival CTA**: Full-width **"ရောက်ရှိပါပြီ (ARRIVE AT DESTINATION)"** button.

---

## Screen 4: 1.0 km Emergency SOS Intercept Radar (Fellow Driver View)
<span class="badge-red">Driver Screen 04</span> • Proximity intercept alert notifying fellow drivers when a driver is attacked or in distress.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/driver_04_sos_1km_mesh.svg" alt="Driver 1km SOS Intercept Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- 🖼️ [View High-Resolution Vector SVG](/wireframes/driver_04_sos_1km_mesh.svg)
- **UX & Functional Specification**:
  - **Code Red Alert Banner**: Flashing emergency header with distance to victim (*240m away, triggered 20s ago*).
  - **Radar Intercept Vector**: Visual vector connecting the responder's car directly to the victim driver's vehicle.
  - **Distress Context**: Driver name (*U Kyaw Swar*), vehicle model (*White Toyota Probox 4B-9102*), location (*Corner of Anawrahta & Sule Pagoda Rd*), and trigger reason (*Physical Passenger Attack Alert*).
  - **1-Tap Intercept Button**: High-priority Crimson action **"ကူညီရန် သွားမည် (I AM RESPONDING / EN ROUTE)"** which transmits ETA to the victim and ERT security team.

---

## Screen 5: Daily Settlement & Sales Payout
<span class="badge-red">Driver Screen 05</span> • Net wallet balance after 15% platform commission, e-wallet channel selector, and instant fund withdrawal.

<div style="display: flex; justify-content: center; margin: 28px 0;">
  <img src="/wireframes/driver_05_daily_sales_payout.svg" alt="Driver Daily Sales Payout Screen" style="max-width: 380px; border-radius: 28px; box-shadow: 0 16px 40px rgba(0,0,0,0.7); border: 2px solid #282836;" />
</div>

- 🖼️ [View High-Resolution Vector SVG](/wireframes/driver_05_daily_sales_payout.svg)
- **UX & Functional Specification**:
  - **Net Available Balance**: Bold display of net withdrawable funds (*41,225 MMK*) after platform commission deduction (*-7,275 MMK on 48,500 MMK gross*).
  - **Payout Channel Selection**: 1-Tap toggle between **KBZPay Partner Direct** (linked phone: `09123456789`) and **WavePay Instant Transfer**.
  - **Daily Breakdown Summary**: Transparent comparison of Cash collected in-hand (*18,500 MMK*) vs digital e-wallet sales (*30,000 MMK*).
  - **Instant Payout Trigger**: Royal Gold button **"ငွေထုတ်ယူမှု အတည်ပြုမည် (TRANSFER NOW)"** with sub-30-second automated bank transfer.
