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

## Firebase

The app uses the Firebase project configured in [src/firebase.js](./src/firebase.js).

Guestbook writes and visitor counting depend on Firestore collections:

- `comments`
- `meta/visitors`

Owner mode now uses Firebase Google Auth instead of a password embedded in frontend code. The UI checks `VITE_OWNER_EMAILS`, but real protection must also be enforced in Firestore Security Rules. A starter rules file is included at [firestore.rules](./firestore.rules).

Before production deployment, replace the placeholder owner email in `firestore.rules` and deploy rules through Firebase.

## Project Notes

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for a functional summary, security notes, and maintenance checklist.
