"""Make picture sides alternate down a post: walk every top-level .split that holds a figure (infographic or photo)
and swap its two children where needed so figures go right, left, right, ... Prose-only splits are skipped.
Usage: python3 scripts/content/alternate-splits.py <post.mdx>...   (prints the side sequence)"""
import re, sys

def blocks(inner):
    """Split the inside of a .split into its 2 top-level children (each a <div …>…</div> or <figure …>…</figure>)."""
    out, i = [], 0
    while i < len(inner):
        m = re.compile(r'<(div|figure)\b').search(inner, i)
        if not m: break
        tag, depth, j = m.group(1), 0, m.start()
        for t in re.finditer(r'<(/?)(div|figure)\b[^>]*>', inner[m.start():]):
            depth += -1 if t.group(1) else 1
            if depth == 0:
                j = m.start() + t.end(); break
        out.append(inner[m.start():j]); i = j
    return out

for f in sys.argv[1:]:
    s = open(f).read(); pos, res, side, seq = 0, [], 0, []
    for m in re.finditer(r'<div class="split">\n', s):
        if m.start() < pos: continue
        depth, end = 0, None
        for t in re.finditer(r'<(/?)div\b[^>]*>', s[m.start():]):
            depth += -1 if t.group(1) else 1
            if depth == 0: end = m.start() + t.end(); break
        inner = s[m.end():end - len('</div>')]
        kids = blocks(inner)
        isfig = [k.startswith('<figure') for k in kids]
        res.append(s[pos:m.start()])
        if len(kids) == 2 and any(isfig):
            want_left = side % 2 == 1; side += 1
            fig_first = isfig[0]
            if fig_first != want_left: kids = kids[::-1]
            seq.append('L' if want_left else 'R')
            res.append('<div class="split">\n' + '\n'.join(kids) + '\n</div>')
        else:
            res.append(s[m.start():end])
        pos = end
    res.append(s[pos:])
    open(f, 'w').write(''.join(res)); print(f.split('/')[-1], ''.join(seq))
