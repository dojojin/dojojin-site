"""Usage: python3 check-splits.py <post.mdx>...  Prints problems: nested splits, splits without exactly 2 children,
standalone news-fig outside a split, figcaption still holding <b>, unbalanced div/section."""
import re, sys
for f in sys.argv[1:]:
    s = open(f).read(); probs = []
    if s.count('<div') != s.count('</div>'): probs.append('div unbalanced')
    if s.count('<section') != s.count('</section>'): probs.append('section unbalanced')
    if '<figcaption><b>' in s: probs.append('figcaption still has title/summary')
    # walk divs
    tokens = re.finditer(r'<div class="split">|<div[^>]*>|</div>|<figure class="(news-fig|split-fig)[^"]*"|</figure>', s)
    stack = []  # entries: [kind, children]
    for t in tokens:
        x = t.group(0)
        if x == '<div class="split">':
            if any(k == 'split' for k, _ in stack): probs.append(f'nested split near char {t.start()}')
            if stack: stack[-1][1].append('split')
            stack.append(['split', []])
        elif x.startswith('<div'):
            if stack: stack[-1][1].append('div')
            stack.append(['div', []])
        elif x == '</div>':
            if not stack: probs.append('extra </div>'); continue
            k, ch = stack.pop()
            if k == 'split' and len(ch) != 2: probs.append(f'split with {len(ch)} children near char {t.start()}')
        elif x.startswith('<figure'):
            in_split = bool(stack) and stack[-1][0] == 'split'
            if stack: stack[-1][1].append('fig')
            if 'news-fig' in x and not in_split: probs.append(f'standalone news-fig near char {t.start()}')
            stack.append(['fig', []])
        elif x == '</figure>':
            if stack and stack[-1][0] == 'fig': stack.pop()
    print(f, 'OK' if not probs else '; '.join(probs))
