---
name: dojojin-content
description: Use when turning a folder in ~/TEMP (post.txt + photos) into a post on dojojin.tech, or when fixing an existing post's captions, specs or photos. Loaded by dojojin-charger, dojojin-headphone and dojojin-food; read it first.
---

# dojojin.tech content pipeline (shared core)

One TEMP folder → one post: `src/content/posts/<type>/<slug>.mdx` + `.shots.json` (+ `.spec.json`) +
`public/media/posts/<type>/<slug>/*.jpg`. Copy the closest existing post; never design a new layout.

## Steps

| # | Do | Tool |
|---|---|---|
| 0 | Slug = ascii kebab-case: `<brand>-<model>` (review) · `<shop>-<place>` (eat) · topic words (knowledge) | — |
| 1 | Intake: copy to `_sources/posts/<type>/<slug>/` (sha256), list photos (GPS?), print post.txt, contact sheets | `python3 scripts/content/intake.py ~/TEMP/<folder> <type>/<slug>` |
| 2 | Look at the sheets (`/tmp/dojojin-intake/<slug>/sheet-*.jpg`); crop full-size only labels, meters, receipts, screens | Read |
| 3 | Verify facts: label/box/receipt in the photo → maker's page → press. Never from memory | WebSearch (deferred: load via ToolSearch) / crops |
| 4 | Images: write plan.json (names, blur/crop boxes), run, LOOK at every `blur-*.jpg` | `scripts/content/prep_images.py` |
| 5 | Captions → `shots.json` | `scripts/content/shots.py` |
| 6 | Write the mdx (+ spec.json) from the type skill's template | Write |
| 7 | `npm run build && npm run lint`; preview server on :4173 if not running (`npx astro preview --host 0.0.0.0 --port 4173`, it stays up and serves each new build); then check | `node scripts/content/check_pages.mjs http://localhost:4173 /<type>/<slug>/ /<type>/ /` + look at all three `/tmp/dojojin-intake/check-{390,768,1280}.png` |
| 8 | Report in Thai (Fact / Opinion): edits to the owner's text, spec conflicts + source, privacy edits, open questions | — |
| 9 | **STOP** — commit only on the owner's word, one commit per post, owner name only, no trailer | git |
| 10 | Deploy only on the owner's word: `git push origin astro-rebuild` (preview) → `git checkout main && git merge --ff-only astro-rebuild && git push origin main && git checkout astro-rebuild` → re-run check against https://dojojin.tech | git |

Batch of 4+ posts: one sub-agent per 2–3 posts (same type together), briefed with this skill + the type skill + the example post paths. The main thread adds every needed tag to `TAGS` first; sub-agents write only their own slugs' files, may run build/check, never commit. The main thread re-runs build + check over all routes, then reports.

## Writing rules

- **Owner's voice.** Keep his words. Fix only typos (Shot→Short, ข้อสังเกตุ→ข้อสังเกต) and list each fix in the report. No emoji anywhere on the page.
- **Every number has a source** in the spec table's 3rd column: `ฉลาก` `กล่อง` `ผู้ผลิต` `แอป` `มิเตอร์` `บิล` `ร้านค้า` `ผู้รีวิว`. Owner value ≠ label/maker → use the verified value, report the conflict.
- **The owner's own claim that nothing contradicts** stays, tagged `ผู้รีวิว`. **Anything else unverified or pending** (a spec you'd add without a source, a receipt that doesn't add up, a protocol the meter didn't name) stays off the page or reads "ไม่ระบุ", and goes in the report as a question.
- **Never invent** taste, sound, quality or menu names. Unknown stays unknown, said plainly and in his tone (a drink he forgot = "น้ำปริศนาผลไม้หั่นเต๋า … จำไม่ได้แล้วเหมือนกันว่าสั่งอะไร"). Ask instead of guessing.
- **Additions** (knowledge boxes, explanations) only when they help the reader, each with a source link.
- **Old posts (≈2+ years):** correct facts in place; one line in `lead`/`description`: "นำมาลงซ้ำและแก้ข้อมูลให้ถูกต้องแล้ว สมัยนั้นข้อมูลอาจจะไม่ครบรอบด้าน". No "what changed" table, no "เดิม:" rows.
- **`date`** follows the product/visit timeline (photo date if unsure) with a YAML comment asking for the FB post date. Home rows mix categories automatically.
- **Tags** must exist in `TAGS` in `src/data/site.js` (build fails otherwise); add new ones there first.

## Privacy (every photo, every time)

GPS is stripped by prep_images. You must still LOOK and blur/crop: faces (incl. phone wallpapers and staff in the background), names/emails in notifications, account names in apps, maps / Find-my / coordinates, parcel labels, the owner's business-card address/phone/email/QR, unit serial numbers and per-unit QR, passports/ID cards. Check the blurred output — a missed box is the common failure. Never publish `_sources/`.
