#!/usr/bin/env python3
"""Move one TEMP folder into _sources/posts/<type>/<slug>/, verified by sha256, and print what is in it.

usage: python3 scripts/content/intake.py ~/TEMP/<folder> <type>/<slug> [--keep]

- Copies every file, compares sha256 of source and copy, then deletes the TEMP folder (unless --keep).
- Prints each image: size, camera, capture date, GPS yes/no; and post.txt.
- Writes contact sheets (8 images each, with file names) to /tmp/dojojin-intake/<slug>/sheet-N.jpg,
  so you can look at all photos in a few reads instead of one read per photo.
"""
import hashlib, shutil, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

REPO = Path(__file__).resolve().parents[2]


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2 or '/' not in args[1]:
        sys.exit(__doc__)
    src, dst = Path(args[0]).expanduser(), REPO / '_sources/posts' / args[1]
    if not src.is_dir():
        sys.exit(f'not a folder: {src}')
    dst.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in src.iterdir() if p.is_file())
    for p in files:
        shutil.copy2(p, dst / p.name)
    bad = [p.name for p in files if sha(p) != sha(dst / p.name)]
    if bad:
        sys.exit(f'CHECKSUM MISMATCH, TEMP kept: {bad}')
    print(f'copied {len(files)} files → {dst.relative_to(REPO)} (sha256 match)')
    if '--keep' not in sys.argv:
        shutil.rmtree(src)
        print(f'removed {src}')

    imgs = [p for p in sorted(dst.iterdir()) if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')]
    for p in imgs:
        im = Image.open(p); ex = im.getexif()
        when = ex.get_ifd(0x8769).get(0x9003) or ex.get(0x0132) or '-'
        gps = 'GPS' if ex.get_ifd(0x8825) else '-'
        print(f'  {p.name}  {im.size[0]}x{im.size[1]}  {(ex.get(0x0110) or "").strip() or "-"}  {when}  {gps}')
    for t in sorted(dst.glob('*.txt')):
        print(f'\n=== {t.name}\n{t.read_text(errors="replace")}')

    out = Path('/tmp/dojojin-intake') / dst.name
    out.mkdir(parents=True, exist_ok=True)
    for i in range(0, len(imgs), 8):
        sheet = Image.new('RGB', (2400, 1300), 'white'); d = ImageDraw.Draw(sheet)
        for j, p in enumerate(imgs[i:i + 8]):
            im = ImageOps.exif_transpose(Image.open(p)); im.thumbnail((590, 610))
            x, y = (j % 4) * 600, (j // 4) * 650
            sheet.paste(im, (x, y)); d.text((x + 5, y + 615), p.name[-34:], fill='black')
        sheet.save(out / f'sheet-{i // 8}.jpg', quality=80)
    print(f'\ncontact sheets: {out}/sheet-*.jpg')


if __name__ == '__main__':
    main()
