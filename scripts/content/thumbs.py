#!/usr/bin/env python3
"""Make an 800px WebP next to every JPEG in public/media (x.jpg → x.800.webp) for card/grid thumbnails.

usage: python3 scripts/content/thumbs.py        (skips files that already have a thumbnail)
Pages use it through srcset (src/lib/thumb.js); the photo modal still opens the full JPEG.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2] / 'public/media'
made = 0
for jpg in sorted(ROOT.rglob('*.jpg')):
    out = jpg.with_suffix('.800.webp')
    if out.exists() and out.stat().st_mtime >= jpg.stat().st_mtime:
        continue
    im = Image.open(jpg)
    im.thumbnail((800, 800))
    im.save(out, 'WEBP', quality=78, method=6)  # PIL writes no EXIF unless asked
    made += 1
print(f'{made} thumbnail(s) written')
