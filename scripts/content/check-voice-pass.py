#!/usr/bin/env python3
"""Usage: python3 scripts/content/check-voice-pass.py <slug>...  — run after a voice pass (เกลาสำนวน).
Compares src/content/posts/news/<slug>.mdx with git HEAD, or with a saved copy when VOICE_BASE=<dir> is set (new posts).
Fails if any number, URL, HTML tag/class or frontmatter key (other than text fields) changed."""
import re,subprocess,sys,collections
import os
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def feats(t):
    return {'num':collections.Counter(re.findall(r'\d[\d,.]*\d|\d',t)),
            'url':collections.Counter(re.findall(r'https?://[^\s)"\'<>]+|\]\(/[^)]+\)|(?:src|href)="[^"]+"',t)),
            'tag':collections.Counter(re.findall(r'</?[a-zA-Z][\w-]*|class="[^"]*"',t)),
            'latin':collections.Counter(w for w in re.findall(r'[A-Za-z][A-Za-z0-9+.-]{2,}',t))}
bad=0
for s in sys.argv[1:]:
    f=f'src/content/posts/news/{s}.mdx'
    base=os.environ.get('VOICE_BASE')  # new post not in git yet: VOICE_BASE=<dir holding the pre-pass copy <slug>.mdx>
    old=open(f'{base}/{s}.mdx').read() if base else subprocess.run(['git','-C',R,'show','HEAD:'+f],capture_output=True,text=True).stdout
    new=open(f'{R}/{f}').read()
    strip=lambda t:re.sub(r'^updated:.*$','',t,flags=re.M)
    a,b=feats(strip(old)),feats(strip(new)); msgs=[]
    for k in ('num','url','tag'):
        d1=a[k]-b[k]; d2=b[k]-a[k]
        if d1 or d2: msgs.append(f'  {k}: removed {dict(d1)} added {dict(d2)}')
    lost=set(a['latin'])-set(b['latin']); gain=set(b['latin'])-set(a['latin'])
    if lost or gain: msgs.append(f'  latin words (names/terms): lost {sorted(lost)} new {sorted(gain)}')
    ratio=len(new)/max(1,len(old))
    if not .85<ratio<1.12: msgs.append(f'  length ratio {ratio:.2f}')
    print(('DIFF ' if msgs else 'OK   ')+s); print('\n'.join(msgs)) if msgs else None; bad+=bool(msgs)
sys.exit(1 if bad else 0)
