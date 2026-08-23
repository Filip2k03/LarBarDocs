#!/usr/bin/env python3
"""Generate Figma-importable DriverReg/Admin SVG frames and the v2 master canvas."""

from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "wireframes"
OUT.mkdir(parents=True, exist_ok=True)

DRIVERREG = [
    ("Staff sign-in", ["Staff ID / phone", "Password or passkey", "MFA code", "Branch + trusted device"]),
    ("Consent & case", ["Purpose and retention notice", "Driver consent", "Assisting staff identity", "Create case ID"]),
    ("Personal details", ["Legal name (EN / MY)", "DOB → calculated age", "Phone + address", "Emergency contact"]),
    ("NRC capture", ["Front / back camera", "Edge, glare, blur checks", "Structured NRC parser", "Masked confirmation"]),
    ("Driving licence scan", ["Live camera mask", "Front / back detection", "Barcode + OCR", "Encrypted upload"]),
    ("OCR review", ["Licence number • 96%", "Name + NRC • 97%", "DOB + class", "Expiry conflict → review"]),
    ("Face & liveness", ["Blink / turn challenge", "94% face similarity", "Profile image", "Manual review path"]),
    ("Vehicle & compliance", ["Plate + vehicle type", "Make/model/year/color", "VIN + engine", "RTAD/insurance/wheel tax"]),
    ("Review & submit", ["Section status", "Mismatch resolution", "Staff attestation", "Consent receipt"]),
    ("Case status", ["Submitted / correction", "Reviewer notes", "Approval + Driver invite", "Immutable audit trail"]),
]

ADMIN = [
    ("Operations dashboard", ["24 pending cases", "6 near SLA", "18 approved today", "37 active sessions"]),
    ("Driver case review", ["Document ↔ OCR comparison", "NRC / DOB cross-check", "Liveness + face score", "Approve / rework / reject"]),
    ("Staff accounts", ["Secure invitation", "Branch assignment", "Limited role picker", "MFA enrollment"]),
    ("Roles & access", ["GOD_ADMIN break-glass", "CEO / CTO / PSO equal", "Registrar vs reviewer", "No privilege escalation"]),
    ("Audit log", ["Document views", "Case decisions", "Role changes", "Session revocations"]),
]

def text(x, y, value, size=14, weight=600, color="#0F172A", anchor="start"):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{escape(value)}</text>'

def mobile_svg(title, rows, index):
    chunks = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">',
        '<rect width="390" height="844" rx="46" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>',
        '<rect x="130" y="12" width="130" height="28" rx="14" fill="#0F172A"/>',
        '<rect y="48" width="390" height="54" fill="#FFFFFF" stroke="#E2E8F0"/>',
        text(22, 81, "LaBar", 19, 900, "#D97706"),
        '<rect x="88" y="66" width="82" height="20" rx="10" fill="#DBEAFE"/>',
        text(129, 80, "DRIVERREG", 9, 900, "#2563EB", "middle"),
        text(22, 133, f"STEP {index:02d} / 10", 10, 900, "#2563EB"),
        text(22, 164, title, 23, 900),
        '<rect x="22" y="180" width="346" height="6" rx="3" fill="#E2E8F0"/>',
        f'<rect x="22" y="180" width="{34.6*index:.1f}" height="6" rx="3" fill="#F59E0B"/>',
    ]
    y = 218
    if index == 5:
        chunks += ['<rect x="22" y="210" width="346" height="250" rx="18" fill="#111827"/>',
                   '<rect x="44" y="245" width="302" height="178" rx="12" fill="#ECFCCB" stroke="#A3E635" stroke-width="2"/>',
                   text(195, 329, "MYANMAR DRIVING LICENCE", 14, 900, "#365314", "middle"),
                   text(195, 352, "Camera sample • edges detected", 11, 700, "#4D7C0F", "middle")]
        y = 490
    for row in rows:
        chunks += [f'<rect x="22" y="{y}" width="346" height="64" rx="13" fill="#F8FAFC" stroke="#E2E8F0"/>',
                   '<circle cx="43" cy="%s" r="8" fill="#D1FAE5"/>' % (y+32),
                   text(43, y+36, "✓", 10, 900, "#059669", "middle"), text(60, y+37, row, 13, 750)]
        y += 74
    chunks += ['<rect x="22" y="758" width="346" height="56" rx="14" fill="#F59E0B"/>',
               text(195, 792, "CONTINUE", 15, 900, "#FFFFFF", "middle"),
               '</svg>']
    return "".join(chunks)

def admin_svg(title, rows, index):
    chunks = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1024" width="1440" height="1024">',
              '<rect width="1440" height="1024" fill="#F8FAFC"/>','<rect width="250" height="1024" fill="#111827"/>',
              text(28, 58, "LaBar Control", 25, 900, "#F59E0B"),text(28, 112, "PSO • EXEC_SUPERADMIN", 12, 750, "#CBD5E1")]
    nav = ["Dashboard", "Driver review", "Staff accounts", "Roles & access", "Audit log"]
    y=170
    for i,item in enumerate(nav,1):
        if i==index: chunks.append(f'<rect x="16" y="{y-26}" width="218" height="46" rx="10" fill="#FFFFFF" fill-opacity=".12"/>')
        chunks.append(text(34,y,item,14,800,"#FFFFFF" if i==index else "#94A3B8")); y+=60
    chunks += [text(292,68,title,30,900),text(292,94,"LaBar Admin Control Center • MFA verified",13,600,"#64748B")]
    x=292
    for i,row in enumerate(rows):
        chunks += [f'<rect x="{x}" y="150" width="250" height="135" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>',
                   text(x+20,190,row,14,800),text(x+20,242,str([24,6,18,37][i] if index==1 else "Verified"),26,900,"#D97706")]
        x+=270
    chunks += ['<rect x="292" y="320" width="1100" height="600" rx="18" fill="#FFFFFF" stroke="#E2E8F0"/>',text(320,365,"Source-backed workspace",18,900)]
    y=415
    for row in rows:
        chunks += [f'<rect x="320" y="{y}" width="1040" height="78" rx="12" fill="#F8FAFC" stroke="#E2E8F0"/>',
                   text(350,y+34,row,15,850),text(350,y+57,"Permission checked • action recorded in audit log",11,600,"#64748B")]
        y+=96
    chunks.append('</svg>')
    return "".join(chunks)

def master_canvas():
    width, mobile_y, admin_y = 2220, 140, 2050
    height = 3300
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
         '<rect width="100%" height="100%" fill="#F1F5F9"/>',text(50,55,"LABAR PRODUCT ECOSYSTEM — FIGMA IMPORT CANVAS V2",31,900,"#D97706"),
         text(50,88,"Passenger • Driver • Guardian • DriverReg • Admin Control Center",16,700,"#475569"),text(50,125,"DRIVERREG MOBILE FRAMES",14,900,"#2563EB")]
    for i,(title,_) in enumerate(DRIVERREG):
        col,row=i%5,i//5;x=50+col*430;y=mobile_y+row*900
        out += [f'<rect x="{x}" y="{y}" width="390" height="844" rx="46" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>',
                text(x+20,y+50,"LaBar  •  DRIVERREG",17,900,"#D97706"),text(x+20,y+92,f"{i+1:02d}. {title}",21,900),
                f'<rect x="{x+20}" y="{y+115}" width="350" height="6" rx="3" fill="#E2E8F0"/>',f'<rect x="{x+20}" y="{y+115}" width="{35*(i+1)}" height="6" rx="3" fill="#F59E0B"/>']
        yy=y+155
        for row_text in DRIVERREG[i][1]:
            out += [f'<rect x="{x+20}" y="{yy}" width="350" height="70" rx="13" fill="#F8FAFC" stroke="#E2E8F0"/>',text(x+42,yy+42,"✓ "+row_text,13,750)]
            yy+=84
        out += [f'<rect x="{x+20}" y="{y+760}" width="350" height="56" rx="14" fill="#F59E0B"/>',text(x+195,y+795,"CONTINUE",14,900,"#FFFFFF","middle")]
    out += [text(50,admin_y-25,"ADMIN CONTROL CENTER DESKTOP FRAMES",14,900,"#2563EB")]
    scale=.46
    for i,(title,rows) in enumerate(ADMIN):
        col,row=i%2,i//2;x=50+col*1060;y=admin_y+row*430
        out += [f'<rect x="{x}" y="{y}" width="1020" height="390" rx="16" fill="#FFFFFF" stroke="#CBD5E1"/>',f'<rect x="{x}" y="{y}" width="180" height="390" rx="16" fill="#111827"/>',
                text(x+22,y+42,"LaBar Control",17,900,"#F59E0B"),text(x+210,y+52,f"{i+1:02d}. {title}",23,900)]
        yy=y+100
        for r in rows:
            out += [f'<rect x="{x+210}" y="{yy}" width="770" height="54" rx="10" fill="#F8FAFC" stroke="#E2E8F0"/>',text(x+232,yy+33,r,13,750)]
            yy+=66
    out.append('</svg>');return "".join(out)

def main():
    for i,(title,rows) in enumerate(DRIVERREG,1):
        (OUT/f"driverreg_{i:02d}_{title.lower().replace(' & ','_').replace(' ','_')}.svg").write_text(mobile_svg(title,rows,i),encoding="utf-8")
    for i,(title,rows) in enumerate(ADMIN,1):
        (OUT/f"admin_{i:02d}_{title.lower().replace(' & ','_').replace(' ','_')}.svg").write_text(admin_svg(title,rows,i),encoding="utf-8")
    (OUT/"labar_master_figma_canvas_v2.svg").write_text(master_canvas(),encoding="utf-8")
    print("Generated 10 DriverReg frames, 5 Admin frames, and master canvas v2")

if __name__ == "__main__":
    main()
