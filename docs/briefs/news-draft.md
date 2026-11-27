# Brief: research + draft one news post (step 3–4 of the news workflow)

Use this brief as it is for any agent (Claude, Codex, Antigravity). Give the agent: the story, a slug, and the starting links from the digest.

Repo: /home/vigil-central/dojojin-site. Work in place. Do NOT enter a worktree, commit, push, or run `npm run build`.
The owner picked this story from the morning digest. You research it, verify it, and write the draft. A separate
copywriter will polish the Thai afterwards, and a separate step makes the cover image, so do neither of those.

## Read first (required)
1. docs/editorial-standard.md — all of it. Sections 0, 2, 3, 4 and 4.1 are rules that must not be broken.
2. docs/news-writing-guide.md — page markup, HTML blocks (news-stat, news-card, table-frame, timeline, split), frontmatter.
3. Two finished posts as models for structure and length:
   src/content/posts/news/nvidia-halts-ai-chip-exports-thailand-asean.mdx and
   src/content/posts/news/1password-github-employee-breach-2026.mdx

## Research
- Helper: `python3 -I scripts/content/fetch_grep.py <url> <regex> [<regex>...]` fetches a page and prints the text around each match.
  Use WebSearch / WebFetch too if you have them. A fact counts only if you opened the page yourself; search snippets do not count.
- Never put the owner's name or email in any request or User-Agent.
- Find the PRIMARY source first (the company's or agency's own statement, advisory, press release, release notes, court/DOJ page).
- Source rule: the story needs the official source, or 2+ independent outlets. Outlets repeating one outlet count as one.
  The owner picked this story, so do NOT drop it for having one source (owner rule, 27 Nov 2026). Search for support in
  this order: the subject's own statement/advisory/release notes/filing → a second outlet with its own reporting → the
  primary evidence the outlet used (benchmark listing, patent, certification database, commit, video, transcript) →
  background facts that bear on it. If it is still one origin after a real search, write it honestly: title starts with
  "[ข่าวลือ]" or "มีรายงานว่า…", the lead names the single origin, one block says what is confirmed / not confirmed /
  what you looked for and did not find, and the supporting background has its own section and sources. Report it as
  "SINGLE ORIGIN: <who>" so the lead agent can list it in `scripts/content/source-exceptions.txt` and in followups.
- Check Thai impact: is Thailand / Thai users mentioned anywhere? If nothing found, the post says so plainly.
- Write `_sources/posts/news/<slug>/facts.md` (mkdir -p): one line per fact: fact | URL | short quote copied from that page.
  Every number, date, name and quote in the post must have a line there.

## Write `src/content/posts/news/<slug>.mdx`
- Frontmatter exactly like the model posts: title, topic, type: news, tags (ONLY tags already in TAGS in src/data/site.js;
  do not edit site.js; if a needed tag is missing, list it in your report), date (now, with +07:00), section
  (security / tech / app / auto as fits), sourceName, sourceUrl (a real article URL you opened), description, kicker, lead,
  meta, cover: "/media/posts/news/<slug>/cover.jpg", coverAlt.
- Body 350–700 Thai words. Sections with `<section class="section">` and `<div class="prose">` as in the models.
  Suggested flow: เกิดอะไรขึ้น → รายละเอียด/ตัวเลข (stat cards or a table, HTML not images) → กระทบคนไทยแค่ไหน /
  ต้องทำอะไร → `## แหล่งข้อมูล` (class "section sources") → `## ที่มาของภาพ` with the single line "- ภาพปก: by dojojin.tech".
- Incident stories (attack, breach): short summary → timeline in Thai time where the source gives times → what was affected →
  Thai impact → cause as the organisation states it → what readers should do.
- Voice: the owner's. Simple Thai, "ผม", "ครับ", short sentences, point first. No emoji. No press-release phrasing.
  Never invent the owner's experience ("ผมลองแล้ว", "ผมยังไม่ได้ลอง"). No process talk ("ผมเปิดหน้านี้ไม่ได้", "403").
  Attribute claims ("X รายงานว่า", "ตามประกาศของ Y"); keep rumours and unconfirmed points labelled.
  Years in พ.ศ. English quotes get a Thai translation right after. Full names of people on first mention.
  Gloss technical terms on first use.
- Do not mention AI tools as the maker of text or images anywhere.
- The Write/Edit tools may be refused in this checkout: if so, write files with Bash (python3 or a heredoc).
- After writing: `python3 scripts/content/check-splits.py src/content/posts/news/<slug>.mdx` must print OK.

## Cover brief (you do not make the image)
Write `_sources/posts/news/<slug>/cover-brief.md`: the subject's real brand (name, official logo page or file URL you found,
brand colours as hex if the brand publishes them or as plainly visible on its site), a 3-line Thai cover headline (max ~14
characters per line), one key number or fact for a badge, 2 short chips, and what real-looking scene fits (no people's faces).
All cover text must match the article exactly.

## Final message (plain text, no file)
VERDICT (drafted / drafted, SINGLE ORIGIN: <who>), the sources you opened (URL + what each confirmed), what you could not verify,
any tag you needed that is missing from TAGS, and anything in the digest line that turned out to be wrong.
