# DOJOJIN.TECH — คู่มือย้ายเครื่อง / ติดตั้งใหม่ (Migration Guide)

ย้าย **dojojin.tech** ไปเครื่องใหม่ หรือกู้คืนหลัง format — ครอบคลุม **Fedora/Nobara, Ubuntu/Debian, Windows**

> สถาปัตยกรรมปัจจุบัน (ไม่ใช้ docker สำหรับ tunnel):
> ```
> dojojin.tech → Cloudflare → cloudflared (systemd/บริการ บน host) → nginx :80
>              → /var/www/dojojin-site (ไฟล์ build static)
> ```
> โค้ดเว็บอยู่บน GitHub แล้ว (`git@github.com:dojojin/dojojin-site.git`) — backup เก็บแค่ **ของลับ** (`~/.cloudflared`, `.env.local`) ที่ไม่ได้อยู่ใน git

---

## สิ่งที่ backup เก็บ (bundle = `~/dojojin-backup`)

สร้าง bundle จากเครื่องเดิม:
```bash
bash deploy/backup.sh          # -> ~/dojojin-backup (replace ของเดิมทั้งหมด)
```
ได้:
```
~/dojojin-backup/
├── restore.sh                     สคริปต์กู้คืน (Linux)
├── MIGRATE.md                     คู่มือนี้
├── MANIFEST.txt                   เวอร์ชัน/tunnel-id ของเครื่องต้นทาง
├── bin/
│   └── cloudflared-linux-amd64    binary (เผื่อ restore แบบ offline / ล็อกเวอร์ชัน)
└── secrets/                       ⚠️ ของลับ — ห้าม commit/แชร์
    ├── cloudflared.tar.gz         ทั้ง ~/.cloudflared (creds + cert + config-host.yml)
    ├── env.local.bak              .env.local
    └── README-secrets.txt
```
**ย้ายเครื่อง:** คัดลอกทั้งโฟลเดอร์ `~/dojojin-backup` ไปเครื่องใหม่ (USB เข้ารหัส / cloud ส่วนตัว) — secrets อยู่ในนี้

**Backup อัตโนมัติ (cron):** ตั้งให้ backup เองทุกสัปดาห์
```bash
crontab deploy/dojojin-backup.cron      # ทุกวันอาทิตย์ 03:17 → log: ~/.cache/dojojin-backup.log
```

---

## A) Linux — Fedora / Nobara (dnf)  ← เครื่องปัจจุบัน

```bash
# 1. ติดตั้ง prerequisites
sudo dnf install -y git nodejs npm nginx curl rsync

# 2. กู้คืนทั้งหมด (อัตโนมัติ)
cd ~/dojojin-backup
bash restore.sh
```
`restore.sh` ทำให้ครบ: กู้ `~/.cloudflared` → clone repo → กู้ `.env.local` → `npm build` →
deploy ไป `/var/www/dojojin-site` (+ตั้ง **SELinux context**) → ติดตั้ง nginx conf →
ปิด docker cloudflared เดิม (กัน split-brain) → ติดตั้ง systemd service → verify ด้วย curl

> **SELinux (สำคัญเฉพาะ Fedora/Nobara/RHEL):** ไฟล์ใน `/var/www` ต้องมี context `httpd_sys_content_t`
> ไม่งั้น nginx เสิร์ฟแล้วได้ **403** — `restore.sh` รัน `restorecon -RF /var/www/dojojin-site` ให้แล้ว

---

## B) Linux — Ubuntu / Debian (apt)

ใช้ `restore.sh` ตัวเดียวกันได้ (ตรวจ distro อัตโนมัติ, ข้าม SELinux เอง) ต่างแค่ขั้นติดตั้ง package:

```bash
# 1. prerequisites
sudo apt update
sudo apt install -y git curl rsync nginx
# Node 22 (ของ apt มักเก่า — ใช้ NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

# 2. กู้คืน
cd ~/dojojin-backup
bash restore.sh
```
ข้อต่างจาก Fedora:
- nginx user เป็น `www-data` (ไม่ใช่ `nginx`) → ตั้ง `NGINX_USER=www-data bash restore.sh`
- ไม่มี SELinux (ปกติ) → ขั้น `restorecon` จะถูกข้ามเอง
- docroot/conf เหมือนกัน (`/var/www/dojojin-site`, `/etc/nginx/conf.d/dojojin-site.conf`)

```bash
NGINX_USER=www-data bash restore.sh
```

---

## C) Windows

Windows ไม่มี systemd/nginx แบบ Linux — ใช้ **cloudflared Windows service** + **static file server** แทน

### C.1 ติดตั้งเครื่องมือ (PowerShell, Run as Administrator)
```powershell
winget install -e --id Git.Git
winget install -e --id OpenJS.NodeJS.LTS      # หรือ Node 22
winget install -e --id Cloudflare.cloudflared
```

### C.2 กู้ของลับ + โค้ด
```powershell
# กู้ ~/.cloudflared  (แตก cloudflared.tar.gz จาก bundle)
tar xzf $HOME\dojojin-backup\secrets\cloudflared.tar.gz -C $HOME

git clone git@github.com:dojojin/dojojin-site.git $HOME\dojojin-site
cd $HOME\dojojin-site
Copy-Item $HOME\dojojin-backup\secrets\env.local.bak .env.local
npm install
npm run build
```

### C.3 เสิร์ฟไฟล์ build ที่ port 80
เลือกวิธีใดวิธีหนึ่ง:
```powershell
# วิธีง่าย: static server ด้วย npx (เปิดค้างไว้ หรือทำเป็น service ด้วย NSSM)
npx serve -l 80 dist

# หรือใช้ Caddy:  caddy file-server --root dist --listen :80
# หรือเปิด IIS แล้วชี้ site root ไปที่ ...\dojojin-site\dist
```

### C.4 แก้ config tunnel ให้ชี้ Windows + ติดตั้งเป็น service
แก้ `%USERPROFILE%\.cloudflared\config-host.yml` ให้ path ใช้รูปแบบ Windows:
```yaml
tunnel: f6684909-a7d7-4b0e-9d29-2328d52c1135
credentials-file: C:\Users\<USER>\.cloudflared\f6684909-a7d7-4b0e-9d29-2328d52c1135.json
ingress:
  - hostname: dojojin.tech
    service: http://127.0.0.1:80
  - service: http_status:404
```
ติดตั้ง tunnel เป็น Windows service (auto-start):
```powershell
cloudflared --config $HOME\.cloudflared\config-host.yml service install
Start-Service cloudflared
# ดูสถานะ: Get-Service cloudflared ; ตรวจเว็บ: curl.exe -I https://dojojin.tech/
```
> หมายเหตุ Windows: ถ้าจะให้ static server (npx serve) รันถาวรหลัง reboot ให้ห่อด้วย **NSSM**
> (`nssm install dojojin-web`) หรือใช้ IIS ซึ่งเป็น service อยู่แล้ว

---

## D) กรณีไฟล์ลับหาย — สร้าง tunnel ใหม่ (ทุก OS)

ถ้าไม่มี `cloudflared.tar.gz` (creds หาย) ต้องสร้าง tunnel ใหม่ แล้ว route DNS:
```bash
cloudflared tunnel login
cloudflared tunnel create dojojin
cloudflared tunnel route dns dojojin dojojin.tech
# คัดลอก <UUID> + ไฟล์ ~/.cloudflared/<UUID>.json แล้วแก้ config-host.yml ให้ใช้ UUID/path ใหม่
```
จากนั้นทำตามขั้น deploy ของ OS นั้นๆ ต่อ

---

## E) Firebase (เหมือนกันทุก OS)

guestbook/counter อยู่บน Firebase cloud — **ไม่หายตอนย้ายเครื่อง** client config เป็น public (`src/firebase.js`)
ถ้าต้อง deploy security rules ใหม่:
```bash
npm i -g firebase-tools && firebase login
firebase deploy --only firestore:rules
```

---

## F) เช็คลิสต์หลังย้าย

- [ ] `systemctl status cloudflared-dojojin.service` = `active` (Linux) / `Get-Service cloudflared` = Running (Windows)
- [ ] `curl -H "Host: dojojin.tech" http://127.0.0.1/` = 200 (nginx เสิร์ฟ build)
- [ ] `curl -I https://dojojin.tech/` = 200 (ผ่าน tunnel จริง)
- [ ] ไม่มี cloudflared **docker container** รันพร้อม service (กัน split-brain → 502)
- [ ] guestbook/counter ทำงาน (Firebase)

---

## G) Troubleshooting (จากปัญหาจริง — ดูเต็มที่ ../DEPLOYMENT.md)

| อาการ | สาเหตุ | แก้ |
|-------|--------|-----|
| `dojojin.tech` → **530** | tunnel ไม่ connect | start `cloudflared-dojojin.service` / Windows: `Start-Service cloudflared` |
| → **502** | tunnel ต่อ origin (nginx) ไม่ได้ | nginx รันไหม / port 80 มีคนเสิร์ฟไหม / split-brain (มี docker cloudflared ปนอยู่) |
| → **404 จาก cloudflare** | cloudflared โหลด `config.yml` (docker) ที่มี catch-all 404 | ใช้ `config-host.yml` ที่ชี้ `127.0.0.1` เท่านั้น |
| nginx → **403** (Fedora) | SELinux context ผิด | `sudo restorecon -RF /var/www/dojojin-site` |
| เห็นหน้า default/test page | Host ไม่ตรง `server_name` → ตก default server | ทดสอบด้วย `curl -H "Host: dojojin.tech" http://127.0.0.1/` |

**กฎทอง:** 530 = ปัญหาที่ tunnel · 502 = ปัญหาที่ nginx/origin · 404 = ปัญหาที่ ingress/config
