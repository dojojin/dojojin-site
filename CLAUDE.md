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

## ข้อควรระวัง

- **`VITE_*` = ฝังตอน build** → ค่า prod ต้องตั้งใน **Cloudflare Pages dashboard** ไม่ใช่ `.env.local` (ถูก gitignore, CI ไม่เห็น)
- push ขึ้น `main` = deploy prod ทันที — ระวังของยังไม่พร้อม (ใช้ branch/PR เพื่อ preview ก่อน)
- ไม่มี client-side router (SPA หน้าเดียว) — ไม่ต้องมี `_redirects`/rewrite rule
- ทั้งแอปอยู่ใน `App.jsx` ไฟล์เดียว ระวัง merge conflict เวลาแก้
