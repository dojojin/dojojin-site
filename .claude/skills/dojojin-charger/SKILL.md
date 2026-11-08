---
name: dojojin-charger
description: Use when a ~/TEMP folder or request is about a charger, power adapter, power bank or USB meter (POWER-Z) reading for dojojin.tech — e.g. "charger-00x", "รีวิวหัวชาร์จ", "Power Bank".
---

# Charger / power review (dojojin.tech)

**REQUIRED:** follow dojojin-content for the steps, privacy and gates. This skill adds only the charger specifics.

`type: review` (old/knowledge-style posts: `knowledge`), `topic: power`, tags e.g. `[<brand>, gan, usb-pd]`, `kicker: "#MiniReview · Charger"`.
**Copy from:** `src/content/posts/review/slimq-f100.mdx` (full), `orsen-c102t.mdx` (multi-port table), `apple-96w-macbook-pro.mdx` (nano), `knowledge/usb-charger-data-pins.mdx` (old post, corrected).

## What to read from the photos

| Photo | Extract | Spec source tag |
|---|---|---|
| Label on the unit | model, maker, input, every output V/A, multi-port split, marks (มอก./CE/…) | `ฉลาก` |
| Box | protocols list, size/weight, GaN chip | `กล่อง` |
| POWER-Z Auto detection / PDO list | protocols, fixed PDOs, PPS range | `มิเตอร์` |
| POWER-Z live reading | V × A = W, protocol, PPS request | `มิเตอร์` (in `readings`) |

Write live readings into each shot: `readings: [["แรงดัน","20.35V"],["กระแส","4.52A"],["กำลัง","91.9W"],["โปรโตคอล","PD3.0 100W"]]`.

## Checks that caught real mistakes

- **Label vs meter:** 96W label = 20.5V×4.7A, protocol says 20V×4.7A = 94W. Explain both, don't pick one.
- **Meter ceiling:** POWER-Z KM003C max **6A** (ChargerLAB manual); older USB meter ≈5A. Any reading ≥5A or a "120W" claim → add a "ข้อจำกัดของเครื่องวัด" note.
- **Measured W is what the device drew**, not the charger's maximum.
- **PPS 3A vs 5A:** a phone can still get ~40W from PPS 3A by asking higher voltage (S25 Ultra did) — check the readings before claiming a limit.
- **e-marker 5A on a "6A" cable:** USB PD e-marker can only say 3A or 5A.
- **Ask the owner** which device is in each photo (laptop vs power bank vs phone model) — don't guess from the shape.
- **D+/D− 2.7V/2.0V** is the Apple 2.1A signal, not a leak.

## Page sections

Short Brief (+ จุดเด่น / ข้อสังเกต) → Specification (`SpecTable`) → ผลวัดจริง (grade-cards; meter-limit note) → multi-port table if the label has one → การชาร์จ (มือถือ / Laptop / วัสดุ) → สรุป ควรซื้อไหม (`proscons`) → link to `/knowledge/charger-ripple-guide/` → ภาพประกอบ (groups: แกะกล่อง · ตัวเครื่อง · ตรวจโปรโตคอล · ชาร์จ <device> …) → ช่องทางการจัดจำหน่าย.
