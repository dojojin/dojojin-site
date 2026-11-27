# AGENTS.md — DOJOJIN.TECH

Instructions for every coding/writing agent in this repo (Codex, Antigravity/agy, Claude Code, others).
Claude Code reads `CLAUDE.md`; Antigravity also reads `GEMINI.md`, which points here. All three must stay consistent.

## News work: one skill, one gate

For anything about /news/ (digest, writing, fixing, covers) follow the skill **`.claude/skills/dojojin-news/SKILL.md`**
(also at `.agents/skills/dojojin-news/`). It starts from the script's digest in `~/news-digest/`, not from your own search.
A news post is not finished until `python3 scripts/content/check-post.py <slug>` prints PASS; put that output in your report.
The same check runs as a git pre-commit hook (`scripts/hooks/pre-commit`, enabled with `git config core.hooksPath scripts/hooks`):
a news post dated 27 Nov 2026 or later that does not PASS cannot be committed. Never use `--no-verify`; only the owner may.

## Read before you work

| Task | Read |
|---|---|
| Anything in this repo | [`CLAUDE.md`](./CLAUDE.md) — stack, commands, deploy, responsive and Core Web Vitals rules |
| Picking, writing, checking or illustrating content | [`docs/editorial-standard.md`](./docs/editorial-standard.md) — **the single editorial standard** (selection, sources, owner's voice, covers, checklist) |
| Making news end to end (order of work, who does what) | [`docs/briefs/README.md`](./docs/briefs/README.md) |
| Drafting a picked story / voice pass / cover and images | [`docs/briefs/news-draft.md`](./docs/briefs/news-draft.md) · [`docs/briefs/voice-pass.md`](./docs/briefs/voice-pass.md) · [`docs/briefs/images.md`](./docs/briefs/images.md) (ready-made briefs, same for every agent) |
| News page markup, HTML blocks, cover scripts | [`docs/news-writing-guide.md`](./docs/news-writing-guide.md) |
| Charger / headphone / food / knowledge posts, FB carousel | `.claude/skills/dojojin-*/SKILL.md` (plain Markdown; usable by any agent) |
| Facebook review pack | [`docs/fb-review-pack.md`](./docs/fb-review-pack.md) |

## Non-negotiables

- Reply to the owner in Thai. Separate verified facts (🔵 Fact) from recommendations (🟡 Opinion).
- Never write a news post the owner has not picked. Never invent facts or the owner's experiences.
- A fact counts as verified only if you opened the page yourself. Search summaries do not count.
- No single-source news. Outlets repeating one outlet's report count as one source.
- Site copy is in the owner's voice: simple Thai, ผม/ครับ, no emoji.
- The voice pass (เกลาสำนวน) changes wording only: never a number, date, name, link or HTML block. Run
  `python3 scripts/content/check-voice-pass.py <slug>` afterwards. Full list: `docs/editorial-standard.md` §4.1 (owner, 26 Nov 2026: "ห้ามละเมิด").
- No process talk on the page ("ผมเปิดหน้านี้ไม่ได้", "403"). Keep every hedge and attribution at the same strength.
- When an article's facts change, open its cover and every image with text and fix them too.
- Covers are 1600×1200 and carry the subject's real logo/icon and brand colours. Text on a cover must match the article.
- Never write AI / Codex / ChatGPT / Canva / NanoBanana in image credits, alt text or inside images. Cover credit: "by dojojin.tech".
- No images from Thai news outlets.
- **Do not commit, push or deploy unless the owner says so in this session.** Pushing `main` deploys production.
  Commits use the owner's name only (repo git config) with no `Co-Authored-By` or other trailer.
- Never commit `_sources/`. Never edit `public/data/` by hand (use `node scripts/patch-atlas.mjs`).
- Vigil Platform / Vigil Mobile are confidential: no vendor, protocol or architecture detail anywhere.
- Before any UI change is committed: check 390 / 768 / 1280 px, no horizontal scroll, and look at the real screenshots.

## Commands

```bash
npm run dev        # http://localhost:4321
npm run build      # static build → dist/
npm run lint
npx astro preview --host 0.0.0.0 --port 4173   # owner reviews at http://100.89.1.29:4173
python3 scripts/content/thumbs.py
scripts/content/gen_image.sh --prompt prompt.txt --out cover.png -i logo.png   # image tool with cooldown: codex (ChatGPT) then agy (NanoBanana); IMAGE_ENGINES=agy inside Antigravity
DIGEST_ENGINES=codex ~/news-digest/run.sh   # news digest; final AI recheck by agy | codex | claude (default order "agy codex claude", or one line in ~/news-digest/engine)
python3 scripts/content/check-splits.py src/content/posts/news/<slug>.mdx
python3 scripts/content/check-sources.py <slug>   # sources: links open, every named outlet is linked, 2-source rule, facts.md
```

## Working with other agents

- Several agents may edit this repo on the same day. Run `git status` and `git log -5` first; do not overwrite or revert
  another agent's uncommitted work, and do not assume your earlier view of a file is current.
- Leave hand-over notes in `_sources/` (gitignored), e.g. `_sources/editorial-audit-YYYY-MM-DD.json`:
  what was checked, what was changed, what remains.
- When the owner gives a new standing rule, write it into `docs/editorial-standard.md` with the date, not only into
  your own tool's memory.
