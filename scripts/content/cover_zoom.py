#!/usr/bin/env python3
"""Cut a cover into full-resolution tiles so every Thai word can be read letter by letter.

  python3 scripts/content/cover_zoom.py <slug>...   ->  /tmp/dojojin-cover-zoom/<slug>-{1..4}.jpg  (2x2 tiles, 100% scale, overlapping)

Why: on 27 Nov 2026 a cover said "ข้อมูลูถูกเข้าถึง" (an extra ู) and passed three looks at the whole image, because at
thumbnail size a wrong vowel or tone mark is invisible. Open every tile and read each line against the prompt text,
mark by mark (สระบน/ล่าง วรรณยุกต์ การันต์). One wrong mark = regenerate."""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
out = Path("/tmp/dojojin-cover-zoom"); out.mkdir(exist_ok=True)
for slug in sys.argv[1:]:
    im = Image.open(ROOT / "public/media/posts/news" / slug / "cover.jpg").convert("RGB")
    w, h = im.size
    boxes = [(0, 0, w * 5 // 8, h * 5 // 8), (w * 3 // 8, 0, w, h * 5 // 8), (0, h * 3 // 8, w * 5 // 8, h), (w * 3 // 8, h * 3 // 8, w, h)]
    for i, b in enumerate(boxes, 1):
        p = out / f"{slug}-{i}.jpg"; im.crop(b).save(p, quality=92); print(p)
