#!/usr/bin/env python3
"""Text cover for a news post that has no photo of its own (1600x1200 JPEG, Thai + Latin text).

usage: python3 scripts/content/news_cover.py <type>/<slug> cover.json

cover.json:
  {"kicker": "แจ้งเตือนความปลอดภัย", "title": "OpenSSH", "headline": "ข้ามการใส่รหัสผ่านได้",
   "sub": "มีการโจมตีจริงแล้ว · อัปเดตด่วน", "chips_label": "เวอร์ชันที่แก้แล้ว", "chips": ["10.6p2"],
   "foot": ["CVE-2026-123158", "CISA KEV · 9 พฤศจิกายน 2569"], "accent": "#e5484d"}
Only "title" is required. Writes public/media/posts/<type>/<slug>/cover.jpg and its 800px WebP twin.
"""
import json, re, runpy, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[2]
F = '/usr/share/fonts/truetype/'
RAQM = ImageFont.Layout.RAQM
THAI = re.compile(r'[฀-๿]+|[^฀-๿]+')


def font(size, bold, thai):
    name = ('noto/NotoSansThai-' if thai else 'noto/NotoSans-') + ('Bold' if bold else 'Regular') + '.ttf'
    return ImageFont.truetype(F + name, size, layout_engine=RAQM)


def mono(size):
    return ImageFont.truetype(F + 'dejavu/DejaVuSansMono-Bold.ttf', size)


THAI_CHAR = re.compile(r'[\u0E00-\u0E7F]')


def width(d, s, size, bold=True):
    return sum(d.textlength(r, font=font(size, bold, '\u0E00' <= r[0] <= '\u0E7F')) for r in THAI.findall(s))


def text(d, x, y, s, size, fill, bold=False, max_w=1380):
    """Draw mixed Thai/Latin text; shrink until it fits max_w (Noto Sans Thai has no Latin glyphs)."""
    while True:
        runs = [(r, font(size, bold, '฀' <= r[0] <= '๿')) for r in THAI.findall(s)]
        if sum(d.textlength(r, font=f) for r, f in runs) <= max_w or size <= 24:
            break
        size -= 4
    for r, f in runs:
        d.text((x, y), r, font=f, fill=fill)
        x += d.textlength(r, font=f)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    c = json.loads(Path(sys.argv[2]).read_text())
    out = REPO / 'public/media/posts' / sys.argv[1]
    out.mkdir(parents=True, exist_ok=True)
    im = Image.new('RGB', (1600, 1200), '#14161f')
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 1600, 14], fill=c.get('accent', '#e5484d'))
    if c.get('kicker'):
        text(d, 110, 170, c['kicker'], 52, '#f2a9ab')
    if THAI_CHAR.search(c['title']):  # DejaVu Mono has no Thai glyphs
        text(d, 110, 250, c['title'], 140, '#ffffff', bold=True)
    else:
        size = 170
        while d.textlength(c['title'], font=mono(size)) > 1380 and size > 60:
            size -= 10
        d.text((105, 250), c['title'], font=mono(size), fill='#ffffff')
    if c.get('headline'):
        text(d, 110, 470, c['headline'], 84, '#ffffff', bold=True)
    if c.get('sub'):
        text(d, 110, 590, c['sub'], 48, '#c8ccd8')
    if c.get('chips'):
        x, y = 110, 760
        text(d, x, y - 70, c.get('chips_label', ''), 40, '#8b91a3')
        for v in c['chips']:
            thai = bool(THAI_CHAR.search(v))
            w = width(d, v, 52) if thai else d.textlength(v, font=mono(56))
            if x + w + 60 > 1500:
                break
            d.rounded_rectangle([x, y, x + w + 60, y + 100], radius=20, fill='#1f7a4d')
            if thai:
                text(d, x + 30, y + 14, v, 52, '#ffffff', bold=True)
            else:
                d.text((x + 30, y + 18), v, font=mono(56), fill='#ffffff')
            x += w + 90
    for i, line in enumerate(c.get('foot', [])):
        text(d, 110, 960 + i * 80, line, 40, '#8b91a3')
    im.save(out / 'cover.jpg', quality=88)
    (out / 'cover.800.webp').unlink(missing_ok=True)
    runpy.run_path(str(Path(__file__).with_name('thumbs.py')))
    print(out / 'cover.jpg')


if __name__ == '__main__':
    main()
