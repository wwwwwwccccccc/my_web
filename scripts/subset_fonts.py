"""Subset the fonts used by the site so the download stays small.

Sources:
- Windows install: NotoSansSC-VF.ttf, NotoSerifSC-VF.ttf,
  DINNextLTPro-*.ttf.
- docs/fonts/MaShanZheng-Regular.ttf (OFL brush font used by the hero).

Outputs go to public/fonts as woff2.
"""
from __future__ import annotations

import string
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "public" / "fonts"
SRC = Path("C:/Windows/Fonts")
BRUSH_TEXT = "Hi，W这里是构建不可见之处设计王迧软件工程"

EXTRA = (
    "　、。，．·—–…“”‘’《》〈〉「」『』【】（）()[]{}<>/\\|+-*=~!?@#$%^&*_.;:'\"`"
    "°↗↘←→↑↓✕✦©®™×÷±≈≤≥∞△○●□■◆◇★☆"
)


def collect_text() -> str:
    chars: set[str] = set(string.printable)
    chars.update(EXTRA)
    for path in list(ROOT.glob("src/**/*")) + [ROOT / "index.html"]:
        if path.is_file() and path.suffix in {".ts", ".tsx", ".css", ".html"}:
            chars.update(path.read_text(encoding="utf-8"))
    cleaned = {c for c in chars if c.isprintable() or c in "\n\t"}
    return "".join(sorted(cleaned))


def run_subset(src: Path, out: Path, text_file: Path | None, unicodes: str | None) -> None:
    args = [
        str(src),
        f"--output-file={out}",
        "--flavor=woff2",
        "--layout-features=*",
        "--no-hinting",
        "--name-IDs=*",
        "--drop-tables+=DSIG",
    ]
    if text_file:
        args.append(f"--text-file={text_file}")
    if unicodes:
        args.append(f"--unicodes={unicodes}")
    subset.main(args)
    print(f"{out.name}: {out.stat().st_size / 1024:.1f} KB")


def main() -> None:
    text = collect_text()
    glyph_file = ROOT / "docs" / "glyphs.txt"
    glyph_file.write_text(text, encoding="utf-8")
    print(f"{len(text)} unique characters")

    run_subset(SRC / "NotoSansSC-VF.ttf", FONT_DIR / "NotoSansSC-subset.woff2", glyph_file, None)
    run_subset(SRC / "NotoSerifSC-VF.ttf", FONT_DIR / "NotoSerifSC-subset.woff2", glyph_file, None)

    latin = "U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-205E,U+2190-2199,U+25A0-25FF"
    for weight in ("Light", "Regular", "Medium", "Bold"):
        run_subset(
            FONT_DIR / f"DINNextLTPro-{weight}.ttf",
            FONT_DIR / f"DINNextLTPro-{weight}.woff2",
            None,
            latin,
        )

    brush_src = ROOT / "docs" / "fonts" / "MaShanZheng-Regular.ttf"
    if brush_src.exists():
        brush_file = ROOT / "docs" / "glyphs-brush.txt"
        brush_file.write_text(BRUSH_TEXT, encoding="utf-8")
        run_subset(brush_src, FONT_DIR / "MaShanZheng-hello.woff2", brush_file, None)


if __name__ == "__main__":
    main()
