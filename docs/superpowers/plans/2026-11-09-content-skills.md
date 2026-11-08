# Content skills: charger / headphone / food & places

Status: plan for owner review · 2026-11-09 · replaces the single "review pipeline" skill idea in
`2026-11-09-review-pipeline-skill.md` (that file's 10 stages stay the shared core).

Goal: three small skills, so each run loads only what it needs. Shared rules live in one place,
and every manual review done this session becomes a worked example.

## Why three skills, not one

The three content types need different things:

| Type | Specs come from | What we verify | Privacy hot spots | Page shape |
|---|---|---|---|---|
| Charger / power | the label, the meter (POWER-Z), the box | label vs meter vs owner text; PDO list; voltage accuracy; meter limit (KM003C max 6A) | iPad/phone notifications in meter photos; wallpapers | Short Brief + spec (label / meter source tags) + measurement cards + multi-port table + buy/not-buy |
| Headphones | the box, the app, the maker's page | owner text vs the official spec page; codec / ANC / battery numbers | app screens: Find-my map, account name, device MAC | Short Brief + brand history + spec + sound (bass / mid / treble) + EQ + mic + app gallery |
| Food & places | the receipt, signs, the owner's text | receipt sum vs printed total; address and phone from the receipt; menu names | faces of people at other tables, wallpapers, card numbers on receipts | Mini Review + เรื่องประทับใจ / ข้อแนะนำ + shop info (when known) + gallery by zone |

One generic skill would load all three checklists every time. Split skills load about a third as much.

## Layout

```
~/.claude/skills/
  dojojin-content/            # shared core, loaded by the three skills below
    SKILL.md                  # the 10-stage pipeline, gates, house style, privacy rules
    scripts/intake.py         # TEMP → _sources/<type>/<slug>, sha256, EXIF/GPS report, contact sheets
    scripts/prep_images.py    # resize ≤1600, strip EXIF, rename map, blur boxes, verify sheet
    scripts/shots.py          # build <slug>.shots.json from a small Python list (w/h filled in)
    scripts/check_pages.mjs   # Playwright: 390/768/1280, overflow, errors, modal, image load
  dojojin-charger/SKILL.md    # charger specifics + examples: orsen-c102t, slimq-f100, commy, apple-96w
  dojojin-headphone/SKILL.md  # headphone specifics + examples: shokz-opendots-one, oppo-enco-x3s
  dojojin-food/SKILL.md       # food/place specifics + examples: jinko-suphanburi, ponn-cafe
```

Each type skill holds three things:

1. **Trigger:** e.g. "รีวิวหูฟังใน TEMP" or "TWS-xxx".
2. **Type checklist:** what to read from photos and which sources to trust, in order.
3. **The template it writes:** front matter, sections and `shots.json` groups.

It points at the core skill for everything else.

## Rules captured from this session (go into the core SKILL.md)

- **Owner voice first.** Keep the owner's words, and only fix typos. List every change in the report.
- **No emoji in the UI.**
- **Things I add:**
  - Mark knowledge add-ons clearly.
  - Every number needs a source tag.
  - Never invent taste, sound or quality claims. If something is unknown, write it as unknown, e.g. "น้ำปริศนาผลไม้หั่นเต๋า".
- **Old posts (older than about 2 years):**
  - Correct the facts in place, with no "what changed" table and no "เดิม:" rows.
  - One line at the top: "นำมาลงซ้ำและแก้ข้อมูลให้ถูกต้องแล้ว สมัยนั้นข้อมูลอาจจะไม่ครบรอบด้าน".
- **Labels for food reviews:**
  - Use "เรื่องประทับใจ / ข้อแนะนำ".
  - Do not use "ผ่าน / ไม่ผ่าน".
- **Measurement limits:** always state the meter's limit when a reading is near it. KM003C is rated 6A. The older USB meter is about 5A.
- **Date and order:**
  - `date` follows the **product timeline**: launch or purchase era, so older products sit lower.
  - When unsure, use the photo date and add a YAML comment asking for the FB post date.
- **Privacy:**
  - Strip GPS from every photo.
  - View every screenshot.
  - Blur faces, including phone wallpapers.
  - Blur names in notifications, maps and coordinates.
  - The owner decides whether to publish a shop's own address and phone.
- **Confidentiality:** run the Vigil and HippoCraft deny-list scan on `dist/`.
- **Gates:**
  - Ask before every commit, with commits split per post.
  - Never push or deploy without the owner's order.
  - For big batches, fan out to sub-agents (one per 2–3 posts). Brief them with the template files, not with this session's history.

## Token savings (expected)

- **Scripts replace retyped Python.** In this session, image prep, contact sheets and shots.json were written ~10 times by hand. Saving: roughly 30–40% of tool-call tokens per review.
- **Contact sheets first.** Look at full-size crops only for labels, meters and receipts.
- **One check script.** It prints one line per width and only failing details.
- **Sub-agents for batches.** The main thread keeps only reports.

## Before building the skills

1. Finish Astro Task 5:
   - `scripts/smoke.mjs` (becomes `check_pages.mjs`)
   - sitemap
   - CLAUDE.md / DEPLOYMENT.md rewrite
2. First production cut-over (`astro-rebuild` → `main`) after a preview check. Until then, "deploy" stops at the preview branch.
3. Build the core skill, then the three type skills. Test each on one real TEMP folder before relying on it.

## Open questions for the owner

- Which gates may run without asking? Proposed: commit plus push to the preview branch automatically, and always stop before prod.
- Should the FB post link be asked for at intake (one question), or added later in a batch?
