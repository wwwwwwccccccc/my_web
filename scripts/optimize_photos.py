from pathlib import Path
from shutil import copy2

from PIL import Image, ImageOps

ROOT = Path('src/assets/province-photos')
BACKUP = Path('docs/photo-originals')
MAX_EDGE = 1600
QUALITY = 82
SOURCE_SUFFIXES = {'.jpg', '.jpeg', '.png'}

converted = []
skipped = []
total_before = 0
total_after = 0

for path in sorted(ROOT.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in SOURCE_SUFFIXES:
        continue

    before = path.stat().st_size
    target = path.with_suffix('.webp')
    if target.exists():
        skipped.append((path, 'target already exists'))
        continue

    try:
        with Image.open(path) as source:
            image = ImageOps.exif_transpose(source)
            if image.mode not in ('RGB', 'RGBA'):
                image = image.convert('RGB')
            width, height = image.size
            scale = min(1.0, MAX_EDGE / max(width, height))
            if scale < 1.0:
                image = image.resize(
                    (max(1, round(width * scale)), max(1, round(height * scale))),
                    Image.Resampling.LANCZOS,
                )
            tmp = target.with_suffix('.webp.tmp')
            image.save(tmp, 'WEBP', quality=QUALITY, method=6)
    except Exception as exc:
        skipped.append((path, f'convert failed: {exc}'))
        continue

    after = tmp.stat().st_size
    relative = path.relative_to(ROOT)
    backup = BACKUP / relative
    backup.parent.mkdir(parents=True, exist_ok=True)
    copy2(path, backup)
    tmp.replace(target)
    path.unlink()
    converted.append((relative, before, after))
    total_before += before
    total_after += after

print(f'converted: {len(converted)}')
for relative, before, after in converted:
    print(f'{before:>8} -> {after:>8}  {relative.with_suffix(".webp")}')
print(f'total: {total_before} -> {total_after} bytes')
if skipped:
    print('skipped:')
    for path, reason in skipped:
        print(f'  {path}: {reason}')
