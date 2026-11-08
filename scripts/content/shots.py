#!/usr/bin/env python3
"""Build src/content/posts/<type>/<slug>.shots.json from a short caption list.

usage: python3 scripts/content/shots.py <type>/<slug> <captions.json>

captions.json — in display order; group order follows first appearance:
  [
    {"name": "label", "group": "ตัวเครื่อง", "title": "ฉลาก", "alt": "...", "summary": "...",
     "readings": [["แรงดัน", "20.35V"]], "analysis": ["..."], "screen": [["Input", "..."]],
     "verdict": [1, "ดีมาก"], "caution": "..."}
  ]
- Fills id, src (/media/posts/<type>/<slug>/<name>.jpg), w, h from the real file.
- Portrait images get "fit": "contain". analysis → analysisTitle "รายละเอียด", screen → screenTitle "ข้อความบนฉลาก"
  unless you set them. Missing summary = alt.
"""
import json, sys
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[2]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    post = sys.argv[1]
    caps = json.loads(Path(sys.argv[2]).read_text())
    groups = list(dict.fromkeys(c['group'] for c in caps))
    caps.sort(key=lambda c: groups.index(c['group']))
    out = []
    for i, c in enumerate(caps, 1):
        img = REPO / 'public/media/posts' / post / f'{c["name"]}.jpg'
        if not img.exists():
            sys.exit(f'missing image: {img} (run prep_images.py first)')
        w, h = Image.open(img).size
        d = {'id': str(i), 'title': c['title'], 'src': f'/media/posts/{post}/{c["name"]}.jpg', 'w': w, 'h': h,
             'group': c['group'], 'alt': c['alt'], 'summary': c.get('summary') or c['alt']}
        if h > w:
            d['fit'] = 'contain'
        for k in ('readings', 'verdict', 'score', 'caution'):
            if k in c:
                d[k] = c[k]
        if 'analysis' in c:
            d['analysisTitle'] = c.get('analysisTitle', 'รายละเอียด'); d['analysis'] = c['analysis']
        if 'screen' in c:
            d['screenTitle'] = c.get('screenTitle', 'ข้อความบนฉลาก'); d['screen'] = c['screen']
        out.append(d)
    dst = REPO / 'src/content/posts' / f'{post}.shots.json'
    dst.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
    print(f'{dst.relative_to(REPO)}: {len(out)} shots in {len(groups)} groups {groups}')


if __name__ == '__main__':
    main()
