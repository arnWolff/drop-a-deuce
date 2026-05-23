# 🍑 Drop a Peach — Mobile-First Redesign

A complete UI/UX overhaul of *Pose ta pêche* / *Drop a Peach*, rebuilt from the ground up for smartphone use while staying a single static site you can drop on GitHub Pages today and wrap into an iOS/Android app tomorrow.

---

## What changed

The original app worked, but the layout was clearly born on a desktop: centered modals, hover-only affordances, tiny tap targets, no safe-area handling. The new build is **mobile-native first** — every interaction was designed for a thumb.

### Navigation
- **Bottom tab bar** with five slots (Map · Quests · **Drop** · Places · You). The center "Drop" button is an elevated FAB — the most important action sits exactly where the thumb rests.
- **Top bar** is a translucent, blurred status strip with the player level, a peach counter, and the language toggle. It floats above the map without stealing real estate.
- **Side stack** (locate-me + show-my-drops) sits flush against the right edge — reachable, never in the way of the FAB.

### Sheets, not modals
Every form, list, and detail view is a **bottom sheet** with:
- A visible drag handle.
- **Swipe-to-dismiss** (touch + mouse, with a momentum threshold).
- A tappable scrim behind it.
- Safe-area padding so it never collides with the iOS home indicator.

No more centered popups that get clipped on small phones.

### Touch & input
- Every interactive element is **at least 48 px** tall.
- Inputs use **16 px font-size** so iOS Safari doesn't auto-zoom on focus.
- Buttons use the chunky sticker aesthetic with the signature `--thwack` hard drop shadow that depresses on `:active` — the press feedback is visual *and* haptic.
- Segmented controls replace radio groups. Toggle switches replace checkboxes. Emoji pickers are 6-column grids sized for fingertips.

### Feedback
- **Haptics** via the Vibration API (toggleable in settings) on every meaningful tap, drop, level-up, and error.
- **Sound FX** synthesized on the fly with the Web Audio API — no asset files to ship. Soft pops for taps, a rising arpeggio on level-up, a low buzz on error.
- **Spring animations** on sheet open/close and the peach drop using `cubic-bezier(.34, 1.56, .64, 1)`.
- **Confetti bursts** on achievement unlocks.

### Platform polish
- Full **`env(safe-area-inset-*)`** handling for the iPhone notch and home indicator.
- **`prefers-color-scheme`** dark mode with an in-app override (Auto / Light / Dark).
- **`prefers-reduced-motion`** respected — animations gracefully degrade.
- Apple-specific PWA meta tags (`apple-mobile-web-app-capable`, status bar style, touch icon).
- First-run **iOS install sheet** with step-by-step Add-to-Home-Screen instructions, since Safari doesn't support `beforeinstallprompt`.
- **Welcome sheet** on first launch — language picker, nickname, avatar.

### Kept all the fun
Nothing was sacrificed: 15 challenges, XP & levels with 8 escalating titles, achievement popups, photo capture with on-device compression, EN/FR i18n (toggle live, all UI re-renders including open popups), saved places, the wobbling peach mascot, the cream-and-brown sticker aesthetic, the Bagel Fat One display font.

---

## Run it locally

Don't double-click `index.html` — `file://` blocks geolocation, camera, and service workers.

```bash
cd peche
python3 -m http.server 8000
# then open http://localhost:8000 on your phone or in DevTools mobile mode
```

To test on a real phone over your LAN, find your local IP and visit `http://<your-ip>:8000`. Some browsers require HTTPS for camera/geolocation on non-localhost — use a tunnel (e.g. `ngrok http 8000`) if needed.

---

## Deploy to GitHub Pages

Exactly the same as the original — it's still a static site.

1. Push `index.html`, `manifest.json`, `sw.js`, your icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.ico`) to your repo.
2. In **Settings → Pages**, pick the branch and `/ (root)`.
3. Wait for the green checkmark and visit `https://<you>.github.io/<repo>/`.

GitHub Pages serves over HTTPS, which means geolocation, camera, and the service worker will all work.

> ⚠️ When you ship an update, bump `CACHE` in `sw.js` (e.g. `peche-v2` → `peche-v3`) so users get the new build. The old cache is cleaned up automatically on activation.

---

## Wrap as iOS / Android with Capacitor

The codebase is ready. There are commented hooks at the bottom of `index.html` flagging where to swap web APIs for native plugins.

```bash
npm init -y
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/ios @capacitor/android \
      @capacitor/haptics @capacitor/camera @capacitor/geolocation
npx cap init "Drop a Peach" "com.yourname.peche" --web-dir=www

mkdir www
cp index.html manifest.json sw.js www/
cp icon-*.png apple-touch-icon.png favicon.ico www/

npx cap add ios
npx cap add android
npx cap sync
npx cap open ios       # or: npx cap open android
```

Then in `index.html`:
- Replace `navigator.vibrate(...)` → `Haptics.impact({ style: ImpactStyle.Light })`.
- Replace the `<input type="file" accept="image/*" capture>` photo flow → `Camera.getPhoto({ source: CameraSource.Camera })`.
- Replace `navigator.geolocation.getCurrentPosition` → `Geolocation.getCurrentPosition()` for better background behavior.

Both stores allow PWA-style apps wrapped this way. For App Store review, make sure the privacy strings in `Info.plist` clearly explain why you need location and camera.

---

## Wire it to your existing Firebase backend

This redesign is **UI + localStorage only** so you can plug in your existing data layer without conflicts. Your `firestore_rules` schema already matches:

```
pins/{pinId}              { uid, lat, lng, ts, challengeId, note, photo, placeName }
users/{userId}            { nickname, avatar, xp, completedChallenges, settings }
users/{userId}/locations/{locId}   { name, emoji, lat, lng }
```

The state lives in a single `state` object inside `index.html`. The integration points are:

| What it does | Where it is | What to do |
|---|---|---|
| `persist()` writes the whole state to `localStorage` | bottom of the JS block | Mirror the relevant slices (`pins`, `places`, `xp`, `completedChallenges`) to Firestore. |
| `performDrop()` adds a pin to `state.pins` | drop flow | After local insert, push the same object to the `pins/` collection. |
| `boot()` reads from `localStorage` | end of JS | Subscribe to a `pins` query (e.g. last 7 days, or geo-bounded) and call `addPinMarker()` per doc. |
| `state.nickname` / `state.avatar` | profile sheet | Gate behind your auth — write to `users/{uid}` instead of LS. |
| `compressImage()` returns a base64 JPEG | photo capture | Upload to Firebase Storage and save the resulting URL on the pin instead. |

The existing rules already enforce per-user writes, so the only Firestore change you'd need is matching the field names above.

---

## File layout

```
peche/
├── index.html      # The whole app: HTML + CSS + JS in one file
├── manifest.json   # PWA manifest with shortcuts & maskable icons
├── sw.js           # Service worker v2 (network-first HTML, cache-first assets)
├── icon-192.png    # — keep your existing icons —
├── icon-512.png
├── apple-touch-icon.png
├── favicon.ico
└── README.md       # this file
```

That's it. No build step, no bundler, no node_modules. The whole thing is grep-able and you can ship it from any static host on the planet.

---

## Browser support

| Feature | Min version |
|---|---|
| Core app (map, drop, challenges) | iOS Safari 14+, Chrome 90+, Firefox 88+ |
| Install prompt | Chrome / Edge on Android & desktop |
| Vibration | Android Chrome / Firefox (iOS Safari ignores silently) |
| `backdrop-filter` (topbar blur) | iOS Safari 14+, Chrome 76+ — degrades to solid color |
| `env(safe-area-inset-*)` | iOS Safari 11+, Chrome 69+ |

Older browsers get a slightly less fancy version but everything still works.

---

Happy pooping. 🍑
