# DOJOJIN.TECH

Personal portfolio and interactive guestbook for DOJOJIN.TECH, built with Vite, React, and Firebase.

The site presents engineering projects, live-style CCTV/terminal interactions, hidden UI effects, a visitor counter, and a real-time guestbook backed by Firestore.

## Tech Stack

- React 19
- Vite 5
- Firebase App, Auth, and Firestore
- Tailwind/PostCSS toolchain
- ESLint with React Hooks rules

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file if owner mode is needed:

```bash
cp .env.example .env.local
```

Set `VITE_OWNER_EMAILS` to a comma-separated list of Google account emails allowed to delete guestbook comments.

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint the project:

```bash
npm run lint
```

The dev server is configured (in [vite.config.js](./vite.config.js)) with `server.host: true`
(listen on both IPv4 and IPv6) and `server.allowedHosts` for `*.trycloudflare.com`, so it can be
reached through a Cloudflare quick tunnel during development.

## Deployment

Production is served as static files (no Docker, no Node runtime in production):

```
dojojin.tech → Cloudflare → cloudflared (named tunnel, on host via systemd)
            → nginx :80 (root /var/www/dojojin-site) → built files (dist/)
```

Deploy a new build:

```bash
npm run build
sudo rsync -a --delete dist/ /var/www/dojojin-site/
sudo chown -R nginx:nginx /var/www/dojojin-site
```

The Cloudflare Tunnel runs as `cloudflared-dojojin.service` using a host-specific config
(`~/.cloudflared/config-host.yml`, pointing at `127.0.0.1` — not the Docker `config.yml`).
Version-controlled copies of the nginx, cloudflared, and systemd config live in [deploy/](./deploy/);
install the tunnel as a service with `sudo bash deploy/install-tunnel.sh`.

Full step-by-step instructions, the systemd unit, and a detailed troubleshooting log (the 530 / 502 /
404 errors hit during setup and how each was fixed) live in [DEPLOYMENT.md](./DEPLOYMENT.md).
Project conventions and a quick troubleshooting table are in [CLAUDE.md](./CLAUDE.md).

### Moving to a new machine (backup / restore)

Secrets that are not in git (`~/.cloudflared` credentials, `.env.local`) are bundled by a script:

```bash
bash deploy/backup.sh          # → ~/dojojin-backup (copy it to a USB / private cloud)
# on the new machine, after copying the bundle across:
cd ~/dojojin-backup && bash restore.sh
```

`restore.sh` rebuilds everything (clone, build, nginx, SELinux context, systemd tunnel) and verifies
with curl. Per-OS instructions for **Fedora/Nobara, Ubuntu/Debian, and Windows** are in
[deploy/MIGRATE.md](./deploy/MIGRATE.md).

## Firebase

The app uses the Firebase project configured in [src/firebase.js](./src/firebase.js).

Guestbook writes and visitor counting depend on Firestore collections:

- `comments`
- `meta/visitors`

Owner mode now uses Firebase Google Auth instead of a password embedded in frontend code. The UI checks `VITE_OWNER_EMAILS`, but real protection must also be enforced in Firestore Security Rules. A starter rules file is included at [firestore.rules](./firestore.rules).

Before production deployment, replace the placeholder owner email in `firestore.rules` and deploy rules through Firebase.

## Project Notes

- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — functional summary, security notes, and maintenance checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) — full install & deploy guide + troubleshooting (Thai)
- [CLAUDE.md](./CLAUDE.md) — project guide for Claude Code, with deployment architecture and a troubleshooting table (Thai)
- [deploy/](./deploy/) — version-controlled prod config + install/backup/restore scripts
- [deploy/MIGRATE.md](./deploy/MIGRATE.md) — move to a new machine (Fedora / Ubuntu / Windows) (Thai)
