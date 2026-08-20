#!/usr/bin/env python3
"""
Generate High-Quality Standalone SVG Visualizations for all 11 Architecture Diagrams
Saves to docs/public/diagrams/*.svg for direct rendering in the VitePress portal
"""

import os

OUTPUT_DIR = "/Users/stephanfilip/Yamato_project/Labar/docs/public/diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def svg_wrapper(content, width, height, title):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background:#FFFFFF; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <style>
      .title {{ font-size: 18px; font-weight: 800; fill: #181922; }}
      .subtitle {{ font-size: 12px; fill: #6B7280; font-weight: 500; }}
      .box {{ fill: #FFFFFF; stroke: #181922; stroke-width: 1.5; rx: 6px; }}
      .box-pkg {{ fill: #FAFAFA; stroke: #2B2D3C; stroke-width: 1.5; stroke-dasharray: 4 4; rx: 8px; }}
      .box-highlight {{ fill: #FFF8E1; stroke: #F59E0B; stroke-width: 2; rx: 6px; }}
      .box-alert {{ fill: #FFE8E8; stroke: #E5252A; stroke-width: 2; rx: 6px; }}
      .hdr-box {{ fill: #181922; }}
      .hdr-text {{ fill: #FFFFFF; font-size: 12px; font-weight: 700; }}
      .lbl {{ font-size: 11px; fill: #181922; font-weight: 600; }}
      .txt {{ font-size: 10px; fill: #374151; }}
      .txt-bold {{ font-size: 10px; fill: #181922; font-weight: 700; }}
      .txt-pk {{ font-size: 10px; fill: #E5252A; font-weight: 700; }}
      .txt-fk {{ font-size: 10px; fill: #D97706; font-weight: 600; }}
      .line {{ stroke: #181922; stroke-width: 1.5; fill: none; }}
      .line-dashed {{ stroke: #6B7280; stroke-width: 1.2; stroke-dasharray: 4 4; fill: none; }}
      .line-gold {{ stroke: #F59E0B; stroke-width: 2; fill: none; }}
      .line-red {{ stroke: #E5252A; stroke-width: 2; fill: none; }}
      .actor-head {{ fill: #FFFFFF; stroke: #181922; stroke-width: 2; }}
      .actor-body {{ stroke: #181922; stroke-width: 2; }}
      .badge-gold {{ fill: #F59E0B; }}
      .badge-red {{ fill: #E5252A; }}
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#181922" />
    </marker>
    <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
    </marker>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#E5252A" />
    </marker>
  </defs>

  <!-- Banner Header -->
  <rect x="0" y="0" width="{width}" height="55" fill="#181922" />
  <rect x="0" y="52" width="{width}" height="3" fill="#F59E0B" />
  <text x="24" y="34" fill="#FFFFFF" font-size="18" font-weight="800">YAMATO TAXI ARCHITECTURE</text>
  <text x="{width - 24}" y="34" fill="#F59E0B" font-size="13" font-weight="700" text-anchor="end">{title.upper()}</text>

  <!-- Diagram Body Canvas -->
  <g transform="translate(0, 60)">
    {content}
  </g>
</svg>"""

def generate_01_use_case():
    w, h = 1200, 820
    c = """
    <rect x="220" y="20" width="760" height="720" class="box-pkg" />
    <text x="240" y="50" class="title">Taxi Application Platform Boundary (UML 2.5)</text>

    <rect x="240" y="70" width="350" height="180" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1" rx="4"/>
    <text x="255" y="92" class="txt-bold">1. Authentication &amp; Profile</text>
    
    <rect x="610" y="70" width="350" height="280" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1" rx="4"/>
    <text x="625" y="92" class="txt-bold">3. Ride Safety &amp; Guardian Mode</text>

    <rect x="240" y="270" width="350" height="260" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1" rx="4"/>
    <text x="255" y="292" class="txt-bold">2. Booking &amp; Dispatch Engine</text>

    <rect x="240" y="550" width="720" height="170" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="1" rx="4"/>
    <text x="255" y="572" class="txt-bold">4. Payment &amp; Financial Settlement</text>

    <!-- Actors Left -->
    <circle cx="90" cy="140" r="18" class="actor-head"/>
    <line x1="90" y1="158" x2="90" y2="205" class="actor-body"/>
    <line x1="65" y1="175" x2="115" y2="175" class="actor-body"/>
    <line x1="90" y1="205" x2="70" y2="245" class="actor-body"/>
    <line x1="90" y1="205" x2="110" y2="245" class="actor-body"/>
    <text x="90" y="268" font-size="12" font-weight="700" fill="#181922" text-anchor="middle">Passenger</text>

    <circle cx="90" cy="380" r="18" class="actor-head"/>
    <line x1="90" y1="398" x2="90" y2="445" class="actor-body"/>
    <line x1="65" y1="415" x2="115" y2="415" class="actor-body"/>
    <line x1="90" y1="445" x2="70" y2="485" class="actor-body"/>
    <line x1="90" y1="445" x2="110" y2="485" class="actor-body"/>
    <text x="90" y="508" font-size="12" font-weight="700" fill="#181922" text-anchor="middle">Driver</text>

    <!-- Actors Right -->
    <circle cx="1090" cy="140" r="18" class="actor-head"/>
    <line x1="1090" y1="158" x2="1090" y2="205" class="actor-body"/>
    <line x1="1065" y1="175" x2="1115" y2="175" class="actor-body"/>
    <line x1="1090" y1="205" x2="1070" y2="245" class="actor-body"/>
    <line x1="1090" y1="205" x2="1110" y2="245" class="actor-body"/>
    <text x="1090" y="268" font-size="12" font-weight="700" fill="#181922" text-anchor="middle">Family Guardian</text>

    <circle cx="1090" cy="580" r="18" class="actor-head"/>
    <line x1="1090" y1="598" x2="1090" y2="645" class="actor-body"/>
    <line x1="1065" y1="615" x2="1115" y2="615" class="actor-body"/>
    <line x1="1090" y1="645" x2="1070" y2="685" class="actor-body"/>
    <line x1="1090" y1="645" x2="1110" y2="685" class="actor-body"/>
    <text x="1090" y="708" font-size="12" font-weight="700" fill="#181922" text-anchor="middle">Payment Gateway</text>

    <ellipse cx="320" cy="130" rx="65" ry="20" class="box"/>
    <text x="320" y="134" class="lbl" text-anchor="middle">UC-01: Register/OTP</text>

    <ellipse cx="490" cy="130" rx="70" ry="20" class="box"/>
    <text x="490" y="134" class="lbl" text-anchor="middle">UC-03: Favorite Places</text>

    <ellipse cx="400" cy="195" rx="80" ry="20" class="box-highlight"/>
    <text x="400" y="199" class="lbl" text-anchor="middle">UC-04: Family Guardians</text>

    <ellipse cx="330" cy="330" rx="70" ry="20" class="box"/>
    <text x="330" y="334" class="lbl" text-anchor="middle">UC-06: Set Pickup/Dest</text>

    <ellipse cx="490" cy="330" rx="70" ry="20" class="box"/>
    <text x="490" y="334" class="lbl" text-anchor="middle">UC-08: Add Extra Stops</text>

    <ellipse cx="330" cy="400" rx="70" ry="20" class="box-highlight"/>
    <text x="330" y="404" class="lbl" text-anchor="middle">UC-10: Call Taxi Now</text>

    <ellipse cx="490" cy="400" rx="70" ry="20" class="box"/>
    <text x="490" y="404" class="lbl" text-anchor="middle">UC-11: 15s Cascading</text>

    <ellipse cx="410" cy="470" rx="75" ry="20" class="box"/>
    <text x="410" y="474" class="lbl" text-anchor="middle">UC-14: In-App Chat</text>

    <ellipse cx="780" cy="130" rx="80" ry="22" class="box-highlight"/>
    <text x="780" y="134" class="lbl" text-anchor="middle">UC-16: Live Family Track</text>

    <ellipse cx="780" cy="195" rx="85" ry="22" class="box-alert"/>
    <text x="780" y="199" class="lbl" text-anchor="middle">UC-17: Route Deviation Alert</text>

    <ellipse cx="780" cy="265" rx="85" ry="22" class="box"/>
    <text x="780" y="269" class="lbl" text-anchor="middle">UC-18: CCTV Video Cloud</text>

    <ellipse cx="360" cy="620" rx="80" ry="22" class="box"/>
    <text x="360" y="624" class="lbl" text-anchor="middle">UC-21: Cash Settlement</text>

    <ellipse cx="580" cy="620" rx="85" ry="22" class="box-highlight"/>
    <text x="580" y="624" class="lbl" text-anchor="middle">UC-23: E-Wallet DeepLink</text>

    <ellipse cx="800" cy="620" rx="80" ry="22" class="box"/>
    <text x="800" y="624" class="lbl" text-anchor="middle">UC-26: Driver Payout</text>

    <line x1="120" y1="160" x2="255" y2="130" class="line"/>
    <line x1="120" y1="180" x2="320" y2="195" class="line"/>
    <line x1="120" y1="200" x2="260" y2="330" class="line"/>
    <line x1="120" y1="220" x2="260" y2="400" class="line"/>
    <line x1="120" y1="240" x2="495" y2="620" class="line"/>
    <line x1="120" y1="400" x2="335" y2="470" class="line"/>
    <line x1="120" y1="420" x2="695" y2="265" class="line"/>
    <line x1="120" y1="440" x2="720" y2="620" class="line"/>
    <line x1="1060" y1="160" x2="860" y2="130" class="line-gold"/>
    <line x1="1060" y1="180" x2="865" y2="195" class="line-red"/>
    <line x1="1060" y1="600" x2="665" y2="620" class="line"/>
    <line x1="1060" y1="620" x2="880" y2="620" class="line"/>
    """
    return svg_wrapper(c, w, h, "01_Use_Case_Model")

def generate_02_flowchart():
    w, h = 1350, 780
    c = """
    <rect x="30" y="20" width="240" height="680" class="box"/>
    <rect x="30" y="20" width="240" height="35" class="hdr-box"/>
    <text x="150" y="42" class="hdr-text" text-anchor="middle">1. PASSENGER APP</text>

    <rect x="290" y="20" width="240" height="680" class="box"/>
    <rect x="290" y="20" width="240" height="35" class="hdr-box"/>
    <text x="410" y="42" class="hdr-text" text-anchor="middle">2. GO DISPATCH ENGINE</text>

    <rect x="550" y="20" width="240" height="680" class="box"/>
    <rect x="550" y="20" width="240" height="35" class="hdr-box"/>
    <text x="670" y="42" class="hdr-text" text-anchor="middle">3. DRIVER APP</text>

    <rect x="810" y="20" width="240" height="680" class="box"/>
    <rect x="810" y="20" width="240" height="35" class="hdr-box"/>
    <text x="930" y="42" class="hdr-text" text-anchor="middle">4. SAFETY SHIELD</text>

    <rect x="1070" y="20" width="240" height="680" class="box"/>
    <rect x="1070" y="20" width="240" height="35" class="hdr-box"/>
    <text x="1190" y="42" class="hdr-text" text-anchor="middle">5. FINANCIAL SETTLEMENT</text>

    <rect x="50" y="80" width="200" height="40" class="box"/>
    <text x="150" y="105" class="lbl" text-anchor="middle">Select Pickup &amp; Dest (+Stops)</text>

    <rect x="50" y="150" width="200" height="40" class="box-highlight"/>
    <text x="150" y="175" class="lbl" text-anchor="middle">Review Fare &amp; Tap 'Call Now'</text>

    <rect x="310" y="150" width="200" height="40" class="box"/>
    <text x="410" y="175" class="lbl" text-anchor="middle">Redis GEORADIUS 3km Search</text>

    <rect x="310" y="220" width="200" height="40" class="box"/>
    <text x="410" y="245" class="lbl" text-anchor="middle">Dispatch 15s Cascading Offer</text>

    <rect x="570" y="220" width="200" height="40" class="box"/>
    <text x="670" y="245" class="lbl" text-anchor="middle">Driver Receives Offer &amp; Accepts</text>

    <rect x="570" y="290" width="200" height="40" class="box"/>
    <text x="670" y="315" class="lbl" text-anchor="middle">Drive to Pickup &amp; Start Trip</text>

    <rect x="830" y="290" width="200" height="45" class="box-highlight"/>
    <text x="930" y="312" class="lbl" text-anchor="middle">Activate Guardian Live Stream</text>
    <text x="930" y="325" class="txt" text-anchor="middle">(Push 'Ride Started' to Family)</text>

    <rect x="830" y="360" width="200" height="45" class="box-alert"/>
    <text x="930" y="382" class="lbl" text-anchor="middle">Off-Route Anomaly Monitor</text>
    <text x="930" y="395" class="txt" text-anchor="middle">(d_xt &gt; 300m Siren Trigger)</text>

    <rect x="830" y="430" width="200" height="40" class="box"/>
    <text x="930" y="455" class="lbl" text-anchor="middle">In-Car CCTV Rolling Chunks</text>

    <rect x="570" y="500" width="200" height="40" class="box"/>
    <text x="670" y="525" class="lbl" text-anchor="middle">Arrive Destination &amp; Lock Meter</text>

    <rect x="1090" y="500" width="200" height="45" class="box-highlight"/>
    <text x="1190" y="522" class="lbl" text-anchor="middle">E-Wallet Deep-Link (KBZPay)</text>
    <text x="1190" y="535" class="txt" text-anchor="middle">(Biometric / PIN Verification)</text>

    <rect x="1090" y="570" width="200" height="40" class="box"/>
    <text x="1190" y="595" class="lbl" text-anchor="middle">HMAC Webhook &amp; Driver Credit</text>

    <rect x="570" y="630" width="200" height="40" class="box-highlight"/>
    <text x="670" y="655" class="lbl" text-anchor="middle">Instant Sales Transfer / Payout</text>

    <line x1="150" y1="120" x2="150" y2="150" class="line" marker-end="url(#arrow)"/>
    <line x1="250" y1="170" x2="310" y2="170" class="line" marker-end="url(#arrow)"/>
    <line x1="410" y1="190" x2="410" y2="220" class="line" marker-end="url(#arrow)"/>
    <line x1="510" y1="240" x2="570" y2="240" class="line" marker-end="url(#arrow)"/>
    <line x1="670" y1="260" x2="670" y2="290" class="line" marker-end="url(#arrow)"/>
    <line x1="770" y1="310" x2="830" y2="310" class="line-gold" marker-end="url(#arrow-gold)"/>
    <line x1="930" y1="335" x2="930" y2="360" class="line" marker-end="url(#arrow)"/>
    <line x1="930" y1="405" x2="930" y2="430" class="line" marker-end="url(#arrow)"/>
    <line x1="670" y1="330" x2="670" y2="500" class="line" marker-end="url(#arrow)"/>
    <line x1="770" y1="520" x2="1090" y2="520" class="line-gold" marker-end="url(#arrow-gold)"/>
    <line x1="1190" y1="545" x2="1190" y2="570" class="line" marker-end="url(#arrow)"/>
    <line x1="1090" y1="590" x2="770" y2="650" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "02_System_Process_Flowchart")

def generate_03_erd():
    w, h = 1350, 780
    c = """
    <rect x="40" y="30" width="260" height="150" class="box"/>
    <rect x="40" y="30" width="260" height="24" class="hdr-box"/>
    <text x="170" y="47" class="hdr-text" text-anchor="middle">USERS</text>
    <text x="50" y="70" class="txt-pk">PK  id : uuid</text>
    <text x="50" y="86" class="txt">UQ  phone_number : varchar(20)</text>
    <text x="50" y="102" class="txt">    full_name : varchar(100)</text>
    <text x="50" y="118" class="txt">    role : varchar(20)</text>
    <text x="50" y="134" class="txt">    is_active : boolean</text>

    <rect x="40" y="210" width="260" height="140" class="box-highlight"/>
    <rect x="40" y="210" width="260" height="24" class="badge-gold"/>
    <text x="170" y="227" fill="#181922" font-size="12" font-weight="700" text-anchor="middle">GUARDIAN_RELATIONSHIPS</text>
    <text x="50" y="250" class="txt-pk">PK  id : uuid</text>
    <text x="50" y="266" class="txt-fk">FK  passenger_id : uuid</text>
    <text x="50" y="282" class="txt-fk">FK  guardian_id : uuid</text>
    <text x="50" y="298" class="txt">    notify_deviation : boolean</text>

    <rect x="40" y="380" width="260" height="140" class="box-alert"/>
    <rect x="40" y="380" width="260" height="24" class="badge-red"/>
    <text x="170" y="397" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">SAFETY_ALERTS</text>
    <text x="50" y="420" class="txt-pk">PK  id : uuid</text>
    <text x="50" y="436" class="txt-fk">FK  ride_id : uuid</text>
    <text x="50" y="452" class="txt">    deviation_meters : decimal</text>
    <text x="50" y="468" class="txt">    status : varchar(30)</text>

    <rect x="360" y="30" width="260" height="170" class="box"/>
    <rect x="360" y="30" width="260" height="24" class="hdr-box"/>
    <text x="490" y="47" class="hdr-text" text-anchor="middle">DRIVERS</text>
    <text x="370" y="70" class="txt-pk">PK  id : uuid</text>
    <text x="370" y="86" class="txt-fk">FK  user_id : uuid</text>
    <text x="370" y="102" class="txt">    status : varchar(20)</text>
    <text x="370" y="118" class="txt">    current_lat / lng : decimal</text>
    <text x="370" y="134" class="txt">    rating_avg : decimal(3,2)</text>
    <text x="370" y="150" class="txt">    is_verified : boolean</text>

    <rect x="360" y="230" width="260" height="130" class="box"/>
    <rect x="360" y="230" width="260" height="24" class="hdr-box"/>
    <text x="490" y="247" class="hdr-text" text-anchor="middle">VEHICLES</text>
    <text x="370" y="270" class="txt-pk">PK  id : uuid</text>
    <text x="370" y="286" class="txt-fk">FK  driver_id : uuid</text>
    <text x="370" y="302" class="txt">UQ  license_plate : varchar(20)</text>
    <text x="370" y="318" class="txt">    cctv_device_serial : varchar(100)</text>

    <rect x="360" y="390" width="260" height="140" class="box"/>
    <rect x="360" y="390" width="260" height="24" class="hdr-box"/>
    <text x="490" y="407" class="hdr-text" text-anchor="middle">GPS_TELEMETRY_LOGS</text>
    <text x="370" y="430" class="txt-pk">PK  id : uuid</text>
    <text x="370" y="446" class="txt-fk">FK  ride_id : uuid</text>
    <text x="370" y="462" class="txt">    speed_kmh : decimal</text>
    <text x="370" y="478" class="txt">    recorded_at : timestamp</text>

    <rect x="680" y="30" width="280" height="210" class="box"/>
    <rect x="680" y="30" width="280" height="24" class="hdr-box"/>
    <text x="820" y="47" class="hdr-text" text-anchor="middle">RIDES (Master Order)</text>
    <text x="690" y="70" class="txt-pk">PK  id : uuid</text>
    <text x="690" y="86" class="txt-fk">FK  passenger_id : uuid</text>
    <text x="690" y="102" class="txt-fk">FK  driver_id : uuid</text>
    <text x="690" y="118" class="txt">    status : varchar(30)</text>
    <text x="690" y="134" class="txt">    estimated_fare : decimal</text>
    <text x="690" y="150" class="txt">    actual_fare : decimal</text>
    <text x="690" y="166" class="txt">    payment_method : varchar(20)</text>

    <rect x="680" y="270" width="280" height="120" class="box"/>
    <rect x="680" y="270" width="280" height="24" class="hdr-box"/>
    <text x="820" y="287" class="hdr-text" text-anchor="middle">RIDE_WAYPOINTS (Extra Stops)</text>
    <text x="690" y="310" class="txt-pk">PK  id : uuid</text>
    <text x="690" y="326" class="txt-fk">FK  ride_id : uuid</text>
    <text x="690" y="342" class="txt">    stop_order : integer</text>

    <rect x="680" y="420" width="280" height="140" class="box"/>
    <rect x="680" y="420" width="280" height="24" class="hdr-box"/>
    <text x="820" y="437" class="hdr-text" text-anchor="middle">CCTV_RECORDINGS (Vault)</text>
    <text x="690" y="460" class="txt-pk">PK  id : uuid</text>
    <text x="690" y="476" class="txt-fk">FK  ride_id : uuid</text>
    <text x="690" y="492" class="txt">    hash_sha256 : varchar(64)</text>

    <rect x="1020" y="30" width="280" height="160" class="box"/>
    <rect x="1020" y="30" width="280" height="24" class="hdr-box"/>
    <text x="1160" y="47" class="hdr-text" text-anchor="middle">PAYMENTS</text>
    <text x="1030" y="70" class="txt-pk">PK  id : uuid</text>
    <text x="1030" y="86" class="txt-fk">FK  ride_id : uuid</text>
    <text x="1030" y="102" class="txt">UQ  transaction_ref : varchar(100)</text>
    <text x="1030" y="118" class="txt">    gateway_provider : varchar(30)</text>

    <rect x="1020" y="220" width="280" height="140" class="box-highlight"/>
    <rect x="1020" y="220" width="280" height="24" class="badge-gold"/>
    <text x="1160" y="237" fill="#181922" font-size="12" font-weight="700" text-anchor="middle">DRIVER_WALLETS</text>
    <text x="1030" y="260" class="txt-pk">PK  id : uuid</text>
    <text x="1030" y="276" class="txt-fk">FK  driver_id : uuid</text>
    <text x="1030" y="292" class="txt">    available_balance : decimal</text>

    <rect x="1020" y="390" width="280" height="140" class="box"/>
    <rect x="1020" y="390" width="280" height="24" class="hdr-box"/>
    <text x="1160" y="407" class="hdr-text" text-anchor="middle">DRIVER_PAYOUTS</text>
    <text x="1030" y="430" class="txt-pk">PK  id : uuid</text>
    <text x="1030" y="446" class="txt-fk">FK  wallet_id : uuid</text>
    <text x="1030" y="462" class="txt">    amount : decimal</text>

    <line x1="300" y1="70" x2="360" y2="70" class="line" marker-end="url(#arrow)"/>
    <line x1="170" y1="180" x2="170" y2="210" class="line" marker-end="url(#arrow)"/>
    <line x1="300" y1="100" x2="680" y2="100" class="line" marker-end="url(#arrow)"/>
    <line x1="620" y1="70" x2="680" y2="70" class="line" marker-end="url(#arrow)"/>
    <line x1="820" y1="240" x2="820" y2="270" class="line" marker-end="url(#arrow)"/>
    <line x1="820" y1="390" x2="820" y2="420" class="line" marker-end="url(#arrow)"/>
    <line x1="960" y1="100" x2="1020" y2="100" class="line" marker-end="url(#arrow)"/>
    <line x1="620" y1="150" x2="1020" y2="270" class="line" marker-end="url(#arrow)"/>
    <line x1="1160" y1="360" x2="1160" y2="390" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "03_Database_ERD_Schema")

def generate_04_component():
    w, h = 1200, 720
    c = """
    <rect x="40" y="20" width="1120" height="100" class="box-pkg"/>
    <text x="60" y="44" class="txt-bold">TIER 1: CLIENT TIER (NATIVE MOBILE &amp; DYNAMIC PLUGINS)</text>
    <rect x="60" y="55" width="320" height="50" class="box"/>
    <text x="220" y="85" class="lbl" text-anchor="middle">Passenger App (SwiftUI / Compose)</text>
    <rect x="440" y="55" width="320" height="50" class="box"/>
    <text x="600" y="85" class="lbl" text-anchor="middle">Driver App (Digital Meter &amp; CCTV)</text>
    <rect x="820" y="55" width="320" height="50" class="box-highlight"/>
    <text x="980" y="85" class="lbl" text-anchor="middle">Guardian Dynamic Plugin (~3.8MB)</text>

    <rect x="40" y="140" width="1120" height="70" class="box"/>
    <rect x="40" y="140" width="1120" height="24" class="hdr-box"/>
    <text x="600" y="157" class="hdr-text" text-anchor="middle">TIER 2: GO API GATEWAY &amp; EDGE REVERSE PROXY (TLS 1.3, Rate Limiting, JWT Auth)</text>
    <text x="600" y="192" class="txt" text-anchor="middle">Multiplexed WebSocket Hub | gRPC Telemetry Ingestion | RESTful Routes</text>

    <rect x="40" y="230" width="1120" height="130" class="box-pkg"/>
    <text x="60" y="254" class="txt-bold">TIER 3: GO APPLICATION CORE SERVICES (CLEAN ARCHITECTURE)</text>
    <rect x="60" y="270" width="200" height="70" class="box"/>
    <text x="160" y="300" class="lbl" text-anchor="middle">Auth &amp; User Service</text>
    <rect x="290" y="270" width="200" height="70" class="box"/>
    <text x="390" y="300" class="lbl" text-anchor="middle">Dispatch Engine</text>
    <rect x="520" y="270" width="200" height="70" class="box"/>
    <text x="620" y="300" class="lbl" text-anchor="middle">Real-Time Hub</text>
    <rect x="750" y="270" width="200" height="70" class="box-alert"/>
    <text x="850" y="300" class="lbl" text-anchor="middle">Safety &amp; Plugin Hub</text>
    <rect x="980" y="270" width="160" height="70" class="box-highlight"/>
    <text x="1060" y="300" class="lbl" text-anchor="middle">Payment Service</text>

    <rect x="40" y="380" width="1120" height="120" class="box-pkg"/>
    <text x="60" y="404" class="txt-bold">TIER 4: PERSISTENCE, SPATIAL CACHE &amp; MEDIA VAULT</text>
    <rect x="60" y="420" width="340" height="60" class="box"/>
    <text x="230" y="448" class="lbl" text-anchor="middle">PostgreSQL 16 + PostGIS</text>
    <rect x="440" y="420" width="340" height="60" class="box"/>
    <text x="610" y="448" class="lbl" text-anchor="middle">Redis 7 Cluster</text>
    <rect x="820" y="420" width="320" height="60" class="box"/>
    <text x="980" y="448" class="lbl" text-anchor="middle">Encrypted S3 Media Vault</text>

    <rect x="40" y="520" width="1120" height="90" class="box-pkg"/>
    <text x="60" y="544" class="txt-bold">TIER 5: EXTERNAL INTEGRATIONS</text>
    <rect x="60" y="555" width="340" height="40" class="box"/>
    <text x="230" y="580" class="lbl" text-anchor="middle">OSRM / Mapbox Routing Engine</text>
    <rect x="440" y="555" width="340" height="40" class="box"/>
    <text x="610" y="580" class="lbl" text-anchor="middle">Bank Webhooks (KBZPay / AYAPay / Wave)</text>
    <rect x="820" y="555" width="320" height="40" class="box"/>
    <text x="980" y="580" class="lbl" text-anchor="middle">Apple APNs &amp; Google FCM Push</text>
    """
    return svg_wrapper(c, w, h, "04_Component_Architecture")

def generate_05_class():
    w, h = 1200, 720
    c = """
    <rect x="40" y="20" width="340" height="180" class="box"/>
    <rect x="40" y="20" width="340" height="24" class="hdr-box"/>
    <text x="210" y="37" class="hdr-text" text-anchor="middle">Ride (Domain Entity)</text>
    <text x="50" y="60" class="txt-bold">+ ID: UUID</text>
    <text x="50" y="78" class="txt-bold">+ PassengerID: UUID</text>
    <text x="50" y="96" class="txt-bold">+ DriverID: *UUID</text>
    <text x="50" y="114" class="txt-bold">+ Status: RideStatus</text>
    <line x1="40" y1="125" x2="380" y2="125" class="line"/>
    <text x="50" y="145" class="txt">+ AddWaypoint(GeoPoint): error</text>
    <text x="50" y="165" class="txt">+ TransitionTo(RideStatus): error</text>

    <rect x="420" y="20" width="340" height="180" class="box-highlight"/>
    <rect x="420" y="20" width="340" height="24" class="badge-gold"/>
    <text x="590" y="37" fill="#181922" font-size="12" font-weight="700" text-anchor="middle">SafetySession (Domain Entity)</text>
    <text x="430" y="60" class="txt-bold">+ RideID: UUID</text>
    <text x="430" y="78" class="txt-bold">+ GuardianActive: bool</text>
    <text x="430" y="96" class="txt-bold">+ CCTVActive: bool</text>
    <line x1="420" y1="125" x2="760" y2="125" class="line"/>
    <text x="430" y="145" class="txt">+ CheckCrossTrack(GeoPoint): bool</text>
    <text x="430" y="165" class="txt">+ TriggerEmergencyAlarm(): error</text>

    <rect x="800" y="20" width="360" height="180" class="box"/>
    <rect x="800" y="20" width="360" height="24" class="hdr-box"/>
    <text x="980" y="37" class="hdr-text" text-anchor="middle">DriverWallet (Domain Entity)</text>
    <text x="810" y="60" class="txt-bold">+ DriverID: UUID</text>
    <text x="810" y="78" class="txt-bold">+ Balance: Money</text>
    <text x="810" y="96" class="txt-bold">+ PendingBalance: Money</text>
    <line x1="800" y1="125" x2="1160" y2="125" class="line"/>
    <text x="810" y="145" class="txt">+ Credit(Money): error</text>
    <text x="810" y="165" class="txt">+ RequestPayout(Money): error</text>

    <rect x="40" y="240" width="540" height="200" class="box-pkg"/>
    <text x="60" y="265" class="txt-bold">&lt;&lt;interface&gt;&gt; RideUseCase (Go Application Port)</text>
    <text x="60" y="295" class="txt">+ RequestRide(ctx, req): (Ride, error)</text>
    <text x="60" y="325" class="txt">+ DispatchNextCandidate(ctx, rideID): error</text>
    <text x="60" y="355" class="txt">+ AcceptRideOffer(ctx, rideID, driverID): error</text>
    <text x="60" y="385" class="txt">+ CompleteRide(ctx, rideID): error</text>

    <rect x="620" y="240" width="540" height="200" class="box-pkg"/>
    <text x="640" y="265" class="txt-bold">&lt;&lt;interface&gt;&gt; SafetyUseCase (Go Application Port)</text>
    <text x="640" y="295" class="txt">+ StreamDriverTelemetry(ctx, rideID, pt): error</text>
    <text x="640" y="325" class="txt">+ ActivateGuardianStream(ctx, rideID): error</text>
    <text x="640" y="355" class="txt">+ UploadCCTVChunk(ctx, rideID, chunk): error</text>
    <text x="640" y="385" class="txt">+ TerminateSafetySession(ctx, rideID): error</text>
    """
    return svg_wrapper(c, w, h, "05_Class_Domain_Architecture")

def generate_06_seq_dispatch():
    w, h = 1200, 680
    c = """
    <!-- Lifelines -->
    <rect x="60" y="20" width="160" height="40" class="box"/><text x="140" y="45" class="lbl" text-anchor="middle">Passenger App</text>
    <line x1="140" y1="60" x2="140" y2="580" class="line-dashed"/>

    <rect x="290" y="20" width="160" height="40" class="box"/><text x="370" y="45" class="lbl" text-anchor="middle">Go API Gateway</text>
    <line x1="370" y1="60" x2="370" y2="580" class="line-dashed"/>

    <rect x="520" y="20" width="160" height="40" class="box"/><text x="600" y="45" class="lbl" text-anchor="middle">Go Dispatch Engine</text>
    <line x1="600" y1="60" x2="600" y2="580" class="line-dashed"/>

    <rect x="750" y="20" width="160" height="40" class="box"/><text x="830" y="45" class="lbl" text-anchor="middle">Redis 7 Cluster</text>
    <line x1="830" y1="60" x2="830" y2="580" class="line-dashed"/>

    <rect x="980" y="20" width="160" height="40" class="box"/><text x="1060" y="45" class="lbl" text-anchor="middle">Candidate Drivers</text>
    <line x1="1060" y1="60" x2="1060" y2="580" class="line-dashed"/>

    <!-- Messages -->
    <line x1="140" y1="100" x2="370" y2="100" class="line" marker-end="url(#arrow)"/><text x="255" y="92" class="txt" text-anchor="middle">1. POST /estimate (Stops, Polyline)</text>
    <line x1="370" y1="130" x2="140" y2="130" class="line-dashed" marker-end="url(#arrow)"/><text x="255" y="122" class="txt" text-anchor="middle">2. Return Fare &amp; Route Polyline</text>
    <line x1="140" y1="170" x2="370" y2="170" class="line" marker-end="url(#arrow)"/><text x="255" y="162" class="txt" text-anchor="middle">3. POST /rides/request ('Call Now')</text>
    <line x1="370" y1="200" x2="600" y2="200" class="line" marker-end="url(#arrow)"/><text x="485" y="192" class="txt" text-anchor="middle">4. MatchAndDispatch(rideID)</text>
    <line x1="600" y1="230" x2="830" y2="230" class="line" marker-end="url(#arrow)"/><text x="715" y="222" class="txt" text-anchor="middle">5. GEORADIUS 3.0km Search</text>
    <line x1="830" y1="260" x2="600" y2="260" class="line-dashed" marker-end="url(#arrow)"/><text x="715" y="252" class="txt" text-anchor="middle">6. Ranked Drivers: [D1, D2]</text>
    <line x1="600" y1="300" x2="1060" y2="300" class="line-gold" marker-end="url(#arrow-gold)"/><text x="830" y="292" class="txt-bold" text-anchor="middle">7. Push Offer (15s Countdown to D1)</text>
    <line x1="1060" y1="340" x2="600" y2="340" class="line-dashed" marker-end="url(#arrow)"/><text x="830" y="332" class="txt" text-anchor="middle">8. Driver 1 Timeout (15s elapsed)</text>
    <line x1="600" y1="380" x2="1060" y2="380" class="line-gold" marker-end="url(#arrow-gold)"/><text x="830" y="372" class="txt-bold" text-anchor="middle">9. Cascade Offer to Driver 2</text>
    <line x1="1060" y1="420" x2="600" y2="420" class="line" marker-end="url(#arrow)"/><text x="830" y="412" class="txt" text-anchor="middle">10. Driver 2 Accepts Offer</text>
    <line x1="600" y1="460" x2="140" y2="460" class="line" marker-end="url(#arrow)"/><text x="370" y="452" class="txt" text-anchor="middle">11. Push: Driver Assigned &amp; ETA</text>
    <line x1="140" y1="500" x2="1060" y2="500" class="line" marker-end="url(#arrow)"/><text x="600" y="492" class="txt" text-anchor="middle">12. In-App Chat Active (WebSocket Room)</text>
    """
    return svg_wrapper(c, w, h, "06_Sequence_Dispatch_Chat")

def generate_07_seq_safety():
    w, h = 1200, 680
    c = """
    <rect x="60" y="20" width="160" height="40" class="box"/><text x="140" y="45" class="lbl" text-anchor="middle">Driver App (CCTV)</text>
    <line x1="140" y1="60" x2="140" y2="580" class="line-dashed"/>

    <rect x="290" y="20" width="160" height="40" class="box"/><text x="370" y="45" class="lbl" text-anchor="middle">Go Safety Engine</text>
    <line x1="370" y1="60" x2="370" y2="580" class="line-dashed"/>

    <rect x="520" y="20" width="160" height="40" class="box-alert"/><text x="600" y="45" class="lbl" text-anchor="middle">Deviation Detector</text>
    <line x1="600" y1="60" x2="600" y2="580" class="line-dashed"/>

    <rect x="750" y="20" width="160" height="40" class="box-highlight"/><text x="830" y="45" class="lbl" text-anchor="middle">Family Guardian App</text>
    <line x1="830" y1="60" x2="830" y2="580" class="line-dashed"/>

    <rect x="980" y="20" width="160" height="40" class="box"/><text x="1060" y="45" class="lbl" text-anchor="middle">S3 Cloud Vault</text>
    <line x1="1060" y1="60" x2="1060" y2="580" class="line-dashed"/>

    <line x1="140" y1="100" x2="370" y2="100" class="line" marker-end="url(#arrow)"/><text x="255" y="92" class="txt" text-anchor="middle">1. Driver Taps 'Start Ride'</text>
    <line x1="370" y1="140" x2="830" y2="140" class="line-gold" marker-end="url(#arrow-gold)"/><text x="600" y="132" class="txt-bold" text-anchor="middle">2. Push: 'Ride Started' to Family Guardians</text>
    <line x1="140" y1="180" x2="370" y2="180" class="line" marker-end="url(#arrow)"/><text x="255" y="172" class="txt" text-anchor="middle">3. Stream Telemetry (lat, lng, speed every 2s)</text>
    <line x1="370" y1="220" x2="830" y2="220" class="line-gold" marker-end="url(#arrow-gold)"/><text x="600" y="212" class="txt" text-anchor="middle">4. Stream Real-Time Vehicle Position (60fps)</text>
    <line x1="370" y1="260" x2="600" y2="260" class="line" marker-end="url(#arrow)"/><text x="485" y="252" class="txt" text-anchor="middle">5. CheckCrossTrack(currentPt, polyline)</text>
    <line x1="600" y1="300" x2="370" y2="300" class="line-red" marker-end="url(#arrow-red)"/><text x="485" y="292" class="txt-bold" text-anchor="middle">6. Anomaly: d_xt &gt; 300m for &gt; 45s</text>
    <line x1="370" y1="340" x2="830" y2="340" class="line-red" marker-end="url(#arrow-red)"/><text x="600" y="332" class="txt-bold" text-anchor="middle">7. CRITICAL SIREN ALERT to Family</text>
    <line x1="140" y1="400" x2="1060" y2="400" class="line" marker-end="url(#arrow)"/><text x="600" y="392" class="txt" text-anchor="middle">8. Upload Encrypted CCTV Video Chunk + SHA-256 Digest</text>
    """
    return svg_wrapper(c, w, h, "07_Sequence_Safety_Guardian_CCTV")

def generate_08_seq_payment():
    w, h = 1200, 680
    c = """
    <rect x="60" y="20" width="160" height="40" class="box"/><text x="140" y="45" class="lbl" text-anchor="middle">Passenger App</text>
    <line x1="140" y1="60" x2="140" y2="580" class="line-dashed"/>

    <rect x="290" y="20" width="160" height="40" class="box"/><text x="370" y="45" class="lbl" text-anchor="middle">Go Billing Service</text>
    <line x1="370" y1="60" x2="370" y2="580" class="line-dashed"/>

    <rect x="520" y="20" width="160" height="40" class="box-highlight"/><text x="600" y="45" class="lbl" text-anchor="middle">E-Wallet (KBZPay)</text>
    <line x1="600" y1="60" x2="600" y2="580" class="line-dashed"/>

    <rect x="750" y="20" width="160" height="40" class="box"/><text x="830" y="45" class="lbl" text-anchor="middle">Bank Webhook API</text>
    <line x1="830" y1="60" x2="830" y2="580" class="line-dashed"/>

    <rect x="980" y="20" width="160" height="40" class="box"/><text x="1060" y="45" class="lbl" text-anchor="middle">Driver Wallet</text>
    <line x1="1060" y1="60" x2="1060" y2="580" class="line-dashed"/>

    <line x1="140" y1="100" x2="370" y2="100" class="line" marker-end="url(#arrow)"/><text x="255" y="92" class="txt" text-anchor="middle">1. POST /payments/initiate-cashless</text>
    <line x1="370" y1="140" x2="140" y2="140" class="line-dashed" marker-end="url(#arrow)"/><text x="255" y="132" class="txt" text-anchor="middle">2. Return DeepLink ('kbzpay://pay?...')</text>
    <line x1="140" y1="180" x2="600" y2="180" class="line-gold" marker-end="url(#arrow-gold)"/><text x="370" y="172" class="txt-bold" text-anchor="middle">3. OS Deep-Link Jump to Wallet App</text>
    <line x1="600" y1="220" x2="830" y2="220" class="line" marker-end="url(#arrow)"/><text x="715" y="212" class="txt" text-anchor="middle">4. Authorize PIN / Biometrics</text>
    <line x1="830" y1="260" x2="370" y2="260" class="line" marker-end="url(#arrow)"/><text x="600" y="252" class="txt" text-anchor="middle">5. Webhook Callback (SHA-256 HMAC Signature)</text>
    <line x1="600" y1="300" x2="140" y2="300" class="line-dashed" marker-end="url(#arrow)"/><text x="370" y="292" class="txt" text-anchor="middle">6. Deep-Link Jump Back to Taxi App</text>
    <line x1="370" y1="340" x2="1060" y2="340" class="line-gold" marker-end="url(#arrow-gold)"/><text x="715" y="332" class="txt-bold" text-anchor="middle">7. Atomic Credit Driver Wallet Balance</text>
    <line x1="1060" y1="400" x2="370" y2="400" class="line" marker-end="url(#arrow)"/><text x="715" y="392" class="txt" text-anchor="middle">8. POST /drivers/wallet/transfer (Payout)</text>
    <line x1="370" y1="440" x2="830" y2="440" class="line" marker-end="url(#arrow)"/><text x="600" y="432" class="txt" text-anchor="middle">9. Disburse Funds via Gateway API</text>
    """
    return svg_wrapper(c, w, h, "08_Sequence_Payment_Payout")

def generate_09_state_ride():
    w, h = 1200, 680
    c = """
    <circle cx="100" cy="180" r="16" fill="#181922"/>
    <rect x="180" y="150" width="160" height="60" class="box"/><text x="260" y="185" class="lbl" text-anchor="middle">DRAFT</text>
    <rect x="400" y="150" width="160" height="60" class="box"/><text x="480" y="185" class="lbl" text-anchor="middle">SEARCHING</text>
    <rect x="620" y="150" width="160" height="60" class="box-highlight"/><text x="700" y="185" class="lbl" text-anchor="middle">DISPATCHED (15s)</text>
    <rect x="840" y="150" width="160" height="60" class="box"/><text x="920" y="185" class="lbl" text-anchor="middle">ARRIVING PICKUP</text>
    
    <rect x="840" y="300" width="160" height="60" class="box-highlight"/><text x="920" y="335" class="lbl" text-anchor="middle">IN_TRANSIT (Safety)</text>
    <rect x="620" y="300" width="160" height="60" class="box"/><text x="700" y="335" class="lbl" text-anchor="middle">ARRIVED DESTINATION</text>
    <rect x="400" y="300" width="160" height="60" class="box"/><text x="480" y="335" class="lbl" text-anchor="middle">PAYMENT_PENDING</text>
    <rect x="180" y="300" width="160" height="60" class="box"/><text x="260" y="335" class="lbl" text-anchor="middle">COMPLETED</text>
    <circle cx="100" cy="330" r="16" fill="#181922"/><circle cx="100" cy="330" r="20" fill="none" stroke="#181922" stroke-width="2"/>

    <line x1="116" y1="180" x2="180" y2="180" class="line" marker-end="url(#arrow)"/>
    <line x1="340" y1="180" x2="400" y2="180" class="line" marker-end="url(#arrow)"/>
    <line x1="560" y1="180" x2="620" y2="180" class="line" marker-end="url(#arrow)"/>
    <line x1="780" y1="180" x2="840" y2="180" class="line" marker-end="url(#arrow)"/>
    <line x1="920" y1="210" x2="920" y2="300" class="line" marker-end="url(#arrow)"/>
    <line x1="840" y1="330" x2="780" y2="330" class="line" marker-end="url(#arrow)"/>
    <line x1="620" y1="330" x2="560" y2="330" class="line" marker-end="url(#arrow)"/>
    <line x1="400" y1="330" x2="340" y2="330" class="line" marker-end="url(#arrow)"/>
    <line x1="180" y1="330" x2="120" y2="330" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "09_State_Machine_Ride_Lifecycle")

def generate_10_state_driver():
    w, h = 1200, 680
    c = """
    <circle cx="100" cy="180" r="16" fill="#181922"/>
    <rect x="180" y="150" width="160" height="60" class="box"/><text x="260" y="185" class="lbl" text-anchor="middle">OFFLINE</text>
    <rect x="400" y="150" width="180" height="60" class="box-highlight"/><text x="490" y="185" class="lbl" text-anchor="middle">AVAILABLE (Online)</text>
    <rect x="640" y="150" width="160" height="60" class="box"/><text x="720" y="185" class="lbl" text-anchor="middle">BREAK_TIME</text>
    <rect x="860" y="150" width="160" height="60" class="box"/><text x="940" y="185" class="lbl" text-anchor="middle">ON_ANOTHER_DUTY</text>

    <rect x="400" y="300" width="180" height="60" class="box"/><text x="490" y="335" class="lbl" text-anchor="middle">OFFER_RECEIVED (15s)</text>
    <rect x="640" y="300" width="160" height="60" class="box"/><text x="720" y="335" class="lbl" text-anchor="middle">EN_ROUTE_PICKUP</text>
    <rect x="860" y="300" width="160" height="60" class="box-highlight"/><text x="940" y="335" class="lbl" text-anchor="middle">ON_TRIP_PROTECTED</text>
    <rect x="860" y="440" width="160" height="60" class="box"/><text x="940" y="475" class="lbl" text-anchor="middle">SALES_SUMMARY</text>

    <line x1="116" y1="180" x2="180" y2="180" class="line" marker-end="url(#arrow)"/>
    <line x1="340" y1="180" x2="400" y2="180" class="line" marker-end="url(#arrow)"/>
    <line x1="580" y1="170" x2="640" y2="170" class="line" marker-end="url(#arrow)"/>
    <line x1="640" y1="190" x2="580" y2="190" class="line" marker-end="url(#arrow)"/>
    <line x1="490" y1="210" x2="490" y2="300" class="line" marker-end="url(#arrow)"/>
    <line x1="580" y1="330" x2="640" y2="330" class="line" marker-end="url(#arrow)"/>
    <line x1="800" y1="330" x2="860" y2="330" class="line" marker-end="url(#arrow)"/>
    <line x1="940" y1="360" x2="940" y2="440" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "10_State_Machine_Driver_Status")

def generate_11_guardian_plugin():
    w, h = 1350, 720
    c = """
    <rect x="30" y="20" width="400" height="620" class="box-pkg"/>
    <rect x="30" y="20" width="400" height="30" class="hdr-box"/>
    <text x="230" y="40" class="hdr-text" text-anchor="middle">PASSENGER APP (CORE HOST)</text>
    
    <rect x="50" y="70" width="360" height="60" class="box"/>
    <text x="230" y="98" class="lbl" text-anchor="middle">Core App Shell (Booking &amp; Auth)</text>
    <text x="230" y="115" class="txt" text-anchor="middle">Lightweight Base (~18MB)</text>

    <rect x="50" y="150" width="360" height="80" class="box-highlight"/>
    <text x="230" y="178" class="lbl" text-anchor="middle">Dynamic Feature Module Manager</text>
    <text x="230" y="198" class="txt" text-anchor="middle">Play Feature Delivery / Dynamic Framework</text>
    <text x="230" y="214" class="txt" text-anchor="middle">Signature &amp; SHA-256 Verifier</text>

    <rect x="50" y="250" width="360" height="70" class="box"/>
    <text x="230" y="278" class="lbl" text-anchor="middle">Modular Event Bus &amp; UI Slot</text>
    <text x="230" y="298" class="txt" text-anchor="middle">Mounts Guardian HUD upon download</text>

    <rect x="470" y="20" width="420" height="620" class="box-highlight" stroke-dasharray="4 4"/>
    <rect x="470" y="20" width="420" height="30" class="badge-gold"/>
    <text x="680" y="40" fill="#181922" font-size="12" font-weight="700" text-anchor="middle">GUARDIAN PLUGIN PACKAGE (~3.8MB)</text>

    <rect x="490" y="70" width="380" height="70" class="box"/>
    <text x="680" y="98" class="lbl" text-anchor="middle">1. Family Mesh Pairing Engine</text>
    <text x="680" y="118" class="txt" text-anchor="middle">QR Code &amp; 6-Digit OTP Pairing Token</text>

    <rect x="490" y="160" width="380" height="70" class="box"/>
    <text x="680" y="188" class="lbl" text-anchor="middle">2. Live Telemetry Stream Renderer</text>
    <text x="680" y="208" class="txt" text-anchor="middle">WebRTC &amp; WebSocket 60fps Interpolation</text>

    <rect x="490" y="250" width="380" height="70" class="box-alert"/>
    <text x="680" y="278" class="lbl" text-anchor="middle">3. Cross-Track Route Deviation Engine</text>
    <text x="680" y="298" class="txt" text-anchor="middle">d_xt &gt; 300m for &gt; 45s Anomaly Alert</text>

    <rect x="490" y="340" width="380" height="70" class="box"/>
    <text x="680" y="368" class="lbl" text-anchor="middle">4. Emergency SOS Siren &amp; DND Bypass</text>
    <text x="680" y="388" class="txt" text-anchor="middle">Apple Critical Alerts / Android High-Priority</text>

    <rect x="930" y="20" width="390" height="620" class="box-pkg"/>
    <rect x="930" y="20" width="390" height="30" class="hdr-box"/>
    <text x="1125" y="40" class="hdr-text" text-anchor="middle">GO BACKEND DYNAMIC PLUGIN HUB</text>

    <rect x="950" y="70" width="350" height="70" class="box"/>
    <text x="1125" y="98" class="lbl" text-anchor="middle">Plugin Manifest Registry (/manifest)</text>
    <text x="1125" y="118" class="txt" text-anchor="middle">Version Negotiation &amp; Whitelist Hash</text>

    <rect x="950" y="160" width="350" height="70" class="box"/>
    <text x="1125" y="188" class="lbl" text-anchor="middle">Dynamic Delivery CDN (S3 / R2)</text>
    <text x="1125" y="208" class="txt" text-anchor="middle">Encrypted Split Packages &amp; Fast Edge</text>

    <rect x="950" y="250" width="350" height="70" class="box"/>
    <text x="1125" y="278" class="lbl" text-anchor="middle">Family Mesh Signaling Server</text>
    <text x="1125" y="298" class="txt" text-anchor="middle">OTP Validation &amp; Telemetry Relayer</text>

    <line x1="410" y1="190" x2="490" y2="105" class="line-gold" marker-end="url(#arrow-gold)"/>
    <line x1="870" y1="105" x2="950" y2="105" class="line" marker-end="url(#arrow)"/>
    <line x1="870" y1="195" x2="950" y2="285" class="line" marker-end="url(#arrow)"/>
    <line x1="410" y1="285" x2="490" y2="285" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "11_Guardian_Plugin_Module_Architecture")

def generate_12_driver_sos():
    w, h = 1350, 720
    c = """
    <!-- Column 1: Victim Driver Node -->
    <rect x="30" y="20" width="400" height="620" class="box-alert"/>
    <rect x="30" y="20" width="400" height="30" class="badge-red"/>
    <text x="230" y="40" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">1. DRIVER IN DISTRESS (DRIVER APP)</text>

    <rect x="50" y="70" width="360" height="75" class="box"/>
    <text x="230" y="98" class="lbl" text-anchor="middle">Multi-Mode Panic Triggers</text>
    <text x="230" y="118" class="txt" text-anchor="middle">Triple Volume Key / Long-Press / BLE Beacon</text>
    <text x="230" y="132" class="txt" text-anchor="middle">&gt;3.5G Collision Impact Detection</text>

    <rect x="50" y="165" width="360" height="75" class="box"/>
    <text x="230" y="193" class="lbl" text-anchor="middle">High-Frequency Telemetry Emitter</text>
    <text x="230" y="213" class="txt" text-anchor="middle">1-Second Real-Time GPS Breadcrumbs</text>
    <text x="230" y="227" class="txt" text-anchor="middle">In-Car CCTV 1080p Video Buffer Lock</text>

    <rect x="50" y="260" width="360" height="75" class="box-highlight"/>
    <text x="230" y="288" class="lbl" text-anchor="middle">Driver Family Guardian Plugin</text>
    <text x="230" y="308" class="txt" text-anchor="middle">On-Demand Module (`:plugin_driver_guardian`)</text>
    <text x="230" y="322" class="txt" text-anchor="middle">Direct P2P Link to Spouse / Parents</text>

    <!-- Column 2: Go Backend Emergency Engine & Redis Spatial Hub -->
    <rect x="470" y="20" width="410" height="620" class="box-pkg"/>
    <rect x="470" y="20" width="410" height="30" class="hdr-box"/>
    <text x="675" y="40" class="hdr-text" text-anchor="middle">2. GO EMERGENCY HUB &amp; REDIS SPATIAL</text>

    <rect x="490" y="70" width="370" height="75" class="box"/>
    <text x="675" y="98" class="lbl" text-anchor="middle">Incident Coordinator &amp; Audit Log</text>
    <text x="675" y="118" class="txt" text-anchor="middle">Creates `SOS_INCIDENT` in PostgreSQL</text>
    <text x="675" y="132" class="txt" text-anchor="middle">SHA-256 Tamper-Proof Cryptographic Lock</text>

    <rect x="490" y="165" width="370" height="75" class="box-alert"/>
    <text x="675" y="193" class="lbl" text-anchor="middle">Tier 1: 1.0 km Immediate Radius</text>
    <text x="675" y="213" class="txt" text-anchor="middle">GEORADIUS drivers:available 1.0km</text>
    <text x="675" y="227" class="txt" text-anchor="middle">Instant WebSocket Critical Alarm Broadcast</text>

    <rect x="490" y="260" width="370" height="75" class="box"/>
    <text x="675" y="288" class="lbl" text-anchor="middle">30s Escalation Engine (Tier 2: 3.0 km)</text>
    <text x="675" y="308" class="txt" text-anchor="middle">Auto-Cascades if &lt; 2 Responders Acknowledge</text>
    <text x="675" y="322" class="txt" text-anchor="middle">Police Webhook &amp; LarBar Rapid Response</text>

    <!-- Column 3: Fellow Driver Mesh & Family Guardian -->
    <rect x="920" y="20" width="400" height="620" class="box-highlight"/>
    <rect x="920" y="20" width="400" height="30" class="badge-gold"/>
    <text x="1120" y="40" fill="#181922" font-size="12" font-weight="700" text-anchor="middle">3. DRIVER MESH &amp; FAMILY GUARDIAN</text>

    <rect x="940" y="70" width="360" height="75" class="box-alert"/>
    <text x="1120" y="98" class="lbl" text-anchor="middle">Fellow Drivers (Within 1.0 km)</text>
    <text x="1120" y="118" class="txt" text-anchor="middle">Plate: 3A-8492 | Distance: 250m ahead</text>
    <text x="1120" y="132" class="txt" text-anchor="middle">1-Tap 'I Am Responding / En Route' Action</text>

    <rect x="940" y="165" width="360" height="75" class="box"/>
    <text x="1120" y="193" class="lbl" text-anchor="middle">Extended Drivers (Within 3.0 km)</text>
    <text x="1120" y="213" class="txt" text-anchor="middle">Tier 2 Broadcast to 50 Online Drivers</text>
    <text x="1120" y="227" class="txt" text-anchor="middle">Perimeter Interception Routing</text>

    <rect x="940" y="260" width="360" height="75" class="box-highlight"/>
    <text x="1120" y="288" class="lbl" text-anchor="middle">Driver Family Guardian (Spouse / Parents)</text>
    <text x="1120" y="308" class="txt" text-anchor="middle">DND Override Siren Alarm Sound</text>
    <text x="1120" y="322" class="txt" text-anchor="middle">Real-Time Live Map &amp; Direct Navigation</text>

    <rect x="940" y="355" width="360" height="50" class="box"/>
    <text x="1120" y="380" class="lbl" text-anchor="middle">Police &amp; LarBar Rapid Response Team</text>
    <text x="1120" y="395" class="txt" text-anchor="middle">Fleet Security Dashboard HUD</text>

    <!-- Connectors -->
    <line x1="410" y1="107" x2="490" y2="107" class="line-red" marker-end="url(#arrow-red)"/>
    <line x1="675" y1="145" x2="675" y2="165" class="line" marker-end="url(#arrow)"/>
    <line x1="860" y1="202" x2="940" y2="107" class="line-red" marker-end="url(#arrow-red)"/>
    <line x1="675" y1="240" x2="675" y2="260" class="line" marker-end="url(#arrow)"/>
    <line x1="860" y1="297" x2="940" y2="202" class="line-red" marker-end="url(#arrow-red)"/>
    <line x1="410" y1="297" x2="940" y2="297" class="line-gold" marker-end="url(#arrow-gold)"/>
    <line x1="860" y1="315" x2="940" y2="380" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "12_Driver_SOS_Mesh_Guardian_Architecture")

def generate_13_hetzner_3server():
    w, h = 1350, 720
    c = """
    <!-- Server 1: Edge & API Gateway -->
    <rect x="30" y="20" width="400" height="620" class="box-alert"/>
    <rect x="30" y="20" width="400" height="30" class="badge-red"/>
    <text x="230" y="40" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">SERVER 1: API &amp; GATEWAY (10.0.0.1 - CPX31)</text>

    <rect x="50" y="70" width="360" height="75" class="box"/>
    <text x="230" y="98" class="lbl" text-anchor="middle">Caddy 2 Reverse Proxy (Auto TLS 1.3)</text>
    <text x="230" y="118" class="txt" text-anchor="middle">Ports 80 &amp; 443 Public Listeners</text>
    <text x="230" y="132" class="txt" text-anchor="middle">Let's Encrypt SSL &amp; DDoS Rate Limit</text>

    <rect x="50" y="165" width="360" height="95" class="box"/>
    <text x="230" y="193" class="lbl" text-anchor="middle">Go Core API Engine (`larbar-core-api`)</text>
    <text x="230" y="213" class="txt" text-anchor="middle">JWT Auth &amp; 15s Cascading Dispatch</text>
    <text x="230" y="227" class="txt" text-anchor="middle">Driver Emergency SOS Tier 1/2 Engine</text>
    <text x="230" y="241" class="txt" text-anchor="middle">FCM / APNs Myanmar Telco Push Gateway</text>

    <rect x="50" y="280" width="360" height="75" class="box"/>
    <text x="230" y="308" class="lbl" text-anchor="middle">60fps Real-Time WebSocket Gateway</text>
    <text x="230" y="328" class="txt" text-anchor="middle">Live Telemetry &amp; In-Trip Chat Relay</text>

    <!-- Server 2: Live Map & Spatial Routing Engine -->
    <rect x="470" y="20" width="410" height="620" class="box-highlight"/>
    <rect x="470" y="20" width="410" height="30" class="badge-gold"/>
    <text x="675" y="40" fill="#181922" font-size="12" font-weight="700" text-anchor="middle">SERVER 2: LIVE MAP &amp; OSRM (10.0.0.2 - CPX41)</text>

    <rect x="490" y="70" width="370" height="85" class="box"/>
    <text x="675" y="98" class="lbl" text-anchor="middle">TileServer GL (Self-Hosted OSM Tiles)</text>
    <text x="675" y="118" class="txt" text-anchor="middle">Vector MBTiles for Myanmar Map View</text>
    <text x="675" y="132" class="txt" text-anchor="middle">Zero Third-Party Map API Charges</text>

    <rect x="490" y="175" width="370" height="100" class="box"/>
    <text x="675" y="203" class="lbl" text-anchor="middle">OSRM Myanmar Router (Port 5000)</text>
    <text x="675" y="223" class="txt" text-anchor="middle">Compiled `myanmar-latest.osrm` (MLD)</text>
    <text x="675" y="237" class="txt" text-anchor="middle">Yangon Downtown 1-Way Grid &amp; Tolls</text>
    <text x="675" y="251" class="txt" text-anchor="middle">Yangon Municipal Motorbike Exclusion</text>

    <rect x="490" y="295" width="370" height="85" class="box"/>
    <text x="675" y="323" class="lbl" text-anchor="middle">Redis 7 Spatial Cluster (Port 6379)</text>
    <text x="675" y="343" class="txt" text-anchor="middle">GEORADIUS 1km - 3km Driver Matching</text>
    <text x="675" y="357" class="txt" text-anchor="middle">1-Second Live GPS Breadcrumb Buffer</text>

    <!-- Server 3: PostGIS DB & Storage Vault -->
    <rect x="920" y="20" width="400" height="620" class="box-pkg"/>
    <rect x="920" y="20" width="400" height="30" class="hdr-box"/>
    <text x="1120" y="40" class="hdr-text" text-anchor="middle">SERVER 3: POSTGIS &amp; VAULT (10.0.0.3)</text>

    <rect x="940" y="70" width="360" height="85" class="box"/>
    <text x="1120" y="98" class="lbl" text-anchor="middle">PostgreSQL 16 + PostGIS 3.4 (Port 5432)</text>
    <text x="1120" y="118" class="txt" text-anchor="middle">18 Production Relational Tables</text>
    <text x="1120" y="132" class="txt" text-anchor="middle">GIST Spatial Indexes (EPSG:4326)</text>

    <rect x="940" y="175" width="360" height="85" class="box"/>
    <text x="1120" y="203" class="lbl" text-anchor="middle">MinIO S3 Video Vault (Port 9000)</text>
    <text x="1120" y="223" class="txt" text-anchor="middle">In-Car CCTV 1080p Video Archive</text>
    <text x="1120" y="237" class="txt" text-anchor="middle">SHA-256 Tamper-Proof Cryptographic Log</text>

    <rect x="940" y="280" width="360" height="75" class="box"/>
    <text x="1120" y="308" class="lbl" text-anchor="middle">Hetzner Remote Storage Box (1 TB)</text>
    <text x="1120" y="328" class="txt" text-anchor="middle">Hourly Encrypted `pg_dump` Backups</text>

    <!-- Connectors over Private VPC (10.0.0.0/24) -->
    <line x1="410" y1="210" x2="490" y2="210" class="line-gold" marker-end="url(#arrow-gold)"/>
    <line x1="410" y1="240" x2="490" y2="330" class="line-gold" marker-end="url(#arrow-gold)"/>
    <line x1="410" y1="180" x2="940" y2="110" class="line" marker-end="url(#arrow)"/>
    <line x1="410" y1="260" x2="940" y2="215" class="line" marker-end="url(#arrow)"/>
    <line x1="1120" y1="160" x2="1120" y2="280" class="line" marker-end="url(#arrow)"/>
    """
    return svg_wrapper(c, w, h, "13_Hetzner_3Server_LiveMap_Architecture")

def generate_all_svgs():
    svg_generators = [
        ("01_use_case_diagram.svg", generate_01_use_case),
        ("02_system_process_flowchart.svg", generate_02_flowchart),
        ("03_database_erd_schema.svg", generate_03_erd),
        ("04_component_architecture.svg", generate_04_component),
        ("05_class_domain_architecture.svg", generate_05_class),
        ("06_sequence_dispatch_chat.svg", generate_06_seq_dispatch),
        ("07_sequence_safety_guardian_cctv.svg", generate_07_seq_safety),
        ("08_sequence_payment_and_payout.svg", generate_08_seq_payment),
        ("09_state_machine_ride_lifecycle.svg", generate_09_state_ride),
        ("10_state_machine_driver_status.svg", generate_10_state_driver),
        ("11_guardian_plugin_module_architecture.svg", generate_11_guardian_plugin),
        ("12_driver_sos_mesh_guardian.svg", generate_12_driver_sos),
        ("13_hetzner_3server_livemap.svg", generate_13_hetzner_3server),
    ]

    for fname, gen in svg_generators:
        content = gen()
        target = os.path.join(OUTPUT_DIR, fname)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Generated SVG: {target}")

if __name__ == "__main__":
    generate_all_svgs()


