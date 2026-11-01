"""Re-render the four project covers from the HTML artboards.

The artboards in docs/artboards are the editable sources.  Each is designed at
1800x1000 or 1200x1450 CSS pixels and captured at 2x, then downscaled to a
web-friendly JPG.  Requires Chrome (set CHROME_PATH if it is not in the default
Windows location).

    python scripts/render_covers.py
"""
from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "docs" / "artboards"
OUT = ROOT / "public" / "images"
CHROME = os.environ.get(
    "CHROME_PATH", r"C:\Program Files\Google\Chrome\Application\chrome.exe"
)

JOBS = [
    # name, css width, css height, output width
    ("inspect", 1800, 1000, 2400),
    ("link", 1200, 1450, 1800),
    ("drive", 1200, 1450, 1800),
    ("portfolio", 1800, 1000, 2400),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="covers-") as tmp:
        for name, w, h, out_w in JOBS:
            png = Path(tmp) / f"{name}.png"
            subprocess.run(
                [
                    CHROME,
                    "--headless=new",
                    "--disable-gpu",
                    "--hide-scrollbars",
                    "--allow-file-access-from-files",
                    "--force-device-scale-factor=2",
                    f"--window-size={w},{h}",
                    "--virtual-time-budget=3500",
                    f"--user-data-dir={Path(tmp) / ('profile-' + name)}",
                    f"--screenshot={png}",
                    (ART / f"{name}.html").as_uri(),
                ],
                check=True,
                capture_output=True,
            )
            im = Image.open(png).convert("RGB")
            height = round(im.height * out_w / im.width)
            im.resize((out_w, height), Image.LANCZOS).save(
                OUT / f"work-{name}.jpg", quality=86, subsampling=1, optimize=True
            )
            print(f"work-{name}.jpg  {out_w}x{height}")


if __name__ == "__main__":
    main()
