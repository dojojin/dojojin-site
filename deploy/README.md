# deploy/ — ไฟล์ตั้งค่า production ของ DOJOJIN.TECH

ไฟล์ในโฟลเดอร์นี้คือสำเนา (version-controlled) ของ config ที่ใช้ deploy จริง
ดูคู่มือฉบับเต็มที่ [`../DEPLOYMENT.md`](../DEPLOYMENT.md)

| ไฟล์ | ติดตั้งจริงที่ | หน้าที่ |
|------|----------------|---------|
| `nginx-dojojin-site.conf` | `/etc/nginx/conf.d/dojojin-site.conf` | nginx เสิร์ฟ `/var/www/dojojin-site` |
| `cloudflared-config-host.yml` | `~/.cloudflared/config-host.yml` | ingress ของ tunnel (ชี้ 127.0.0.1) |
| `cloudflared-dojojin.service` | `/etc/systemd/system/cloudflared-dojojin.service` | systemd unit ทำให้ tunnel รันถาวร |
| `install-tunnel.sh` | — | สคริปต์ติดตั้ง tunnel เป็น service (ครบในคำสั่งเดียว) |
| `backup.sh` | — | สร้าง migration bundle (ของลับ + binary) → `~/dojojin-backup` |
| `restore.sh` | — | กู้คืนทั้งระบบบนเครื่องใหม่ (Linux) |
| `MIGRATE.md` | — | คู่มือย้ายเครื่องครบทุก OS (Fedora/Ubuntu/Windows) |
| `dojojin-backup.cron` | crontab ของ user | ตั้ง backup อัตโนมัติทุกสัปดาห์ |

## ย้ายเครื่อง / backup-restore

```bash
bash deploy/backup.sh        # สร้าง bundle -> ~/dojojin-backup (เก็บใส่ USB/cloud ส่วนตัว)
# บนเครื่องใหม่: คัดลอก ~/dojojin-backup มา แล้ว
cd ~/dojojin-backup && bash restore.sh
```
- bundle **รวม binary `cloudflared`** ไว้ด้วย → restore ได้แม้ไม่มีเน็ต (ถ้าไม่มีค่อยดาวน์โหลด)
- รายละเอียดต่อ OS (รวม Windows + Ubuntu/apt) ดู [`MIGRATE.md`](./MIGRATE.md)

## Backup อัตโนมัติ (cron — ทุกวันอาทิตย์ 03:17)

```bash
crontab deploy/dojojin-backup.cron   # ติดตั้ง   (ดู: crontab -l   ถอด: crontab -r)
```
log: `~/.cache/dojojin-backup.log`  ·  ต้องมี crond ทำงาน: `systemctl is-active crond`

**ตรวจ/ทดสอบว่า cron ยิงจริง** (ตั้งทุกนาทีชั่วคราว รอ 1 รอบ แล้วคืนค่า):
```bash
( crontab -l; echo '* * * * * bash ~/dojojin-site/deploy/backup.sh >> ~/.cache/dojojin-backup.log 2>&1' ) | crontab -
sleep 75; grep '^created' ~/dojojin-backup/MANIFEST.txt   # ควรเป็นเวลานาทีล่าสุด
crontab deploy/dojojin-backup.cron                         # คืนค่าตารางปกติ
```

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
