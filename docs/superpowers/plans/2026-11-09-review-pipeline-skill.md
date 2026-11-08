# Review Pipeline Skill — Plan (draft for owner review)

Goal: one skill that takes a folder from `~/TEMP`, produces a finished post on dojojin.tech, and walks it
through a test stage to production, with the owner approving at fixed gates.

Status: draft · 2026-11-09 · based on the manual runs for ripple-guide, Shokz OpenDots One, HOCO Q47, OPPO Enco X3s.

## Pipeline

| # | Stage | What the skill does | Output | Gate |
|---|---|---|---|---|
| 1 | **Intake** | Read every file in `TEMP/<folder>/`: `post.txt` + images. Identify the product/place, propose `type` (review / knowledge / data / …), `topic`, `tags`, `slug`. Report GPS-tagged photos. | intake summary | ask the owner only if type/slug is unclear |
| 2 | **Move** | `TEMP/<folder>` → `_sources/posts/<type>/<slug>/` with sha256 check of every file; delete empty TEMP folders. | files in `_sources/` | — |
| 3 | **Research & verify** | Primary sources first: read the box/label in the photos (full-res crops), then the maker's official page, then reputable press. Each spec row records its source (`ฉลาก`, `กล่อง`, maker, `ร้านค้า`). Compare against the owner's text; list conflicts; never fill from memory. | `<slug>.spec.json` + list of conflicts | — |
| 4 | **Privacy check** | Resize ≤1600 px, strip EXIF/GPS. Look at every screenshot for maps, coordinates, addresses, faces, names, account details; crop or ask. Scan text for confidential terms (Vigil list). | `public/media/posts/<type>/<slug>/` | ask if something personal is in a photo |
| 5 | **Write** | MDX in the house layout (Short Brief + pros/cons, spec, sections from the owner's text, knowledge add-ons clearly marked, gallery). Owner wording kept; obvious typos fixed and listed. Caption for every image (`<slug>.shots.json`, groups, `fit: contain` for tall screenshots). No emoji as UI. | `<slug>.mdx`, `<slug>.shots.json` | — |
| 6 | **Build & verify** | `npm run build`, `npm run lint`, smoke check: all routes at 390 / 768 / 1280, no horizontal overflow, no JS errors, no 404s, modal opens, no docs links, confidential scan. Look at screenshots. | pass/fail report | — |
| 7 | **Report** | Thai Fact/Opinion report: what was added, every change to the owner's text, conflicts with official specs, open questions (FB post date/link, price). | report | **STOP — owner reviews** |
| 8 | **Commit** | One commit per post, owner name only, no trailer. | commit | **owner approves commit** |
| 9 | **Deploy: test stage** | Push the working branch → Cloudflare Pages builds a preview URL. Run the smoke check against the preview URL. | preview URL | owner approves push (or pre-approve this gate) |
| 10 | **Deploy: production** | Merge to `main` (fast-forward) → Pages deploys dojojin.tech. Re-run the smoke check on production. | live post | **owner approves every prod deploy** |

## Things to build once, before the skill

1. **Finish Task 5 of the Astro plan.** `scripts/smoke.mjs` becomes stage 6's check. Also: sitemap cleanup and rewriting `CLAUDE.md` / `DEPLOYMENT.md`.
2. **Helper scripts**, so the skill doesn't retype them each time:
   - `scripts/intake.py`: move, checksum and GPS report.
   - `scripts/prep-images.py`: resize, strip EXIF, keep a crop list.
   - `scripts/smoke.mjs`.
3. **First production cut-over.** Merge `astro-rebuild` → `main` once, after a preview check. Until then there is no "prod" for new posts to go to.
4. **Cloudflare Pages settings:**
   - Branch previews enabled.
   - `VITE_OWNER_EMAILS` set for **Preview** too.
   - `NODE_VERSION` comes from `.node-version`.
5. **Firebase Auth:** add the `*.pages.dev` preview domain to Authorized domains, so guestbook sign-in works on the test stage.
6. **New content types the owner wants:**
   - Places, restaurants and food reviews (`TEMP/variety`).
   - Decide where they live in the menu, and what spec-like "facts" a place has (address, opening hours, price range, map link). The skill then gets a second template.

## Skill layout (proposal)

```
~/.claude/skills/dojojin-review/
  SKILL.md            # the 10 stages above, gates, house style, privacy rules
  templates/          # review.mdx, place.mdx, spec.json, shots.json
  scripts/            # intake.py, prep-images.py (smoke.mjs stays in the repo)
```

## Open questions for the owner

- Which gates may run without asking? Stages 8 and 9 are the candidates, for example "commit and push to preview automatically, stop before prod".
- Should the FB post date and link be asked for at intake, so the date isn't a photo date?
- Should a post go live on its own day, or should several posts be batched into one production deploy?
