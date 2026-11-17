---
name: dojojin-fb-carousel
description: Use when the owner asks for short Facebook content with images ("Content สั้นๆ พร้อมรูป", "แบบ HippoCraft") about a dojojin.tech article, review or news post.
---

# FB carousel for a dojojin.tech post

**Deliverable:** one zip, plus a preview image sent with SendUserFile, plus the caption printed in chat as a code block. The zip holds:
- N slides as PNGs at 2160×2700 (4:5)
- `post.txt`
- `preview-sheet.jpg`

Do it in one go, with no step-by-step questions. First example: `_sources/social/sets/bluetooth-guide/` (17 Nov 2026).

## Generator (gitignored, in `_sources/social/`)

```
_sources/social/
  dojojin-logo-round.png       # brand badge (copy of _sources/brand/dojojin-logo-round.png)
  fonts/IBMPlexSansThai-*.ttf  # OFL, + OFL.txt
  sets/<name>/make.py          # slide content + CSS → slides.html
  sets/<name>/render.mjs       # Playwright: node render.mjs 1 (1080 preview) | 2 (2160×2700)
  sets/<name>/post.txt
```

1. New set: `cp -r _sources/social/sets/bluetooth-guide _sources/social/sets/<name>`, then rewrite the `slides = [...]` list and the `MEDIA` path in `make.py`.
2. Run `python3 make.py && node render.mjs 1`.
   - The script prints "no overflow" or "slide N overflows by Npx". Fix every overflow by shortening text or reducing a photo's height.
   - Look at a contact sheet of all slides. Check that logo rows don't wrap untidily and there are no orphan words or big empty bottoms.
3. Render the final set with `node render.mjs 2`, then zip `out/2160x2700/*.png`, `post.txt` and the preview sheet.

## Look (differs from HippoCraft on purpose)

HippoCraft is a dark navy engineering log with emoji. dojojin.tech is light, like the site.

- **Colours:** paper `#f7f7f5`, white cards with a `#e2e2dc` border, ink `#1c1c1a`, muted `#5c5c57`, teal `#00735f`, yellow `#f7c433` (from the D in the logo), navy `#07111f` for the CTA box only. Teal/yellow strip at the top.
- **Header:** round DOJOJIN badge at 64px, "DOJOJIN.TECH" bold, a muted subtitle (section · article name), and an `n/N` pill at the top right.
- **Footer:** "อ่านเต็มที่ dojojin.tech/<path>".
- **Slide pattern:**
  - a yellow pill tag (e.g. เข้าใจผิดบ่อยที่สุด · ใหม่ · ล่าสุด · ก่อนซื้อ)
  - a 56px bold heading, often the reader's question
  - one of: a photo, cards, stat tiles, bars, an A → B flow, or numbered steps
- **Cover:** a large photo, kicker, an 84px title, a lead line, logo plates, then 3 chips.
- **Last slide:** "ก่อนซื้อ / สิ่งที่ควรดู" steps, then the navy CTA with the URL.
- **Logos (the owner wants them because they attract attention):** white plates (`plates([...])`) using the article's own logo PNGs from `public/media/.../logo/`. Use the official or registered marks already vetted for the article; never invent one.
- **Photos:** only the article's own pictures. Generated scenes carry "ภาพประกอบจาก DOJOJIN.TECH" on the image. Don't use Commons or third-party photos unless the credit fits on the slide. Check generated photos for bad hands.

## Text rules

- **Every number and claim comes from the published post,** including its hedges. Vendor numbers stay vendor numbers, and expected dates stay "คาดว่า".
- **Voice:** the owner's (ผม/ครับ, simple Thai, plain opinions). Never invent his experiences.
- **Slides:** short lines, one idea per slide, about 7 slides.
- **`post.txt` (Facebook):**
  - No emoji. The only symbols allowed are → and ✓ (the owner's rule).
  - Structure:

```
<question headline>? <short answer>ครับ
<2-line intro: what the article is, "ส่วนนี้คือฉบับย่อครับ">

→ point 1 … (4–5 points, one per slide idea)

<ก่อนซื้อ / ควรดู> 3 อย่าง
✓ … ✓ … ✓ …

อ่านเต็ม ๆ พร้อมที่มาของทุกตัวเลข → https://dojojin.tech/<path>/

#dojojin #<topic> … (6–8 hashtags)
```

- Claude never presses Post on Facebook. The owner posts it himself.
