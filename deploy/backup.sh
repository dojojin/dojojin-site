#!/usr/bin/env bash
# ============================================================================
# backup.sh — สร้าง "migration bundle" สำหรับย้ายเครื่อง (เฉพาะ dojojin-site)
# เก็บเฉพาะของลับที่ "ไม่ได้อยู่ใน git" — โค้ด + config ระบบอยู่ใน repo (deploy/) แล้ว
#
# ใช้:  bash deploy/backup.sh            # -> ~/dojojin-backup (default)
#       bash deploy/backup.sh /path/to/dir
#
# bundle ที่ได้ (self-contained พอจะย้ายไปเครื่องใหม่):
#   <dir>/secrets/cloudflared.tar.gz   ทั้งโฟลเดอร์ ~/.cloudflared (creds+cert+config-host.yml)
#   <dir>/secrets/env.local.bak        สำเนา .env.local
#   <dir>/secrets/README-secrets.txt   คำเตือน
#   <dir>/restore.sh                   สคริปต์กู้คืน (สำเนาจาก repo)
#   <dir>/MIGRATE.md                   คู่มือย้ายเครื่อง (สำเนาจาก repo)
#   <dir>/MANIFEST.txt                 เวอร์ชัน/วันที่ของเครื่องต้นทาง
# ============================================================================
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${1:-$HOME/dojojin-backup}"

# --- safety: กัน rm -rf พลาดไปโดน path อันตราย ---
case "$BACKUP_DIR" in
  "$HOME"|"/"|""|"$HOME/") echo "!! BACKUP_DIR ไม่ปลอดภัย: '$BACKUP_DIR'" >&2; exit 1 ;;
esac

SECRETS="$BACKUP_DIR/secrets"

echo "==> เป้าหมาย backup: $BACKUP_DIR"
echo "==> ล้างของเดิมทั้งหมดใน bundle (replace ทั้งหมด)"
rm -rf "$BACKUP_DIR"
mkdir -p "$SECRETS"

# 1) ~/.cloudflared (tunnel credentials + cert + config-host.yml) -> tarball
if [ -d "$HOME/.cloudflared" ]; then
  tar czf "$SECRETS/cloudflared.tar.gz" -C "$HOME" .cloudflared
  echo "   + secrets/cloudflared.tar.gz   ($(du -h "$SECRETS/cloudflared.tar.gz" | cut -f1))"
else
  echo "   !! ไม่พบ ~/.cloudflared — ข้าม (tunnel จะกู้ไม่ได้ถ้าไม่มีไฟล์นี้)"
fi

# 2) .env.local (VITE_OWNER_EMAILS) — secret ไม่อยู่ใน git
if [ -f "$REPO_DIR/.env.local" ]; then
  cp "$REPO_DIR/.env.local" "$SECRETS/env.local.bak"
  echo "   + secrets/env.local.bak"
else
  echo "   !! ไม่พบ .env.local — ข้าม"
fi

# 3) สำเนา restore.sh + MIGRATE.md เข้า bundle ให้ self-contained
cp "$REPO_DIR/deploy/restore.sh" "$BACKUP_DIR/restore.sh"; chmod +x "$BACKUP_DIR/restore.sh"
cp "$REPO_DIR/deploy/MIGRATE.md" "$BACKUP_DIR/MIGRATE.md"
echo "   + restore.sh, MIGRATE.md"

# 4) README เตือนของลับ
cat > "$SECRETS/README-secrets.txt" <<'EOF'
ไฟล์ในโฟลเดอร์นี้คือ "ของลับ" — ห้าม commit เข้า git / ห้ามแชร์
- cloudflared.tar.gz : ทั้งโฟลเดอร์ ~/.cloudflared (config-host.yml + .json credentials + cert.pem + tokens)
- env.local.bak      : .env.local ของ dojojin-site (VITE_OWNER_EMAILS)
เก็บ bundle นี้ในที่ปลอดภัย เช่น USB เข้ารหัส / password manager / cloud ส่วนตัว
กู้คืนด้วย:  bash restore.sh   (อ่าน MIGRATE.md ก่อน)
EOF

# 5) MANIFEST — เวอร์ชันเครื่องต้นทาง (ไว้ match เครื่องใหม่)
TUNNEL_ID="$(grep -E '^tunnel:' "$HOME/.cloudflared/config-host.yml" 2>/dev/null | awk '{print $2}' || true)"
cat > "$BACKUP_DIR/MANIFEST.txt" <<EOF
dojojin-site migration bundle
created  : $(date -Iseconds)
host     : $(hostname)
os       : $(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME" || uname -a)
node     : $(node -v 2>/dev/null || echo 'n/a')
npm      : $(npm -v 2>/dev/null || echo 'n/a')
cloudflared: $(/usr/local/bin/cloudflared --version 2>/dev/null || echo 'n/a')
tunnel-id: ${TUNNEL_ID:-n/a}
repo     : git@github.com:dojojin/dojojin-site.git
EOF

echo "==> เสร็จ. โครงสร้าง bundle:"
find "$BACKUP_DIR" -maxdepth 2 -printf '   %P\n' | sort
echo
echo "ย้ายเครื่อง: คัดลอกทั้งโฟลเดอร์ '$BACKUP_DIR' ไปเครื่องใหม่ แล้วรัน  bash restore.sh"
