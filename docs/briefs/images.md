# Brief: cover + body image for a news post

Use this brief as it is for any agent (Claude, Codex, Antigravity). Input: the slug(s). The writer left
`_sources/posts/news/<slug>/cover-brief.md`; the post is `src/content/posts/news/<slug>.mdx`.
Do not edit the .mdx while a copywriter is working on it: write image files and `figure.md` only.

Read first: `docs/editorial-standard.md` section 5 (cover and image rules, the central image script).

## Cover → `public/media/posts/news/<slug>/cover.jpg`, 1600×1200 JPEG
- Carries the subject's CI: the REAL logo/icon and brand colours. Download the logo from the brand's own site or
  Wikimedia Commons into `_sources/posts/news/<slug>/logo/` (never put the owner's name or email in a request).
  US government seals are public domain. No real logo file? Make the cover without one and say so. Never let the tool invent a logo.
- Dark background only for cybersecurity stories; all others light.
- Text: small category label, big 2–3 line Thai headline, one badge or highlight bar, 2–3 chips. Take them from the cover
  brief, but check every word and number against the article first and fix the brief where it disagrees.
- No faces, no hands, no watermark, no tool names (AI/ChatGPT/Codex/NanoBanana/Canva) in the image.
- Generate ONE image at a time through the central script (it queues, waits the cooldown, and falls back between tools):
  `scripts/content/gen_image.sh --prompt <prompt.txt> --out <out.png> -i <logo file> -i public/media/posts/news/pearcleaner-macos-app-review/cover.jpg`
  The last `-i` is the approved style reference (layout and finish only; tell the prompt not to copy its text or icon).
  Inside Antigravity, or when Codex is unavailable: prefix `IMAGE_ENGINES=agy` (NanoBanana, 90 s gap).
  Keep `prompt.txt` and the raw output in `_sources/posts/news/<slug>/cover-gen/`.
- In the prompt: put each exact Thai string in quotes, ask for correct Thai letterforms and tone marks, 4:3 landscape,
  text in the left ~55%, subject on the right, about 90px clear from every edge.
- LOOK at every result. Regenerate (max 2 retries) if a Thai word is misspelled, text differs from the prompt, the logo is
  wrong or distorted, text touches an edge, or hands/faces appear. Then centre-crop to 4:3 and resize to exactly
  1600×1200, JPEG quality 88.

## Body image → `public/media/posts/news/<slug>/photo-1.jpg` (1600×1200 or 1600×900)
- If an official image or real screenshot exists, use that (credit + link). Otherwise a realistic scene that illustrates
  the story with NO text, NO logos, NO people/hands/faces, generated with the same script (no `-i`).
- Write `_sources/posts/news/<slug>/figure.md`: `**Alt:**` (what is in the picture), `**Caption:**` (one Thai sentence ending
  "(ภาพประกอบจาก DOJOJIN.TECH)"), `**Placement:**` (which section it sits beside).
- In the post the figure goes inside `<div class="split">` next to a `<div class="prose">` block
  (`<figure class="news-fig news-fig--zoom">` with `<img ... width height loading="lazy" alt>` and `<figcaption>`), and
  "## ที่มาของภาพ" gets the line "- ภาพในเนื้อข่าว: ภาพประกอบจาก DOJOJIN.TECH".

Finish with `python3 scripts/content/thumbs.py`. Report per slug: cover text exactly as rendered, logo source URL,
and anything a human should look at again.
