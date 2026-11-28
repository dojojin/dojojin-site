#!/usr/bin/env python3
"""Cover layout A (owner approved 28 Nov 2026): full-bleed photo, logo plate top-left, 2-line headline and ONE fact
at the bottom over a gradient scrim. All text is real HTML text in the site font, so it cannot be misspelled by an
image model and can be changed in seconds.

  python3 scripts/content/cover_a.py <slug>...
reads  _sources/posts/news/<slug>/cover-a/spec.json
  {"bg": "bg.jpg", "logo": "logo.png", "lines": ["บรรทัด 1", "บรรทัด 2"], "fact": "ข้อเท็จจริงเด่น 1 อย่าง",
   "tone": "dark" | "light", "accent": "#326295", "bg_position": "center top" (optional),
   "plate": "dark" (optional: dark logo plate for a logo with white lettering)}
  (bg and logo are files in that folder; the photo must have NO text and keep its subject in the upper half)
writes cover.html there, renders it, and saves public/media/posts/news/<slug>/cover.jpg (1600x1200).
Then run thumbs.py and read the result with cover_zoom.py.
"""
import html, json, subprocess, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FONTS = ROOT / "public/fonts"
FACES = "".join(
    f'@font-face{{font-family:"IBM Plex Sans Thai";src:url("file://{FONTS}/ibm-plex-sans-thai-{w}-{s}.woff2") format("woff2");'
    f'font-weight:{w};font-style:normal;font-display:block;unicode-range:{r}}}'
    for w in (400, 600, 700) for s, r in (("thai", "U+0E00-0E7F"), ("latin", "U+0000-0DFF,U+0E80-10FFFF")))
CSS = """
*{box-sizing:border-box}html,body{width:1600px;height:1200px;margin:0;overflow:hidden}
body{font-family:"IBM Plex Sans Thai",sans-serif}
.cover{position:relative;width:1600px;height:1200px;overflow:hidden;isolation:isolate;background:var(--base);color:var(--ink)}
.dark{--base:#07111f;--ink:#fff}.light{--base:#f7f7f5;--ink:#1c1c1a}
.photo{position:absolute;inset:0;width:1600px;height:1200px;display:block;object-fit:cover;z-index:-2}
.cover::before{content:"";position:absolute;inset:0;z-index:-1}
.dark::before{background:linear-gradient(180deg,rgba(7,17,31,.04) 0%,rgba(7,17,31,.03) 37%,rgba(7,17,31,.66) 59%,rgba(7,17,31,.96) 77%,#07111f 100%)}
.light::before{background:linear-gradient(180deg,rgba(247,247,245,0) 0%,rgba(247,247,245,0) 39%,rgba(247,247,245,.72) 60%,rgba(247,247,245,.98) 77%,#f7f7f5 100%)}
.brand{position:absolute;left:90px;top:90px;height:82px;min-width:82px;padding:16px 22px;background:#fff;display:flex;align-items:center;justify-content:center}
.brand.inv{background:#0b1626}
.brand img{display:block;height:50px;width:auto;max-width:260px;object-fit:contain}
.copy{position:absolute;left:90px;right:90px;bottom:90px}
h1,p{margin:0}h1{font-weight:700;font-size:100px;line-height:1.25;letter-spacing:0}
h1 span{display:block;white-space:nowrap}
.fact{margin-top:34px;font-size:44px;font-weight:600;line-height:1.4;color:var(--fact);white-space:nowrap}
"""
FIT = """<script>
(function(){var h=document.querySelector('h1'),f=document.querySelector('.fact'),max=1420;
function w(el){return Math.max.apply(null,[].map.call(el.querySelectorAll('span').length?el.querySelectorAll('span'):[el],function(s){var r=document.createRange();r.selectNodeContents(s);return r.getBoundingClientRect().width}))}
var s=100;while(w(h)>max&&s>64){s-=2;h.style.fontSize=s+'px'}
var t=44;while(w(f)>max&&t>32){t-=1;f.style.fontSize=t+'px'}
document.documentElement.dataset.h1=s;document.documentElement.dataset.fit=(w(h)<=max&&w(f)<=max)?'ok':'OVERFLOW'})();
</script>"""


def tint(hex_, k=0.62):
    h = hex_.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02x%02x%02x" % tuple(round(c + (255 - c) * k) for c in (r, g, b))


def prep_logo(src, dst):
    """Trim empty margins so every logo fills the plate; report whether the logo is light (needs a dark plate)."""
    im = Image.open(src).convert("RGBA")
    alpha = im.split()[3]
    if alpha.getextrema()[0] == 255:  # no transparency: treat near-white as background
        from PIL import ImageChops
        bg = Image.new("RGB", im.size, (255, 255, 255))
        box = ImageChops.difference(im.convert("RGB"), bg).point(lambda v: 255 if v > 18 else 0).getbbox()
    else:
        box = alpha.point(lambda v: 255 if v > 12 else 0).getbbox()
    if box:
        im = im.crop(box)
    px = [p for p in im.getdata() if p[3] > 40]
    lum = sum(0.299 * r + 0.587 * g + 0.114 * b for r, g, b, _ in px) / max(1, len(px))
    im.save(dst)
    return lum > 205


def build(slug):
    d = ROOT / "_sources/posts/news" / slug / "cover-a"
    sp = json.loads((d / "spec.json").read_text(encoding="utf-8"))
    assert len(sp["lines"]) == 2 and sp["fact"], "spec needs exactly 2 headline lines and one fact"
    for k in ("bg", "logo"):
        assert (d / sp[k]).exists(), f"missing {d / sp[k]}"
    tone = sp.get("tone", "dark"); acc = sp.get("accent", "#326295")
    fact = tint(acc) if tone == "dark" else acc
    e = html.escape
    light_logo = prep_logo(d / sp["logo"], d / "logo-trim.png")
    page = (f'<!doctype html><html lang="th"><head><meta charset="utf-8"><style>{FACES}{CSS}.cover{{--fact:{fact}}}'
            f'.photo{{object-position:{sp.get("bg_position", "center")}}}</style></head><body>'
            f'<main class="cover {tone}"><img class="photo" src="{e(sp["bg"])}" alt="">'
            f'<div class="brand{" inv" if (light_logo or sp.get("plate") == "dark") else ""}"><img src="logo-trim.png" alt=""></div>'
            f'<div class="copy"><h1><span>{e(sp["lines"][0])}</span><span>{e(sp["lines"][1])}</span></h1>'
            f'<p class="fact">{e(sp["fact"])}</p></div></main>{FIT}</body></html>')
    (d / "cover.html").write_text(page, encoding="utf-8")
    out = d / "cover.jpg"
    subprocess.run(["node", str(ROOT / "scripts/content/render_cover.mjs"), str(d / "cover.html"), str(out)], check=True, cwd=ROOT)
    assert Image.open(out).size == (1600, 1200)
    dest = ROOT / "public/media/posts/news" / slug
    dest.mkdir(parents=True, exist_ok=True)
    Image.open(out).convert("RGB").save(dest / "cover.jpg", quality=88)
    (dest / "cover.800.webp").unlink(missing_ok=True)
    print("ok", slug)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    for s in sys.argv[1:]:
        build(s)
