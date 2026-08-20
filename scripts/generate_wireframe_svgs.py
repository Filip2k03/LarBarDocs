import os

OUTPUT_DIR = "/Users/stephanfilip/Yamato_project/Labar/public/wireframes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def screen_frame(content, title, status_bar="9:41", battery="100%"):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844" style="background:#0E0F14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Pyidaungsu', sans-serif;">
  <defs>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD54F"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F85A5A"/>
      <stop offset="100%" stop-color="#E5252A"/>
    </linearGradient>
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Device Outer Border & Island -->
  <rect x="1" y="1" width="388" height="842" rx="44" fill="#0E0F14" stroke="#282836" stroke-width="2"/>
  <rect x="130" y="12" width="130" height="30" rx="15" fill="#000000"/>
  <circle cx="236" cy="27" r="5" fill="#181922"/>

  <!-- Status Bar -->
  <text x="36" y="32" fill="#FFFFFF" font-size="14" font-weight="600">{status_bar}</text>
  <text x="354" y="32" fill="#FFFFFF" font-size="12" font-weight="600" text-anchor="end">5G 🔋 {battery}</text>

  <!-- App Header -->
  <rect x="0" y="52" width="390" height="50" fill="#181922" fill-opacity="0.8"/>
  <text x="24" y="83" fill="#F59E0B" font-size="18" font-weight="800">LarBar</text>
  <text x="195" y="83" fill="#FFFFFF" font-size="15" font-weight="700" text-anchor="middle">{title}</text>
  <circle cx="360" cy="77" r="14" fill="#282836"/>
  <text x="360" y="82" fill="#FFFFFF" font-size="12" text-anchor="middle">🔔</text>

  <!-- Body Content -->
  {content}

  <!-- Home Indicator -->
  <rect x="125" y="828" width="140" height="5" rx="2.5" fill="#484856"/>
</svg>"""

# =============================================================================
# 1. PASSENGER APP SCREENS
# =============================================================================

def gen_passenger_booking():
    content = """
    <!-- Live Map Preview Area -->
    <rect x="16" y="112" width="358" height="240" rx="20" fill="#181922" stroke="#282836"/>
    <!-- Mock Map Grid Lines -->
    <path d="M 30 200 Q 150 160 350 220" stroke="#282836" stroke-width="6" fill="none"/>
    <path d="M 120 120 L 120 340" stroke="#282836" stroke-width="4" fill="none"/>
    <path d="M 260 120 L 260 340" stroke="#282836" stroke-width="4" fill="none"/>

    <!-- Map Route Polyline (Gold) -->
    <path d="M 80 280 L 180 210 L 300 170" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" fill="none"/>

    <!-- Pickup & Dest Pins -->
    <circle cx="80" cy="280" r="8" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
    <text x="95" y="284" fill="#FFFFFF" font-size="11" font-weight="600">Sule Square</text>

    <circle cx="180" cy="210" r="6" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5"/>
    <text x="195" y="214" fill="#FFE082" font-size="10">Stop 1: Bogyoke</text>

    <circle cx="300" cy="170" r="8" fill="#E5252A" stroke="#FFFFFF" stroke-width="2"/>
    <text x="300" y="155" fill="#FFFFFF" font-size="11" font-weight="600" text-anchor="middle">Junction City</text>

    <!-- Moving Taxi Icon -->
    <rect x="130" y="228" width="28" height="16" rx="4" fill="#F59E0B"/>
    <text x="144" y="240" fill="#181922" font-size="9" font-weight="800" text-anchor="middle">🚖 3m</text>

    <!-- Multi-Stop Input Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="364" width="358" height="170" rx="16" fill="#181922" stroke="#282836"/>
      <circle cx="40" cy="396" r="6" fill="#10B981"/>
      <text x="58" y="400" fill="#FFFFFF" font-size="13" font-weight="600">Sule Square, Downtown</text>

      <line x1="40" y1="406" x2="40" y2="430" stroke="#484856" stroke-width="2" stroke-dasharray="2 2"/>
      
      <circle cx="40" cy="438" r="5" fill="#F59E0B"/>
      <text x="58" y="442" fill="#FFE082" font-size="12">Waypoint: Bogyoke Aung San Market</text>
      <text x="350" y="442" fill="#F85A5A" font-size="12" text-anchor="end">✕</text>

      <line x1="40" y1="448" x2="40" y2="472" stroke="#484856" stroke-width="2" stroke-dasharray="2 2"/>

      <circle cx="40" cy="480" r="6" fill="#E5252A"/>
      <text x="58" y="484" fill="#FFFFFF" font-size="13" font-weight="600">Junction City Mall</text>

      <line x1="30" y1="502" x2="360" y2="502" stroke="#282836" stroke-width="1"/>
      <text x="58" y="522" fill="#F59E0B" font-size="12" font-weight="600">+ အပိုမှတ်တိုင် ထည့်သွင်းမည် (Add Extra Stop)</text>
    </g>

    <!-- Vehicle Selection Options -->
    <rect x="16" y="546" width="358" height="66" rx="14" fill="#242533" stroke="#F59E0B" stroke-width="2"/>
    <text x="36" y="575" fill="#FFFFFF" font-size="14" font-weight="700">🚗 Standard Taxi (4 Seats)</text>
    <text x="36" y="596" fill="#9CA3AF" font-size="11">Toyota Fielder / Probox • 3 mins away</text>
    <text x="354" y="582" fill="#F59E0B" font-size="16" font-weight="800" text-anchor="end">2,800 MMK</text>

    <rect x="16" y="622" width="358" height="62" rx="14" fill="#181922" stroke="#282836"/>
    <text x="36" y="650" fill="#FFFFFF" font-size="14" font-weight="600">👑 Royal Gold VIP Sedan</text>
    <text x="36" y="670" fill="#9CA3AF" font-size="11">Crown / Alphard • Leather &amp; AC • 2 mins</text>
    <text x="354" y="658" fill="#FFFFFF" font-size="15" font-weight="700" text-anchor="end">4,500 MMK</text>

    <!-- Payment & Booking Button -->
    <rect x="16" y="694" width="358" height="42" rx="10" fill="#181922" stroke="#282836"/>
    <text x="36" y="720" fill="#FFFFFF" font-size="12">💳 Payment: <tspan fill="#38BDF8" font-weight="700">KBZPay Direct</tspan></text>
    <text x="354" y="720" fill="#F59E0B" font-size="11" text-anchor="end">Change ❯</text>

    <g filter="url(#card-shadow)">
      <rect x="16" y="746" width="358" height="56" rx="14" fill="url(#gold-grad)"/>
      <text x="195" y="780" fill="#181922" font-size="16" font-weight="800" text-anchor="middle">ခရီးစဥ် ခေါ်ယူမည် (CONFIRM RIDE)</text>
    </g>
    """
    return screen_frame(content, "ခရီးစဥ်မှာယူခြင်း (Ride Booking)")

def gen_passenger_cascading():
    content = """
    <!-- Cascading Dispatch Radar Animation Area -->
    <rect x="16" y="120" width="358" height="400" rx="20" fill="#181922" stroke="#282836"/>
    
    <!-- Radar Concentric Circles -->
    <circle cx="195" cy="290" r="140" fill="none" stroke="#282836" stroke-width="2"/>
    <circle cx="195" cy="290" r="100" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.3"/>
    <circle cx="195" cy="290" r="60" fill="none" stroke="#F59E0B" stroke-width="2" stroke-opacity="0.6"/>
    <circle cx="195" cy="290" r="20" fill="#F59E0B" fill-opacity="0.2"/>
    <circle cx="195" cy="290" r="8" fill="#F59E0B"/>

    <!-- Nearby Candidate Drivers Pings -->
    <circle cx="150" cy="230" r="6" fill="#10B981"/>
    <text x="150" y="220" fill="#10B981" font-size="9" text-anchor="middle">Driver 1 (250m)</text>

    <circle cx="260" cy="260" r="5" fill="#9CA3AF"/>
    <circle cx="170" cy="370" r="5" fill="#9CA3AF"/>

    <!-- 15s Countdown Ring HUD -->
    <rect x="75" y="440" width="240" height="60" rx="12" fill="#0E0F14" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="195" y="465" fill="#F59E0B" font-size="13" font-weight="700" text-anchor="middle">15s Cascading Offer Active</text>
    <text x="195" y="485" fill="#FFFFFF" font-size="11" text-anchor="middle">Offering to nearest driver: U Aung Kyaw (9s left)</text>

    <!-- Status Card -->
    <rect x="16" y="540" width="358" height="150" rx="16" fill="#181922" stroke="#282836"/>
    <text x="36" y="572" fill="#FFFFFF" font-size="15" font-weight="700">ယာဥ်မောင်း ရှာဖွေနေပါသည်...</text>
    <text x="36" y="594" fill="#9CA3AF" font-size="12">Searching within 3.0 km via Redis Spatial Engine</text>

    <line x1="36" y1="610" x2="354" y2="610" stroke="#282836" stroke-width="1"/>
    <text x="36" y="635" fill="#FFFFFF" font-size="12">Pickup: <tspan font-weight="600">Sule Square</tspan></text>
    <text x="36" y="658" fill="#FFFFFF" font-size="12">Est. Fare: <tspan fill="#F59E0B" font-weight="700">2,800 MMK</tspan> (KBZPay)</text>

    <!-- Cancel Button -->
    <rect x="16" y="720" width="358" height="52" rx="14" fill="#242533" stroke="#F85A5A" stroke-width="1.5"/>
    <text x="195" y="752" fill="#F85A5A" font-size="14" font-weight="700" text-anchor="middle">မခေါ်ယူတော့ပါ (CANCEL SEARCH)</text>
    """
    return screen_frame(content, "ရှာဖွေနေသည် (Dispatch Cascading)")

# =============================================================================
# 2. DRIVER APP SCREENS
# =============================================================================

def gen_driver_shift_dashboard():
    content = """
    <!-- Shift Mode Toggle Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="112" width="358" height="96" rx="18" fill="#181922" stroke="#10B981" stroke-width="2"/>
      <circle cx="48" cy="160" r="18" fill="#10B981"/>
      <text x="48" y="166" fill="#181922" font-size="14" font-weight="800" text-anchor="middle">✓</text>

      <text x="80" y="152" fill="#FFFFFF" font-size="16" font-weight="700">အလုပ်ဆင်းနေသည် (ON DUTY)</text>
      <text x="80" y="174" fill="#10B981" font-size="12">Online • Ready to receive ride dispatches</text>

      <rect x="290" y="142" width="64" height="34" rx="17" fill="#10B981"/>
      <circle cx="334" cy="159" r="13" fill="#FFFFFF"/>
    </g>

    <!-- Today Sales & Earnings HUD -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="222" width="358" height="150" rx="18" fill="#181922" stroke="#282836"/>
      <text x="36" y="252" fill="#9CA3AF" font-size="12">ယနေ့ ရရှိငွေ (Today's Earnings)</text>
      <text x="36" y="290" fill="#F59E0B" font-size="30" font-weight="900">48,500 <tspan font-size="16">MMK</tspan></text>

      <line x1="36" y1="310" x2="354" y2="310" stroke="#282836" stroke-width="1"/>

      <text x="36" y="342" fill="#FFFFFF" font-size="12">Completed Trips: <tspan font-weight="700">12</tspan></text>
      <text x="180" y="342" fill="#FFFFFF" font-size="12">Hours Online: <tspan font-weight="700">5.4h</tspan></text>
      <text x="354" y="342" fill="#10B981" font-size="12" font-weight="700" text-anchor="end">⭐ 4.96</text>
    </g>

    <!-- Quick Actions Grid -->
    <rect x="16" y="386" width="172" height="90" rx="14" fill="#181922" stroke="#282836"/>
    <text x="36" y="420" fill="#F59E0B" font-size="20">💳</text>
    <text x="36" y="445" fill="#FFFFFF" font-size="13" font-weight="700">ငွေထုတ်ယူမည်</text>
    <text x="36" y="462" fill="#9CA3AF" font-size="10">KBZPay / Wave Transfer</text>

    <rect x="202" y="386" width="172" height="90" rx="14" fill="#181922" stroke="#282836"/>
    <text x="222" y="420" fill="#10B981" font-size="20">📹</text>
    <text x="222" y="445" fill="#FFFFFF" font-size="13" font-weight="700">CCTV Protecting</text>
    <text x="222" y="462" fill="#10B981" font-size="10">Active • 1080p Stream</text>

    <!-- Driver Emergency SOS Panic Button -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="492" width="358" height="90" rx="18" fill="url(#red-grad)"/>
      <text x="40" y="534" fill="#FFFFFF" font-size="28">🚨</text>
      <text x="80" y="532" fill="#FFFFFF" font-size="16" font-weight="800">အရေးပေါ် အကူအညီတောင်းရန်</text>
      <text x="80" y="555" fill="#FFE8E8" font-size="12">1km - 3km Fellow Driver SOS Broadcast</text>
    </g>

    <!-- Recent Rides History List -->
    <rect x="16" y="598" width="358" height="190" rx="16" fill="#181922" stroke="#282836"/>
    <text x="36" y="628" fill="#FFFFFF" font-size="14" font-weight="700">လတ်တလော ခရီးစဥ်များ (Recent Trips)</text>

    <rect x="28" y="642" width="334" height="60" rx="10" fill="#242533"/>
    <text x="44" y="666" fill="#FFFFFF" font-size="12" font-weight="600">Sule ➔ Junction City</text>
    <text x="44" y="686" fill="#9CA3AF" font-size="10">2:45 PM • Cashless (KBZPay)</text>
    <text x="346" y="675" fill="#10B981" font-size="14" font-weight="700" text-anchor="end">+2,800 MMK</text>

    <rect x="28" y="712" width="334" height="60" rx="10" fill="#242533"/>
    <text x="44" y="736" fill="#FFFFFF" font-size="12" font-weight="600">Hledan ➔ Inya Lake</text>
    <text x="44" y="756" fill="#9CA3AF" font-size="10">1:15 PM • Cash</text>
    <text x="346" y="745" fill="#10B981" font-size="14" font-weight="700" text-anchor="end">+3,500 MMK</text>
    """
    return screen_frame(content, "ယာဥ်မောင်း ပင်မစာမျက်နှာ (Driver Home)")

def gen_driver_sos_mesh():
    content = """
    <!-- Code Red Alert Banner -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="112" width="358" height="110" rx="18" fill="url(#red-grad)"/>
      <text x="195" y="146" fill="#FFFFFF" font-size="18" font-weight="900" text-anchor="middle">🚨 CODE RED: DRIVER IN DISTRESS</text>
      <text x="195" y="172" fill="#FFFFFF" font-size="13" font-weight="600" text-anchor="middle">Fellow Driver Needs Immediate Assistance!</text>
      <text x="195" y="196" fill="#FFE8E8" font-size="11" text-anchor="middle">Location: 240 meters away (30s ago)</text>
    </g>

    <!-- Radar Proximity Intercept Map View -->
    <rect x="16" y="234" width="358" height="280" rx="18" fill="#181922" stroke="#E5252A" stroke-width="2"/>
    <circle cx="195" cy="374" r="90" fill="none" stroke="#E5252A" stroke-width="1.5" stroke-dasharray="4 4"/>
    
    <!-- Your Position -->
    <circle cx="120" cy="420" r="10" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
    <text x="120" y="445" fill="#FFFFFF" font-size="11" font-weight="700" text-anchor="middle">You</text>

    <!-- Intercept Vector -->
    <path d="M 120 420 L 250 320" stroke="#E5252A" stroke-width="3" stroke-dasharray="4 2"/>

    <!-- Victim Position -->
    <circle cx="250" cy="320" r="14" fill="#E5252A" stroke="#FFFFFF" stroke-width="3"/>
    <text x="250" y="325" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">🚨</text>
    <text x="250" y="300" fill="#F85A5A" font-size="12" font-weight="800" text-anchor="middle">U Kyaw Swar (240m)</text>

    <!-- Distress Details Card -->
    <rect x="16" y="526" width="358" height="150" rx="16" fill="#181922" stroke="#282836"/>
    <text x="36" y="556" fill="#FFFFFF" font-size="14" font-weight="700">Driver: U Kyaw Swar</text>
    <text x="36" y="578" fill="#9CA3AF" font-size="12">Vehicle: <tspan fill="#FFFFFF">White Toyota Probox (License: 4B-9102)</tspan></text>
    <text x="36" y="600" fill="#9CA3AF" font-size="12">Location: <tspan fill="#FFFFFF">Corner of Anawrahta &amp; Sule Pagoda Rd</tspan></text>
    <text x="36" y="622" fill="#9CA3AF" font-size="12">Trigger: <tspan fill="#F85A5A" font-weight="700">Physical Passenger Attack Alert</tspan></text>
    <text x="36" y="644" fill="#9CA3AF" font-size="12">Protecting CCTV: <tspan fill="#10B981" font-weight="600">LIVE BUFFER RECORDED</tspan></text>

    <!-- Intercept Action Buttons -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="690" width="358" height="54" rx="14" fill="url(#red-grad)"/>
      <text x="195" y="724" fill="#FFFFFF" font-size="15" font-weight="800" text-anchor="middle">ကူညီရန် သွားမည် (I AM RESPONDING / EN ROUTE)</text>
    </g>

    <rect x="16" y="754" width="358" height="44" rx="12" fill="#242533" stroke="#282836"/>
    <text x="195" y="781" fill="#9CA3AF" font-size="13" text-anchor="middle">ရဲစခန်း တိုက်ရိုက်ခေါ်ဆိုမည် (CALL POLICE 199)</text>
    """
    return screen_frame(content, "၁ကီလိုမီတာ အရေးပေါ် အကူအညီ (SOS Mesh)")

# =============================================================================
# 3. GUARDIAN PLUGIN SCREENS
# =============================================================================

def gen_guardian_passenger_shield():
    content = """
    <!-- Guardian Live Shield Status Header -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="112" width="358" height="110" rx="18" fill="#181922" stroke="#F59E0B" stroke-width="2"/>
      <text x="36" y="144" fill="#10B981" font-size="13" font-weight="700">🟢 RIDE IN PROGRESS (NORMAL)</text>
      <text x="36" y="168" fill="#FFFFFF" font-size="16" font-weight="800">Passenger: Ma Thiri (Daughter)</text>
      <text x="36" y="190" fill="#9CA3AF" font-size="12">Driver: U Aung Kyaw (Toyota Fielder - 3A-8492)</text>
      <text x="36" y="208" fill="#F59E0B" font-size="11">Protecting CCTV: ACTIVE • 1080p</text>
    </g>

    <!-- Real-time 60fps Route & Telemetry HUD -->
    <rect x="16" y="234" width="358" height="340" rx="18" fill="#181922" stroke="#282836"/>
    
    <!-- Map Path -->
    <path d="M 60 480 Q 200 380 320 280" stroke="#10B981" stroke-width="5" fill="none"/>
    <circle cx="60" cy="480" r="7" fill="#10B981"/>
    <text x="75" y="484" fill="#FFFFFF" font-size="10">Pickup</text>

    <circle cx="320" cy="280" r="7" fill="#E5252A"/>
    <text x="320" y="265" fill="#FFFFFF" font-size="10" text-anchor="middle">Destination</text>

    <!-- Live Vehicle Marker -->
    <circle cx="210" cy="350" r="14" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
    <text x="210" y="355" fill="#181922" font-size="10" font-weight="800" text-anchor="middle">🚖</text>

    <!-- Telemetry Float Card -->
    <rect x="36" y="490" width="318" height="64" rx="12" fill="#0E0F14" stroke="#282836"/>
    <text x="56" y="515" fill="#FFFFFF" font-size="11">Cross-Track Deviation: <tspan fill="#10B981" font-weight="700">12m (SAFE)</tspan></text>
    <text x="56" y="536" fill="#FFFFFF" font-size="11">Speed: <tspan font-weight="700">38 km/h</tspan> | Heading: North-West</text>

    <!-- Emergency SOS Siren Button -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="590" width="358" height="60" rx="16" fill="url(#red-grad)"/>
      <text x="195" y="626" fill="#FFFFFF" font-size="16" font-weight="800" text-anchor="middle">🚨 အရေးပေါ် ဥသြသံဖွင့်မည် (EMERGENCY SOS)</text>
    </g>

    <!-- Direct Call Driver & Police -->
    <rect x="16" y="662" width="172" height="50" rx="12" fill="#242533" stroke="#282836"/>
    <text x="102" y="693" fill="#FFFFFF" font-size="12" font-weight="600" text-anchor="middle">📞 ယာဥ်မောင်းခေါ်မည်</text>

    <rect x="202" y="662" width="172" height="50" rx="12" fill="#242533" stroke="#282836"/>
    <text x="288" y="693" fill="#FFFFFF" font-size="12" font-weight="600" text-anchor="middle">👮 ရဲစခန်း ၁၉၉</text>

    <text x="195" y="745" fill="#9CA3AF" font-size="11" text-anchor="middle">Guardian Shield Dynamic Plugin v1.4 • Encrypted</text>
    """
    return screen_frame(content, "မိသားစု အကာအကွယ် (Guardian Shield)")

def gen_guardian_driver_family():
    content = """
    <!-- Driver Family Guardian Status Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="112" width="358" height="130" rx="18" fill="#181922" stroke="#10B981" stroke-width="2"/>
      <text x="36" y="144" fill="#10B981" font-size="13" font-weight="700">🟢 STATUS: ON-DUTY (WORKING)</text>
      <text x="36" y="170" fill="#FFFFFF" font-size="17" font-weight="800">Driver: Ko Aung Kyaw (Husband)</text>
      <text x="36" y="194" fill="#9CA3AF" font-size="12">Vehicle: Toyota Fielder (3A-8492)</text>
      <text x="36" y="216" fill="#38BDF8" font-size="12">🔋 Phone Battery: 86% • 📶 5G Signal: Strong</text>
    </g>

    <!-- Real-Time Shift Tracking Map -->
    <rect x="16" y="254" width="358" height="340" rx="18" fill="#181922" stroke="#282836"/>
    
    <!-- Road Polylines -->
    <path d="M 40 380 L 160 380 L 280 480" stroke="#282836" stroke-width="6" fill="none"/>
    <path d="M 160 270 L 160 550" stroke="#282836" stroke-width="6" fill="none"/>

    <!-- Driver Vehicle Marker -->
    <circle cx="160" cy="380" r="16" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
    <text x="160" y="386" fill="#181922" font-size="12" font-weight="900" text-anchor="middle">🚖</text>
    <text x="160" y="356" fill="#FFFFFF" font-size="11" font-weight="700" text-anchor="middle">Pyay Road (38 km/h)</text>

    <rect x="36" y="520" width="318" height="54" rx="10" fill="#0E0F14" stroke="#282836"/>
    <text x="56" y="542" fill="#FFFFFF" font-size="11">Current Shift Duration: <tspan fill="#F59E0B" font-weight="700">4 hours 20 mins</tspan></text>
    <text x="56" y="560" fill="#9CA3AF" font-size="10">Last GPS Ping: 1 second ago (Accuracy: 2.8m)</text>

    <!-- Emergency DND Siren Alarm Remote Trigger -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="610" width="358" height="60" rx="16" fill="url(#red-grad)"/>
      <text x="195" y="646" fill="#FFFFFF" font-size="15" font-weight="800" text-anchor="middle">🚨 အရေးပေါ် အချက်ပြသံ မြည်စေမည် (SOS SIREN)</text>
    </g>

    <!-- Direct Contact Husband -->
    <rect x="16" y="682" width="358" height="50" rx="14" fill="url(#gold-grad)"/>
    <text x="195" y="713" fill="#181922" font-size="14" font-weight="800" text-anchor="middle">📞 ခင်ပွန်းထံ ဖုန်းတိုက်ရိုက်ခေါ်ဆိုမည်</text>

    <text x="195" y="760" fill="#9CA3AF" font-size="11" text-anchor="middle">Driver Guardian Family Mesh Shield • DND Override Active</text>
    """
    return screen_frame(content, "ယာဥ်မောင်း မိသားစု အကာအကွယ် (Driver Family)")

def generate_all_wireframes():
    screens = [
        ("passenger_01_booking_multistop.svg", gen_passenger_booking),
        ("passenger_02_cascading_search.svg", gen_passenger_cascading),
        ("driver_01_shift_dashboard.svg", gen_driver_shift_dashboard),
        ("driver_02_sos_1km_mesh.svg", gen_driver_sos_mesh),
        ("guardian_01_passenger_shield.svg", gen_guardian_passenger_shield),
        ("guardian_02_driver_family_shield.svg", gen_guardian_driver_family),
    ]

    for fname, func in screens:
        svg_code = func()
        target = os.path.join(OUTPUT_DIR, fname)
        with open(target, "w", encoding="utf-8") as f:
            f.write(svg_code)
        print(f"Generated Wireframe SVG: {target}")

if __name__ == "__main__":
    generate_all_wireframes()
