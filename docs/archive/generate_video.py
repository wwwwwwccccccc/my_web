"""Generate the seamless abstract background video for the hero.

The look is a slowly drifting "signal terrain": fine contour filaments over a
dark, cold-warm fog.  It stays low-contrast on purpose so white type remains
the loudest thing on screen.

Pure numpy + Pillow + ffmpeg (via imageio-ffmpeg).
"""
from __future__ import annotations

import math
import subprocess
import tempfile
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1600, 900
LW, LH = 800, 450
ASPECT = LW / LH
FPS = 24
DURATION = 14.0
FRAMES = int(FPS * DURATION)
RNG = np.random.default_rng(20251101)

yy, xx = np.mgrid[0:LH, 0:LW].astype(np.float32)
x = (xx / LW * 2 - 1) * ASPECT
y = yy / LH * 2 - 1
R = np.sqrt((x / ASPECT) ** 2 + y**2)


def field(t: float) -> np.ndarray:
    a = 2 * math.pi * t
    wx = 0.70 * np.sin(y * 1.55 + a) + 0.32 * np.sin(y * 3.1 - a * 2 + 1.1)
    wy = 0.62 * np.cos(x * 1.15 - a) + 0.30 * np.cos(x * 2.4 + a + 0.4)
    u = x * 1.45 + wx
    v = y * 1.95 + wy
    f = (
        np.sin(u * 1.7 + np.sin(v * 1.5 + a * 2) * 0.9)
        + 0.55 * np.sin(v * 2.5 - np.cos(u * 1.15 - a) * 0.8)
        + 0.32 * np.sin((u + v) * 1.25 + a * 3)
    )
    return np.clip((f / 1.87 + 1) * 0.5, 0, 1)


def ribbons(t: float) -> np.ndarray:
    a = 2 * math.pi * t
    wx = 0.85 * np.sin(y * 1.35 + a * 0.8) + 0.35 * np.sin(y * 2.9 - a * 1.6)
    wy = 0.75 * np.cos(x * 1.05 - a * 0.7) + 0.30 * np.cos(x * 2.2 + a * 1.3)
    u = x * 1.25 + wx
    v = y * 1.7 + wy
    phase = u * 2.1 + v * 1.15 + 0.9 * np.sin(v * 2.2 + a * 0.9) + a * 0.55
    return (0.5 + 0.5 * np.cos(phase * 2 * math.pi)) ** 12


FOCUS = np.exp(-(((x - 0.55) / 1.15) ** 2 + ((y + 0.05) / 1.0) ** 2))
COOL = np.clip(0.55 + 0.55 * (x / ASPECT) - 0.25 * y, 0, 1)
WARM = np.clip(0.55 - 0.5 * x / ASPECT + 0.35 * y, 0, 1)
VIG = np.clip(1.18 - 0.55 * R**1.6, 0.15, 1.0)

N_DUST = 150
dust_x = RNG.uniform(0, W, N_DUST)
dust_y = RNG.uniform(0, H, N_DUST)
dust_r = RNG.uniform(0.35, 1.4, N_DUST)
dust_a = RNG.uniform(4, 30, N_DUST)
dust_v = RNG.uniform(2, 10, N_DUST)


def make_frame(i: int) -> Image.Image:
    t = i / FRAMES
    a = 2 * math.pi * t
    f = field(t)
    density = np.clip((f - 0.42) * 1.9, 0, 1) ** 1.25 * (0.42 + 0.58 * FOCUS)

    img = np.zeros((LH, LW, 3), np.float32)
    img += np.array([0.010, 0.013, 0.016], np.float32)
    img += np.array([0.24, 0.38, 0.42], np.float32) * (density * COOL * 0.55)[..., None]
    img += np.array([0.40, 0.29, 0.18], np.float32) * (density * WARM * 0.30)[..., None]
    img += np.array([0.55, 0.72, 0.74], np.float32) * (ribbons(t) * (0.30 + 0.70 * FOCUS) * 0.062)[..., None]

    # very slow light sweep
    s = (t * 1.0) % 1.0
    band = np.exp(-(((x - (-0.9 + 1.9 * s)) * 0.9 + y * 0.5) ** 2) / 0.22) * 0.042
    img += np.array([0.50, 0.62, 0.66], np.float32) * band[..., None]
    halo = np.exp(-(((x - 0.62) ** 2 + (y + 0.45) ** 2)) / 0.55) * 0.05
    img += np.array([0.36, 0.46, 0.48], np.float32) * halo[..., None]

    img *= VIG[..., None]
    img = np.clip(img, 0, 1) ** (1 / 1.3)
    im = Image.fromarray((img * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    im = Image.blend(im, im.filter(ImageFilter.GaussianBlur(20)), 0.14)
    im = Image.blend(im, im.filter(ImageFilter.GaussianBlur(48)), 0.16)
    frame = im.convert("RGBA")

    # dust
    dust = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(dust)
    for k in range(N_DUST):
        dx = (dust_x[k] + math.sin(a + k) * 6) % W
        dy = (dust_y[k] - dust_v[k] * DURATION * t) % H
        r = dust_r[k]
        alpha = int(dust_a[k] * (0.55 + 0.45 * math.sin(a * 2 + k)))
        d.ellipse((dx - r, dy - r, dx + r, dy + r), fill=(210, 222, 220, max(alpha, 0)))
    frame = Image.alpha_composite(frame, dust).convert("RGB")

    noise = RNG.normal(0, 2.0, (H, W, 1))
    return Image.fromarray(np.clip(np.asarray(frame, np.float32) + noise, 0, 255).astype(np.uint8))


def main() -> None:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = Path(tempfile.mkdtemp(prefix="hero-frames-"))
    print(f"rendering {FRAMES} frames -> {tmp}")
    for i in range(FRAMES):
        make_frame(i).save(tmp / f"{i:04d}.jpg", quality=93)
        if i % 48 == 0:
            print(f"  {i}/{FRAMES}")

    mp4 = OUT / "hero.mp4"
    cmd = [
        ffmpeg, "-y", "-framerate", str(FPS), "-i", str(tmp / "%04d.jpg"),
        "-vf", "scale=1600:900:flags=lanczos,format=yuv420p",
        "-c:v", "libx264", "-preset", "slow", "-crf", "24",
        "-tune", "film", "-movflags", "+faststart", "-an", str(mp4),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"wrote {mp4} ({mp4.stat().st_size / 1e6:.1f} MB)")

    make_frame(int(FRAMES * 0.18)).save(OUT / "hero-poster.jpg", quality=90)


if __name__ == "__main__":
    main()
