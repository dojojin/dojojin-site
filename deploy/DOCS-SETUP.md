# DOCS-SETUP.md — แผนสร้าง docs.dojojin.tech

> สร้างเมื่อ: 2026-06-03
> Stack: VitePress · nginx · cloudflared tunnel f6684909 (เดิม) · Cloudflare DNS

---

## Architecture

```
docs.dojojin.tech
  → Cloudflare (CNAME → tunnel, Proxied ON)
  → cloudflared tunnel f6684909 (ingress ใหม่)
  → nginx :80 server block docs.dojojin.tech
  → /var/www/dojojin-docs/ (VitePress static build)
```

Project source แยกที่ `~/dojojin-docs/` (ไม่ปน dojojin-site repo)

---

## Phase 0 — Pre-flight Audit

```bash
node -v && npm -v                                    # ต้อง Node ≥ 18
sudo systemctl is-active nginx cloudflared-dojojin   # ต้อง active ทั้งคู่
curl -sI https://dojojin.tech/ | head -1             # ต้อง HTTP/2 200
ls -laZ /var/www/                                    # ดู SELinux context เดิม
cat ~/.cloudflared/config-host.yml                   # ยืนยัน ingress ปัจจุบัน
```

ผ่านเงื่อนไข: ทุก service active, HTTP 200, Node ≥ 18

---

## Phase 1 — VitePress Project Init

```bash
mkdir ~/dojojin-docs && cd ~/dojojin-docs
npm init -y
npm install -D vitepress
npx vitepress init
#   → Root: ./docs
#   → Site title: DOJOJIN Docs
#   → Site description: Engineering docs & project references
#   → Theme: Default Theme
git init && git add -A && git commit -m "init: vitepress scaffold"
```

สร้าง `.gitignore`:
```
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
```

---

## Phase 2 — Content Structure

โครงสร้างโฟลเดอร์:
```
docs/
├── index.md                    ← landing page
├── projects/
│   ├── index.md
│   ├── vigil-platform.md
│   └── ai-ocr-pipeline.md
├── guides/
│   └── index.md
└── .vitepress/
    └── config.js
```

`config.js` skeleton:
```js
export default {
  title: 'DOJOJIN Docs',
  description: 'Engineering docs & project references',
  themeConfig: {
    nav: [
      { text: 'Projects', link: '/projects/' },
      { text: 'Guides',   link: '/guides/' },
      { text: 'dojojin.tech', link: 'https://dojojin.tech' }
    ],
    sidebar: { /* per-section */ },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dojojin' }]
  }
}
```

---

## Phase 3 — Local Build & Test

```bash
npm run docs:build              # output → docs/.vitepress/dist/
npm run docs:preview            # http://localhost:4173
ls -lh docs/.vitepress/dist/   # ต้องมี index.html + assets/
```

ผ่านเงื่อนไข: preview ขึ้นไม่มี error, nav ทำงาน

---

## Phase 4 — nginx Server Block

```bash
# สร้าง docroot
sudo mkdir -p /var/www/dojojin-docs
sudo chown -R nginx:nginx /var/www/dojojin-docs
sudo restorecon -RF /var/www/dojojin-docs        # Fedora SELinux

# deploy config (ดูไฟล์ nginx-dojojin-docs.conf ใน deploy/)
sudo cp deploy/nginx-dojojin-docs.conf /etc/nginx/conf.d/dojojin-docs.conf

# ทดสอบ + reload
sudo nginx -t
sudo systemctl reload nginx
curl -H "Host: docs.dojojin.tech" http://127.0.0.1:80/ -sI | head -1
```

---

## Phase 5 — cloudflared Ingress Update

แก้ `~/.cloudflared/config-host.yml` — เพิ่ม block ก่อน catch-all:
```yaml
  - hostname: docs.dojojin.tech
    service: http://127.0.0.1:80
```

ดูไฟล์ `cloudflared-config-host.yml` (ใน deploy/) สำหรับ config เต็มหลัง update

```bash
sudo systemctl restart cloudflared-dojojin.service
sudo systemctl status  cloudflared-dojojin.service
journalctl -u cloudflared-dojojin.service -n 20 --no-pager
```

หลัง restart อัปเดต version-controlled copy:
```bash
cp ~/.cloudflared/config-host.yml ~/dojojin-site/deploy/cloudflared-config-host.yml
```

---

## Phase 6 — Cloudflare DNS

ทำใน Cloudflare Dashboard → dojojin.tech → DNS:

| Field  | Value |
|--------|-------|
| Type   | CNAME |
| Name   | docs  |
| Target | f6684909-a7d7-4b0e-9d29-2328d52c1135.cfargotunnel.com |
| Proxy  | ON (orange cloud) |
| TTL    | Auto |

รอ propagation ~1-2 นาที

---

## Phase 7 — First Deploy

```bash
# รันจาก ~/dojojin-docs
sudo rsync -a --delete docs/.vitepress/dist/ /var/www/dojojin-docs/
sudo chown -R nginx:nginx /var/www/dojojin-docs
sudo restorecon -RF /var/www/dojojin-docs
```

สร้าง `~/dojojin-docs/deploy.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
npm run docs:build
sudo rsync -a --delete docs/.vitepress/dist/ /var/www/dojojin-docs/
sudo chown -R nginx:nginx /var/www/dojojin-docs
command -v restorecon >/dev/null && sudo restorecon -RF /var/www/dojojin-docs || true
echo -n "docs -> "; curl -sI https://docs.dojojin.tech/ | head -1
```

---

## Phase 8 — End-to-End Verification

```bash
# nginx direct
curl -H "Host: docs.dojojin.tech" http://127.0.0.1:80/ -sI | head -1
# expect: HTTP/1.1 200 OK

# ผ่าน Cloudflare
curl -sI https://docs.dojojin.tech/ | head -1
# expect: HTTP/2 200

# title
curl -s https://docs.dojojin.tech/ | grep "<title>"
# expect: <title>DOJOJIN Docs</title>

# ไม่กระทบ dojojin.tech เดิม
curl -sI https://dojojin.tech/ | head -1
# expect: HTTP/2 200
```

---

## Phase 9 — Housekeeping

- [ ] commit nginx-dojojin-docs.conf เข้า dojojin-site/deploy/
- [ ] commit cloudflared-config-host.yml (หลัง Phase 5 เสร็จ)
- [ ] อัปเดต DEPLOYMENT.md เพิ่ม section docs.dojojin.tech
- [ ] อัปเดต deploy/backup.sh ให้ backup /var/www/dojojin-docs (optional)

---

## Dependency Order

```
Phase 0 → 1 → 2 → 3 (build pass)
                  ↓
           4 (nginx) ←──── ทำพร้อมกันได้
           5 (tunnel) ←───
           6 (DNS) ←──────
                  ↓ (4+5+6 ครบ)
           7 (first deploy)
                  ↓
           8 (verify) → 9 (housekeeping)
```

เวลาประมาณ: ~45-60 นาที
