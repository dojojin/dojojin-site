#!/usr/bin/env python3
"""Stamp an "อัปเดต <date>" ribbon on a news cover, always from the untouched original.
usage: python3 scripts/content/update_badge.py <slug> "อัปเดต 17 พ.ย."
First run copies public/media/posts/news/<slug>/cover.jpg to _sources/posts/news/<slug>/cover-orig.jpg;
later runs reuse that original, so badges never stack. Then run thumbs.py for the .800.webp."""
import shutil, subprocess, sys
from pathlib import Path

slug, text = sys.argv[1], sys.argv[2]
root = Path(__file__).resolve().parents[2]
pub = root / f"public/media/posts/news/{slug}/cover.jpg"
src = root / f"_sources/posts/news/{slug}/update-badge"
src.mkdir(parents=True, exist_ok=True)
orig = src.parent / "cover-orig.jpg"
if not orig.exists():
    shutil.copy2(pub, orig)
shutil.copy2(orig, src / "orig.jpg")
for f in ("ibm-plex-sans-thai-700-thai.woff2", "ibm-plex-sans-thai-700-latin.woff2"):
    shutil.copy2(root / "public/fonts" / f, src / f)
# ribbon sits bottom-right inside the 180-1020 safe band so 16:9 and og crops keep it
(src / "badge.html").write_text(f"""<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:P;font-weight:700;src:url(ibm-plex-sans-thai-700-thai.woff2)}}
@font-face{{font-family:P;font-weight:700;src:url(ibm-plex-sans-thai-700-latin.woff2);unicode-range:U+0000-00FF}}
html,body{{margin:0;width:1600px;height:1200px;overflow:hidden}}
img{{position:absolute;inset:0;width:1600px;height:1200px}}
.b{{position:absolute;right:56px;top:900px;background:#e11d48;color:#fff;font:700 52px/1 P,sans-serif;
padding:20px 34px 24px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.45);border:4px solid #fff}}
</style><img src=orig.jpg><div class=b>{text}</div>""")
subprocess.run(["node", str(root / "scripts/content/render_cover.mjs"), str(src / "badge.html"), str(pub)], check=True)
print("wrote", pub)
