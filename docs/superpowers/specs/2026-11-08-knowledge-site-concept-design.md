# DOJOJIN.TECH — Knowledge & Review Site Concept (draft)

Status: implemented on branch `astro-rebuild` · 2026-11-08, revised 2026-11-09

> **Revision 2026-11-09 (owner):** the menu is split **by type**, not by topic, so readers can skip what they don't want:
> `Home · Review · ความรู้ · Data · Projects · Guestbook`. URLs are `/review/<slug>/`, `/knowledge/<slug>/`, `/data/<slug>/`.
> Content folders follow the type (`src/content/posts/<type>/`). Topic (Gadget / ถ่ายภาพ / Infra & AI) becomes a card badge,
> and a topic filter appears inside a section once it holds more than one topic. The home page shows one block per type, in menu order.
> The sections below that say "topic-first" are superseded by this note.

## Positioning
"อธิบายเทคโนโลยีให้เข้าใจง่าย วัดจริง รีวิวจริง" — a knowledge + review site by Dojo-mAn.
The person is secondary: everything about the owner lives under **Projects**.

## Navigation (topic-first)
`Gadget · ถ่ายภาพ · Infra & AI · Projects · Guestbook`

- A topic appears in the menu only once it has at least one post (today only Gadget).
- `Docs` leaves the main menu; it is linked from Projects only.
- `About` is merged into Projects. `Reviews` and `Data` stop being menu items; they become post types.

## Content model
One collection, `posts`, at `src/content/posts/<topic>/<slug>.mdx`, with:
- `topic`: `gadget` | `photo` | `infra-ai`
- `type`: `ความรู้` | `รีวิว` | `ข้อมูล`, shown as a badge and a filter chip on topic pages
- the existing review fields (title, date, cover, lead, kicker, meta, sourceUrl, draft)

Price Atlases stay as standalone HTML. They are listed in Gadget as type `ข้อมูล` cards (from `src/data/atlases.js`).

URLs: `/<topic>/<slug>/`, for example `/gadget/charger-ripple-guide/`, `/gadget/shokz-opendots-one/` and `/gadget/iphone-price-atlas/`. The branch has never been deployed, so no redirects are needed.

| Existing content | Topic / type |
|---|---|
| หัวชาร์จแบบไหนดี | Gadget / ความรู้ |
| Shokz OpenDots One | Gadget / รีวิว |
| Price Atlas ×3 | Gadget / ข้อมูล |

## Pages
- **Home:** a site tagline, not the owner's job title. Then latest posts across all topics, then one block per topic that has posts.
- **Topic page** (`/gadget/`): post cards with type filter chips (ทั้งหมด / ความรู้ / รีวิว / ข้อมูล).
- **Projects:**
  1. A short intro of the owner.
  2. Project cards, each 1–2 sentences, with a "เอกสารฉบับเต็ม" link to docs.dojojin.tech.
  3. Work history (today's About content).

## Confidentiality (owner rule)
Vigil Platform and Vigil Mobile are business-confidential. The site shows a teaser only: no vendor protocol names, no alert channels, no architecture, no case studies. Details stay on docs.dojojin.tech, which remains a separate site and is not merged.

Draft teasers:
- **Vigil Platform:** ระบบรวมกล้องวงจรปิดหลายยี่ห้อมาวิเคราะห์และจัดการในจอเดียว ใช้งานจริงในองค์กร
- **Vigil Mobile:** แอปมือถือคู่กับ Vigil Platform ดูสถานะกล้องและการแจ้งเตือนได้ทุกที่
- ANPR and Crowd Density are folded into the Vigil Platform teaser. They are not separate cards.
- HippoCraft, AI Stack and AI OCR Pipeline get short teasers plus a docs link.
- `CASE_STUDIES` and the vendor list in `PROFILE.summary` are removed from the formal pages.

**Open question:** `/lab` (the old site, already public on production today) contains the same Vigil details. Should they be trimmed there too?

## Out of scope
New content for ถ่ายภาพ and Infra & AI, search, comments on posts, English pages.
