# deploy/ — ไฟล์ตั้งค่า production ของ DOJOJIN.TECH

ไฟล์ในโฟลเดอร์นี้คือสำเนา (version-controlled) ของ config ที่ใช้ deploy จริง
ดูคู่มือฉบับเต็มที่ [`../DEPLOYMENT.md`](../DEPLOYMENT.md)

| ไฟล์ | ติดตั้งจริงที่ | หน้าที่ |
|------|----------------|---------|
| `nginx-dojojin-site.conf` | `/etc/nginx/conf.d/dojojin-site.conf` | nginx เสิร์ฟ `/var/www/dojojin-site` |
| `cloudflared-config-host.yml` | `~/.cloudflared/config-host.yml` | ingress ของ tunnel (ชี้ 127.0.0.1) |
| `cloudflared-dojojin.service` | `/etc/systemd/system/cloudflared-dojojin.service` | systemd unit ทำให้ tunnel รันถาวร |
| `install-tunnel.sh` | — | สคริปต์ติดตั้ง tunnel เป็น service (ครบในคำสั่งเดียว) |

## ติดตั้ง tunnel เป็น systemd service (รันถาวร)

```bash
sudo bash deploy/install-tunnel.sh
```

สคริปต์จะ: ติดตั้ง binary → วาง host config + systemd unit → `enable --now` → โชว์สถานะ

ตรวจสอบ:
```bash
systemctl status cloudflared-dojojin.service
curl -sI https://dojojin.tech/ | head -1
```
