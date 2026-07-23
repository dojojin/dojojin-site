# คู่มือการ Deploy — DOJOJIN.TECH

เว็บ DOJOJIN.TECH (React/Vite SPA + Firestore guestbook) เสิร์ฟ production บน **Cloudflare Pages**
แบบ **Git integration** — push ขึ้น `main` แล้ว Cloudflare build + deploy ให้อัตโนมัติ
ไม่มี server / nginx / tunnel / systemd ให้ดูแลอีกต่อไป

> ประวัติเก่า: เดิมเคย deploy ด้วย Cloudflare Tunnel + nginx บน Linux host — เลิกใช้แล้ว
> (โครง config/สคริปต์เก่าอยู่ใน git history ก่อน commit ที่ย้ายมา Pages)

---

## 1. ภาพรวม

```
ผู้ใช้ทั่วโลก
   │  https://dojojin.tech
   ▼
Cloudflare Pages (build จาก GitHub repo dojojin/dojojin-site @ main)
   ▼
static files (dist/) ที่ Cloudflare build เอง + เสิร์ฟบน edge CDN
```

- **แหล่ง build:** GitHub repo `dojojin/dojojin-site`, branch `main`
- **Deploy:** `git push origin main` → Cloudflare ตรวจ commit ใหม่ → build → เผยแพร่
- **Preview:** ทุก branch / PR ได้ URL preview อัตโนมัติ (ไม่กระทบ prod)

---

## 2. ตั้งค่า Cloudflare Pages (ทำครั้งเดียวใน dashboard)

**Pages → Create project → Connect to Git → เลือก repo `dojojin/dojojin-site`**

| Setting | ค่า |
|---------|-----|
| Framework preset | Vite (หรือ None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Node version | ตั้ง env `NODE_VERSION` (เช่น `22`) ถ้า build ต้องการเวอร์ชันเฉพาะ |

### Environment variables (สำคัญมาก)

`VITE_OWNER_EMAILS` ต้องตั้งใน **Pages → Settings → Environment variables** (Production + Preview)

```
VITE_OWNER_EMAILS = dojojin@gmail.com
```

> ⚠️ ตัวแปร prefix `VITE_` ถูก **ฝังตอน build** (build-time inline) — ตอน Cloudflare build
> จะ **ไม่มี** ไฟล์ `.env.local` (อยู่ใน `.gitignore` ไม่ถูก push ขึ้น repo)
> ถ้าไม่ตั้งค่านี้ใน dashboard → owner mode (ลบคอมเมนต์ guestbook) จะพังเงียบ ๆ บน prod

---

## 3. รันในเครื่อง (Local)

```bash
npm install                    # ติดตั้ง dependencies
cp .env.example .env.local     # ตั้ง VITE_OWNER_EMAILS สำหรับ dev/owner mode (local เท่านั้น)
npm run dev                    # dev server → http://localhost:5173
npm run build                  # build → dist/ (เหมือนที่ Cloudflare รัน)
npm run preview                # พรีวิวไฟล์ build
npm run lint                   # ESLint
```

> `vite.config.js > server` มี `host: true` + `allowedHosts: ['.trycloudflare.com']`
> ไว้เปิด dev server ออกผ่าน Cloudflare quick tunnel ตอนพัฒนา — **ไม่เกี่ยวกับ prod**

---

## 4. Deploy จริง

```bash
git add -A
git commit -m "..."
git push origin main           # ← นี่คือ deploy: Cloudflare build + เผยแพร่ให้เอง
```

ดูสถานะ build / rollback ได้ที่ **Cloudflare Pages → Deployments**
(rollback = เลือก deployment เก่า → "Rollback to this deployment")

**Verify:**
```bash
curl -sI https://dojojin.tech/ | head -1
curl -s https://dojojin.tech/ | grep -o '<title>[^<]*</title>' | head -1
```

---

## 5. Firestore (guestbook + visitor counter)

Firestore ไม่เกี่ยวกับ Pages — deploy security rules แยกผ่าน Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

- config Firebase อยู่ใน [`src/firebase.js`](./src/firebase.js)
- rules อยู่ใน [`firestore.rules`](./firestore.rules) — แก้อีเมล owner ให้ตรงก่อน deploy
- collections: `comments`, `meta/visitors`

---

## 6. Troubleshooting

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| owner mode ลบคอมเมนต์ไม่ได้บน prod | ไม่ได้ตั้ง `VITE_OWNER_EMAILS` ใน Pages | ตั้งใน dashboard (Production) → re-deploy |
| build fail บน Pages | node version / lockfile ไม่ตรง | ตั้ง `NODE_VERSION` env, commit `package-lock.json` |
| push แล้วเว็บไม่อัปเดต | build ยังไม่เสร็จ / ล้ม | ดู log ที่ Pages → Deployments |
| คอมเมนต์เขียน/ลบไม่ได้ | Firestore rules | เช็ค `firestore.rules` + `firebase deploy --only firestore:rules` |

---

## 7. docs.dojojin.tech (ไซต์แยก — ไม่อยู่ใน repo นี้)

`docs.dojojin.tech` เป็น **VitePress site คนละ repo** (`~/dojojin-docs`) มี deploy ของตัวเอง
เดิมเสิร์ฟผ่าน tunnel+nginx เครื่องเดียวกับ dojojin-site — ถ้ายัง live อยู่และจะย้ายมา Pages
ให้จัดการใน repo `dojojin-docs` ต่างหาก (ไม่เกี่ยวกับเอกสารนี้)
