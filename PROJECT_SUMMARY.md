# Project Summary

## Overview

DOJOJIN.TECH is a single-page React portfolio with a cyber/terminal visual style. It combines project showcases, playful system-status widgets, hidden interactions, a visitor counter, and a Firestore-powered guestbook.

## Main Features

- Dynamic browser title with idle/visibility behavior.
- Terminal-style command processor with simulated infra commands.
- CCTV-style static panels, live Bangkok clock, and screensaver overlay.
- Project cards for CCTV analytics, mobile app work, ANPR, OCR, and crowd-density systems.
- Visitor counter stored in Firestore.
- Real-time guestbook using Firestore `onSnapshot`.
- Owner comment deletion through Firebase Auth owner mode.
- Konami-code popup and glitch text effects.

## Important Files

- `src/main.jsx` mounts the React app.
- `src/App.jsx` contains the main UI, hooks, widgets, project data, visitor counter, and guestbook.
- `src/firebase.js` initializes Firebase App, Auth, Google provider, and Firestore.
- `vite.config.js` configures React and production code splitting.
- `firestore.rules` contains starter Firestore rules for comments, visitor count, and owner deletes.
- `public/favicon.svg` and `src/favicon.svg` are optimized lightweight favicons.

## Fixes Applied

- Removed the unused root-level `App.jsx` copy.
- Removed duplicate `tailwind.config.cjs`; the project now uses `tailwind.config.js`.
- Replaced the 2.4 MB favicon with a small SVG favicon.
- Removed hard-coded owner password from the frontend.
- Added Firebase Google Auth owner flow.
- Added `VITE_OWNER_EMAILS` configuration for owner-mode UI checks.
- Fixed React lint errors caused by synchronous state initialization in effects.
- Fixed render-time `Math.random()` usage in `GlitchText`.
- Added Vite manual chunks for React and Firebase to remove production bundle-size warning.
- Rewrote README documentation.

## Security Notes

Frontend owner checks are only a UI convenience. Firestore Security Rules must enforce delete permissions on the server side.

Before going live:

- Set `VITE_OWNER_EMAILS` in the hosting environment.
- Update `firestore.rules` with the same real owner email addresses.
- Deploy Firestore rules.
- Confirm only owner emails can delete comments.

Firebase web API keys are not private secrets by themselves, but Firestore/Auth rules must be strict because the config is public in every Firebase web app.

## Verification

The current local checks pass:

```bash
npm run lint
npm run build
```

Production build splits app, React, and Firebase chunks successfully.
