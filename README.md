# 🍑 Drop a Peach — v2

A silly, social PWA that lets you map your bathroom breaks, complete daily quests, and see what other peach-droppers are up to in real time. Single-file static app with a Firestore backend.

## What's new in v2

- **Modern design** — peach→pink gradient brand, soft layered shadows (no more sticker thwack), Inter + Bagel Fat One typography, glassmorphic topbar, generous border-radius (16–28px). Light/dark/auto.
- **Fixed FAB position** — the drop button now floats *above* the bottom nav with a 14 px gap, never overlapping any tab. Bottom nav is 4 evenly-spaced tabs: Map · Quests · Places · You.
- **Real Firebase backend** — anonymous sign-in by default, Google sign-in upgrades via `linkWithPopup`, real-time pin subscription so every drop from every user shows on the map within a second.

## Architecture

| Concern | Implementation |
| --- | --- |
| Map | Leaflet + OSM tiles |
| Auth | Firebase `signInAnonymously` on boot; `linkWithPopup` with `GoogleAuthProvider`; redirect fallback when popups are blocked; anon→Google snapshot+recreate migration when the Google account already exists |
| Pins | `pins` collection, real-time `onSnapshot` (latest 200 by `ts desc`) |
| User profile | `users/{uid}` — `displayName`, `photoURL`, `avatarEmoji`, `xp`, `completed[]` |
| Saved places | `users/{uid}/locations` subcollection |
| Storage | Photos stored as compressed base64 JPEG in the pin doc (≤ ~700 KB after client-side resize) |
| PWA | Manifest + service worker; install prompt on Android/desktop, "Add to Home Screen" sheet on iOS |

## Hosting

It's all static. Host the four files (`index.html`, `manifest.json`, `sw.js`, `README.md`) plus your icon pngs anywhere — GitHub Pages, Netlify, Cloudflare Pages, your hand. Make sure the domain is on the Firebase Auth **Authorized domains** list so Google sign-in works.

## Wrapping for native

Drop the same files into a Capacitor or Tauri shell for App Store / Play Store distribution. The webview just needs Leaflet + Firebase reachable over the network.

## Firestore rules

Already set up — see `firestore_rules` in the project. Anyone can read `pins` (so all users see all drops); only the owner can create their own; writes must include `uid == request.auth.uid`.

## Languages

English and French, switchable from the topbar pill (🇬🇧/🇫🇷). All UI strings live in the `I18N` object at the top of the script.

## Browser support

Modern evergreen browsers. Service worker + `backdrop-filter` graceful degradation. iOS 14+, Android Chrome 90+.
