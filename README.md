# Drop a Deuce 🍑 / Pose ta pêche

The fun way to map your #2 around the world. A single-file static web app — no build step, no backend, no API keys. Bilingual (🇬🇧 EN / 🇫🇷 FR), mobile-first, GitHub Pages ready.

## ✨ Features

- 🗺️ **Real-time map** with OpenStreetMap (free, open source, no Google Maps key)
- 📍 **Real geolocation** — auto-centers on you, blue pulsing user marker, recenter button
- 💩 **Live global counter** — total worldwide drops + today's drops, ticking every 250ms
- 🎲 **Rotating fun facts** — Olympic pools filled, Earth laps circled, etc.
- 🏆 **15 challenges** with bilingual punny names: 🚽 Classic Throne, 🍳 Kitchen Catastrophe, 🌍 Globe Trotter…
- 📸 **Photo capture** — opens phone camera (rear-facing), auto-compresses to ~900px JPEG
- 🎮 **XP + levels + achievements** — pop animation when you complete a challenge for the first time
- 🇬🇧🇫🇷 **Drop a Deuce / Pose ta pêche** — the whole UI, including the app title in your browser tab, swaps with one tap
- 🆓⭐ **Free vs Premium** — 3 drops/day cap on Free; Premium unlocks all challenges
- 💾 **Persists across reloads** — your pins, XP, level, plan, and language are saved in `localStorage`
- 📱 **Mobile-first responsive** — works on iPhone, Android, tablet, desktop
- ⚡ **Single HTML file** — drop it on any static host

## 🚀 Run Locally

⚠️ **Don't double-click `index.html`** — Chrome blocks geolocation on `file://`. Use a tiny local server instead:

```bash
# Option 1: Python (built into macOS/Linux)
python3 -m http.server 8000

# Option 2: Node
npx serve

# Option 3: PHP
php -S localhost:8000

# Option 4: VS Code → install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open <http://localhost:8000> in your browser. Allow location access when prompted.

## 🌍 Deploy to GitHub Pages (free, 2 minutes)

1. Create a new public GitHub repo, e.g. `drop-a-deuce`.
2. Drop `index.html` (and this `README.md`) into the repo and push:
   ```bash
   git init
   git add index.html README.md
   git commit -m "Initial release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/drop-a-deuce.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from a branch → `main` / `(root)` → Save**.
4. Wait ~1 minute. Your site is live at `https://YOUR_USERNAME.github.io/drop-a-deuce/` 🎉

GitHub Pages serves it over HTTPS, so geolocation works perfectly on mobile and desktop.

## 🧠 How the Global Counter Works

GitHub Pages is static (no backend), so the counter is **deterministic**:

```
total = BASE_OFFSET + (seconds_since_LAUNCH_TS × RATE) + your_local_pins
today = (seconds_since_local_midnight × RATE) + your_local_pins_today
```

It ticks live, looks identical to a real counter, works offline, and is consistent across reloads. To swap for a real backend later:

1. Build a tiny endpoint (Cloudflare Workers free tier, Vercel functions, etc.) that returns `{ total, today }`.
2. Replace `totalCount()` and `todayGlobal()` in `index.html` with `fetch('/api/stats')`.

That's it.

## 🏗️ Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Markup | HTML5 | Single file |
| Map | [Leaflet 1.9](https://leafletjs.com/) (BSD-2) + [OpenStreetMap](https://www.openstreetmap.org) (ODbL) | Free, open, no key |
| Fonts | Google Fonts (Bagel Fat One, Plus Jakarta Sans) | Free, swappable |
| Storage | `localStorage` | No backend |
| i18n | Plain JSON dictionaries | Easy to extend |

## 🌐 Adding a Language

In `index.html`, find the `I18N` object and add a key. Each language needs an `appName` and `tagline` (used for the browser tab title) plus all the UI strings:

```js
es: {
  appName: 'Suelta el Marrón',
  tagline: 'La forma divertida de mapear tu #2',
  free: 'Gratis', premium: 'Premium', today: 'Hoy', /* … */
  facts: ['Suficiente para llenar {pools} piscinas olímpicas 🏊', /* … */],
  perks: ['Depósitos diarios ilimitados', /* … */],
  // …
}
```

Then for each challenge in `CHALLENGES`, add an `es: ['Name', 'Description']` array. Done.

## 🔮 Roadmap to Real MVP

| Feature | How |
|--------|-----|
| Cross-user pins | Add a backend (Node + PostgreSQL/PostGIS, or Supabase free tier). Replace local `pins` array with `fetch('/api/pins?bbox=...')`. |
| Auth | [Auth.js](https://authjs.dev/), [Clerk](https://clerk.com), or Supabase Auth. JWT in `localStorage`, sent as `Authorization` header. |
| Photo storage | Cloudflare R2 or S3 (signed upload URLs). Replace base64 dataURLs with `https://cdn.example.app/photos/abc.jpg`. |
| Premium billing | [Stripe](https://stripe.com) or [Lemon Squeezy](https://lemonsqueezy.com). Webhook updates a `plan` column. |
| Real global counter | Tiny Cloudflare Worker + Durable Object. Increments on every `POST /pins`. |
| Install on phone | Add `manifest.json` + service worker → installable PWA. |
| Push notifications | Web Push API + a notification queue worker. "Streak alert: don't break your 7-day chain!" |
| Friends, leaderboards, heatmap | Standard CRUD + PostGIS `ST_DWithin` queries. |

## 📜 License

MIT. Have fun. Don't poo in actual kitchens.
