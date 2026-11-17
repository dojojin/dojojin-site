#!/usr/bin/env python3
"""Photo cover for news (1600x1200): real photo + title/key numbers/chips (owner 17 Nov 2026: no text-only covers).
usage: python3 scripts/content/photo_cover.py spec.json out.html && node scripts/content/render_cover.mjs out.html cover.jpg
Fonts: copy public/fonts/ibm-plex-sans-thai-{400,700}-{thai,latin}.woff2 next to out.html. Examples: _sources/posts/news/*/cover-v2/*.json
spec:  (spec: photo, mode dark|light, kicker, title[], info{label,big,unit,badge}, chips[], logo (svg/png path, shown on a white tile above the title), logo_h, photo_top, photo_h, pos, accent)"""
import json,sys,html
s=json.load(open(sys.argv[1])); e=html.escape
dark=s.get('mode','dark')=='dark'
bg='#0f1218' if dark else '#ffffff'; fg='#fff' if dark else '#14171c'
fade=('15,18,24' if dark else '244,245,247')
inf=s.get('info')
css=f"""
@font-face{{font-family:P;font-weight:700;src:url(ibm-plex-sans-thai-700-thai.woff2)}}
@font-face{{font-family:P;font-weight:700;src:url(ibm-plex-sans-thai-700-latin.woff2);unicode-range:U+0000-00FF,U+2013,U+2192}}
@font-face{{font-family:P;font-weight:400;src:url(ibm-plex-sans-thai-400-thai.woff2)}}
@font-face{{font-family:P;font-weight:400;src:url(ibm-plex-sans-thai-400-latin.woff2);unicode-range:U+0000-00FF,U+2013,U+2192}}
*{{margin:0;box-sizing:border-box}}
body{{width:1600px;height:1200px;background:{bg};font-family:P;color:{fg};position:relative;overflow:hidden}}
.ph{{position:absolute;left:0;top:{s.get('photo_top',370)}px;width:1600px;height:{s.get('photo_h',830)}px;background:url({s['photo']}) {s.get('pos','center')}/{s.get('fit','cover')} no-repeat}}
.ph::after{{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgb({fade}) 0%,rgba({fade},.5) 14%,rgba({fade},0) 30%,rgba({fade},0) 70%,rgb({fade}) 100%),linear-gradient(90deg,rgba({fade},.7) 0%,rgba({fade},0) 32%)}}
.bar{{position:absolute;left:0;top:0;width:100%;height:12px;background:{s.get('accent','#4b9bf0')}}}
.t{{position:absolute;left:90px;top:180px;max-width:{s.get('title_w',860)}px}}
.k{{font-size:34px;color:{'#f4a3b0' if dark else '#c2364a'}}}
h1{{font-size:{s.get('title_size',96)}px;line-height:1.08;margin-top:6px;margin-left:{s.get('title_indent',0)}px;font-weight:700}}
.i{{position:absolute;right:90px;top:180px;text-align:right}}
.i .a{{font-size:30px;color:{'#c9d2e0' if dark else '#5b6472'}}}
.i .b{{font-size:{s.get('big_size',84)}px;line-height:1.05}} .i .b small{{font-size:40px}}
.i .c{{display:inline-block;margin-top:10px;background:{s.get('badge_bg','#e5484d')};color:#fff;font-size:34px;padding:6px 18px;border-radius:10px}}
.chips{{position:absolute;{'right' if s.get('chips_right') else 'left'}:90px;top:{s.get('chips_top',950)}px;display:flex;gap:18px}}

.lg{{display:inline-flex;align-items:center;background:#fff;border-radius:18px;padding:{s.get('logo_pad',18)}px {s.get('logo_pad',18)+10}px;margin:{s.get('logo_gap',14)}px 0 {s.get('logo_gap',14)+6}px}}
.lg img{{height:{s.get('logo_h',48)}px;display:block}}
.chips span{{background:{s.get('chip_bg','#2f7d4f')};color:#fff;font-size:40px;padding:8px 22px;border-radius:12px}}
"""+("" if dark else ".ph::after{display:none!important}")
out=[f'<!doctype html><meta charset=utf-8><style>{css}</style><div class=bar></div><div class=ph></div>',
 f'<div class=t><div class=k>{e(s["kicker"])}</div>'+(f'<div class=lg><img src="{e(s["logo"])}"></div>' if s.get('logo') else '')+f'<h1>{"<br>".join(e(x) for x in s["title"])}</h1></div>']
if inf:
  out.append('<div class=i>'+(f'<div class=a>{e(inf["label"])}</div>' if inf.get('label') else '')
   +(f'<div class=b>{e(inf["big"])}'+(f' <small>{e(inf["unit"])}</small>' if inf.get('unit') else '')+'</div>' if inf.get('big') else '')
   +(f'<div class=c>{e(inf["badge"])}</div>' if inf.get('badge') else '')+'</div>')
if s.get('chips'): out.append('<div class=chips>'+''.join(f'<span>{e(c)}</span>' for c in s['chips'])+'</div>')
open(sys.argv[2],'w').write(''.join(out))
