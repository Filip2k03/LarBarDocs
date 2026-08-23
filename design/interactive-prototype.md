# 📱 Interactive UI/UX Mobile Prototype Showcase

Experience the complete **LaBar Taxi & Safety Ecosystem** directly inside the interactive mobile viewer below. Click on any screen tab to preview the high-fidelity UI states across Passenger, Driver, and Guardian applications.

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
    { name: '4. 1km SOS Intercept Radar', path: '/wireframes/driver_04_sos_1km_mesh.svg', desc: '🚨 Code Red fellow driver emergency intercept vector' },
    { name: '5. Daily Sales Payout', path: '/wireframes/driver_05_daily_sales_payout.svg', desc: 'Net balance (41,225 MMK) & instant KBZPay/Wave transfer' }
  ],
  guardian: [
    { name: '1. Passenger Live Shield', path: '/wireframes/guardian_01_passenger_shield.svg', desc: '60fps live route map with cross-track deviation alarms' },
    { name: '2. Driver Family Shield', path: '/wireframes/guardian_02_driver_family_shield.svg', desc: 'Driver spouse view: 86% battery, 5G status & remote siren' },
    { name: '3. Family Mesh QR Pairing', path: '/wireframes/guardian_03_pairing_qr_mesh.svg', desc: 'High-contrast QR code scanner & 6-digit OTP token' }
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
    🚖 Passenger App (4 Screens)
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
    🚗 Driver App (5 Screens)
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
    🛡️ Guardian Safety (3 Screens)
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
        🖼️ Open Fullscreen Vector SVG
      </a>
    </div>
  </div>
</div>

---

## 🎨 Design System & Token Integration
- 📂 **Figma Tokens Studio JSON**: [`design-system/figma_tokens.json`](file:///Users/stephanfilip/Yamato_project/Labar/design-system/figma_tokens.json)
- 🌟 **Master 12-Screen Figma Canvas**: [`labar_master_figma_canvas.svg`](/wireframes/labar_master_figma_canvas.svg)
- 📖 [**Red & Gold 100-900 Color Palette Specifications**](/design/design-system)
