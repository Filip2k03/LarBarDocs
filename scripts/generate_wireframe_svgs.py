import os

OUTPUT_DIR = "/Users/stephanfilip/Yamato_project/Labar/public/wireframes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def rich_map_canvas(w=358, h=236, route_polyline="", pins=""):
    """Generates a rich, daylight vector cartography tile with roads, water bodies, parks, and city blocks."""
    return f"""
    <!-- Rich Daylight Cartography Map Layer -->
    <g id="cartography-basemap">
      <!-- Background Land Surface (Light Slate 100) -->
      <rect x="16" y="110" width="{w}" height="{h}" rx="18" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
      <clipPath id="map-clip">
        <rect x="16" y="110" width="{w}" height="{h}" rx="18"/>
      </clipPath>
      
      <g clip-path="url(#map-clip)">
        <!-- Yangon River / Water Layer (Light Blue) -->
        <path d="M 16 310 Q 120 280 220 315 T 374 340 L 374 360 L 16 360 Z" fill="#BAE6FD" stroke="#7DD3FC" stroke-width="2"/>
        <!-- Kandawgyi / Inya Lake Park Reservoir (Soft Green) -->
        <path d="M 270 120 C 310 120, 360 140, 350 180 C 340 210, 290 200, 270 180 Z" fill="#BBF7D0" stroke="#86EFAC" stroke-width="1.5"/>
        <text x="310" y="165" fill="#166534" font-size="8" font-weight="700" text-anchor="middle">Kandawgyi Lake</text>

        <!-- City Block Footprints (Crisp White / Subtle Slate) -->
        <rect x="30" y="130" width="55" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="95" y="130" width="60" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="165" y="130" width="60" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        
        <rect x="30" y="185" width="55" height="45" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="95" y="185" width="60" height="45" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="165" y="185" width="60" height="45" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>

        <rect x="30" y="245" width="55" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="95" y="245" width="60" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
        <rect x="165" y="245" width="60" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>

        <!-- Secondary Street Network -->
        <line x1="20" y1="178" x2="370" y2="178" stroke="#E2E8F0" stroke-width="3"/>
        <line x1="20" y1="238" x2="370" y2="238" stroke="#E2E8F0" stroke-width="3"/>
        <line x1="90" y1="110" x2="90" y2="340" stroke="#E2E8F0" stroke-width="3"/>
        <line x1="160" y1="110" x2="160" y2="340" stroke="#E2E8F0" stroke-width="3"/>
        <line x1="230" y1="110" x2="230" y2="340" stroke="#E2E8F0" stroke-width="3"/>

        <!-- Major Arterial Highways (Pyay Rd / Bogyoke Rd / Strand Rd) -->
        <path d="M 20 236 Q 160 210 374 240" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M 20 236 Q 160 210 374 240" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
        
        <line x1="160" y1="110" x2="160" y2="340" stroke="#CBD5E1" stroke-width="8"/>
        <line x1="160" y1="110" x2="160" y2="340" stroke="#FFFFFF" stroke-width="4"/>

        <!-- Street Labels in Yangon -->
        <text x="210" y="228" fill="#475569" font-size="8" font-weight="700">Bogyoke Aung San Rd</text>
        <text x="166" y="145" fill="#475569" font-size="8" font-weight="700" transform="rotate(90 166 145)">Sule Pagoda Rd</text>
        <text x="32" y="230" fill="#475569" font-size="8" font-weight="700">Anawrahta Rd</text>

        <!-- Route Overlays and Pins -->
        {route_polyline}
        {pins}
      </g>
    </g>
    """

def screen_frame(content, title, status_bar="9:41", battery="100%", badge_color="#F59E0B", badge_text="LABAR NATIVE"):
    title = title.replace("&", "&amp;")
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844" style="background:#F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Pyidaungsu', 'Myanmar3', sans-serif;">
  <defs>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
    <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Device Outer Border & Dynamic Island - Light Mode -->
  <rect x="1" y="1" width="388" height="842" rx="46" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="130" y="12" width="130" height="28" rx="14" fill="#0F172A"/>
  <circle cx="236" cy="26" r="5" fill="#1E293B"/>

  <!-- Status Bar -->
  <text x="36" y="32" fill="#0F172A" font-size="13" font-weight="700">{status_bar}</text>
  <text x="354" y="32" fill="#0F172A" font-size="11" font-weight="700" text-anchor="end">5G 🔋 {battery}</text>

  <!-- App Header -->
  <rect x="0" y="48" width="390" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
  <text x="24" y="80" fill="#D97706" font-size="18" font-weight="900" letter-spacing="0.5">LaBar</text>
  <rect x="92" y="66" width="82" height="18" rx="9" fill="{badge_color}" fill-opacity="0.12" stroke="{badge_color}" stroke-width="1"/>
  <text x="133" y="79" fill="{badge_color}" font-size="9" font-weight="800" text-anchor="middle">{badge_text}</text>
  
  <text x="280" y="80" fill="#0F172A" font-size="12" font-weight="800" text-anchor="middle">{title}</text>
  <circle cx="360" cy="74" r="14" fill="#F1F5F9"/>
  <text x="360" y="79" fill="#0F172A" font-size="11" text-anchor="middle">🔔</text>

  <!-- Body Content -->
  {content}

  <!-- Home Indicator -->
  <rect x="128" y="828" width="134" height="4" rx="2" fill="#CBD5E1"/>
</svg>"""

# =============================================================================
# 1. PASSENGER APP SCREENS WITH REAL VECTOR MAPS (LIGHT MODE)
# =============================================================================

def gen_passenger_01_booking():
    route = """
      <!-- Golden Polyline Route with Glow -->
      <path d="M 60 250 L 160 225 L 290 190" stroke="#D97706" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.95"/>
      <path d="M 60 250 L 160 225 L 290 190" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" fill="none"/>
    """
    pins = """
      <!-- Pickup Pin (Green) -->
      <circle cx="60" cy="250" r="10" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="60" cy="250" r="4" fill="#FFFFFF"/>
      <rect x="35" y="265" width="65" height="18" rx="4" fill="#FFFFFF" stroke="#10B981"/>
      <text x="67" y="277" fill="#065F46" font-size="8" font-weight="800" text-anchor="middle">Sule Square</text>

      <!-- Stop Pin (Gold) -->
      <circle cx="160" cy="225" r="7" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5"/>
      <text x="160" y="215" fill="#92400E" font-size="8" font-weight="800" text-anchor="middle">Bogyoke Market</text>

      <!-- Dest Pin (Red) -->
      <circle cx="290" cy="190" r="10" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="290" cy="190" r="4" fill="#FFFFFF"/>
      <rect x="255" y="165" width="70" height="18" rx="4" fill="#FFFFFF" stroke="#EF4444"/>
      <text x="290" y="177" fill="#991B1B" font-size="8" font-weight="800" text-anchor="middle">Junction City</text>

      <!-- Cruising Taxi -->
      <rect x="110" y="228" width="30" height="16" rx="4" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1"/>
      <text x="125" y="240" fill="#FFFFFF" font-size="9" font-weight="900" text-anchor="middle">🚖 3m</text>
    """
    map_svg = rich_map_canvas(358, 236, route, pins)

    content = f"""
    {map_svg}

    <!-- Multi-Stop Input Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="356" width="358" height="174" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
      <circle cx="38" cy="388" r="6" fill="#10B981"/>
      <text x="56" y="392" fill="#0F172A" font-size="13" font-weight="800">Sule Square, Downtown (စတင်ရာနေရာ)</text>

      <line x1="38" y1="398" x2="38" y2="422" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="2 2"/>
      
      <circle cx="38" cy="430" r="5" fill="#F59E0B"/>
      <text x="56" y="434" fill="#92400E" font-size="12" font-weight="700">Stop 1: Bogyoke Aung San Market</text>
      <text x="352" y="434" fill="#DC2626" font-size="12" font-weight="800" text-anchor="end">✕</text>

      <line x1="38" y1="440" x2="38" y2="464" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="2 2"/>

      <circle cx="38" cy="472" r="6" fill="#EF4444"/>
      <text x="56" y="476" fill="#0F172A" font-size="13" font-weight="800">Junction City Mall (သွားရောက်မည့်နေရာ)</text>

      <line x1="28" y1="494" x2="362" y2="494" stroke="#E2E8F0" stroke-width="1"/>
      <text x="56" y="514" fill="#D97706" font-size="12" font-weight="800">+ အပိုမှတ်တိုင် ထည့်သွင်းမည် (Add Extra Stop)</text>
    </g>

    <!-- Vehicle Selection Options -->
    <rect x="16" y="540" width="358" height="66" rx="14" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2"/>
    <text x="36" y="568" fill="#0F172A" font-size="14" font-weight="800">🚗 Standard Taxi (4 Seats)</text>
    <text x="36" y="589" fill="#475569" font-size="11">Toyota Fielder / Probox • 3 mins away</text>
    <text x="354" y="576" fill="#D97706" font-size="16" font-weight="900" text-anchor="end">2,800 MMK</text>

    <rect x="16" y="614" width="358" height="62" rx="14" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="36" y="642" fill="#0F172A" font-size="14" font-weight="700">👑 Royal Gold VIP Sedan</text>
    <text x="36" y="662" fill="#475569" font-size="11">Crown / Alphard • Leather &amp; AC • 2 mins</text>
    <text x="354" y="650" fill="#0F172A" font-size="15" font-weight="800" text-anchor="end">4,500 MMK</text>

    <!-- Payment & Booking Button -->
    <rect x="16" y="686" width="358" height="42" rx="10" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="36" y="712" fill="#0F172A" font-size="12">💳 Payment: <tspan fill="#0284C7" font-weight="800">KBZPay Direct</tspan></text>
    <text x="354" y="712" fill="#D97706" font-size="11" font-weight="800" text-anchor="end">Change ❯</text>

    <g filter="url(#card-shadow)">
      <rect x="16" y="738" width="358" height="56" rx="14" fill="url(#gold-grad)"/>
      <text x="195" y="772" fill="#FFFFFF" font-size="16" font-weight="900" text-anchor="middle">ခရီးစဥ် ခေါ်ယူမည် (CONFIRM RIDE)</text>
    </g>
    """
    return screen_frame(content, "ခရီးစဥ်မှာယူခြင်း (Ride Booking)")

def gen_passenger_02_cascading():
    route = """
      <circle cx="195" cy="280" r="140" fill="none" stroke="#E2E8F0" stroke-width="2"/>
      <circle cx="195" cy="280" r="100" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.4"/>
      <circle cx="195" cy="280" r="60" fill="none" stroke="#F59E0B" stroke-width="2" stroke-opacity="0.8"/>
      <circle cx="195" cy="280" r="20" fill="#FEF3C7"/>
      <circle cx="195" cy="280" r="8" fill="#F59E0B"/>
    """
    pins = """
      <circle cx="140" cy="220" r="8" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <text x="140" y="206" fill="#065F46" font-size="9" font-weight="800" text-anchor="middle">U Aung Kyaw (240m)</text>
      <circle cx="270" cy="250" r="5" fill="#94A3B8"/>
      <circle cx="160" cy="370" r="5" fill="#94A3B8"/>
    """
    map_svg = rich_map_canvas(358, 400, route, pins)

    content = f"""
    {map_svg}

    <!-- 15s Countdown Ring HUD -->
    <rect x="65" y="430" width="260" height="66" rx="14" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2" filter="url(#card-shadow)"/>
    <text x="195" y="456" fill="#D97706" font-size="13" font-weight="900" text-anchor="middle">15s Cascading Offer Active</text>
    <text x="195" y="478" fill="#0F172A" font-size="11" font-weight="700" text-anchor="middle">Offering to nearest driver: U Aung Kyaw (9s)</text>

    <!-- Status Card -->
    <rect x="16" y="528" width="358" height="160" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="558" fill="#0F172A" font-size="15" font-weight="800">ယာဥ်မောင်း ရှာဖွေနေပါသည်...</text>
    <text x="36" y="580" fill="#475569" font-size="12">Searching within 3.0 km via Redis Spatial Engine</text>

    <line x1="36" y1="598" x2="354" y2="598" stroke="#E2E8F0" stroke-width="1"/>
    <text x="36" y="624" fill="#0F172A" font-size="12">Pickup: <tspan font-weight="700">Sule Square, Downtown</tspan></text>
    <text x="36" y="648" fill="#0F172A" font-size="12">Est. Fare: <tspan fill="#D97706" font-weight="900">2,800 MMK</tspan> (KBZPay Direct)</text>
    <text x="36" y="670" fill="#059669" font-size="11" font-weight="700">Guardian Protection: ACTIVE (60fps Telemetry)</text>

    <!-- Cancel Button -->
    <rect x="16" y="708" width="358" height="52" rx="14" fill="#FFFFFF" stroke="#EF4444" stroke-width="1.5"/>
    <text x="195" y="740" fill="#DC2626" font-size="14" font-weight="800" text-anchor="middle">မခေါ်ယူတော့ပါ (CANCEL SEARCH)</text>
    """
    return screen_frame(content, "ရှာဖွေနေသည် (Cascading Dispatch)")

def gen_passenger_03_intrip():
    route = """
      <path d="M 40 370 Q 180 290 320 180" stroke="#059669" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="40" cy="370" r="7" fill="#10B981"/>
      <circle cx="320" cy="180" r="7" fill="#EF4444"/>
      <circle cx="190" cy="275" r="14" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="190" y="280" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">🚖</text>
    """
    pins = ""
    map_svg = rich_map_canvas(358, 310, route, pins)

    content = f"""
    {map_svg}

    <!-- Live Dynamic Fare Meter Floating Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="434" width="358" height="106" rx="18" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="36" y="464" fill="#92400E" font-size="11" font-weight="700">လက်ရှိ ကျသင့်ငွေ (Current Fare Meter)</text>
      <text x="36" y="500" fill="#D97706" font-size="28" font-weight="900">2,350 <tspan font-size="14">MMK</tspan></text>
      <text x="354" y="475" fill="#0F172A" font-size="12" font-weight="700" text-anchor="end">Distance: 4.2 km</text>
      <text x="354" y="496" fill="#475569" font-size="11" text-anchor="end">Duration: 11m 40s</text>
      <text x="36" y="526" fill="#0284C7" font-size="11" font-weight="700">Payment: KBZPay Digital Linked</text>
    </g>

    <!-- Driver Info Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="550" width="358" height="120" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
      <circle cx="56" cy="595" r="22" fill="#F1F5F9"/>
      <text x="56" y="601" fill="#0F172A" font-size="16" text-anchor="middle">👨🏻‍✈️</text>

      <text x="90" y="588" fill="#0F172A" font-size="15" font-weight="800">U Aung Kyaw</text>
      <text x="90" y="608" fill="#D97706" font-size="12" font-weight="700">⭐ 4.96 (1,420 trips) • Pro Driver</text>
      <text x="90" y="626" fill="#475569" font-size="11">Toyota Fielder <tspan fill="#0F172A" font-weight="700">(3A-8492)</tspan></text>

      <circle cx="310" cy="595" r="18" fill="#F1F5F9"/>
      <text x="310" y="600" fill="#0284C7" font-size="14" text-anchor="middle">💬</text>

      <circle cx="350" cy="595" r="18" fill="#F1F5F9"/>
      <text x="350" y="600" fill="#059669" font-size="14" text-anchor="middle">📞</text>

      <rect x="28" y="642" width="334" height="20" rx="4" fill="#D1FAE5"/>
      <text x="195" y="656" fill="#065F46" font-size="10" font-weight="800" text-anchor="middle">📹 Driver Protecting CCTV: RECORDING ACTIVE</text>
    </g>

    <!-- Collapsed Discreet Safety Drawer -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="682" width="358" height="54" rx="14" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="36" y="716" fill="#0F172A" font-size="14" font-weight="900">🛡️ SAFETY &amp; EMERGENCY OPTIONS</text>
      <text x="350" y="716" fill="#64748B" font-size="14" font-weight="900" text-anchor="end">⌃</text>
    </g>
    """
    return screen_frame(content, "ခရီးစဥ် လိုက်ပါနေသည် (In-Trip)")

def gen_passenger_04_payment_rating():
    content = """
    <!-- Trip Completed Success Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="112" width="358" height="230" rx="20" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
      <circle cx="195" cy="155" r="24" fill="#10B981"/>
      <text x="195" y="163" fill="#FFFFFF" font-size="18" font-weight="900" text-anchor="middle">✓</text>
      
      <text x="195" y="202" fill="#065F46" font-size="18" font-weight="800" text-anchor="middle">ခရီးစဥ် ပြီးဆုံးပါပြီ (Trip Completed)</text>
      <text x="195" y="240" fill="#D97706" font-size="32" font-weight="900" text-anchor="middle">2,800 <tspan font-size="16">MMK</tspan></text>
      <text x="195" y="264" fill="#0284C7" font-size="12" font-weight="700" text-anchor="middle">Paid via KBZPay Direct (Auto Settled)</text>
      
      <line x1="36" y1="282" x2="354" y2="282" stroke="#CBD5E1" stroke-width="1"/>
      <text x="36" y="306" fill="#475569" font-size="11">Distance: 5.4 km</text>
      <text x="195" y="306" fill="#475569" font-size="11" text-anchor="middle">Duration: 14 mins</text>
      <text x="354" y="306" fill="#475569" font-size="11" text-anchor="end">Ref: #TX-98421</text>
    </g>

    <!-- 5-Star Rating Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="356" width="358" height="210" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="195" y="388" fill="#0F172A" font-size="15" font-weight="800" text-anchor="middle">ယာဥ်မောင်းအား အဆင့်သတ်မှတ်ပါ</text>
      <text x="195" y="408" fill="#475569" font-size="12" text-anchor="middle">How was your ride with U Aung Kyaw?</text>

      <!-- 5 Gold Stars -->
      <text x="195" y="450" fill="#F59E0B" font-size="28" letter-spacing="8" text-anchor="middle">★★★★★</text>

      <!-- Tipping Quick Chips -->
      <text x="195" y="488" fill="#475569" font-size="11" text-anchor="middle">Add Driver Tip (မုန့်ဖိုးပေးမည်):</text>
      
      <rect x="36" y="504" width="96" height="36" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="84" y="527" fill="#0F172A" font-size="11" font-weight="700" text-anchor="middle">+500 MMK</text>

      <rect x="146" y="504" width="96" height="36" rx="8" fill="#FEF3C7" stroke="#F59E0B"/>
      <text x="194" y="527" fill="#D97706" font-size="11" font-weight="800" text-anchor="middle">+1,000 MMK</text>

      <rect x="256" y="504" width="96" height="36" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="304" y="527" fill="#0F172A" font-size="11" font-weight="700" text-anchor="middle">+2,000 MMK</text>
    </g>

    <!-- Done & Back to Home Button -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="584" width="358" height="56" rx="14" fill="url(#gold-grad)"/>
      <text x="195" y="618" fill="#FFFFFF" font-size="16" font-weight="900" text-anchor="middle">ပြီးဆုံးပါပြီ (DONE &amp; SUBMIT)</text>
    </g>
    """
    return screen_frame(content, "ခရီးစဥ်ပြီးဆုံးခြင်း (Receipt & Rating)")

# =============================================================================
# 2. DRIVER APP SCREENS (LIGHT MODE)
# =============================================================================

def gen_driver_01_dashboard():
    content = """
    <!-- Shift Mode Toggle Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="96" rx="18" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
      <circle cx="48" cy="158" r="18" fill="#10B981"/>
      <text x="48" y="164" fill="#FFFFFF" font-size="14" font-weight="900" text-anchor="middle">✓</text>

      <text x="80" y="150" fill="#065F46" font-size="16" font-weight="800">အလုပ်ဆင်းနေသည် (ON DUTY)</text>
      <text x="80" y="172" fill="#059669" font-size="12" font-weight="700">Online • 15s Cascading Offers Active</text>

      <rect x="290" y="140" width="64" height="34" rx="17" fill="#10B981"/>
      <circle cx="334" cy="157" r="13" fill="#FFFFFF"/>
    </g>

    <!-- Today Sales & Earnings HUD -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="218" width="358" height="152" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="36" y="248" fill="#475569" font-size="12">ယနေ့ ရရှိငွေ စုစုပေါင်း (Today's Earnings)</text>
      <text x="36" y="286" fill="#D97706" font-size="32" font-weight="900">48,500 <tspan font-size="16">MMK</tspan></text>

      <line x1="36" y1="306" x2="354" y2="306" stroke="#E2E8F0" stroke-width="1"/>

      <text x="36" y="338" fill="#0F172A" font-size="12">Completed: <tspan font-weight="700">12 Trips</tspan></text>
      <text x="180" y="338" fill="#0F172A" font-size="12">Online: <tspan font-weight="700">5.4 Hours</tspan></text>
      <text x="354" y="338" fill="#059669" font-size="12" font-weight="800" text-anchor="end">⭐ 4.96</text>
    </g>

    <!-- Quick Actions Grid -->
    <rect x="16" y="382" width="172" height="92" rx="14" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="416" fill="#D97706" font-size="20">💳</text>
    <text x="36" y="442" fill="#0F172A" font-size="13" font-weight="800">ငွေထုတ်ယူမည်</text>
    <text x="36" y="460" fill="#475569" font-size="10">Instant KBZPay Payout</text>

    <rect x="202" y="382" width="172" height="92" rx="14" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="222" y="416" fill="#059669" font-size="20">📹</text>
    <text x="222" y="442" fill="#0F172A" font-size="13" font-weight="800">CCTV Protecting</text>
    <text x="222" y="460" fill="#059669" font-size="10" font-weight="700">Active • 1080p Stream</text>

    <!-- Collapsed Discreet Safety Drawer -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="488" width="358" height="92" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>
      <text x="40" y="532" fill="#2563EB" font-size="28">🛡️</text>
      <text x="80" y="530" fill="#0F172A" font-size="16" font-weight="900">Safety &amp; emergency options</text>
      <text x="80" y="554" fill="#64748B" font-size="12">Collapsed • tap once • hold 2s for silent SOS</text>
      <text x="350" y="538" fill="#64748B" font-size="18" font-weight="900" text-anchor="end">⌃</text>
    </g>

    <!-- Recent Rides History List -->
    <rect x="16" y="594" width="358" height="194" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="36" y="624" fill="#0F172A" font-size="14" font-weight="800">လတ်တလော ခရီးစဥ်များ (Recent Trips)</text>

    <rect x="28" y="638" width="334" height="62" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="44" y="662" fill="#0F172A" font-size="12" font-weight="700">Sule Square ➔ Junction City</text>
    <text x="44" y="682" fill="#475569" font-size="10">2:45 PM • Cashless (KBZPay)</text>
    <text x="346" y="672" fill="#059669" font-size="14" font-weight="800" text-anchor="end">+2,800 MMK</text>

    <rect x="28" y="710" width="334" height="62" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="44" y="734" fill="#0F172A" font-size="12" font-weight="700">Hledan Center ➔ Inya Lake</text>
    <text x="44" y="754" fill="#475569" font-size="10">1:15 PM • Cash Collected</text>
    <text x="346" y="744" fill="#059669" font-size="14" font-weight="800" text-anchor="end">+3,500 MMK</text>
    """
    return screen_frame(content, "ယာဥ်မောင်း ပင်မစာမျက်နှာ (Driver Home)")

def gen_driver_02_offer():
    content = """
    <!-- Incoming 15s Offer Modal Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="670" rx="24" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2.5"/>
      
      <!-- 15s Countdown Header -->
      <rect x="16" y="110" width="358" height="60" rx="24" fill="url(#gold-grad)"/>
      <text x="195" y="146" fill="#FFFFFF" font-size="16" font-weight="900" text-anchor="middle">⏱️ ခရီးစဥ်အသစ် ရောက်ရှိပါသည် (11s left)</text>

      <!-- Earnings Highlight -->
      <text x="195" y="210" fill="#D97706" font-size="34" font-weight="900" text-anchor="middle">3,800 <tspan font-size="16">MMK</tspan></text>
      <text x="195" y="234" fill="#0284C7" font-size="12" font-weight="700" text-anchor="middle">Cashless (KBZPay Direct) • Standard Taxi</text>

      <!-- Mini Route Map -->
      <rect x="36" y="252" width="318" height="150" rx="14" fill="#F1F5F9" stroke="#CBD5E1"/>
      <path d="M 60 360 L 160 300 L 290 270" stroke="#D97706" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="360" r="6" fill="#10B981"/>
      <circle cx="290" cy="270" r="6" fill="#EF4444"/>
      <text x="75" y="364" fill="#065F46" font-size="10" font-weight="800">Pickup (450m away)</text>
      <text x="290" y="258" fill="#991B1B" font-size="10" font-weight="800" text-anchor="middle">Junction City</text>

      <!-- Trip Details List -->
      <circle cx="50" cy="430" r="6" fill="#10B981"/>
      <text x="68" y="434" fill="#0F172A" font-size="13" font-weight="800">Sule Square (450m • 2 mins away)</text>

      <circle cx="50" cy="470" r="6" fill="#EF4444"/>
      <text x="68" y="474" fill="#0F172A" font-size="13" font-weight="800">Junction City Mall (Trip: 5.4 km)</text>

      <line x1="36" y1="496" x2="354" y2="496" stroke="#E2E8F0" stroke-width="1"/>

      <!-- Passenger Profile -->
      <circle cx="56" cy="530" r="16" fill="#F1F5F9"/>
      <text x="56" y="535" fill="#0F172A" font-size="12" text-anchor="middle">👤</text>
      <text x="82" y="526" fill="#0F172A" font-size="13" font-weight="800">Ma Thiri (Passenger)</text>
      <text x="82" y="544" fill="#D97706" font-size="11" font-weight="700">⭐ 4.95 (148 trips completed)</text>

      <!-- Accept / Reject Actions -->
      <g filter="url(#card-shadow)">
        <rect x="36" y="576" width="318" height="60" rx="16" fill="url(#gold-grad)"/>
        <text x="195" y="612" fill="#FFFFFF" font-size="17" font-weight="900" text-anchor="middle">လက်ခံမည် (ACCEPT RIDE OFFER)</text>
      </g>

      <rect x="36" y="650" width="318" height="48" rx="14" fill="#FFFFFF" stroke="#EF4444"/>
      <text x="195" y="680" fill="#DC2626" font-size="14" font-weight="800" text-anchor="middle">ငြင်းပယ်မည် (DECLINE / PASS)</text>
    </g>
    """
    return screen_frame(content, "ခရီးစဥ်လက်ခံခြင်း (Offer Modal)")

def gen_driver_03_intrip_cctv():
    route = """
      <path d="M 60 380 L 160 380 L 160 200 L 300 200" stroke="#059669" stroke-width="6" stroke-linecap="round" fill="none"/>
      <circle cx="160" cy="270" r="14" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="160" y="276" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">🚖</text>
    """
    pins = ""
    map_svg = rich_map_canvas(358, 310, route, pins)

    content = f"""
    {map_svg}

    <!-- CCTV Recording Banner Indicator -->
    <rect x="36" y="126" width="318" height="34" rx="8" fill="#FEE2E2" stroke="#EF4444" stroke-width="1"/>
    <circle cx="54" cy="143" r="5" fill="#EF4444"/>
    <text x="68" y="147" fill="#DC2626" font-size="11" font-weight="800">● REC 1080p CCTV PROTECTING MODE ACTIVE</text>

    <!-- Turn Direction Banner -->
    <rect x="36" y="168" width="318" height="50" rx="10" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="56" y="190" fill="#0F172A" font-size="12" font-weight="800">Turn Left on Bogyoke Aung San Rd (220m)</text>
    <text x="56" y="208" fill="#059669" font-size="10" font-weight="700">Speed: 38 km/h • Remaining: 3.2 km (7 mins)</text>

    <!-- Live Dynamic Fare Meter HUD -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="434" width="358" height="110" rx="18" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2"/>
      <text x="36" y="464" fill="#92400E" font-size="11" font-weight="700">လက်ရှိ မီတာခ (Dynamic Taximeter HUD)</text>
      <text x="36" y="504" fill="#D97706" font-size="32" font-weight="900">3,850 <tspan font-size="16">MMK</tspan></text>
      
      <text x="354" y="475" fill="#0F172A" font-size="13" font-weight="800" text-anchor="end">5.4 km • 14m 20s</text>
      <text x="354" y="498" fill="#0284C7" font-size="12" font-weight="800" text-anchor="end">KBZPay Cashless</text>
      <text x="36" y="530" fill="#059669" font-size="11" font-weight="700">Waypoint 1 of 2: Bogyoke (Visited ✓)</text>
    </g>

    <!-- Passenger Contact Card -->
    <rect x="16" y="556" width="358" height="106" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="586" fill="#0F172A" font-size="14" font-weight="800">Passenger: Ma Thiri</text>
    <text x="36" y="608" fill="#475569" font-size="12">Dest: Junction City Mall, Main Entrance</text>
    <circle cx="310" cy="595" r="18" fill="#F1F5F9"/>
    <text x="310" y="600" fill="#0284C7" font-size="14" text-anchor="middle">💬</text>
    <circle cx="350" cy="595" r="18" fill="#F1F5F9"/>
    <text x="350" y="600" fill="#059669" font-size="14" text-anchor="middle">📞</text>

    <!-- Complete / Arrive Button -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="674" width="358" height="56" rx="14" fill="url(#gold-grad)"/>
      <text x="195" y="708" fill="#FFFFFF" font-size="16" font-weight="900" text-anchor="middle">ရောက်ရှိပါပြီ (ARRIVE AT DESTINATION)</text>
    </g>
    """
    return screen_frame(content, "လမ်းညွှန် မီတာစနစ် (Turn Navigation)")

def gen_driver_04_sos_mesh():
    route = """
      <circle cx="195" cy="374" r="90" fill="none" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="120" cy="420" r="10" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <text x="120" y="445" fill="#065F46" font-size="11" font-weight="800" text-anchor="middle">You</text>
      <path d="M 120 420 L 250 320" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 2"/>
      <circle cx="250" cy="320" r="14" fill="#EF4444" stroke="#FFFFFF" stroke-width="3"/>
      <text x="250" y="325" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">🚨</text>
      <text x="250" y="300" fill="#DC2626" font-size="12" font-weight="800" text-anchor="middle">U Kyaw Swar (240m)</text>
    """
    pins = ""
    map_svg = rich_map_canvas(358, 280, route, pins)

    content = f"""
    <!-- Code Red Alert Banner -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="114" rx="18" fill="url(#red-grad)"/>
      <text x="195" y="144" fill="#FFFFFF" font-size="18" font-weight="900" text-anchor="middle">🚨 CODE RED: DRIVER IN DISTRESS</text>
      <text x="195" y="170" fill="#FFFFFF" font-size="13" font-weight="800" text-anchor="middle">Fellow Driver Needs Immediate Assistance!</text>
      <text x="195" y="196" fill="#FEE2E2" font-size="11" text-anchor="middle">Location: 240 meters away (Triggered 20s ago)</text>
    </g>

    {map_svg}

    <!-- Distress Details Card -->
    <rect x="16" y="526" width="358" height="150" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="556" fill="#0F172A" font-size="14" font-weight="800">Driver: U Kyaw Swar</text>
    <text x="36" y="578" fill="#475569" font-size="12">Vehicle: <tspan fill="#0F172A" font-weight="700">White Toyota Probox (License: 4B-9102)</tspan></text>
    <text x="36" y="600" fill="#475569" font-size="12">Location: <tspan fill="#0F172A" font-weight="700">Corner of Anawrahta &amp; Sule Pagoda Rd</tspan></text>
    <text x="36" y="622" fill="#475569" font-size="12">Trigger: <tspan fill="#DC2626" font-weight="800">Physical Passenger Attack Alert</tspan></text>
    <text x="36" y="644" fill="#475569" font-size="12">Protecting CCTV: <tspan fill="#059669" font-weight="700">LIVE BUFFER LOCKED</tspan></text>

    <!-- Intercept Action Buttons -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="688" width="358" height="54" rx="14" fill="url(#red-grad)"/>
      <text x="195" y="722" fill="#FFFFFF" font-size="15" font-weight="900" text-anchor="middle">ကူညီရန် သွားမည် (I AM RESPONDING / EN ROUTE)</text>
    </g>

    <rect x="16" y="752" width="358" height="44" rx="12" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="195" y="779" fill="#DC2626" font-size="13" font-weight="800" text-anchor="middle">ရဲစခန်း တိုက်ရိုက်ခေါ်ဆိုမည် (CALL POLICE 199)</text>
    """
    return screen_frame(content, "၁ကီလိုမီတာ အရေးပေါ် အကူအညီ (SOS Mesh)")

def gen_driver_05_daily_payout():
    content = """
    <!-- Daily Settlement Header -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="150" rx="18" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2"/>
      <text x="36" y="142" fill="#92400E" font-size="12" font-weight="700">ထုတ်ယူနိုင်သော လက်ကျန်ငွေ (Available Balance)</text>
      <text x="36" y="180" fill="#D97706" font-size="34" font-weight="900">41,225 <tspan font-size="16">MMK</tspan></text>
      <text x="36" y="208" fill="#059669" font-size="11" font-weight="700">Net After 15% Platform Commission</text>
      
      <line x1="36" y1="222" x2="354" y2="222" stroke="#CBD5E1" stroke-width="1"/>
      <text x="36" y="244" fill="#0F172A" font-size="11">Gross Sales: 48,500 MMK | Fee: -7,275 MMK</text>
    </g>

    <!-- Payout Destination Channels -->
    <rect x="16" y="272" width="358" height="230" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="302" fill="#0F172A" font-size="14" font-weight="800">ငွေထုတ်ယူမည့် ချန်နယ် ရွေးချယ်ပါ (Select Payout Channel)</text>

    <!-- KBZPay Option -->
    <rect x="28" y="318" width="334" height="60" rx="12" fill="#F0F9FF" stroke="#0284C7" stroke-width="1.5"/>
    <text x="44" y="342" fill="#0284C7" font-size="14" font-weight="800">KBZPay Partner Direct</text>
    <text x="44" y="362" fill="#475569" font-size="11">Account: 09123456789 (U Aung Kyaw)</text>
    <text x="346" y="352" fill="#0284C7" font-size="14" font-weight="800" text-anchor="end">✓</text>

    <!-- WavePay Option -->
    <rect x="28" y="388" width="334" height="60" rx="12" fill="#FFFFFF" stroke="#E2E8F0"/>
    <text x="44" y="412" fill="#0F172A" font-size="14" font-weight="700">WavePay Instant Transfer</text>
    <text x="44" y="432" fill="#475569" font-size="11">Wave Account Linked: 09123456789</text>

    <text x="195" y="482" fill="#475569" font-size="11" text-anchor="middle">Processing Time: Instant (Under 30 seconds)</text>

    <!-- Daily Breakdown Table -->
    <rect x="16" y="514" width="358" height="150" rx="16" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="544" fill="#0F172A" font-size="14" font-weight="800">ယနေ့ ခရီးစဥ် အကျဉ်းချုပ် (Daily Summary)</text>
    
    <text x="36" y="572" fill="#475569" font-size="12">Total Completed Trips:</text>
    <text x="354" y="572" fill="#0F172A" font-size="12" font-weight="700" text-anchor="end">12 Trips</text>

    <text x="36" y="596" fill="#475569" font-size="12">Cash Collected (In-Hand):</text>
    <text x="354" y="596" fill="#0F172A" font-size="12" font-weight="700" text-anchor="end">18,500 MMK</text>

    <text x="36" y="620" fill="#475569" font-size="12">Digital E-Wallet Sales:</text>
    <text x="354" y="620" fill="#059669" font-size="12" font-weight="800" text-anchor="end">30,000 MMK</text>

    <!-- Payout Confirm Button -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="678" width="358" height="56" rx="14" fill="url(#gold-grad)"/>
      <text x="195" y="712" fill="#FFFFFF" font-size="16" font-weight="900" text-anchor="middle">ငွေထုတ်ယူမှု အတည်ပြုမည် (TRANSFER NOW)</text>
    </g>
    """
    return screen_frame(content, "ဝင်ငွေ ထုတ်ယူခြင်း (Sales Payout)")

# =============================================================================
# 3. GUARDIAN SAFETY APPS (LIGHT MODE)
# =============================================================================

def gen_guardian_01_passenger_shield():
    route = """
      <path d="M 60 480 Q 200 380 320 280" stroke="#059669" stroke-width="5" fill="none"/>
      <circle cx="60" cy="480" r="7" fill="#10B981"/>
      <text x="75" y="484" fill="#065F46" font-size="10" font-weight="800">Pickup: Sule</text>
      <circle cx="320" cy="280" r="7" fill="#EF4444"/>
      <text x="320" y="265" fill="#991B1B" font-size="10" font-weight="800" text-anchor="middle">Destination: Junction City</text>
      <circle cx="210" cy="350" r="14" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="210" y="355" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">🚖</text>
    """
    pins = ""
    map_svg = rich_map_canvas(358, 340, route, pins)

    content = f"""
    <!-- Guardian Live Shield Status Header -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="114" rx="18" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
      <text x="36" y="142" fill="#059669" font-size="13" font-weight="800">🟢 RIDE IN PROGRESS (NORMAL)</text>
      <text x="36" y="168" fill="#0F172A" font-size="16" font-weight="800">Passenger: Ma Thiri (Daughter)</text>
      <text x="36" y="190" fill="#475569" font-size="12">Driver: U Aung Kyaw (Toyota Fielder - 3A-8492)</text>
      <text x="36" y="208" fill="#D97706" font-size="11" font-weight="700">In-Car CCTV: ACTIVE • 1080p Buffer Locked</text>
    </g>

    {map_svg}

    <!-- Telemetry Float Card -->
    <rect x="36" y="490" width="318" height="64" rx="12" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="56" y="515" fill="#0F172A" font-size="11">Cross-Track Deviation: <tspan fill="#059669" font-weight="800">12m (SAFE &lt; 300m)</tspan></text>
    <text x="56" y="536" fill="#0F172A" font-size="11">Speed: <tspan font-weight="700">38 km/h</tspan> | Heading: North-West</text>

    <!-- Emergency SOS Siren Button -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="590" width="358" height="60" rx="16" fill="url(#red-grad)"/>
      <text x="195" y="626" fill="#FFFFFF" font-size="16" font-weight="900" text-anchor="middle">🚨 အရေးပေါ် ဥသြသံဖွင့်မည် (EMERGENCY SOS)</text>
    </g>

    <!-- Direct Call Driver & Police -->
    <rect x="16" y="662" width="172" height="50" rx="12" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="102" y="693" fill="#0F172A" font-size="12" font-weight="700" text-anchor="middle">📞 ယာဥ်မောင်းခေါ်မည်</text>

    <rect x="202" y="662" width="172" height="50" rx="12" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="288" y="693" fill="#DC2626" font-size="12" font-weight="800" text-anchor="middle">👮 ရဲစခန်း ၁၉၉</text>

    <text x="195" y="745" fill="#475569" font-size="11" text-anchor="middle">Guardian Shield Dynamic Plugin v1.4 • Encrypted Stream</text>
    """
    return screen_frame(content, "မိသားစု အကာအကွယ် (Guardian Shield)")

def gen_guardian_02_driver_family():
    route = """
      <path d="M 40 380 L 160 380 L 280 480" stroke="#CBD5E1" stroke-width="6" fill="none"/>
      <path d="M 160 270 L 160 550" stroke="#CBD5E1" stroke-width="6" fill="none"/>
      <circle cx="160" cy="380" r="16" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="160" y="386" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">🚖</text>
      <text x="160" y="356" fill="#0F172A" font-size="11" font-weight="800" text-anchor="middle">Pyay Road (38 km/h)</text>
    """
    pins = ""
    map_svg = rich_map_canvas(358, 340, route, pins)

    content = f"""
    <!-- Driver Family Guardian Status Card -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="134" rx="18" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
      <text x="36" y="142" fill="#059669" font-size="13" font-weight="800">🟢 STATUS: ON-DUTY (WORKING)</text>
      <text x="36" y="168" fill="#0F172A" font-size="17" font-weight="800">Driver: Ko Aung Kyaw (Husband)</text>
      <text x="36" y="192" fill="#475569" font-size="12">Vehicle: Toyota Fielder (3A-8492)</text>
      <text x="36" y="214" fill="#0284C7" font-size="12" font-weight="700">🔋 Phone Battery: 86% • 📶 5G Signal: Strong</text>
    </g>

    {map_svg}

    <rect x="36" y="520" width="318" height="54" rx="10" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="56" y="542" fill="#0F172A" font-size="11">Current Shift Duration: <tspan fill="#D97706" font-weight="800">4 hours 20 mins</tspan></text>
    <text x="56" y="560" fill="#475569" font-size="10">Last GPS Ping: 1 second ago (Accuracy: 2.8m)</text>

    <!-- Emergency DND Siren Alarm Remote Trigger -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="610" width="358" height="60" rx="16" fill="url(#red-grad)"/>
      <text x="195" y="646" fill="#FFFFFF" font-size="15" font-weight="900" text-anchor="middle">🚨 အရေးပေါ် အချက်ပြသံ မြည်စေမည် (SOS SIREN)</text>
    </g>

    <!-- Direct Contact Husband -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="682" width="358" height="50" rx="14" fill="url(#gold-grad)"/>
      <text x="195" y="713" fill="#FFFFFF" font-size="14" font-weight="900" text-anchor="middle">📞 ခင်ပွန်းထံ ဖုန်းတိုက်ရိုက်ခေါ်ဆိုမည်</text>
    </g>

    <text x="195" y="760" fill="#475569" font-size="11" text-anchor="middle">Driver Guardian Family Mesh Shield • DND Override Active</text>
    """
    return screen_frame(content, "ယာဥ်မောင်း မိသားစု အကာအကွယ် (Driver Family)")

def gen_guardian_03_pairing_qr():
    content = """
    <!-- Family Mesh Pairing Container -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="670" rx="20" fill="#FFFFFF" stroke="#E2E8F0"/>
      
      <text x="195" y="150" fill="#0F172A" font-size="18" font-weight="800" text-anchor="middle">မိသားစု ချိတ်ဆက်ခြင်း (Family Pairing)</text>
      <text x="195" y="174" fill="#475569" font-size="12" text-anchor="middle">Scan QR code or share 6-digit OTP token</text>

      <!-- High-Contrast QR Code Card -->
      <rect x="75" y="200" width="240" height="240" rx="18" fill="#0F172A" stroke="#F59E0B" stroke-width="3"/>
      
      <!-- QR Matrix Mockup -->
      <rect x="95" y="220" width="60" height="60" fill="#FFFFFF"/>
      <rect x="105" y="230" width="40" height="40" fill="#0F172A"/>
      <rect x="115" y="240" width="20" height="20" fill="#FFFFFF"/>

      <rect x="235" y="220" width="60" height="60" fill="#FFFFFF"/>
      <rect x="245" y="230" width="40" height="40" fill="#0F172A"/>
      <rect x="255" y="240" width="20" height="20" fill="#FFFFFF"/>

      <rect x="95" y="360" width="60" height="60" fill="#FFFFFF"/>
      <rect x="105" y="370" width="40" height="40" fill="#0F172A"/>
      <rect x="115" y="380" width="20" height="20" fill="#FFFFFF"/>

      <!-- QR Center Shield Emblem -->
      <circle cx="195" cy="320" r="22" fill="#EF4444"/>
      <text x="195" y="326" fill="#FFFFFF" font-size="14" font-weight="900" text-anchor="middle">🛡️</text>

      <!-- 6-Digit OTP Box -->
      <rect x="55" y="465" width="280" height="54" rx="12" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="195" y="500" fill="#D97706" font-size="22" font-weight="900" letter-spacing="6" text-anchor="middle">8 4 9 2 0 1</text>

      <text x="195" y="545" fill="#475569" font-size="11" text-anchor="middle">OTP Token expires in 10 minutes</text>

      <!-- Pairing Instructions -->
      <rect x="36" y="570" width="318" height="100" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="50" y="595" fill="#0F172A" font-size="12" font-weight="700">1. Install LaBar Guardian Plugin (~3.8MB)</text>
      <text x="50" y="618" fill="#0F172A" font-size="12" font-weight="700">2. Scan this QR or type code 849201</text>
      <text x="50" y="641" fill="#059669" font-size="12" font-weight="800">3. Enjoy 24/7 Live GPS &amp; Emergency Alarms</text>

      <!-- Share Invite Button -->
      <g filter="url(#card-shadow)">
        <rect x="36" y="692" width="318" height="52" rx="14" fill="url(#gold-grad)"/>
        <text x="195" y="724" fill="#FFFFFF" font-size="15" font-weight="900" text-anchor="middle">မိသားစုထံ ဖိတ်ခေါ်လင့်ခ် ပေးပို့မည် (SHARE LINK)</text>
      </g>
    </g>
    """
    return screen_frame(content, "မိသားစု ချိတ်ဆက်ခြင်း (Family Pairing)")

def gen_plugin_addons_store():
    content = """
    <!-- Add-Ons & Plugins Marketplace Header -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="110" width="358" height="100" rx="18" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2"/>
      <text x="36" y="142" fill="#D97706" font-size="13" font-weight="800">🧩 ON-DEMAND ADD-ONS STORE</text>
      <text x="36" y="168" fill="#0F172A" font-size="16" font-weight="900">အပိုဆောင်း လုပ်ဆောင်ချက်များ</text>
      <text x="36" y="190" fill="#475569" font-size="11">Base App: 18MB • Download only what you need (~3.8MB)</text>
    </g>

    <!-- Plugin 1: Guardian Safety Shield (INSTALLED) -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="222" width="358" height="150" rx="16" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
      <circle cx="48" cy="254" r="18" fill="#D1FAE5"/>
      <text x="48" y="260" fill="#059669" font-size="16" text-anchor="middle">🛡️</text>

      <text x="76" y="250" fill="#0F172A" font-size="14" font-weight="800">Guardian Family Safety Shield</text>
      <text x="76" y="268" fill="#059669" font-size="11" font-weight="700">● INSTALLED &amp; ACTIVE • v1.4.0 (3.8 MB)</text>
      <text x="36" y="296" fill="#475569" font-size="11">60fps live route telemetry, cross-track deviation warnings, DND-override siren alarms.</text>

      <rect x="36" y="318" width="160" height="34" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="116" y="339" fill="#0F172A" font-size="11" font-weight="700" text-anchor="middle">Open Settings ⚙️</text>

      <rect x="294" y="240" width="56" height="28" rx="14" fill="#10B981"/>
      <circle cx="336" cy="254" r="11" fill="#FFFFFF"/>
    </g>

    <!-- Plugin 2: In-Car CCTV Protecting Mode (AVAILABLE DOWNLOAD) -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="384" width="358" height="150" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
      <circle cx="48" cy="416" r="18" fill="#FEE2E2"/>
      <text x="48" y="422" fill="#DC2626" font-size="16" text-anchor="middle">📹</text>

      <text x="76" y="412" fill="#0F172A" font-size="14" font-weight="800">In-Car CCTV Video Sentinel</text>
      <text x="76" y="430" fill="#D97706" font-size="11" font-weight="700">Available for Drivers • Size: 3.2 MB</text>
      <text x="36" y="458" fill="#475569" font-size="11">1080p continuous loop recording, SHA-256 cloud rolling buffer &amp; G-sensor collision lock.</text>

      <rect x="36" y="480" width="318" height="36" rx="10" fill="url(#gold-grad)"/>
      <text x="195" y="503" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">ဒေါင်းလုဒ်ရယူမည် (DOWNLOAD &amp; INSTALL ~3.2MB)</text>
    </g>

    <!-- Plugin 3: Silent Audio Sentinel (AVAILABLE DOWNLOAD) -->
    <g filter="url(#card-shadow)">
      <rect x="16" y="546" width="358" height="150" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
      <circle cx="48" cy="578" r="18" fill="#E0F2FE"/>
      <text x="48" y="584" fill="#0284C7" font-size="16" text-anchor="middle">🎙️</text>

      <text x="76" y="574" fill="#0F172A" font-size="14" font-weight="800">Silent Voice Panic Sentinel</text>
      <text x="76" y="592" fill="#0284C7" font-size="11" font-weight="700">Passenger &amp; Driver Safety • Size: 2.4 MB</text>
      <text x="36" y="620" fill="#475569" font-size="11">On-device acoustic distress keyword detector ("Help", "ကယ်ပါ") with cloud audio vault.</text>

      <rect x="36" y="642" width="318" height="36" rx="10" fill="url(#gold-grad)"/>
      <text x="195" y="665" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">ဒေါင်းလုဒ်ရယူမည် (DOWNLOAD &amp; INSTALL ~2.4MB)</text>
    </g>

    <!-- Storage Manager Footer -->
    <rect x="16" y="710" width="358" height="60" rx="14" fill="#FFFFFF" stroke="#E2E8F0" filter="url(#card-shadow)"/>
    <text x="36" y="736" fill="#0F172A" font-size="11" font-weight="700">💾 App Storage Usage: <tspan fill="#059669">21.8 MB Total</tspan></text>
    <text x="36" y="754" fill="#475569" font-size="10">Clean Cache &amp; Manage Add-On Storage Space</text>
    <text x="354" y="744" fill="#D97706" font-size="11" font-weight="800" text-anchor="end">Manage ❯</text>
    """
    return screen_frame(content, "အပိုဆောင်း စနစ်များ (Add-Ons Store)")

# =============================================================================
# MASTER FIGMA CANVAS GENERATOR (LIGHT MODE)
# =============================================================================

def gen_master_figma_canvas(screens_dict):
    """Creates a large multi-screen SVG canvas in Light Mode suitable for direct Figma / Sketch import."""
    canvas_w = 4 * 430 + 60
    canvas_h = 4 * 890 + 120
    
    svg_canvas = [f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w} {canvas_h}" width="{canvas_w}" height="{canvas_h}" style="background:#F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Pyidaungsu', sans-serif;">
  <defs>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Canvas Header -->
  <text x="60" y="60" fill="#D97706" font-size="32" font-weight="900">LABAR TAXI PLATFORM — MASTER FIGMA / SKETCH WIREFRAME CANVAS (LIGHT MODE)</text>
  <text x="60" y="90" fill="#475569" font-size="16">13 Production Mobile Screen Prototypes with Real Yangon Daylight Vector Cartography &amp; Add-On Store • Red &amp; Gold Design System</text>
"""]

    positions = [
        (0, 0), (1, 0), (2, 0), (3, 0),
        (0, 1), (1, 1), (2, 1), (3, 1),
        (0, 2), (1, 2), (2, 2), (3, 2),
        (0, 3)
    ]

    for idx, (fname, title, func) in enumerate(screens_dict):
        safe_title = title.replace("&", "&amp;")
        col, row = positions[idx]
        pos_x = 60 + col * 430
        pos_y = 130 + row * 890
        
        inner_svg = func()
        inner_body = inner_svg[inner_svg.find("<rect x=\"1\" y=\"1\""):inner_svg.rfind("</svg>")]

        svg_canvas.append(f"""
  <!-- Screen {idx+1}: {safe_title} -->
  <g transform="translate({pos_x}, {pos_y})">
    <text x="0" y="-12" fill="#0F172A" font-size="14" font-weight="800">#{idx+1:02d} • {safe_title}</text>
    {inner_body}
  </g>
""")

    svg_canvas.append("</svg>")
    return "".join(svg_canvas)

def generate_all_wireframes():
    screens = [
        ("passenger_01_booking_multistop.svg", "Passenger Multi-Stop Booking", gen_passenger_01_booking),
        ("passenger_02_cascading_search.svg", "Passenger 15s Cascading Search", gen_passenger_02_cascading),
        ("passenger_03_intrip_live_meter.svg", "Passenger In-Trip Navigation & Fare Meter", gen_passenger_03_intrip),
        ("passenger_04_payment_rating.svg", "Passenger Receipt & Driver 5-Star Rating", gen_passenger_04_payment_rating),
        ("driver_01_shift_dashboard.svg", "Driver Shift Dashboard & Today's Earnings", gen_driver_01_dashboard),
        ("driver_02_15s_offer_card.svg", "Driver 15s Cascading Ride Offer Modal", gen_driver_02_offer),
        ("driver_03_intrip_cctv_meter.svg", "Driver In-Trip Meter & CCTV HUD", gen_driver_03_intrip_cctv),
        ("driver_04_sos_1km_mesh.svg", "Driver 1km Emergency SOS Intercept Radar", gen_driver_04_sos_mesh),
        ("driver_05_daily_sales_payout.svg", "Driver Daily Settlement & Instant Payout", gen_driver_05_daily_payout),
        ("guardian_01_passenger_shield.svg", "Passenger Family Guardian Live Route Shield", gen_guardian_01_passenger_shield),
        ("guardian_02_driver_family_shield.svg", "Driver Family Guardian Shift & SOS Shield", gen_guardian_02_driver_family),
        ("guardian_03_pairing_qr_mesh.svg", "Family Mesh Pairing & QR Code Scanner", gen_guardian_03_pairing_qr),
        ("plugins_01_addons_store.svg", "In-App Add-Ons & Dynamic Plugin Store", gen_plugin_addons_store),
    ]

    for fname, title, func in screens:
        svg_code = func()
        target = os.path.join(OUTPUT_DIR, fname)
        with open(target, "w", encoding="utf-8") as f:
            f.write(svg_code)
        print(f"Generated Wireframe Screen: {target}")

    master_canvas = gen_master_figma_canvas(screens)
    master_target = os.path.join(OUTPUT_DIR, "labar_master_figma_canvas.svg")
    with open(master_target, "w", encoding="utf-8") as f:
        f.write(master_canvas)
    
    # Also sync larbar_master_figma_canvas.svg
    with open(os.path.join(OUTPUT_DIR, "larbar_master_figma_canvas.svg"), "w", encoding="utf-8") as f:
        f.write(master_canvas)
    print(f"Generated Master Figma Canvas: {master_target}")

if __name__ == "__main__":
    generate_all_wireframes()
