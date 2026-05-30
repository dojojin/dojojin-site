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
| `.env.local` | `VITE_OWNER_EMAILS` = อีเมลที่ลบคอมเมนต์ได้ (dojojin@gmail.com) |
| `src/cloudflared` | binary cloudflared (ใช้ทำ tunnel — ไม่ควร commit) |

## Environment / Config

- `VITE_OWNER_EMAILS` — รายชื่ออีเมล Google (คั่นด้วย comma) ที่มีสิทธิ์ลบคอมเมนต์ guestbook
- `vite.config.js > server`:
  - `host: true` — ฟังทั้ง IPv4 + IPv6 (จำเป็นเมื่อ proxy/tunnel ต่อผ่าน 127.0.0.1)
  - `allowedHosts: ['.trycloudflare.com']` — อนุญาตให้ tunnel host เข้าถึง dev server

---

## การ Deploy (production) — DOJOJIN.TECH

**สถาปัตยกรรม:**
```
dojojin.tech → Cloudflare → cloudflared (named tunnel f6684909, รันบน host ผ่าน systemd)
            → nginx :80 (server_name dojojin.tech, root /var/www/dojojin-site) → ไฟล์ build (dist/)
```
> **ไม่ใช้ docker** สำหรับ deploy — รัน cloudflared เป็น binary บน host โดยตรง

**ขั้นตอน deploy เว็บใหม่:**
```bash
npm run build
sudo rsync -a --delete dist/ /var/www/dojojin-site/
sudo chown -R nginx:nginx /var/www/dojojin-site
sudo systemctl reload nginx          # ถ้าแก้ nginx config
```

**ไฟล์ระบบที่เกี่ยวข้อง:**
- `/etc/nginx/conf.d/dojojin-site.conf` — server block (root → `/var/www/dojojin-site`)
- `/var/www/dojojin-site` — docroot (ไฟล์ build)
- `~/.cloudflared/config-host.yml` — config cloudflared **สำหรับ host** (ชี้ `127.0.0.1`, ห้ามใช้ `config.yml` เดิมที่เป็นของ docker)
- `/usr/local/bin/cloudflared` — binary ของ systemd service
- `/etc/systemd/system/cloudflared-dojojin.service` — service ทำให้ tunnel รันถาวร

**คุม tunnel (systemd):**
```bash
sudo systemctl status  cloudflared-dojojin.service
sudo systemctl restart cloudflared-dojojin.service
journalctl -u cloudflared-dojojin.service -n 50 --no-pager
```

---

## Troubleshooting (สรุปจากปัญหาจริงที่เคยเจอ — รายละเอียดเต็มใน DEPLOYMENT.md)

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|--------|
| `dojojin.tech` → **530** | tunnel ไม่ connect (ไม่มี cloudflared ต่อ tunnel f6684909) | start `cloudflared-dojojin.service` (อย่าลืม: ไม่ต้องแก้ DNS/ไม่ต้องลบอะไรใน Cloudflare) |
| → **502** | tunnel ต่อ origin ไม่ได้ | เช็ค nginx รันไหม / `host: true` (Vite ฟัง IPv4) / พอร์ต |
| → **404 (จาก cloudflare)** | cloudflared โหลด ingress catch-all `http_status:404` จาก `~/.cloudflared/config.yml` ทับ | ใช้ `--config` ชี้ config ที่ถูกต้อง (host) หรือ config เปล่า |
| dev server → **404 ผ่าน tunnel** | Vite block host ภายนอก | `allowedHosts` ใน vite.config.js |
| nginx เสิร์ฟหน้า Fedora test page | curl ด้วย Host ไม่ตรง `server_name` → ตก default server | ทดสอบด้วย `curl -H "Host: dojojin.tech" http://127.0.0.1:80/` |

**กฎทอง:** 530=ปัญหาที่ tunnel · 502=ปัญหาที่ origin/nginx · 404=ปัญหาที่ ingress/docroot

**เช็คเร็ว:**
```bash
curl -sI https://dojojin.tech/ | head -1                                   # online ไหม
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: dojojin.tech" http://127.0.0.1:80/   # nginx ok ไหม
curl -s http://127.0.0.1:20241/metrics | grep -E 'total_requests|request_errors'        # tunnel เห็น request ไหม
```

---

## ข้อควรระวัง

- **docker vs host:** มี `~/.cloudflared/config.yml` (ของ docker, ใช้ `host.docker.internal`) กับ `config-host.yml` (ของ host, ใช้ `127.0.0.1`) — **อย่าสลับกัน** การรันบน host ด้วย config ของ docker จะ 502
- **split-brain:** ถ้า cloudflared container ใน docker (ai-stack, `restart:always`) รัน tunnel เดียวกันพร้อม host จะเกิด 502 เป็นช่วงๆ → ปิด container เดิม: `sudo docker rm -f cloudflared`
- **อย่า commit `src/cloudflared`** (binary 39MB) — ควรอยู่ใน `.gitignore`
- ทั้งแอปอยู่ใน `App.jsx` ไฟล์เดียว ระวัง merge conflict เวลาแก้
