#!/usr/bin/env python3
"""Generate the readable v2 Taxi application system flow update PDF without third-party packages."""

from pathlib import Path
from textwrap import wrap

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "Taxi application system flow update.pdf"
W, H = 1440, 900

INK=(15,23,42); MUTED=(71,85,105); LINE=(203,213,225); BG=(248,250,252)
GOLD=(245,158,11); RED=(229,37,42); BLUE=(37,99,235); GREEN=(5,150,105); WHITE=(255,255,255); NAV=(17,24,39)

def rgb(c): return " ".join(f"{x/255:.3f}" for x in c)
def esc(s): return s.replace("\\","\\\\").replace("(","\\(").replace(")","\\)")

class Canvas:
    def __init__(self): self.ops=[]
    def rect(self,x,y,w,h,fill=WHITE,stroke=LINE,r=0,lw=1):
        py=H-y-h; self.ops += [f"{rgb(fill)} rg {rgb(stroke)} RG {lw} w {x} {py} {w} {h} re B"]
    def line(self,x1,y1,x2,y2,color=LINE,lw=2):
        self.ops += [f"{rgb(color)} RG {lw} w {x1} {H-y1} m {x2} {H-y2} l S"]
    def text(self,x,y,s,size=14,bold=False,color=INK):
        font="/F2" if bold else "/F1"; self.ops += [f"BT {rgb(color)} rg {font} {size} Tf 1 0 0 1 {x} {H-y-size} Tm ({esc(s)}) Tj ET"]
    def paragraph(self,x,y,s,width_chars=48,size=12,leading=17,color=MUTED,bold=False):
        for line in wrap(s,width_chars): self.text(x,y,line,size,bold,color); y+=leading
        return y
    def pill(self,x,y,label,color=BLUE):
        w=max(86,len(label)*7+22); self.rect(x,y,w,28,tuple(int((v+255*4)/5) for v in color),color); self.text(x+11,y+7,label,10,True,color); return w
    def box(self,x,y,w,h,title,body,color=BLUE,number=None):
        self.rect(x,y,w,h,WHITE,LINE)
        self.rect(x,y,7,h,color,color)
        if number: self.pill(x+20,y+17,number,color)
        self.text(x+20,y+55 if number else y+22,title,17,True,INK)
        self.paragraph(x+20,y+82 if number else y+52,body,max(24,int((w-40)/7.2)),11,16,MUTED)
    def arrow(self,x1,y1,x2,y2,color=MUTED):
        self.line(x1,y1,x2,y2,color,2)
        self.line(x2,y2,x2-10,y2-6,color,2); self.line(x2,y2,x2-10,y2+6,color,2)
    def bytes(self): return ("\n".join(self.ops)).encode("latin-1")

def header(c,kicker,title,subtitle,page):
    c.rect(0,0,W,H,BG,BG); c.text(58,42,"LABAR TAXI PLATFORM",13,True,GOLD); c.text(58,75,title,31,True,INK); c.text(58,116,subtitle,14,False,MUTED); c.pill(1260,42,f"V2 / PAGE {page}",BLUE); c.line(58,148,1382,148,LINE,1)

def page1():
    c=Canvas(); header(c,"OVERVIEW","Product ecosystem and trust boundaries","Five apps, one platform core, explicit identity and safety boundaries",1)
    apps=[("Passenger","Book, ride, pay, rate",GOLD),("Driver","Shift, trips, meter, payout",RED),("Guardian","Family live safety shield",GREEN),("DriverReg","Staff-assisted KYC capture",BLUE),("Admin Control","Review, staff, roles, audit",(124,58,237))]
    x=58
    for name,body,color in apps:
        c.box(x,190,244,145,name,body,color); x+=266
    c.text(58,390,"Shared platform services",20,True)
    services=[("Identity & RBAC","Staff MFA, grant ceilings, driver activation"),("KYC Orchestrator","OCR, liveness, comparison, case state"),("Dispatch & Realtime","PostGIS/Redis matching, chat, live GPS"),("Safety Hub","Safety Drawer, SOS, Guardian, CCTV"),("Payments","Cash, KBZPay, WavePay, settlement")]
    x=58
    for title,body in services:
        c.box(x,425,244,140,title,body,NAV); x+=266
    c.rect(58,620,1324,180,NAV,NAV)
    c.text(85,652,"Core architectural rule",18,True,GOLD)
    c.paragraph(85,686,"Driver onboarding is not part of the Driver ride app. DriverReg creates a consented KYC case; an independent reviewer decides it; only approval can issue a one-time Driver App activation invitation.",95,15,22,WHITE)
    c.paragraph(85,755,"Raw identity media stays encrypted and access-controlled. Operational ride services consume only the minimum verified driver profile and compliance status.",105,13,19,(203,213,225))
    return c

def page2():
    c=Canvas(); header(c,"DRIVERREG","Driver registration and activation flow","Camera OCR, NRC, face/liveness, vehicle compliance, manual review",2)
    steps=[("Consent","Purpose, retention, staff identity"),("Personal","Name, DOB -> age, phone, address"),("NRC","Front/back, parser, masking"),("Licence OCR","Quality, barcode, per-field confidence"),("Face","Liveness before similarity"),("Vehicle","Plate, type, VIN, RTAD, insurance"),("Submit","Attestation and locked snapshot"),("Review","Approve, rework, or reject"),("Activate","Driver ID and one-time invite")]
    positions=[]
    for i,(title,body) in enumerate(steps):
        row=i//5; col=i%5; x=58+col*266; y=190+row*250; positions.append((x,y)); c.box(x,y,230,170,title,body,BLUE if i<7 else GREEN,f"{i+1:02d}")
        if col and i!=5: c.arrow(x-34,y+85,x-4,y+85)
    c.text(58,695,"Decision and quality rules",19,True)
    rules=[">= 0.90: OCR may autofill but remains editable","0.75-0.89: require explicit staff confirmation","< 0.75, expiry, duplicate, or mismatch: manual review","Registrar cannot approve own case; score is never sole decision"]
    y=735
    for r in rules:
        c.text(68,y,"-",15,True,RED); c.text(88,y,r,13,False,INK); y+=30
    return c

def page3():
    c=Canvas(); header(c,"ACCESS CONTROL","Staff roles and account registration","Least privilege, grant ceilings, independent review, immutable audit",3)
    roles=[("GOD_ADMIN","Break-glass owner. Creates/revokes executive superadmins. Hardware MFA; no daily use.",RED),
           ("EXEC_SUPERADMIN","CEO, CTO, and PSO are equal labels on one permission set.",(124,58,237)),
           ("KYC_MANAGER / REVIEWER","Assigns and decides cases. Reviewer must be independent from registrar.",BLUE),
           ("DRIVER_REGISTRAR","Captures and submits branch cases. Cannot approve.",GREEN),
           ("STAFF_REGISTRAR","Invites only marketer, support, or registrar roles. No privilege elevation.",GOLD),
           ("MARKETER / SUPPORT / AUDITOR","Leads; masked support; or read-only oversight according to role.",MUTED)]
    y=185
    for i,(title,body,color) in enumerate(roles):
        col=i%2; row=i//2; c.box(58+col*672,y+row*180,630,145,title,body,color)
    c.rect(58,740,1302,90,(255,247,237),(254,215,170))
    c.text(82,765,"Safe marketer onboarding rule",15,True,(194,65,12))
    c.text(82,795,"A marketer may create driver leads. Staff invitations require the separate STAFF_REGISTRAR scope and cannot grant admin, executive, security, or audit roles.",12,False,(154,52,18))
    return c

def page4():
    c=Canvas(); header(c,"RIDE + SAFETY","Revised passenger and driver flow","The normal ride flow stays familiar; emergency controls use a discreet, accessible drawer",4)
    ride=[("Passenger plan","Pickup, stops, destination, tier"),("Fare + request","Route, estimate, payment preference"),("15s dispatch","Rank and cascade nearby drivers"),("Driver accepts","Navigate, chat, arrive pickup"),("Trip active","Meter, route, Guardian, CCTV"),("Complete","Fare lock, payment, rating, payout")]
    x=58
    for i,(title,body) in enumerate(ride):
        c.box(x,190,195,150,title,body,GOLD if i<3 else RED,f"{i+1:02d}");
        if i: c.arrow(x-31,265,x-4,265)
        x+=219
    c.text(58,410,"Discreet Safety Drawer",22,True)
    c.box(58,455,390,255,"Collapsed normal state","Persistent shield icon; one deliberate tap; screen-reader label; no dominant panic panel.",BLUE)
    c.box(525,455,390,255,"Opened drawer","Hold 2 seconds; cancel countdown; alert LaBar Safety; share location; record evidence; call emergency services; silent mode.",RED)
    c.box(992,455,390,255,"Active incident","Cannot remain hidden. Persistent incident strip, responder state, Guardian updates, evidence lock, and controlled resolve/cancel.",GREEN)
    c.arrow(452,580,516,580); c.arrow(919,580,983,580)
    c.rect(58,755,1324,70,NAV,NAV); c.text(84,778,"Incoming responder alerts remain interruptive. Hidden means visually collapsed, never undiscoverable or inaccessible.",14,True,WHITE)
    return c

def page5():
    c=Canvas(); header(c,"DATA + PROTOTYPE","Implementation and Figma handoff map","Authoritative fields, protected media, audit evidence, and import-ready artifacts",5)
    cols=[("Identity","DOB is authoritative; age is computed. NRC is normalized, encrypted, and masked in lists."),
          ("Documents","Encrypted object keys, SHA-256 fingerprint, quality metrics, OCR raw and normalized values."),
          ("Biometrics","Profile media, liveness result, face score, provider/version, manual-review requirement."),
          ("Vehicle","Plate, type, make/model/year, VIN, engine, insurance, RTAD inspection, wheel tax, CCTV ID."),
          ("Governance","Consent, registering staff, reviewer, decisions, corrections, role grants, sensitive views.")]
    x=58
    for title,body in cols: c.box(x,190,244,190,title,body,BLUE); x+=266
    c.text(58,445,"Prototype deliverables",20,True)
    files=[("Interactive hub","public/prototypes/index.html"),("DriverReg prototype","public/prototypes/driverreg-app.html"),("Admin prototype","public/prototypes/admin-control-center.html"),("Figma plan","design/figma-prototype-plan.md"),("Import canvas","public/wireframes/labar_master_figma_canvas_v2.svg"),("Tokens","design-system/figma_tokens.json")]
    y=490
    for i,(name,path) in enumerate(files):
        col=i%2; row=i//2; x=58+col*672; yy=y+row*92
        c.rect(x,yy,630,72,WHITE,LINE); c.text(x+18,yy+17,name,13,True); c.text(x+18,yy+41,path,11,False,MUTED)
    c.rect(58,790,1302,60,(239,246,255),(147,197,253)); c.text(82,811,"Import the v2 SVG and Tokens Studio JSON into Figma, convert repeated groups to components, wire the documented branches, then save/export the authoritative native .fig file.",12,True,(29,78,216))
    return c

def write_pdf(pages):
    objects={1:b"<< /Type /Catalog /Pages 2 0 R >>",3:b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",4:b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"}
    kids=[]
    for i,page in enumerate(pages):
        pnum=5+i*2; cnum=pnum+1; kids.append(f"{pnum} 0 R")
        stream=page.bytes(); objects[cnum]=b"<< /Length %d >>\nstream\n"%len(stream)+stream+b"\nendstream"
        objects[pnum]=f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {W} {H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {cnum} 0 R >>".encode()
    objects[2]=f"<< /Type /Pages /Kids [{' '.join(kids)}] /Count {len(kids)} >>".encode()
    data=bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"); offsets=[0]
    for n in range(1,max(objects)+1):
        offsets.append(len(data)); data += f"{n} 0 obj\n".encode()+objects[n]+b"\nendobj\n"
    xref=len(data); data += f"xref\n0 {len(offsets)}\n".encode()+b"0000000000 65535 f \n"
    for off in offsets[1:]: data += f"{off:010d} 00000 n \n".encode()
    data += f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    TARGET.write_bytes(data)

if __name__ == "__main__":
    write_pdf([page1(),page2(),page3(),page4(),page5()])
    print(f"Generated {TARGET}")
