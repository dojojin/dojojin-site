---
name: dojojin-food
description: Use when a ~/TEMP folder or request is about a restaurant, café, food or place visit for dojojin.tech — e.g. "location00x", "variety", "#MiniReview ร้าน…", a post with พิกัด / ที่จอดรถ / เมนู.
---

# Food & place review (dojojin.tech, menu "กิน & เที่ยว")

**REQUIRED:** follow dojojin-content for the steps, privacy and gates. This skill adds only the food specifics.

`type: eat`, `topic: restaurant`, tags e.g. `[thai-food, cafe, <province>]` (add the province tag to `TAGS` if missing), `kicker: "กิน & เที่ยว · ร้านอาหาร"`, `meta: "Dojo-mAn Fotographer · ถ่ายด้วย <phone> · ไปเอง จ่ายเอง"`.
**Copy from:** `src/content/posts/eat/jinko-suphanburi.mdx` (full: receipt + shop info table), `ponn-cafe.mdx` (short), `kuay-teow-ruea-may-suphanburi.mdx` (two shops side by side).

## Tone

- Boxes are **"เรื่องประทับใจ"** and **"ข้อแนะนำ"** — never ผ่าน / ไม่ผ่าน (too harsh for a shop).
- The owner's own "ผ่าน/ไม่ผ่าน" in his prose stays as he wrote it.
- Taste words come only from post.txt. Dishes he didn't describe get a neutral caption of what is visible.

## Facts

| Item | Source | Note |
|---|---|---|
| Shop name | sign in the photo + post.txt | Thai and English if the sign has both |
| Address, phone | receipt | ask before publishing if not on a receipt |
| Coordinates | post.txt | link `https://www.google.com/maps?q=<lat>,<lng>` |
| Branch, price range | ask the owner | e.g. "แฟชั่นไอส์แลนด์", "ประมาณ 200 บาทขึ้นไป" |
| Order + prices | receipt | items must add up to the printed total; extra handwritten amounts → ask |
| Menu names | receipt / placemat / owner | unsure → ask (a "pork" dish was beef; a drink he forgot) |

## Privacy (most common in food photos)

Other diners' faces, staff/baristas at the counter, people behind glass, a person on a phone wallpaper, card numbers on receipts. Blur, then look at the blurred output (boxes are easy to misplace).

## Page sections

Mini Review / Short Brief (+ เรื่องประทับใจ / ข้อแนะนำ, พิกัด link) → ข้อมูลร้านและที่สั่ง (`SpecTable`, sources `บิล` `ป้ายร้าน` `ผู้รีวิว`) when there is a receipt → อาหาร / ภาพรวม → ภาพรีวิว (groups: บรรยากาศ · อาหาร · ของหวาน & เครื่องดื่ม · บิล).
