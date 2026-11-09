---
name: dojojin-headphone
description: Use when a ~/TEMP folder or request is about earbuds, TWS, open-ear or headphones for dojojin.tech — e.g. "TWS-00x", "รีวิวหูฟัง", a post.txt with Bass / Midrange / Treble / EQ / Microphone sections.
---

# Headphone review (dojojin.tech)

**REQUIRED:** follow dojojin-content for the steps, privacy and gates. This skill adds only the headphone specifics.

`type: review`, `topic: audio`, tags from `[<brand>, tws, open-ear, anc, ldac, lhdc]`, `kicker: "#MiniReview · หูฟัง"`, `meta: "Dojo-mAn Fotographer · ใช้งานจริง"`.
**Copy from:** `src/content/posts/review/shokz-opendots-one.mdx` (open-ear, full), `oppo-enco-x3s.mdx` (ANC + app screenshots group), `baseus-bp1-pro.mdx`.

## Verify (the owner's post often reuses lines from an older post)

| Claim | Check against | Real catches |
|---|---|---|
| Bluetooth version, codec, battery h, mAh | box back, case label, maker page | 5.3→5.4 (box); 400→600 mAh (label); 12→10 h (box) |
| ANC / Transparency | box + app + maker page | an ANC paragraph copied from another model's post → removed |
| IP rating | maker page / reviews | IP55 vs IPX5 — search, cite the source |
| Mic count | maker wording | "2 mics" may be total or per side — say which is unclear |
| Latency | box | owner wrote "no data", box said 0.06s |
| Hardware controls (dial, slide) | the photos | a "volume dial" not visible → ask, then remove |

Truncated sentences in post.txt: end at the last complete phrase and ask.

## Photos

Groups: แกะกล่อง · ตัวเคส / ตัวหูฟัง · เทียบกับรุ่นอื่น · ภาพหน้าจอแอป (`fit: "contain"`). Tall app screenshots: split into two images rather than shrink.
Blur in app screens: account name, Find-my map/address, device MAC. Blur on boxes: scratch-off SN and per-unit QR (keep the EAN barcode). The owner's business card appears often: blur address, phones, email, QR.

## Page sections

After the post: add one row to `src/data/headphones.js` (feeds `/compare/headphones/`).

Short Brief (+ จุดเด่น / ข้อสังเกต) → ประวัติแบรนด์แบบย่อ (only if in post.txt) → Specification → คุณภาพเสียง (grade-cards Bass / Midrange / Treble) → EQ → Microphone → การเชื่อมต่อ/แอป → สรุป → ภาพประกอบ → ช่องทางการจัดจำหน่าย.
