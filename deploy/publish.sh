#!/usr/bin/env bash
# ============================================================================
# publish.sh — build + เผยแพร่ขึ้น production (dojojin.tech) ในคำสั่งเดียว
# ใช้:  bash deploy/publish.sh    (หรือ npm run deploy)
# build รันในสิทธิ์ user ปกติ, sudo เฉพาะตอน copy ขึ้น nginx docroot (จะถาม password)
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

WEBROOT="${WEBROOT:-/var/www/dojojin-site}"
NGINX_USER="${NGINX_USER:-nginx}"

echo "==> build"
npm run build

echo "==> publish dist/ -> $WEBROOT (ต้องใช้ sudo)"
sudo rsync -a --delete dist/ "$WEBROOT/"
sudo chown -R "$NGINX_USER:$NGINX_USER" "$WEBROOT" 2>/dev/null || true
# Fedora/Nobara: ตั้ง SELinux context ให้ nginx อ่านได้
command -v restorecon >/dev/null && sudo restorecon -RF "$WEBROOT" || true

echo "==> verify"
echo -n "  https://dojojin.tech/ -> "; curl -sI https://dojojin.tech/ | head -1
echo -n "  title: "; curl -s https://dojojin.tech/ | grep -o '<title>[^<]*</title>' | head -1
echo "เสร็จ — เผยแพร่เวอร์ชันล่าสุดขึ้น production แล้ว ✅"
