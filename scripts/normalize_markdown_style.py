#!/usr/bin/env python3
"""Remove emoji presentation from project Markdown and normalize affected spacing."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SKIP_PARTS = {"node_modules", ".git", "dist", "cache"}

EMOJI = re.compile(
    "["
    "\U0001F000-\U0001FAFF"
    "\u2300-\u23FF"
    "\u2600-\u27BF"
    "\u2B00-\u2BFF"
    "\uFE0E-\uFE0F"
    "\u200D"
    "]"
)

changed = 0
for path in ROOT.rglob("*.md"):
    if any(part in SKIP_PARTS for part in path.parts):
        continue
    original = path.read_text(encoding="utf-8")
    text = EMOJI.sub("", original)
    text = re.sub(r"^(#{1,6})[ \t]+", r"\1 ", text, flags=re.MULTILINE)
    text = re.sub(r"^([ \t]*[-*+])[ \t]{2,}", r"\1 ", text, flags=re.MULTILINE)
    text = re.sub(r"[ \t]+\n", "\n", text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed += 1

print(f"Normalized {changed} Markdown files")
