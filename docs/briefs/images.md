# Brief: cover + body image for a news post

Use this brief as it is for any agent (Claude, Codex, Antigravity). Input: the slug(s). The writer left
`_sources/posts/news/<slug>/cover-brief.md`; the post is `src/content/posts/news/<slug>.mdx`.
Do not edit the .mdx while a copywriter is working on it: write image files and `figure.md` only.

Read first: `docs/editorial-standard.md` section 5 (cover and image rules, the central image script).

## Cover → `public/media/posts/news/<slug>/cover.jpg`, 1600×1200 (layout A, owner approved 28 Nov 2026)
The cover is a full-bleed photo with ONLY three things on it: the real logo (small plate, top-left), a 2-line headline,
and ONE fact line. No category label, chips, pills, icons or big logo tile. **The image tool never draws text**: all text
is placed by `scripts/content/cover_a.py` in the site font.

1. Folder `_sources/posts/news/<slug>/cover-a/` with:
   - `bg.jpg`: a real or official photo if one exists (credit it). Otherwise generate a scene through
     `scripts/content/gen_image.sh` (one image at a time; it calls ChatGPT through `codex exec`; never NanoBanana or an agent's own image tool, except inside Codex itself). The prompt
     must say: NO text, NO letters, NO logos, NO people/hands/faces; main subject in the UPPER 55% of the frame; the LOWER
     40% calm and uncluttered, fading to dark navy (dark tone) or off-white (light tone). Never invent a product's look.
     The background must NOT contain: a face or a hand (even in a real photo or an official screenshot), another
     outlet's photograph (outlet photos belong in the body with credit, never on the cover), readable text or device
     names on a screen, or the previous model standing in for a rumoured new one (use a scene that points to no model).
   - `logo.png`: the real logo from the brand's own site or Wikimedia Commons, without a tagline. US government seals are
     public domain. No real logo file → stop and say so.
   - `spec.json`: `{"bg":"bg.jpg","logo":"logo.png","lines":["บรรทัด 1","บรรทัด 2"],"fact":"…","tone":"dark"|"light","accent":"#hex"}`
     (`"plate":"dark"` for a logo with white lettering; `"bg_position"` to shift the crop). `tone` follows the photo.
     Headline: 2 short lines that make people want to read, not a compressed title. Fact: a fact of the STORY, never a note about the picture ("ภาพรุ่นปกติ" goes in `coverAlt` and the credit line): one number or one caveat
     ("ต้นทางเดียว: X", "ยังไม่ยืนยัน"). Check every word, number and who-said-it against the article.
2. `python3 scripts/content/cover_a.py <slug>` then `python3 scripts/content/thumbs.py`.
3. Look at the result: the main subject is not buried under the scrim (shift with `bg_position`); text not sitting on a busy part of the photo, logo visible on its plate, nothing important hidden
   under the scrim. `python3 scripts/content/cover_zoom.py <slug>` gives 100% tiles if you need to look closely.
4. Set `coverAlt` to the cover text ("ปกข่าว <line 1> <line 2> · <fact>").

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
