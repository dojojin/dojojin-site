# คู่มือการติดตั้งและ Deploy — DOJOJIN.TECH

เอกสารนี้สรุป **วิธีติดตั้งเว็บบน OS นี้**, **ปัญหาทั้งหมดที่พบระหว่างทำ** และ **วิธีแก้แต่ละปัญหา** อย่างละเอียด
เขียนจากการติดตั้งจริงบนเครื่องนี้ (2026-05-31)

---

## 1. ภาพรวมสถาปัตยกรรม (Architecture)

```
ผู้ใช้ทั่วโลก
   │  https://dojojin.tech
   ▼
Cloudflare Edge (proxy / orange-cloud, NS: gemma|walt.ns.cloudflare.com)
   │  Cloudflare Tunnel (QUIC)
   ▼
cloudflared  (named tunnel: f6684909-a7d7-4b0e-9d29-2328d52c1135)
   │  รันบน host ด้วย systemd  →  ingress: dojojin.tech → http://127.0.0.1:80
   ▼
nginx :80   (server_name dojojin.tech → root /var/www/dojojin-site)
   ▼
ไฟล์ static ที่ build แล้ว (dist/) ของเว็บ React/Vite
```

**สรุปสั้น:** เว็บถูก build เป็นไฟล์ static → วางใน docroot ของ nginx → เปิดออกเน็ตผ่าน Cloudflare Tunnel
โดย **ไม่ใช้ docker** (รัน cloudflared เป็น binary บน host โดยตรง)

---

## 2. ข้อมูลสภาพแวดล้อม (Environment)

| รายการ | ค่า |
|--------|-----|
| OS | Nobara / Fedora 43 (kernel 7.0.9-200.nobara.fc43) |
| Node.js | v22.22.0 |
| npm | 10.9.4 |
| nginx | 1.30.0 (systemd, `active`) |
| docker | 29.5.2 (ติดตั้งอยู่แต่ **ไม่ได้ใช้** ในงาน deploy นี้) |
| cloudflared | 2026.5.2 |
| Tunnel ID | `f6684909-a7d7-4b0e-9d29-2328d52c1135` |
| โดเมน | dojojin.tech (อยู่บน Cloudflare, เปิด proxy) |

ไฟล์/พาธสำคัญ:

| พาธ | หน้าที่ |
|-----|---------|
| `/home/kiseki/dojojin-site` | โค้ดเว็บ (repo นี้) |
| `/home/kiseki/dojojin-site/src/cloudflared` | binary cloudflared (39MB, ELF) |
| `/var/www/dojojin-site` | docroot ที่ nginx เสิร์ฟ (ไฟล์ build) |
| `/etc/nginx/conf.d/dojojin-site.conf` | nginx server block ของ dojojin.tech |
| `/home/kiseki/.cloudflared/config.yml` | config เดิม (สำหรับ **docker** — ใช้ host.docker.internal) |
| `/home/kiseki/.cloudflared/config-host.yml` | **config ใหม่สำหรับรันบน host** (ชี้ 127.0.0.1) |
| `/home/kiseki/.cloudflared/f6684909-...json` | credentials ของ tunnel |
| `/home/kiseki/.cloudflared/cert.pem` | Argo tunnel token / cert |
| `/usr/local/bin/cloudflared` | binary ที่ใช้กับ systemd service |
| `/etc/systemd/system/cloudflared-dojojin.service` | systemd unit (ทำให้ tunnel รันถาวร) |

---

## 3. วิธีติดตั้งและรันเว็บ (Local)

### 3.1 ติดตั้ง dependencies
```bash
cd /home/kiseki/dojojin-site
npm install
```

### 3.2 ตั้งค่า environment (สำหรับโหมด owner)
```bash
cp .env.example .env.local
# แก้ VITE_OWNER_EMAILS เป็นอีเมล Google ที่อนุญาตให้ลบคอมเมนต์ guestbook
# ปัจจุบัน: VITE_OWNER_EMAILS=dojojin@gmail.com
```

### 3.3 รัน dev server (สำหรับพัฒนา)
```bash
npm run dev          # เปิดที่ http://localhost:5173
```

### 3.4 Build สำหรับ production
```bash
npm run build        # ได้ผลลัพธ์ในโฟลเดอร์ dist/
```

---

## 4. การ Deploy ออกเน็ต (Production)

### 4.1 นำไฟล์ build ขึ้น nginx docroot
```bash
npm run build
sudo rsync -a --delete dist/ /var/www/dojojin-site/
# หรือ: sudo cp -r dist/* /var/www/dojojin-site/
sudo chown -R nginx:nginx /var/www/dojojin-site
```

### 4.2 nginx server block (`/etc/nginx/conf.d/dojojin-site.conf`)
```nginx
server {
    listen 80;
    server_name dojojin.tech www.dojojin.tech localhost;

    root /var/www/dojojin-site;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4.3 Config ของ cloudflared สำหรับรันบน host (`~/.cloudflared/config-host.yml`)

> **สำคัญ:** อย่าใช้ `~/.cloudflared/config.yml` เดิมตรงๆ เพราะมันเขียนไว้สำหรับ **docker**
> (ใช้ `service: http://host.docker.internal:80` และ `credentials-file: /etc/cloudflared/...`)
> ซึ่ง resolve ไม่ได้เมื่อรันบน host — ต้องใช้ไฟล์ใหม่ที่ชี้ `127.0.0.1` แทน

```yaml
tunnel: f6684909-a7d7-4b0e-9d29-2328d52c1135
credentials-file: /home/kiseki/.cloudflared/f6684909-a7d7-4b0e-9d29-2328d52c1135.json

ingress:
  - hostname: dojojin.tech
    service: http://127.0.0.1:80
  - hostname: www.dojojin.tech
    service: http://127.0.0.1:80
  - hostname: ssh.dojojin.tech
    service: ssh://127.0.0.1:22
  - service: http_status:404
```

### 4.4 รัน tunnel ชั่วคราว (ทดสอบ — ดับเมื่อปิด session)
```bash
src/cloudflared tunnel --config ~/.cloudflared/config-host.yml run
```

### 4.5 ทำให้รันถาวรด้วย systemd (วิธีที่แนะนำสำหรับ production)

ติดตั้ง binary และ service:
```bash
sudo install -m755 /home/kiseki/dojojin-site/src/cloudflared /usr/local/bin/cloudflared
sudo cp /tmp/cloudflared-dojojin.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-dojojin.service
systemctl status cloudflared-dojojin.service
```

ไฟล์ `/etc/systemd/system/cloudflared-dojojin.service`:
```ini
[Unit]
Description=Cloudflare Tunnel (dojojin.tech)
After=network-online.target nginx.service
Wants=network-online.target

[Service]
Type=simple
User=kiseki
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/kiseki/.cloudflared/config-host.yml run
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> **ระวัง:** ถ้ามี cloudflared **container ใน docker** (ai-stack, `restart: always`) รัน tunnel ตัวเดียวกันอยู่ด้วย
> จะเกิด "split-brain" (Cloudflare สลับ request ไปหา connection ที่เสิร์ฟ origin ไม่ได้ → 502 เป็นช่วงๆ)
> ให้ปิด container เดิม: `sudo docker rm -f cloudflared`

---

## 5. ปัญหาที่พบทั้งหมด + วิธีแก้ (Troubleshooting)

ระหว่างเปิด tunnel ออกเน็ต เจอปัญหาซ้อนกัน **5 ชั้น** กว่าจะถึง 200 — บันทึกไว้ครบเพื่อกันพลาดซ้ำ

### ปัญหา 1 — Vite บล็อก host แปลกปลอม (404)
- **อาการ:** เปิด tunnel ได้ URL มา แต่เข้าแล้วได้ HTTP 404 (body ว่าง) ทั้งที่ `localhost:5173` ตอบ 200 ปกติ
- **สาเหตุ:** Vite 5.4 มีระบบเช็ค host — request ที่ Host เป็นโดเมนภายนอก (เช่น `*.trycloudflare.com`) จะถูกปฏิเสธ
- **วิธีแก้:** เพิ่ม `server.allowedHosts` ใน `vite.config.js`
  ```js
  server: {
    allowedHosts: ['.trycloudflare.com'],
  }
  ```
- *(หมายเหตุ: production ใช้ nginx เสิร์ฟ static ไม่เจอปัญหานี้ — แต่บันทึกไว้สำหรับการ tunnel ไปที่ dev server)*

### ปัญหา 2 — cloudflared โหลด config เดิมทับ flag `--url` (404)
- **อาการ:** ใช้ `cloudflared tunnel --url http://localhost:5173` แต่ทุก request ตอบ 404 จาก edge ของ Cloudflare
- **การวินิจฉัย:** เปิด debug log (`--loglevel debug`) เห็นบรรทัด
  ```
  ingressRule=3 originService=http_status:404 path=/
  ```
  และ `Loading configuration from /home/kiseki/.cloudflared/config.yml`
- **สาเหตุ:** cloudflared โหลด `~/.cloudflared/config.yml` (ของ named tunnel เดิม) อัตโนมัติ
  ในนั้นมี ingress rule สุดท้าย `service: http_status:404` (catch-all) → มันชนะ flag `--url` → ตอบ 404 ทุกอย่าง
- **วิธีแก้:** บังคับให้ใช้ config เปล่า เพื่อไม่ให้โหลด ingress เดิม
  ```bash
  printf '{}\n' > /tmp/cf-empty.yml
  src/cloudflared tunnel --config /tmp/cf-empty.yml --url http://127.0.0.1:5173
  ```

### ปัญหา 3 — Vite ฟังเฉพาะ IPv6 แต่ cloudflared ต่อ IPv4 (502)
- **อาการ:** หลังแก้ปัญหา 2 เปลี่ยนจาก 404 เป็น **502 Bad Gateway**
- **การวินิจฉัย:** log ของ cloudflared:
  ```
  dial tcp 127.0.0.1:5173: connect: connection refused
  ```
  และ `ss -ltn` เห็น Vite ฟังที่ `[::1]:5173` (IPv6 เท่านั้น)
- **สาเหตุ:** `localhost` บนเครื่องนี้ resolve เป็น IPv6 (`::1`) Vite เลย bind แค่ IPv6
  แต่ cloudflared dial `127.0.0.1` (IPv4) → ต่อไม่ได้
- **วิธีแก้:** ให้ Vite ฟังทุก interface — เพิ่ม `host: true` ใน `vite.config.js`
  ```js
  server: {
    host: true,                          // ฟังทั้ง IPv4 + IPv6
    allowedHosts: ['.trycloudflare.com'],
  }
  ```

### ปัญหา 4 — dojojin.tech ตอบ 530 (tunnel ไม่ connect)
- **อาการ:** `https://dojojin.tech` ตอบ **HTTP 530** (server: cloudflare)
- **สาเหตุ:** 530 = Cloudflare หา origin ของ tunnel ไม่เจอ = **ไม่มี cloudflared instance ใดเชื่อมต่อ tunnel `f6684909` อยู่เลย**
  - DNS ฝั่ง Cloudflare ปกติ (โดเมน proxied, NS เป็นของ Cloudflare) — ไม่ต้องแก้ DNS / ไม่ต้องลบอะไร
  - named tunnel ถูกออกแบบให้รันใน docker (ai-stack) แต่ container ไม่ได้รัน/ต่อไม่สำเร็จ
- **วิธีแก้:** ไม่ต้องพึ่ง docker — รัน named tunnel ด้วย binary บน host โดยตรง (ดูปัญหา 5 + หัวข้อ 4.3–4.5)

### ปัญหา 5 — config ของ docker ใช้บน host ไม่ได้
- **อาการ:** เอา `~/.cloudflared/config.yml` มารันบน host ตรงๆ ไม่ได้
- **สาเหตุ:** config นั้นเขียนสำหรับ docker —
  - `service: http://host.docker.internal:80` → `host.docker.internal` resolve ได้เฉพาะในเน็ตเวิร์ค docker
  - `credentials-file: /etc/cloudflared/...` → เป็น path ในคอนเทนเนอร์ (mount มาจาก `~/.cloudflared`)
- **วิธีแก้:** สร้าง `config-host.yml` ใหม่ที่ใช้ `127.0.0.1` และ path จริงบน host (ดูหัวข้อ 4.3) แล้วรัน
  ```bash
  src/cloudflared tunnel --config ~/.cloudflared/config-host.yml run
  ```
  → tunnel register สำเร็จหลาย connection (bkk/sin) → `https://dojojin.tech` = **200** ✅

### เกร็ดเพิ่มเติมที่เจอระหว่างทาง
- มีไฟล์ขยะ `/etc/nginx/conf.d/dojojin.conf:` (ชื่อมี `:` ต่อท้าย + มี placeholder `USERNAME` ที่ไม่เคยแก้)
  → nginx **ไม่โหลด** เพราะ include รับเฉพาะไฟล์ `*.conf` (ลงท้ายด้วย `:` จึงถูกข้าม) — ลบทิ้งได้
- `curl http://127.0.0.1:80` ได้หน้า "Test Page for the HTTP Server on Fedora" เพราะ Host เป็น `127.0.0.1`
  ไม่ตรง `server_name` ของ dojojin-site.conf → ตกไป default server ของ nginx
  ต้องทดสอบด้วย `curl -H "Host: dojojin.tech" http://127.0.0.1:80/` ถึงจะเห็นเว็บจริง
- `www.dojojin.tech` ยังเข้าไม่ได้ — ต้องเพิ่ม DNS record `www` (CNAME ไป tunnel) ใน Cloudflare dashboard

---

## 6. คำสั่งตรวจสอบ / แก้ปัญหาเบื้องต้น

```bash
# เว็บออนไลน์ไหม
curl -sI https://dojojin.tech/ | head -1

# nginx เสิร์ฟไฟล์ถูกไหม (ต้องใส่ Host ให้ตรง server_name)
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: dojojin.tech" http://127.0.0.1:80/

# nginx ฟังพอร์ตอะไร / ใครฟัง :80
ss -ltnp | grep ':80'

# สถานะ tunnel (systemd)
systemctl status cloudflared-dojojin.service
journalctl -u cloudflared-dojojin.service -n 50 --no-pager

# metrics ของ cloudflared (จำนวน request / error)
curl -s http://127.0.0.1:20241/metrics | grep -E 'total_requests|request_errors|ha_connections' | grep -v '#'

# DNS / nameserver
dig +short dojojin.tech
dig +short NS dojojin.tech
```

**ความหมายของ HTTP code ที่เจอบ่อย:**
| Code | ความหมาย | ดูที่ไหน |
|------|----------|---------|
| 530 | tunnel ไม่ connect | systemd service / docker container ของ cloudflared |
| 502 | tunnel ต่อ origin (nginx) ไม่ได้ | nginx รันไหม / IPv4-IPv6 / พอร์ตถูกไหม |
| 404 (จาก cloudflare) | ingress ไม่ match / config ผิด | ingress rules ใน config |
| 404 (จาก nginx) | docroot ว่าง / ไม่มี index.html | `/var/www/dojojin-site` |
| 200 | ปกติ ✅ | — |

---

## 7. สถานะ ณ ปัจจุบัน (2026-05-31)

- ✅ เว็บ build แล้ว วางที่ `/var/www/dojojin-site`, nginx เสิร์ฟปกติ
- ✅ `config-host.yml` สร้างแล้ว, named tunnel รันบน host → **`https://dojojin.tech` = 200**
- ✅ binary copy ไป `/usr/local/bin/cloudflared` แล้ว
- ⏳ **ค้าง:** ติดตั้ง systemd service ให้ครบ (`enable --now`) เพื่อให้รันถาวร —
  ตอนนี้ tunnel ยังรันผ่าน session อยู่ จะดับเมื่อปิด session
  รันคำสั่งในหัวข้อ 4.5 เพื่อปิดงานส่วนนี้
- ⏳ (ถ้าต้องการ) เพิ่ม DNS `www`, ลบไฟล์ขยะ `dojojin.conf:`, ปิด cloudflared container เดิมใน docker
