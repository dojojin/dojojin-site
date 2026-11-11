"""Pair a standalone inline photo with the prose block right before it into a .split (photo beside text),
alternating sides with the post's existing splits. Usage: python3 scripts/content/wrap-figs.py <post.mdx>..."""
import re, sys
PAIR = re.compile(r'(<div class="prose">\n(?:(?!<div class="split">).)*?\n</div>)\n+(<figure class="news-fig[^"]*">.*?</figure>)', re.S)
for f in sys.argv[1:]:
    s = open(f).read()
    out, pos, side = [], 0, 0
    for m in re.finditer(r'<div class="split">|' + PAIR.pattern, s, re.S):
        if m.group(0).startswith('<div class="split">'):
            side += 1; continue
        # skip pairs that are already inside a split (prose directly after '<div class="split">\n')
        if s[max(0, m.start() - 20):m.start()].endswith('<div class="split">\n'): continue
        side += 1
        prose, fig = m.group(1), m.group(2)
        inner = f'{fig}\n{prose}' if side % 2 == 0 else f'{prose}\n{fig}'
        out.append(s[pos:m.start()]); out.append(f'<div class="split">\n{inner}\n</div>'); pos = m.end()
    out.append(s[pos:]); n = len(out) // 2
    open(f, 'w').write(''.join(out)); print(f, 'wrapped', n)
