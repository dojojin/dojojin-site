#!/usr/bin/env bash
# ติดตั้ง cloudflared named tunnel ของ dojojin.tech เป็น systemd service (รันถาวร)
# ใช้: sudo bash deploy/install-tunnel.sh
# ต้องรันจาก root ของ repo (โฟลเดอร์ dojojin-site)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_HOME="/home/kiseki"

echo "==> ติดตั้ง binary cloudflared -> /usr/local/bin/cloudflared"
install -m755 "$REPO_DIR/src/cloudflared" /usr/local/bin/cloudflared

echo "==> ติดตั้ง host config -> $USER_HOME/.cloudflared/config-host.yml (ถ้ายังไม่มี)"
if [ ! -f "$USER_HOME/.cloudflared/config-host.yml" ]; then
  install -o kiseki -g kiseki -m600 "$REPO_DIR/deploy/cloudflared-config-host.yml" \
    "$USER_HOME/.cloudflared/config-host.yml"
fi

echo "==> ติดตั้ง systemd unit -> /etc/systemd/system/cloudflared-dojojin.service"
install -m644 "$REPO_DIR/deploy/cloudflared-dojojin.service" \
  /etc/systemd/system/cloudflared-dojojin.service

echo "==> เปิดใช้งาน service (enable --now)"
systemctl daemon-reload
systemctl enable --now cloudflared-dojojin.service

echo "==> สถานะ:"
systemctl --no-pager --full status cloudflared-dojojin.service | head -12

echo
echo "เสร็จแล้ว — ตรวจสอบเว็บ: curl -sI https://dojojin.tech/ | head -1"
