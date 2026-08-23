# Interactive UI/UX Mobile Prototype Showcase

Experience the complete **LaBar Taxi & Safety Ecosystem** directly inside the interactive viewer. The v2 prototype adds DriverReg and the Admin Control Center to the Passenger, Driver, and Guardian applications.

- [Launch all interactive prototypes](/prototypes/index.html)
- [Launch Passenger v2 with twenty-one pages and live fare calculation](/prototypes/passenger-v2.html)
- [Launch DriverReg KYC](/prototypes/driverreg-app.html)
- [Launch Admin Control Center](/prototypes/admin-control-center.html)
- [Read the Figma build and interaction plan](/design/figma-prototype-plan)

The embedded vector viewer below preserves the original Figma-importable ride screens. Passenger v2 is the current interactive product-flow reference.

---

<script setup>
import { ref } from 'vue'

const activeApp = ref('passenger')
const activeScreen = ref('/wireframes/passenger_01_booking_multistop.svg')

const screens = {
  passenger: [
    { name: '1. Multi-Stop Booking', path: '/wireframes/passenger_01_booking_multistop.svg', desc: 'Route planner with intermediate waypoints & MMK pricing' },
    { name: '2. 15s Cascading Search', path: '/wireframes/passenger_02_cascading_search.svg', desc: 'Spatial radar searching within 3km with 15s countdown' },
    { name: '3. In-Trip Live Meter', path: '/wireframes/passenger_03_intrip_live_meter.svg', desc: 'Live dynamic taximeter, CCTV active HUD & driver chat' },
    { name: '4. Receipt & 5-Star Rating', path: '/wireframes/passenger_04_payment_rating.svg', desc: 'KBZPay payment breakdown with driver tipping chips' }
  ],
  driver: [
    { name: '1. Shift Dashboard', path: '/wireframes/driver_01_shift_dashboard.svg', desc: 'ON DUTY toggle, daily earnings (48,500 MMK) & SOS panic' },
    { name: '2. 15s Incoming Offer', path: '/wireframes/driver_02_15s_offer_card.svg', desc: 'Incoming offer modal: 3,800 MMK, passenger rating & swipe' },
    { name: '3. In-Trip CCTV Meter', path: '/wireframes/driver_03_intrip_cctv_meter.svg', desc: 'Turn navigation, ● REC 1080p CCTV HUD & arrival button' },
    { name: '4. 1km SOS Intercept Radar', path: '/wireframes/driver_04_sos_1km_mesh.svg', desc: ' Code Red fellow driver emergency intercept vector' },
    { name: '5. Daily Sales Payout', path: '/wireframes/driver_05_daily_sales_payout.svg', desc: 'Net balance (41,225 MMK) & instant KBZPay/Wave transfer' }
  ],
  guardian: [
    { name: '1. Passenger Live Shield', path: '/wireframes/guardian_01_passenger_shield.svg', desc: '60fps live route map with cross-track deviation alarms' },
    { name: '2. Driver Family Shield', path: '/wireframes/guardian_02_driver_family_shield.svg', desc: 'Driver spouse view: 86% battery, 5G status & remote siren' },
    { name: '3. Family Mesh QR Pairing', path: '/wireframes/guardian_03_pairing_qr_mesh.svg', desc: 'High-contrast QR code scanner & 6-digit OTP token' }
  ],
  driverreg: [
    { name: '1. Staff Sign-in', path: '/wireframes/driverreg_01_staff_sign-in.svg', desc: 'Staff identity, branch/device binding, and MFA' },
    { name: '2. Consent & Case', path: '/wireframes/driverreg_02_consent_case.svg', desc: 'Driver consent, privacy notice, and KYC case creation' },
    { name: '3. Personal Details', path: '/wireframes/driverreg_03_personal_details.svg', desc: 'Legal name, DOB-derived age, address, and emergency contact' },
    { name: '4. NRC Capture', path: '/wireframes/driverreg_04_nrc_capture.svg', desc: 'Front/back capture and structured NRC parsing' },
    { name: '5. Licence Scan', path: '/wireframes/driverreg_05_driving_licence_scan.svg', desc: 'Camera mask, document quality, and OCR' },
    { name: '6. OCR Review', path: '/wireframes/driverreg_06_ocr_review.svg', desc: 'Confidence-aware autofill and mismatch review' },
    { name: '7. Face & Liveness', path: '/wireframes/driverreg_07_face_liveness.svg', desc: 'Guided liveness and document portrait comparison' },
    { name: '8. Vehicle', path: '/wireframes/driverreg_08_vehicle_compliance.svg', desc: 'Plate, type, VIN, insurance, RTAD, and wheel tax' },
    { name: '9. Submit', path: '/wireframes/driverreg_09_review_submit.svg', desc: 'Completeness, attestation, consent receipt, and submit' },
    { name: '10. Status', path: '/wireframes/driverreg_10_case_status.svg', desc: 'Review, correction, approval, and activation handoff' }
  ]
}

function selectApp(app) {
  activeApp.value = app
  activeScreen.value = screens[app][0].path
}
</script>

<!-- App Switcher Navigation Bar -->
<div style="display: flex; gap: 12px; margin: 24px 0; justify-content: center; flex-wrap: wrap;">
  <button
    @click="selectApp('passenger')"
    :style="{
      background: activeApp === 'passenger' ? 'linear-gradient(135deg, #FFD54F, #F59E0B)' : '#181922',
      color: activeApp === 'passenger' ? '#181922' : '#FFFFFF',
      fontWeight: '800',
      border: '1px solid #282836',
      borderRadius: '12px',
      padding: '12px 24px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    }">
     Passenger App (4 Screens)
  </button>

  <button
    @click="selectApp('driver')"
    :style="{
      background: activeApp === 'driver' ? 'linear-gradient(135deg, #F85A5A, #E5252A)' : '#181922',
      color: '#FFFFFF',
      fontWeight: '800',
      border: '1px solid #282836',
      borderRadius: '12px',
      padding: '12px 24px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    }">
     Driver App (5 Screens)
  </button>

  <button
    @click="selectApp('guardian')"
    :style="{
      background: activeApp === 'guardian' ? 'linear-gradient(135deg, #34D399, #10B981)' : '#181922',
      color: activeApp === 'guardian' ? '#181922' : '#FFFFFF',
      fontWeight: '800',
      border: '1px solid #282836',
      borderRadius: '12px',
      padding: '12px 24px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    }">
     Guardian Safety (3 Screens)
  </button>

  <button
    @click="selectApp('driverreg')"
    :style="{
      background: activeApp === 'driverreg' ? 'linear-gradient(135deg, #60A5FA, #2563EB)' : '#181922',
      color: '#FFFFFF', fontWeight: '800', border: '1px solid #282836', borderRadius: '12px',
      padding: '12px 24px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease'
    }">
     DriverReg (10 Screens)
  </button>
</div>

<!-- Screen Selector Chips -->
<div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px;">
  <button
    v-for="scr in screens[activeApp]"
    :key="scr.path"
    @click="activeScreen = scr.path"
    :style="{
      background: activeScreen === scr.path ? '#242533' : '#101116',
      color: activeScreen === scr.path ? '#F59E0B' : '#9CA3AF',
      border: activeScreen === scr.path ? '1px solid #F59E0B' : '1px solid #282836',
      borderRadius: '20px',
      padding: '6px 16px',
      fontSize: '12px',
      fontWeight: activeScreen === scr.path ? '700' : '500',
      cursor: 'pointer'
    }">
    {{ scr.name }}
  </button>
</div>

<!-- Interactive Phone Viewport -->
<div style="display: flex; justify-content: center; align-items: center; margin: 32px 0;">
  <div style="max-width: 400px; width: 100%; text-align: center;">
    <img
      :src="activeScreen"
      alt="Interactive Prototype Preview"
      style="width: 100%; border-radius: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 2px solid #282836;"
    />

    <div style="margin-top: 16px;">
      <a :href="activeScreen" target="_blank" class="btn-gold-action" style="display: inline-block; padding: 10px 20px; font-size: 13px;">
         Open Fullscreen Vector SVG
      </a>
    </div>
  </div>
</div>

---

## Design System & Token Integration
- **Figma Tokens Studio JSON**: [`design-system/figma_tokens.json`](file:///Users/stephanfilip/Yamato_project/Labar/design-system/figma_tokens.json)
- **Legacy Master Canvas**: [`labar_master_figma_canvas.svg`](/wireframes/labar_master_figma_canvas.svg)
- **DriverReg + Admin v2 Canvas**: [`labar_master_figma_canvas_v2.svg`](/wireframes/labar_master_figma_canvas_v2.svg)
- [**Red & Gold 100-900 Color Palette Specifications**](/design/design-system)
