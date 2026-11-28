#!/usr/bin/env bash
# Run this FIRST in any agent session before news work. If a line says FAIL, stop and tell the owner:
# the session cannot do that step, and must not pretend it did.
cd "$(git rev-parse --show-toplevel)" || exit 2
bad=0; say(){ printf "%-9s %s\n" "$1" "$2"; if [ "$1" = FAIL ]; then bad=1; fi; return 0; }
c=$(curl -s -o /dev/null -w '%{http_code}' -m 15 https://nginx.org/ 2>/dev/null)
[ "$c" = 200 ] && say OK "network: can open source pages" || say FAIL "network: cannot open web pages ($c) -> cannot verify sources (steps 4, 7b)"
node -e "import('playwright').then(async({chromium})=>{const b=await chromium.launch();await b.close();console.log('ok')}).catch(()=>process.exit(1))" >/dev/null 2>&1 \
  && say OK "browser: can render covers and check pages" || say FAIL "browser: Chromium cannot start -> cannot run cover_a.py or check_pages.mjs (steps 6, 8)"
( touch _sources/.pf && rm _sources/.pf ) 2>/dev/null && say OK "write: _sources/" || say FAIL "write: _sources/ (facts.md, cover files)"
( touch "$HOME/news-digest/.pf" && rm "$HOME/news-digest/.pf" ) 2>/dev/null && say OK "write: ~/news-digest/ (followups)" || say WARN "write: ~/news-digest/ is read-only -> list follow-up lines for the owner instead"
curl -s -o /dev/null -m 8 http://100.89.1.29:4173/news/ && say OK "preview server is up" || say WARN "preview server not reachable: npx astro preview --host 0.0.0.0 --port 4173"
f=$(ls -t "$HOME"/news-digest/20*.md 2>/dev/null | head -1); [ -n "$f" ] && say OK "latest digest: $(basename "$f")" || say FAIL "no digest file in ~/news-digest/"
[ "$(git config core.hooksPath)" = scripts/hooks ] && say OK "commit gate installed" || say WARN "commit gate off: git config core.hooksPath scripts/hooks"
exit $bad
