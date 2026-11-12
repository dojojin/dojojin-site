# CLAUDE.md

คู่มือโปรเจกต์สำหรับ Claude Code — เว็บ **DOJOJIN.TECH** (portfolio + guestbook แบบ real-time)

> เอกสาร deploy/troubleshooting ฉบับเต็ม ดูที่ [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## ภาพรวม

เว็บความรู้ + รีวิวของ DOJOJIN.TECH (Dojo-mAn) สร้างด้วย **Astro** (static) — เมนูตามประเภท:
Home · Review · ความรู้ · กิน & เที่ยว · Data · Projects · Guestbook · เว็บเก่าแบบ CCTV/terminal เก็บไว้ที่ `/lab`

**Tech stack:** Astro 7 (MDX, sitemap, React island) · React 19 (เฉพาะ `/lab` + guestbook) · Firebase (Auth/Firestore) · Node 22 (`.node-version`)

## คำสั่งหลัก

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/ (static)
npm run preview    # เสิร์ฟ dist/
npm run lint
node scripts/patch-atlas.mjs   # สร้างหน้า Price Atlas ใหม่ (ดูหัวข้อ Data)
```

## โครงสร้างไฟล์สำคัญ

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/data/site.js` | TYPES (เมนู), TOPICS (หมวด), TAGS (รายชื่อ tag), NAV, PROFILE, ข้อมูล /lab |
| `src/content/posts/<type>/<slug>.mdx` | บทความ (+ `.shots.json`, `.spec.json`) |
| `src/content/projects/<slug>.mdx` | หน้าโปรเจกต์ (Vigil = teaser เท่านั้น, business confidential) |
| `src/content.config.js` | schema ของ content (tag นอกรายชื่อ = build ล้ม) |
| `src/pages/` | routes: `[type]/`, `[type]/[slug]`, `tag/`, `projects/`, `guestbook`, `lab`, `404` |
| `src/components/` | ShotGallery (modal ซูมได้), SpecTable, PostCard, … |
| `src/App.jsx` | เว็บเก่า (React) ใช้ที่ `/lab` + guestbook + easter eggs |
| `src/styles/site.css` | token + layout ทั้งเว็บ |
| `firestore.rules` | security rules ของ guestbook |

## Environment / Config

- `VITE_OWNER_EMAILS` — อีเมลที่ลบคอมเมนต์ guestbook ได้ (ฝังตอน build) → ตั้งใน **Cloudflare Pages → Settings → Environment variables ทั้ง Production และ Preview**; `.env.local` ใช้แค่ในเครื่อง
- `PUBLIC_DOCS_URL` — (ไม่บังคับ) ชี้ลิงก์ docs ใน `/lab` ไปเครื่อง local ตอนทดสอบ
- Firebase Auth → **Authorized domains** ต้องมี `dojojin.tech` (และโดเมน `*.pages.dev` ของ preview ถ้าจะทดสอบ sign-in บน preview)

---

## การ Deploy (production) — DOJOJIN.TECH

Cloudflare Pages (Git integration) — **deploy = `git push origin main`** · branch อื่นได้ preview URL อัตโนมัติ

| Pages setting | ค่า |
|---|---|
| Framework preset | Astro (หรือ None) |
| Build command | `npm run build` |
| Build output | `dist` |
| Node | อ่านจาก `.node-version` (22.23.1) |
| Production branch | `main` |

Firestore rules deploy แยก: `firebase deploy --only firestore:rules`

**Rollback:** Pages → Deployments → เลือก deploy ก่อนหน้า → *Rollback* (ทันที) · โค้ดเว็บเก่าอยู่ที่ tag `pre-astro-backup`

---

## Troubleshooting

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| owner mode ลบคอมเมนต์ไม่ได้ | ไม่ได้ตั้ง `VITE_OWNER_EMAILS` ใน Pages (environment นั้น) | ตั้งแล้ว re-deploy |
| sign-in guestbook บน preview ไม่ได้ | โดเมน `*.pages.dev` ไม่อยู่ใน Firebase Authorized domains | เพิ่มใน Firebase console |
| build ล้มเรื่อง tag | tag ในบทความไม่อยู่ใน `TAGS` | เพิ่มใน `src/data/site.js` ก่อน |
| push แล้วเว็บไม่อัปเดต | Pages build ยังไม่เสร็จ/ล้ม | ดู log ที่ Pages → Deployments |

---

## เนื้อหา: เมนู / หมวด / tag

- **เมนู = ประเภท** (`TYPES` ใน `src/data/site.js`): Review · ความรู้ · กิน & เที่ยว (`eat`) · Data → บทความอยู่ที่ `src/content/posts/<review|knowledge|eat>/<slug>.mdx` = URL `/<type>/<slug>/`
- **หมวด** (`topic`, 1 ต่อบทความ, `TOPICS`): สมาร์ทโฟน · หูฟัง & เสียง · ชาร์จ & พลังงาน · กล้อง & ถ่ายภาพ · Infra & AI · ร้านอาหาร
- **tags** (หลายอัน, `TAGS`): แบรนด์ / ชนิดสินค้า / เทคนิค — **ต้องอยู่ในรายชื่อ `TAGS` เท่านั้น** (build ล้มถ้าไม่มี) กันสะกดซ้ำซ้อน; tag ใหม่ = เพิ่มใน `TAGS` ก่อน · หน้า `/tag/<key>/` สร้างเอง
- **ไฟล์ต้นฉบับ** (รูปเต็มมี GPS, ข้อความโพสต์, คู่มือ) → `_sources/posts/<type>/<slug>/` · `_sources/data/` · `_sources/projects/<slug>/` (gitignored, ห้าม commit)
- **รูปบนเว็บ** → `public/media/posts/<type>/<slug>/` (ย่อ ≤1600px, ล้าง EXIF/GPS, ตรวจภาพหน้าจอว่าไม่มีแผนที่/พิกัด/ข้อมูลส่วนตัว) · โปรเจกต์ → `public/media/projects/<slug>/`
- **ไฟล์ของบทความ** → `src/content/posts/<type>/<slug>.mdx` + `<slug>.shots.json` (คำบรรยายรูป, ใช้ `group` แยกโซน, `fit: "contain"` สำหรับภาพแนวตั้ง) + `<slug>.spec.json` (ตารางสเปก, คอลัมน์ที่ 3 = ที่มา เช่น ฉลาก/กล่อง/OPPO/ร้านค้า)

---

## Data (Price Atlas)

หน้า `/data/<slug>/` เป็นไฟล์ HTML เดี่ยว (ข้อมูล+สคริปต์ในไฟล์) ที่ได้รับมาจากภายนอก — session vigil-central เป็นแค่ผู้ส่งต่อ ไม่ใช่ผู้สร้าง ต้นฉบับจริงต้องถามเจ้าของ — **ห้ามแก้ไฟล์ใน `public/data/` ตรงๆ**

- ต้นฉบับเก็บที่ `_sources/data/<slug>.html` + `<slug>.og.png` (gitignored)
- รัน `node scripts/patch-atlas.mjs` → เขียน `public/data/<slug>/index.html` + `og.png` (ใช้การแก้ข้อมูลใน `src/data/atlas-corrections/<slug>.json`, แก้ `<head>`/og ให้ชี้ dojojin.tech, CSS แก้ responsive + ความกว้างเท่าเว็บ, Top Bar ของเว็บตรึงบนสุด (เมนูจาก `NAV` ใน `src/data/site.js`) + ลิงก์ “ที่มาของรูป”)
- การแก้ข้อมูลแต่ละรายการต้องมี `source` + `snippet` ที่คัดจากหน้านั้นจริง; ค่า `old` ต้องตรงกับไฟล์ ไม่งั้นสคริปต์หยุด (กันการแก้ทับเวอร์ชันใหม่)
- รายชื่อ + ตัวเลขบนการ์ด `/data/` อยู่ที่ `src/data/atlases.js` (นับจาก `window.__ATLAS__` ในไฟล์ — อัปเดตเมื่อได้ไฟล์เวอร์ชันใหม่)
- รูปเครื่องทุกรูปต้องมีผู้ถ่าย + สัญญาอนุญาต + ลิงก์ไฟล์ต้นฉบับ (Wikimedia Commons) ก่อนขึ้นเว็บ

---

## Responsive design (บังคับทุกหน้า)

มือถือ (≤768px) สำคัญเท่า desktop เสมอ — ถ้าคำสั่งไหนจะทำให้มือถือแย่ลง ให้บอกก่อนทำ

**Breakpoints ของหน้าทางการ** (`src/styles/site.css`)

| ความกว้าง | layout |
|---|---|
| ≤768px | คอลัมน์เดียวทั้งหมด, เมนูขึ้นบรรทัดใหม่ได้ (ไม่ซ่อน), modal เต็มจอ (รูปบน รายละเอียดล่าง) |
| ≥769px | `.split` / hero เป็น 2 คอลัมน์, modal เป็นกล่อง (รูปซ้าย รายละเอียดขวา) |
| ≥1100px | มีสารบัญ (`.toc`) ตรึงด้านซ้าย |

**กติกา**
- ขนาดตัวอักษร/ระยะใช้ token (`--fs-*` เป็น `clamp()`, `--space-*` ตาราง 4px, `--gutter`) ห้าม hardcode px ใน component
- grid ใช้ `repeat(auto-fit|auto-fill, minmax(min(100%, Xpx), 1fr))` และลูกของ grid/flex ที่มีเนื้อหายาวต้องมี `min-width: 0`
- ย่อหน้าข้อความ (`.prose`) จำกัด 72ch เพื่อให้อ่านง่าย — ถ้าเหลือที่ว่างด้านข้าง ให้จับคู่เนื้อหาด้วย `.split` (ข้อความ | การ์ด/รายการ) **ไม่ใช่** ขยายบรรทัดให้ยาวเต็มจอ
- ตารางกว้างห้ามล้นจอ — ใช้ 2 คอลัมน์ (label | ค่า) หรือ stack บนมือถือ
- รูปแนวตั้ง/ภาพหน้าจอมือถือ: ใส่ `"fit": "contain"` และแยก `"group"` ใน `.shots.json` (การ์ดทรงมือถือ, modal ไม่ crop)
- Modal รูป: ต้องซูมได้ (ปุ่ม +/−, ล้อเมาส์, ดับเบิลคลิก, ลาก, pinch บนมือถือ) และมีปุ่มปิดที่มองเห็นได้ในทุกโหมด

**ตรวจก่อน commit ทุกครั้งที่แตะ UI** (headless Chromium หรือเปิดจริง)
1. ความกว้าง **390 / 768 / 1280** (และ 1920 ถ้าเป็นหน้า layout กว้าง)
2. ไม่มี scroll แนวนอน: `document.documentElement.scrollWidth === innerWidth`
3. **ดูภาพจริง** ว่าอ่านได้ — ไม่ล้น ≠ อ่านง่าย
4. รายงานผล (ผ่าน / แก้แล้ว / ปัญหาที่เหลือ) ก่อนขอ commit

---

## ความเร็ว + Core Web Vitals (บังคับทุกหน้า)

Google วัดจากผู้ใช้จริง 28 วัน (CLS ≤ 0.1, LCP ≤ 2.5 s, INP ≤ 200 ms) — แก้ 12 พ.ย. 2569 จาก CLS 0.16 / มือถือ 76 คะแนน

**ห้ามทำ (เคยพังมาแล้ว)**
- **ห้ามดึงฟอนต์/CSS จาก CDN ภายนอกแบบ render-blocking** — ฟอนต์อยู่ที่ `public/fonts/` + `src/styles/fonts.css` (เฉพาะ thai/latin/latin-ext), preload แค่ 400 thai + latin ใน `Base.astro` · ใช้ `font-display: optional` เท่านั้น (ห้าม `swap`: เครื่องที่ไม่มีฟอนต์ไทยในระบบ เช่นเครื่องทดสอบของ PageSpeed จะได้ CLS 0.25 ตอนฟอนต์สลับ) · ทดสอบ CLS ด้วย `FONTCONFIG_FILE` ที่มีแค่ DejaVu
- **ห้ามโหลด Firebase SDK หรือ React ในหน้าทางการ** — ตัวนับใช้ Firestore REST (`src/components/ViewCounter.astro`, config ที่ `src/firebase-config.js`); SDK ใช้เฉพาะ `/guestbook` และ `/lab`
- **easter egg** ตรวจด้วย JS ธรรมดาใน `Base.astro` แล้วค่อย `import('../eggs.jsx')` ตอนเกิดจริง — ห้ามกลับไปใช้ `client:only` ทั้งเว็บ
- **ห้ามให้เนื้อหาที่มาทีหลังดันหน้า** — ตัวเลข/กล่องที่เติมด้วย JS ต้องจองที่ไว้ก่อน (`visibility:hidden` + `min-width`/`min-height`), carousel/กล่องหมุนต้องสูงคงที่ (`line-clamp` + `min-height`), ไม่สลับเนื้อหาทันทีที่โหลดหน้า
- **รูปต้องมี `width`/`height`** และใช้ `srcset()` จาก `src/lib/thumb.js`; โหลดรูปล่วงหน้าด้วย `srcset`+`sizes` เดียวกับรูปจริง (ห้าม `new Image().src = 'x.jpg'` เต็มขนาด); โลโก้/ไอคอนใช้ไฟล์ขนาดเท่าที่แสดง ×2

**ตรวจก่อน commit ที่แตะ layout / script / รูป / ฟอนต์**
1. CLS: วัด layout-shift ที่ 390 และ 1350 รวมรอ ≥ 13 วินาที (ให้กล่องหมุนสลับ) — ต้อง < 0.05
2. รายการไฟล์ที่มือถือ (412 px, DPR 1.75) โหลดหน้าแรก: JS ของเราไม่เกิน ~10 KB, รูป+ฟอนต์ไม่เกิน ~400 KB
3. หลัง deploy ไม่ต้องขอ index ใหม่ (ความเร็วไม่เกี่ยวกับ index) — ให้เจ้าของกดวิเคราะห์ใหม่ใน PageSpeed

---

## ข้อควรระวัง

- push ขึ้น `main` = deploy prod ทันที — ใช้ branch เพื่อดู preview ก่อน และ **ต้องได้คำสั่งเจ้าของก่อน push ทุกครั้ง**
- `_sources/` (รูปเต็มมี GPS, ไฟล์ต้นฉบับ) gitignored — ห้าม commit
- Vigil Platform / Vigil Mobile เป็น business confidential — ห้ามใส่ vendor/protocol/architecture ทั้งหน้าทางการและ `/lab`
- `VITE_*` ฝังตอน build → ค่า prod/preview ตั้งใน Cloudflare dashboard
