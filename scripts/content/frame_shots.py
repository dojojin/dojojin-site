#!/usr/bin/env python3
"""Frame real app screenshots on a soft pastel gradient (owner's choice, 14 Nov 2026: colourful but calm,
same tone as the pastel infographics). Screenshot pixels are untouched; rounded corners + light shadow.

  python3 scripts/content/frame_shots.py SHOT.png OUT.jpg            # body image: shot + 7% margin, max 1600 px
  python3 scripts/content/frame_shots.py --cover OUT.jpg A.png [B.png]  # 1600x1200 cover, 1-2 shots large, overlapping

Keep the unframed originals in _sources/posts/<type>/<slug>/ and credit: "... วางบนพื้นสีโดย DOJOJIN.TECH".
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

STOPS = [(0.0, (236, 228, 250)), (0.55, (250, 232, 240)), (1.0, (255, 240, 226))]  # lavender -> pink -> peach


def grad(w, h):
    g = Image.new('RGB', (w, h))
    px = g.load()
    for y in range(h):
        for x in range(w):
            t = x / w * 0.6 + y / h * 0.4
            for (a, ca), (b, cb) in zip(STOPS, STOPS[1:]):
                if a <= t <= b:
                    k = (t - a) / (b - a)
                    px[x, y] = tuple(round(ca[i] + (cb[i] - ca[i]) * k) for i in range(3))
                    break
    return g


def place(bg, im, xy, r):
    x, y = xy
    sh = Image.new('L', bg.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle((x + 6, y + 18, x + im.width + 6, y + im.height + 18), r, fill=90)
    bg.paste(Image.new('RGB', bg.size, (90, 70, 120)), (0, 0), sh.filter(ImageFilter.GaussianBlur(22)))
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, *im.size), r, fill=255)
    bg.paste(im, xy, m)


def body(src, dst):
    im = Image.open(src).convert('RGB')
    p = round(max(im.size) * 0.07)
    bg = grad(im.width + 2 * p, im.height + 2 * p)
    place(bg, im, (p, p), round(min(im.size) * 0.035))
    if max(bg.size) > 1600:
        k = 1600 / max(bg.size)
        bg = bg.resize((round(bg.width * k), round(bg.height * k)), Image.LANCZOS)
    bg.save(dst, quality=85)
    return bg.size


def cover(dst, srcs):
    """One shot: centred, 90% of the height. Two: first at left/top, second overlapping at right/lower.
    Shots may bleed past the bottom edge: the frame stays full (no empty bands)."""
    bg = grad(1600, 1200)
    ims = [Image.open(s).convert('RGB') for s in srcs]
    if len(ims) == 1:
        im = ims[0]
        k = min(1080 / im.height, 1440 / im.width)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        place(bg, im, ((1600 - im.width) // 2, (1200 - im.height) // 2), 26)
    else:
        a, b = ims[:2]
        h = 1080
        ka, kb = min(h / a.height, 820 / a.width), min(h / b.height, 820 / b.width)
        a = a.resize((round(a.width * ka), round(a.height * ka)), Image.LANCZOS)
        b = b.resize((round(b.width * kb), round(b.height * kb)), Image.LANCZOS)
        gap = max(0, 1600 - a.width - b.width) // 3
        place(bg, a, (gap, 60), 26)
        place(bg, b, (1600 - b.width - gap, 140), 26)
    bg.save(dst, quality=85)
    return bg.size


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--cover'] and len(args) >= 3:
        print(args[1], cover(args[1], args[2:4]))
    elif len(args) == 2:
        print(args[1], body(*args))
    else:
        sys.exit(__doc__)
