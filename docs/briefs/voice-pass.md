# Brief: voice pass (เกลาสำนวน, step 5 of the news workflow)

Run by a different agent from the one that drafted. Works for any agent (Claude, Codex, Antigravity).

You are the copywriter. The facts in these posts were already checked against sources. Your job is ONLY the Thai wording:
make every post read like the site owner wrote it. Repo: /home/vigil-central/dojojin-site. Work in place.
Do NOT enter a worktree, commit, push, run `npm run build`, or touch images / json / other files.

## Read first
1. docs/editorial-standard.md section "4. สำนวนเจ้าของเว็บ" (the rules) and section 0.
2. The owner's real writing, to hear the voice: src/content/posts/review/hoco-q47.mdx, src/content/posts/review/anitech-h9313.mdx,
   src/content/posts/knowledge/usb-charger-data-pins.mdx (skim the prose parts).

## What to change
- Simple spoken-but-tidy Thai, "ผม", "ครับ" (not on every sentence). Short sentences, point first, paragraphs of 1–3 sentences.
- Remove translated-English and press-release phrasing ("มุ่งมั่น", "ตอกย้ำ", "ยกระดับประสบการณ์", "ถือเป็นก้าวสำคัญ", "ทั้งนี้", "อย่างไรก็ตาม" chains, passive "ถูก…โดย").
- Process talk becomes reader-facing. Bad: "ผมเปิดหน้า X ไม่ได้ (403)", "หน้าที่ผมเปิดอ่าน", "ตามหน้าที่เปิดได้", "ต้นฉบับ".
  Good: "ผมหาเอกสารยืนยันจาก X ไม่เจอครับ", "X ยังไม่ได้ประกาศเรื่องนี้". Keep the hedge itself and its strength; only reword it.
- A source named over and over in one section: name it once where the claim starts, then let the sentences flow. Never drop the
  attribution of a claim entirely, and never turn "ตามที่ X รายงาน" / "คาดว่า" / "ยังไม่ยืนยัน" into a plain fact.
- Technical terms and abbreviations get a short plain gloss on first use if missing ("CVE (เลขทะเบียนช่องโหว่สากล)").
- English quotes in " " must be followed by a Thai translation.
- Fix clumsy or ambiguous words, typos, doubled particles, machine tics ("อย่าเพิ่ง…", "บอกกันตรง ๆ", "ที่น่าสนใจคือ" repeated).
- title / description / lead / coverAlt / figcaption / table cell text: polish wording if it is clumsy, but keep the meaning, and keep
  the title's key facts and roughly its length. Do not change `slug`, file names, tags, dates, kicker, sourceUrl, sourceName.
- No emoji. Never mention AI tools as the maker of text or images. Never invent the owner's experience ("ผมลองแล้ว", "ผมใช้อยู่").
  Existing "ผมว่า…" opinions stay opinions; you may tighten them but not add new claims.

## What must NOT change (a script checks this)
- Every number, date, price, version, model name, person/company name, URL, link target, image path.
- All HTML tags, class names and MDX structure (sections, `<div class="split">`, tables, figures, `news-stat`, tint blocks, sources section).
  Edit the text inside them only. Do not add or remove blocks, rows, list items or paragraphs that carry a fact.
- The "## แหล่งข้อมูล" and "## ที่มาของภาพ" sections: leave as they are except obvious typos.
- Length: stay within about −12% / +8% of the original.
- A post that already reads well: change little or nothing. Do not rewrite for the sake of it.

## How to edit
The Write/Edit tools are refused in this checkout. Edit with Bash: a small python3 script per post, kept in
a temp folder outside the repo, that reads the file, replaces exact old strings with new ones
(`assert old in s` for each), and writes it back. Work post by post: read the whole post first, then edit.

After each post:
- for a post already published: set frontmatter `updated:` to the current time (+07:00). For a new post, add nothing;
- `python3 scripts/content/check-splits.py src/content/posts/news/<slug>.mdx` must print OK;
- `python3 scripts/content/check-voice-pass.py <slug>` must print OK (new post not in git yet: save a copy before you start and run it with `VOICE_BASE=<folder with that copy>`). If it prints DIFF, restore what you changed by
  accident. A DIFF that is intended and harmless (for example a Thai gloss that adds a Latin word, or a removed "403") is fine:
  list it in your report with the reason.

## Report (your final message, plain text, no file)
Per post one line: slug — untouched / light / heavy — the 1–2 most typical changes (old → new, short).
Then: any factcheck DIFF you left and why; any sentence where you were unsure whether rewording changes the meaning (quote it);
anything that looked factually wrong (do NOT fix facts, just list them).
