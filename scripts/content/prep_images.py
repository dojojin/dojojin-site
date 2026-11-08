#!/usr/bin/env python3
"""Make web images for one post from _sources, with privacy edits, and a sheet to check the blurs.

usage: python3 scripts/content/prep_images.py <type>/<slug> <plan.json>

plan.json — one entry per photo to publish (photos not listed are skipped):
  [
    {"src": "IMG_20251203_180820", "name": "front"},
    {"src": "batch_76", "name": "cafe-counter", "blur": [[840, 330, 1180, 620]]},
    {"src": "005", "name": "receipt", "crop": [0, 140, 1512, 2016]}
  ]
- "src": any unique part of the source file name.
- "blur" / "crop": boxes [x0, y0, x1, y1] in pixels of the OUTPUT image (long side 1600), i.e. the
  coordinates you read off the 1600px image, so you never convert scales by hand. Crop runs before resize
  and is given in source pixels.
- Output: public/media/posts/<type>/<slug>/<name>.jpg — EXIF-rotated, long side ≤1600, JPEG q84, no EXIF/GPS.
- Every blurred image is also written to /tmp/dojojin-intake/<slug>/blur-<name>.jpg: LOOK at each one.
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

REPO = Path(__file__).resolve().parents[2]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    post = sys.argv[1]
    src_dir, out_dir = REPO / '_sources/posts' / post, REPO / 'public/media/posts' / post
    out_dir.mkdir(parents=True, exist_ok=True)
    check = Path('/tmp/dojojin-intake') / Path(post).name
    check.mkdir(parents=True, exist_ok=True)
    files = [p for p in src_dir.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    for e in json.loads(Path(sys.argv[2]).read_text()):
        hits = [p for p in files if e['src'] in p.name]
        if len(hits) != 1:
            sys.exit(f'"{e["src"]}" matches {len(hits)} files: {[p.name for p in hits]}')
        im = ImageOps.exif_transpose(Image.open(hits[0])).convert('RGB')
        if 'crop' in e:
            im = im.crop(tuple(e['crop']))
        im.thumbnail((1600, 1600), Image.LANCZOS)
        for b in e.get('blur', []):
            b = tuple(int(v) for v in b)
            im.paste(im.crop(b).filter(ImageFilter.GaussianBlur(30)), b[:2])
        im.save(out_dir / f'{e["name"]}.jpg', quality=84, optimize=True, progressive=True)  # no exif= → stripped
        if e.get('blur'):
            im.save(check / f'blur-{e["name"]}.jpg', quality=80)
        print(f'{e["name"]}.jpg  {im.size[0]}x{im.size[1]}  ← {hits[0].name}' + ('  [blurred]' if e.get('blur') else ''))
    left = [p.name for p in out_dir.glob('*.jpg') if Image.open(p).getexif()]
    print('EXIF left:', left or 'none')


if __name__ == '__main__':
    main()
