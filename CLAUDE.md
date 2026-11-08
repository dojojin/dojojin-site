# CLAUDE.md

คู่มือโปรเจกต์สำหรับ Claude Code — เว็บ **DOJOJIN.TECH** (portfolio + guestbook แบบ real-time)

> เอกสาร deploy/troubleshooting ฉบับเต็ม ดูที่ [`DEPLOYMENT.md`](./DEPLOYMENT.md)

---

## ภาพรวม

Personal portfolio + interactive guestbook ของ DOJOJIN.TECH
มีหน้าโชว์โปรเจกต์วิศวกรรม, เอฟเฟกต์ CCTV/terminal, visitor counter, และ guestbook real-time บน Firestore

**Tech stack:** React 19 · Vite 5 · Firebase (App/Auth/Firestore) · Tailwind/PostCSS · ESLint (React Hooks)
ทั้งแอปอยู่ใน `src/App.jsx` ไฟล์เดียว (~108KB) — **ไม่มี client-side router** (เป็น SPA หน้าเดียว เสิร์ฟ static ได้เลย)

## คำสั่งหลัก

```bash
npm install        # ติดตั้ง dependencies
npm run dev        # dev server → http://localhost:5173
npm run build      # build production → dist/
npm run preview    # พรีวิวไฟล์ build
npm run lint       # ESLint
```

## โครงสร้างไฟล์สำคัญ

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/App.jsx` | ทั้งแอป (UI, guestbook, effects) |
| `src/firebase.js` | init Firebase App/Auth/Firestore |
| `src/main.jsx` | entry point |
| `vite.config.js` | manualChunks (react/firebase) + `server.host`/`allowedHosts` |
| `firestore.rules` | security rules ของ guestbook |
| `.env.local` | `VITE_OWNER_EMAILS` = อีเมลที่ลบคอมเมนต์ได้ (dojojin@gmail.com) — **local/dev เท่านั้น**; prod ตั้งใน Cloudflare Pages dashboard |

## Environment / Config

- `VITE_OWNER_EMAILS` — รายชื่ออีเมล Google (คั่นด้วย comma) ที่มีสิทธิ์ลบคอมเมนต์ guestbook
  - **สำคัญ:** prefix `VITE_` = ฝังตอน build → บน prod ต้องตั้งใน **Cloudflare Pages → Settings → Environment variables** (CI ไม่มี `.env.local` ที่ถูก gitignore)
- `vite.config.js > server` (สำหรับ dev เท่านั้น): `host: true` + `allowedHosts: ['.trycloudflare.com']` — ไว้เปิด dev server ผ่าน Cloudflare quick tunnel ตอนพัฒนา ไม่เกี่ยวกับ prod

---

## การ Deploy (production) — DOJOJIN.TECH

Production เสิร์ฟบน **Cloudflare Pages** (Git integration) — **deploy = `git push origin main`**
Cloudflare build จาก repo ให้เอง ไม่มี server/nginx/tunnel ให้ดูแล

**Cloudflare Pages settings (ตั้งครั้งเดียวใน dashboard):**
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main` (branch/PR อื่น ได้ preview URL อัตโนมัติ)
- Environment variables → `VITE_OWNER_EMAILS` (ดูด้านล่าง)

**Firestore rules** deploy แยกผ่าน Firebase (ไม่เกี่ยวกับ Pages):
```bash
firebase deploy --only firestore:rules
```

---

## Troubleshooting

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| owner mode ลบคอมเมนต์ไม่ได้บน prod | ไม่ได้ตั้ง `VITE_OWNER_EMAILS` ใน Pages (CI ไม่มี `.env.local`) | ตั้งใน Pages → Settings → Environment variables แล้ว re-deploy |
| build fail บน Pages | node version / lockfile ไม่ตรง | ตั้ง `NODE_VERSION` ใน Pages env, commit `package-lock.json` เข้า repo |
| push แล้วเว็บไม่อัปเดต | Pages build ยังไม่เสร็จ/ล้ม | ดู log ที่ Pages → Deployments |

---

## เนื้อหา: เมนู / หมวด / tag

- **เมนู = ประเภท** (`TYPES` ใน `src/data/site.js`): Review · ความรู้ · Data → บทความอยู่ที่ `src/content/posts/<review|knowledge>/<slug>.mdx` = URL `/<type>/<slug>/`
- **หมวด** (`topic`, 1 ต่อบทความ, `TOPICS`): สมาร์ทโฟน · หูฟัง & เสียง · ชาร์จ & พลังงาน · กล้อง & ถ่ายภาพ · Infra & AI
- **tags** (หลายอัน, `TAGS`): แบรนด์ / ชนิดสินค้า / เทคนิค — **ต้องอยู่ในรายชื่อ `TAGS` เท่านั้น** (build ล้มถ้าไม่มี) กันสะกดซ้ำซ้อน; tag ใหม่ = เพิ่มใน `TAGS` ก่อน · หน้า `/tag/<key>/` สร้างเอง

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

## ข้อควรระวัง

- **`VITE_*` = ฝังตอน build** → ค่า prod ต้องตั้งใน **Cloudflare Pages dashboard** ไม่ใช่ `.env.local` (ถูก gitignore, CI ไม่เห็น)
- push ขึ้น `main` = deploy prod ทันที — ระวังของยังไม่พร้อม (ใช้ branch/PR เพื่อ preview ก่อน)
- ไม่มี client-side router (SPA หน้าเดียว) — ไม่ต้องมี `_redirects`/rewrite rule
- ทั้งแอปอยู่ใน `App.jsx` ไฟล์เดียว ระวัง merge conflict เวลาแก้
