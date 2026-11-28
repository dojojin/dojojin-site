# GEMINI.md — DOJOJIN.TECH

Antigravity / Gemini agents: the rules for this repo are in [`AGENTS.md`](./AGENTS.md). Read it first, then the documents it links:

- [`CLAUDE.md`](./CLAUDE.md) — project rules (stack, deploy, responsive, Core Web Vitals)
- [`docs/editorial-standard.md`](./docs/editorial-standard.md) — news selection, sources, owner's writing voice, covers, pre-delivery checklist
- [`docs/news-writing-guide.md`](./docs/news-writing-guide.md) — page markup and cover tooling

**News work (digest, writing, covers): follow `.claude/skills/dojojin-news/SKILL.md` step by step, in a new conversation, and finish only when `python3 scripts/content/check-post.py <slug>` prints PASS. Do not use Canva templates or call image tools directly; use `scripts/content/gen_image.sh` (it calls ChatGPT through `codex exec`); never your own image tool (NanoBanana).**

Do not keep a separate copy of the rules here. If the owner gives a new standing rule, add it to `docs/editorial-standard.md`.
