---
name: dojojin-knowledge
description: Use when writing, rewriting or reviewing a long knowledge article (/knowledge/) on dojojin.tech, e.g. a Bluetooth, PDF, font or charger explainer built from the owner's source material plus research.
---

# Knowledge article (dojojin.tech)

**REQUIRED:** dojojin-content for the pipeline, privacy and the commit/deploy gates. This skill covers how a long explainer is written and checked.
**Copy from:** `src/content/posts/knowledge/bluetooth-guide.mdx` (long: logos, splits, timeline, myths), `pdf-history.mdx`, `charger-ripple-guide.mdx`.
These rules came from a Fable review of the Bluetooth guide (17 Nov 2026), where the owner approved every fix.

## Order of work

1. **Research.** Write a fact sheet with a source for each fact.
2. **Draft.** Build the structure (see below).
3. **Voice pass.** Rewrite in the owner's voice: ผม/ครับ, ask the reader's question and then answer it, one everyday picture per idea. Never invent his experiences.
4. **Independent review.** Give the reviewer the file, not your conclusions, and ask for contradictions, structure, repetition, ambiguous words and tics, each with a line number and a suggested fix.
5. **Verify every finding before fixing it.** A reviewer's claim is not a fact. Real cases:
   - aptX "325 kb/s" looked like a typo for 352, but it is the figure aptx.com gives.
   - "Mate 80 Pro" appeared in two L2HC lists and looked doubled, but the Huawei Support page lists it in both.
6. **Fix, then check.** `check-splits.py`, `npm run build`, then 390/768/1280 in light and dark, and CLS (see CLAUDE.md).

## Consistency (the most common defect)

- **One fact, one wording, everywhere.** Before finishing, grep each number, version and claim that appears more than once (table, card, body, myth card, glossary) and make them agree.
  - Bad: "HDT2/3/4 mandatory" in a table next to "HDT is optional" in the body.
  - Good: "HDT is optional; a device that includes it must have HDT2/3/4."
- **Attribute each number to who says it,** and attribute it the same way each time. If one fact has two sources, name both: Support page = 2.3 Mb/s, annual report = "lossless".
- **Vendor latency and quality numbers** get "(เลขของผู้ผลิตเอง)".
- **Hedges stay attached to the same claim at the same strength.** Don't print a year in a table and then disown it below. Write "ราวปี 2020" in both places.
- **Formats:**
  - Years: พ.ศ. first, with (ค.ศ.) on the first mention in a section. In a stat tile, use one style.
  - Units: `kb/s` and `Mb/s`, never `kbps`.
  - Use "Bluetooth LE", not BLE (BLE is mentioned once as the nickname). Use ไบต์ (octets on first use), sample rate, and มือถือ.
- **Counts in prose match the items.** "สามกลุ่ม" must have three sub-headings.

## Structure

- **Explain before use.** Basics come before the chapters that need them (why compress → CODEC families). A term is glossed the first time it appears, not three sections later.
- **One topic, one section.** If two sections talk about security, or Mesh is explained three times, merge them. Say "not just headphones" once.
- **Reference material goes last:** Core/latest news → myths → glossary → closing → sources.
- **Pointers name the section:** "(ดูหัวข้อไทม์ไลน์ทุกเวอร์ชัน)". Use ข้างบน/ข้างล่าง only for a block that is directly adjacent.
- **Text before its picture.** Put the explanation (or "where these bars come from") before the chart or table, not after it.

## Repetition

- Explain each fact fully once. Elsewhere, write one line and point to the section, or cut it.
  - Bluetooth guide before the fix: mic → HFP in 8 places, "LC3plus not mandatory" in 5, frame ≠ latency in 3, SBC 345 / LC3 160 twice.
- Use one analogy per idea and don't reuse it. The parcel analogy showed up six times.
- Cards that repeat a table further down get cut, or reduced to the one case the table lacks.

## Words and tics

- **Cut machine tics.** Each may appear at most once per article:
  - "อย่าเพิ่ง…"
  - "ถ้าให้จำข้อเดียว"
  - "มีข้อดีก็ย่อมมีข้อเสีย"
  - "ก่อนดู… ขอบอก…"
  - "บอกกันตรง ๆ"
  - two enumerations in a row ("เรื่องแรก… เรื่องที่สอง…")
- **No process talk.** Avoid "ลิงก์ที่ผมใช้เช็ก", "ข้อนี้ผมหาเอกสารไม่เจอ" repeated 13 times, and "บทความนี้เริ่มจาก…". Keep a hedge only where it changes what the reader believes. Write it about the claim, not about your work.
- **Ambiguous words:**
  - "คะแนนเสียง" → "คะแนนคุณภาพเสียง"
  - "ช่อง" can mean a column, a box or a channel, so say which.
  - In alt text, "มือถือกล่อง…" reads as "the phone box…", so write "มือข้างหนึ่งถือกล่อง…".
- **Card titles read on their own, and no card is left empty.** A myth card answers "ไม่ใช่ครับ…" first, then gives the reason.

## Pictures and logos

- **A paragraph beside a photo says why the photo matters.** It does not repeat the alt text. Screenshot paragraphs point to the exact spot ("ซูมดูมุมล่างซ้ายของกล่อง…").
- **Credits:** generated scenes are credited "ภาพประกอบจาก DOJOJIN.TECH" and are never called "ภาพประกอบ, so the label is blank".
- **Visual density:** about one visual block per phone screen (memory: long-articles-visual-density).
- **Technology logos:** `.logo-row` / `.logo-plate`. Use official or registered marks only, and credit them. Reject mislabeled images and promo posters.
  - Brand-only icons get a caption such as "ตัวอย่างไอคอน ANC ของ JBL".
  - Check that each logo is legible at 390px.
  - If there is no logo, use a dashed name plate with a plain caption, never "ไม่พบโลโก้ทางการ".
