#!/usr/bin/env python3
"""Generate the original LaBar outline icon family as dependency-free SVG files."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

ICONS = {
    "labar-mark": '<path d="M8 25 18 7h8l10 18-4 7H12z"/><path d="M17 25h10l-5-9z"/>',
    "passenger": '<circle cx="24" cy="15" r="7"/><path d="M11 39c1-10 7-15 13-15s12 5 13 15"/><path d="M8 39h32"/>',
    "driver": '<circle cx="24" cy="14" r="6"/><path d="M11 38c1-9 6-14 13-14s12 5 13 14"/><path d="M14 30h20M18 24l6 7 6-7"/>',
    "guardian": '<path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11z"/><path d="m17 24 5 5 10-12"/>',
    "driverreg": '<rect x="7" y="10" width="34" height="28" rx="5"/><circle cx="18" cy="22" r="5"/><path d="M12 33c1-5 3-7 6-7s5 2 6 7M28 18h8M28 24h8M28 30h6"/>',
    "admin": '<rect x="6" y="8" width="36" height="27" rx="4"/><path d="M18 42h12M24 35v7M11 15h9v7h-9zM25 15h12M25 21h12M11 27h26"/>',
    "home": '<path d="m6 23 18-15 18 15"/><path d="M11 21v20h26V21M20 41V29h8v12"/>',
    "map": '<path d="m6 11 11-5 14 5 11-5v31l-11 5-14-5-11 5zM17 6v31M31 11v31"/><circle cx="25" cy="22" r="4"/>',
    "route": '<circle cx="10" cy="38" r="4"/><circle cx="38" cy="10" r="4"/><path d="M13 35c12-2 3-14 13-16s8 9 9 13M35 13l3-3"/>',
    "ride": '<path d="M8 30h32l-3-11a6 6 0 0 0-6-4H17a6 6 0 0 0-6 4z"/><path d="M7 30v8h5l2-4h20l2 4h5v-8M13 24h22"/><circle cx="15" cy="30" r="2"/><circle cx="33" cy="30" r="2"/>',
    "payment": '<rect x="5" y="10" width="38" height="28" rx="5"/><path d="M5 19h38M11 30h10M34 28h3"/>',
    "finding": '<circle cx="21" cy="21" r="12"/><path d="m30 30 10 10M21 14v7l5 4"/>',
    "trip": '<path d="M8 35c5-14 11-21 18-21 6 0 8 4 14 0"/><path d="m35 9 5 5-5 5"/><circle cx="9" cy="36" r="4"/>',
    "receipt": '<path d="M11 5h26v38l-5-4-4 4-4-4-4 4-4-4-5 4z"/><path d="M17 15h14M17 22h14M17 29h8"/>',
    "history": '<path d="M8 15V7l6 4a18 18 0 1 1-5 23"/><path d="M24 14v11l8 5"/>',
    "profile": '<circle cx="24" cy="16" r="8"/><path d="M8 42c1-12 7-18 16-18s15 6 16 18"/>',
    "wallet": '<path d="M7 13h31a4 4 0 0 1 4 4v23H10a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5h25"/><path d="M30 23h12v10H30a5 5 0 0 1 0-10z"/>',
    "plugin": '<path d="M18 6h12v10h10v12H30v12H18V30H8V18h10z"/><path d="M21 11h6M13 21v4M35 21v4M21 35h6"/>',
    "places": '<path d="M24 43S10 30 10 19a14 14 0 1 1 28 0c0 11-14 24-14 24z"/><circle cx="24" cy="19" r="5"/>',
    "support": '<circle cx="24" cy="24" r="18"/><path d="M10 24h7M31 24h7M17 34c4 3 10 3 14 0M13 16c3-8 19-8 22 0"/>',
    "schedule": '<rect x="7" y="10" width="34" height="31" rx="4"/><path d="M15 6v8M33 6v8M7 19h34"/><circle cx="25" cy="29" r="7"/><path d="M25 25v5l3 2"/>',
    "settings": '<circle cx="24" cy="24" r="7"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5"/>',
    "notifications": '<path d="M12 33h24l-3-5v-8a9 9 0 0 0-18 0v8z"/><path d="M20 38c1 4 7 4 8 0"/>',
    "promotions": '<path d="M7 20h34v21H7zM5 13h38v8H5zM24 13v28"/><path d="M24 13c-7 0-11-2-11-6 0-3 5-4 8-1 2 2 3 7 3 7zM24 13c7 0 11-2 11-6 0-3-5-4-8-1-2 2-3 7-3 7z"/>',
}

TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="{label}">
  <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">{body}</g>
</svg>\n'''

for name, body in ICONS.items():
    (OUT / f"{name}.svg").write_text(TEMPLATE.format(label=name.replace("-", " "), body=body), encoding="utf-8")

# The product mark is intentionally colored and more detailed than the utility
# icon family. It is original vector artwork modeled on LaBar's taxi, location,
# and safety concepts.
(OUT / "labar-mark.svg").write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112" role="img" aria-label="LaBar taxi safety mark">
  <path fill="#ef1720" d="M48 3C24 3 7 20 7 43c0 28 30 51 41 65 11-14 41-37 41-65C89 20 72 3 48 3z"/>
  <path fill="#fff" d="M48 10c20 0 34 14 34 33 0 20-20 39-34 55C34 82 14 63 14 43c0-19 14-33 34-33z"/>
  <circle cx="48" cy="42" r="28" fill="#ef1720"/>
  <circle cx="48" cy="42" r="22" fill="#fff"/>
  <path fill="#111827" d="M27 49h42l-4-14c-1-5-6-8-11-8H42c-5 0-10 3-11 8zm8-13h26l2 7H33z"/>
  <path fill="#facc15" d="M39 21h18v7H39z"/>
  <path fill="#111827" d="M41 21h5v7h-5zm10 0h5v7h-5z"/>
  <circle cx="35" cy="50" r="4" fill="#111827"/><circle cx="61" cy="50" r="4" fill="#111827"/>
  <path fill="#ef1720" stroke="#fff" stroke-width="2" d="M48 64 65 70v12c0 11-8 17-17 22-9-5-17-11-17-22V70z"/>
  <path fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="m40 83 6 6 11-13"/>
</svg>\n''', encoding="utf-8")

print(f"Generated {len(ICONS)} LaBar SVG icons in {OUT}")
