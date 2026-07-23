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
reached through a Cloudflare quick tunnel during development. These settings affect the dev server
only — production is a static build with no Node runtime.

## Deployment

Production is hosted on **Cloudflare Pages** via Git integration — **deploying is just pushing to
`main`**; Cloudflare builds the repo and publishes the static output:

```bash
git push origin main
```

Cloudflare Pages settings (configured once in the dashboard):

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Environment variable | `VITE_OWNER_EMAILS` (see below) |

> **Important:** `VITE_`-prefixed vars are inlined at build time. The Cloudflare build has no
> `.env.local` (it is gitignored), so `VITE_OWNER_EMAILS` **must** be set in
> Pages → Settings → Environment variables, or owner mode silently breaks in production.

Every branch / PR gets an automatic preview URL, and past deployments can be rolled back from
Pages → Deployments. Full details and troubleshooting are in [DEPLOYMENT.md](./DEPLOYMENT.md);
project conventions and a quick troubleshooting table are in [CLAUDE.md](./CLAUDE.md).

## Firebase

The app uses the Firebase project configured in [src/firebase.js](./src/firebase.js).

Guestbook writes and visitor counting depend on Firestore collections:

- `comments`
- `meta/visitors`

Owner mode now uses Firebase Google Auth instead of a password embedded in frontend code. The UI checks `VITE_OWNER_EMAILS`, but real protection must also be enforced in Firestore Security Rules. A starter rules file is included at [firestore.rules](./firestore.rules).

Before production deployment, replace the placeholder owner email in `firestore.rules` and deploy rules through Firebase.

## Project Notes

- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) — functional summary, security notes, and maintenance checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Cloudflare Pages deploy guide + troubleshooting (Thai)
- [CLAUDE.md](./CLAUDE.md) — project guide for Claude Code, with deploy notes and a troubleshooting table (Thai)
