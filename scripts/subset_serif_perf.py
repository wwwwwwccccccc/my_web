"""Build a smaller serif subset for the characters used by serif UI text.

The body font keeps the full site subset. This serif file only needs the
endnote, section-title em, archive names/captions and similar accents.
"""
from __future__ import annotations

import re
import string
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "glyphs-serif.txt"

chars: set[str] = set(string.printable)
chars.update(
    "　、。，．·—–…“”‘’《》〈〉「」『』【】（）()[]{}<>/\\|+-*=~!?@#$%^&*_.;:'\"`"
    "°↗↘←→↑↓✕✦©®™×÷±≈≤≥∞△○●□■◆◇★☆"
)
chars.update("欢迎你来参观我的生命一角慢慢归档可靠这一站，还没有归档")

# Only serif data fields: province names, photo captions / places, and
# project subtitles remain available for future use.
site = (ROOT / "src" / "data" / "site.ts").read_text(encoding="utf-8")
for match in re.finditer(r"(?:name|caption|place|subtitle):\s*'([^']*)'", site):
    chars.update(match.group(1))

map_data = (ROOT / "src" / "data" / "chinaMap.ts").read_text(encoding="utf-8")
for match in re.finditer(r"name:\s*'([^']*)'", map_data):
    chars.update(match.group(1))

text = "".join(sorted(c for c in chars if c.isprintable() or c == "\n"))
OUT.write_text(text, encoding="utf-8")
print(f"{OUT}: {len(text)} chars, {sum(ord(c) > 0x2E80 for c in text)} CJK")
