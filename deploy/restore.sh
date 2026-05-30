#!/usr/bin/env bash
# ============================================================================
# restore.sh — กู้คืน dojojin.tech บนเครื่องใหม่ (Fedora/Nobara + nginx + systemd)
#
# สถาปัตยกรรมเป้าหมาย (ไม่ใช้ docker สำหรับ tunnel):
#   dojojin.tech -> Cloudflare -> cloudflared (systemd บน host) -> nginx :80
#                -> /var/www/dojojin-site (ไฟล์ build)
#
# รันจากในโฟลเดอร์ bundle ที่ backup.sh สร้าง:  bash restore.sh
# ต้องมีสิทธิ์ sudo (จะถาม password เป็นช่วงๆ)
#
# ปรับแต่งผ่าน env: REPO_DIR, REPO_URL, WEBROOT
# ============================================================================
set -euo pipefail

BUNDLE_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="${REPO_DIR:-$HOME/dojojin-site}"
REPO_URL="${REPO_URL:-git@github.com:dojojin/dojojin-site.git}"
WEBROOT="${WEBROOT:-/var/www/dojojin-site}"
NGINX_USER="${NGINX_USER:-nginx}"

say(){ printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn(){ printf '\033[1;33m   !! %s\033[0m\n' "$*"; }

# ---------------------------------------------------------------------------
say "0) ตรวจ prerequisites (git, node, npm, nginx, curl)"
need=(); for c in git node npm curl rsync; do command -v "$c" >/dev/null || need+=("$c"); done
if ! command -v nginx >/dev/null; then need+=("nginx"); fi
if [ "${#need[@]}" -gt 0 ]; then
  warn "ยังขาด: ${need[*]}"
  if   command -v dnf >/dev/null; then warn "ติดตั้ง:  sudo dnf install -y git nodejs npm nginx curl rsync"
  elif command -v apt >/dev/null; then warn "ติดตั้ง:  sudo apt update && sudo apt install -y git nodejs npm nginx curl rsync"
  elif command -v pacman >/dev/null; then warn "ติดตั้ง:  sudo pacman -S --needed git nodejs npm nginx curl rsync"
  else warn "ติดตั้ง git/node/npm/nginx/curl/rsync ด้วย package manager ของเครื่องคุณ"; fi
  warn "อ่าน MIGRATE.md หัวข้อ OS ของคุณ แล้วรัน restore.sh ใหม่"
  exit 1
fi

# ---------------------------------------------------------------------------
say "1) กู้ ~/.cloudflared (credentials + cert + config-host.yml)"
if [ -f "$BUNDLE_DIR/secrets/cloudflared.tar.gz" ]; then
  tar xzf "$BUNDLE_DIR/secrets/cloudflared.tar.gz" -C "$HOME"
  chmod 700 "$HOME/.cloudflared" || true
  echo "   restored: $(ls "$HOME/.cloudflared"/*.yml "$HOME/.cloudflared"/*.json 2>/dev/null | xargs -n1 basename | tr '\n' ' ')"
else
  warn "ไม่พบ secrets/cloudflared.tar.gz — tunnel จะกู้ไม่ได้ (ดู MIGRATE.md หัวข้อ 'สร้าง tunnel ใหม่')"
fi

# ---------------------------------------------------------------------------
say "2) clone repo (ถ้ายังไม่มี)"
if [ -d "$REPO_DIR/.git" ]; then
  echo "   มี repo อยู่แล้วที่ $REPO_DIR"
else
  git clone "$REPO_URL" "$REPO_DIR"
fi

# ---------------------------------------------------------------------------
say "3) กู้ .env.local"
if [ -f "$BUNDLE_DIR/secrets/env.local.bak" ]; then
  cp "$BUNDLE_DIR/secrets/env.local.bak" "$REPO_DIR/.env.local"
  echo "   restored .env.local"
else
  warn "ไม่พบ env.local.bak — owner mode อาจไม่ทำงานจนกว่าจะตั้ง VITE_OWNER_EMAILS เอง"
fi

# ---------------------------------------------------------------------------
say "4) build เว็บ"
cd "$REPO_DIR"
npm install
npm run build

# ---------------------------------------------------------------------------
say "5) deploy ไฟล์ build -> $WEBROOT (nginx docroot)"
sudo mkdir -p "$WEBROOT"
sudo rsync -a --delete "$REPO_DIR/dist/" "$WEBROOT/"
sudo chown -R "$NGINX_USER:$NGINX_USER" "$WEBROOT" 2>/dev/null || sudo chown -R root:root "$WEBROOT"
# Fedora/Nobara = SELinux: ต้องตั้ง context ให้ nginx อ่านได้ ไม่งั้นเสิร์ฟแล้ว 403
if command -v restorecon >/dev/null; then
  sudo restorecon -RF "$WEBROOT" && echo "   SELinux context: ตั้งให้ $WEBROOT แล้ว"
fi

# ---------------------------------------------------------------------------
say "6) ติดตั้ง nginx server block + reload"
sudo install -m644 "$REPO_DIR/deploy/nginx-dojojin-site.conf" /etc/nginx/conf.d/dojojin-site.conf
if sudo nginx -t; then
  sudo systemctl enable --now nginx
  sudo systemctl reload nginx
else
  warn "nginx -t ไม่ผ่าน — ตรวจ config แล้วลองใหม่"; exit 1
fi

# ---------------------------------------------------------------------------
say "7) กัน split-brain: ปิด cloudflared container เดิมใน docker (ถ้ามี)"
if command -v docker >/dev/null && sudo docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qx cloudflared; then
  sudo docker rm -f cloudflared && echo "   ลบ container cloudflared เดิมแล้ว"
else
  echo "   ไม่มี container cloudflared (ดีแล้ว)"
fi

# ---------------------------------------------------------------------------
say "8) ติดตั้ง cloudflared tunnel เป็น systemd service (auto-start ถาวร)"
# ใช้ binary จาก bundle ถ้ามี (offline) ไม่งั้น install-tunnel.sh จะดาวน์โหลดเอง
if [ -f "$BUNDLE_DIR/bin/cloudflared-linux-amd64" ] && [ ! -x /usr/local/bin/cloudflared ]; then
  sudo install -m755 "$BUNDLE_DIR/bin/cloudflared-linux-amd64" /usr/local/bin/cloudflared
  echo "   ติดตั้ง cloudflared จาก bundle (offline)"
fi
# install-tunnel.sh จัดการ binary (ถ้ายังไม่มี) + config + unit + enable --now
sudo bash "$REPO_DIR/deploy/install-tunnel.sh"

# ---------------------------------------------------------------------------
say "9) ตรวจสอบ (verify)"
sleep 5
echo -n "   nginx (Host: dojojin.tech) : "; curl -s -o /dev/null -w "%{http_code}\n" -H "Host: dojojin.tech" http://127.0.0.1:80/
echo -n "   service active             : "; systemctl is-active cloudflared-dojojin.service
echo -n "   public https://dojojin.tech: "
for i in 1 2 3 4 5 6; do
  code="$(curl -s -o /dev/null -w '%{http_code}' https://dojojin.tech/ || true)"
  [ "$code" = "200" ] && { echo "$code ✅"; break; }
  [ "$i" = 6 ] && echo "$code (ยังไม่ 200 — ดู: journalctl -u cloudflared-dojojin.service -n 50)"
  sleep 5
done

say "เสร็จสิ้น — ดู MIGRATE.md เช็คลิสต์ข้อ 6 เพื่อยืนยันครบทุกอย่าง"
