# คู่มือการ Deploy — DOJOJIN.TECH

เว็บ DOJOJIN.TECH เป็น **Astro static site** เสิร์ฟบน **Cloudflare Pages** (Git integration)
push ขึ้น `main` → Cloudflare build + deploy อัตโนมัติ · branch อื่นได้ preview URL

```
GitHub dojojin/dojojin-site ──push──▶ Cloudflare Pages (npm run build → dist/) ──▶ https://dojojin.tech
                                         └─ branch อื่น ──▶ https://<branch>.<project>.pages.dev
```

## ตั้งค่า Cloudflare Pages (dashboard)

| Setting | ค่า |
|---|---|
| Framework preset | Astro (หรือ None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | จาก `.node-version` (22.23.1) — หรือ env `NODE_VERSION=22.23.1` |
| Production branch | `main` |
| Environment variables | `VITE_OWNER_EMAILS` ทั้ง **Production** และ **Preview** |

## ขั้นตอน deploy

1. ทำงานบน branch แยก → `npm run build && npm run lint` ผ่าน → ตรวจ 390/768/1280
2. `git push origin <branch>` → เปิด preview URL ตรวจหน้าเว็บจริง
3. ได้คำสั่งเจ้าของ → `git checkout main && git merge --ff-only <branch> && git push origin main`
4. ตรวจ https://dojojin.tech หลัง deploy เสร็จ (Pages → Deployments)

## Firebase

- Authorized domains: `dojojin.tech` (+ `*.pages.dev` ถ้าจะทดสอบ sign-in บน preview)
- Rules: `firebase deploy --only firestore:rules`

## Rollback

- เร็วสุด: Pages → Deployments → deploy ก่อนหน้า → **Rollback**
- โค้ด: tag `pre-astro-backup` = เว็บ React เดิมก่อนย้ายมา Astro
