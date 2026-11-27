---
name: dojojin-news
description: Use for any news work on dojojin.tech (/news/) — the owner says "สรุปข่าว", "ข่าวรอบเช้า/บ่าย", picks numbers from the digest ("1,2,9"), or asks to write, fix, re-check or illustrate a news post. Applies to every agent (Claude Code, Codex, Antigravity/agy).
---

# dojojin.tech news: from the digest to a published post

**A post is finished only when `python3 scripts/content/check-post.py <slug>` prints PASS.** Paste that output in your report.
Do not say "เสร็จแล้ว" without it. Rules live in `docs/editorial-standard.md` (read sections 0, 2, 4, 4.1, 5 once per session).
Start a NEW conversation for each news round; habits from an old conversation (Canva templates, direct image tools) are not the method.

## Steps (do them in order; do not skip or merge)

| # | Step | How |
|---|---|---|
| 1 | **Get the list** | Read the newest `~/news-digest/YYYY-MM-DD-HHMM.md`. A script already found, filtered, grouped and counted sources (cron 08:20 / 16:20). **Do not search for news yourself.** No file for this round or `last-error.log` not empty → say so; rerun with `~/news-digest/run.sh` only if the owner asks |
| 2 | **Show it** | Post the numbered list as it is (same numbers, source status per item). Then stop |
| 3 | **Owner picks** | Write only the numbers the owner picks. Never write an unpicked story |
| 4 | **Research + draft** | One agent per story, brief = `docs/briefs/news-draft.md`. Output: `_sources/posts/news/<slug>/facts.md`, the `.mdx`, `cover-brief.md`. Item marked "สื่อเจ้าเดียว" → see **Single-source picks** below (do not drop it) |
| 5 | **Voice pass** | A DIFFERENT agent, brief = `docs/briefs/voice-pass.md`. Save a copy of the draft first; `VOICE_BASE=<copy dir> python3 scripts/content/check-voice-pass.py <slug>` |
| 6 | **Cover + body image** | Brief = `docs/briefs/images.md`. Every image through `scripts/content/gen_image.sh` (queues, cooldown 25 s codex / 90 s NanoBanana, falls back). In agy: `IMAGE_ENGINES="agy codex"` (NanoBanana gives about 14 images per 5 h; the script moves to ChatGPT when it runs out). Never call an image tool directly. No Canva templates. A real photo or official product image exists → build the cover from it with `scripts/content/photo_cover.py` + `render_cover.mjs` instead of generating one. Real logo + brand colours, 1600×1200, text matches the article. Look at every image |
| 7 | **Assemble** | Put the figure in a `.split` beside its text; check each thing the copywriter flagged against `facts.md` |
| 8 | **Gate** | `python3 scripts/content/check-post.py <slug>...` → PASS, then `python3 scripts/content/thumbs.py`, `npm run build`, `npm run lint`, then `node scripts/content/check_pages.mjs http://100.89.1.29:4173 /news/<slug>/ ...` (opens each page at 390 / 768 / 1280, reports horizontal overflow and broken assets, saves screenshots of the first route to `/tmp/dojojin-intake/`) and look at the screenshots |
| 9 | **Report** | Thai, 🔵 Fact / 🟡 Opinion: gate output, preview links, what could not be verified, what the digest got wrong |
| 10 | **Commit / deploy** | Only when the owner says so in this session. `git push origin main` = production. Owner's name only, no trailer |
| 11 | **Follow up old stories** | Last step of every round: go through digest section "I. ติดตามข่าวเดิม" and the lines marked "อาจเกี่ยวกับโพสต์ที่ลงแล้ว". See **Follow-ups** below |

Full table with lessons learned: `docs/briefs/README.md`.

## Single-source picks (owner, 27 Nov 2026: "ถ้าที่ผมเลือกมี source ทางเดียว แต่เป็นข่าวที่น่าสนใจ เราจะไม่ตัดออก แต่จะให้หาข้อมูลสนับสนุนแทน")

The owner picking a number IS the decision to run it. Never drop a picked story for having one source. Instead:

1. **Look for support, in this order:** the subject's own statement / advisory / release notes / filing / court or regulator page →
   a second outlet with its OWN reporting (not a rewrite) → the primary evidence the outlet used (benchmark listing, patent,
   certification database, code commit, video, transcript) → background facts that make the claim more or less plausible
   (earlier official statements, previous model's specs, the same person's track record).
2. **Found support** → write normally and cite it.
3. **Still one origin after a real search** → write it anyway, honestly:
   - title starts with "[ข่าวลือ]" or "มีรายงานว่า…"; lead names the single origin ("ต้นทางเดียว: X")
   - a short block says what is confirmed, what is not, and what you looked for and did not find (reader-facing wording)
   - the supporting background goes in its own section with its own sources
   - add one line to `scripts/content/source-exceptions.txt`: `<slug> | เจ้าของเลือกจากสรุป <วันที่ รอบ ข้อ N>: ต้นทางเดียว <X>`
     (only for a story the owner picked; never to make an unpicked story pass)
   - add a follow-up line to `~/news-digest/followups.md` so the next digest watches for confirmation
4. **Report it** under 🟡: which picked stories are still single-origin and what would confirm them.

Outlets that repeat one outlet still count as one origin; say so, do not present them as agreement.

## Follow-ups (owner, 27 Nov 2026: "ข่าวเก่าไม่เกิน 1 อาทิตย์ หากมีอัปเดตให้อัปเดตของเดิม แต่ถ้าเกิน 1 อาทิตย์แล้วมีอัปเดต ให้สร้างเป็นข่าวใหม่แทน")

Age = today minus the original post's `date:`. The digest prints the age and the action for each follow-up item.

| Original post | Real new information arrives | Do |
|---|---|---|
| **7 days old or less** | yes | **Update the existing post**: add a block "อัปเดต <วันที่>" near the top with the new facts and sources, fix title/lead/table/cover text that the news makes wrong, set `updated:` and `bumped:` (same value) |
| **More than 7 days old** | yes | **Write a new post** (full steps 4–10), link back to the old one, and add one line at the top of the old post pointing to the new one (`updated:` only, no `bumped:`) |
| any age | no new information | nothing; the digest line stays "ไม่มีความคืบหน้า" |

- "Real new information" = confirmed by the subject or meeting the source rule. A rewrite of the same facts is not an update.
- Updates go through the same gate (`check-post.py`), and the cover is re-checked whenever a fact on it changed.
- Tell the owner which follow-ups you found and what you propose; update or write only after the owner says so (an update is still a pick).
- After acting: edit `~/news-digest/followups.md` (close the line, or set the next check date). Lines past their date with nothing new: propose closing them.

## Mistakes that already happened (do not repeat)

| Mistake | Rule |
|---|---|
| Wrote 11 posts in an old conversation with the old Canva template | New conversation; follow this file |
| Covers 1024×768, no logo, same navy template for every brand | 1600×1200, real logo + brand colours, dark only for cyber |
| Cover said RAM 8GB, article said 6GB | Cover text is checked against the article word by word |
| Invented a phone that looks like another brand | Product news uses the real official image, or no product on the cover |
| No `facts.md`, outlet names without links, dead links | `check-sources.py` (inside the gate) must pass |
| One-outlet rumours written as plain news, no label, no support | Follow "Single-source picks": search for support, label the origin, list in source-exceptions |
| One section, no Thai impact, "ครับ" once | 2+ sections, say what it means for Thai users (or that nothing was found), voice pass by another agent |
| Four images generated in 3 minutes | `gen_image.sh` only (cooldown) |
| Car news in `section: tech`, cyber news in `tech` | car → `auto`, vulnerabilities/attacks → `security` |

## What the gate cannot judge (a second agent and the owner still look)
Whether the Thai sounds like the owner · whether the cover text matches the article · whether a logo is the real one ·
whether two outlets are independent · whether the page really says what the post claims.
