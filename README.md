# Fated List of Minor Recipes

See what you can make after a farmer's market trip. Enter what you bought this week and get every recipe sorted into Makeable / Almost makeable / Missing, filterable by season.

See [SPEC.md](./SPEC.md) for the full requirements and design decisions.

## Setup

```sh
npm install
npm run dev
```

Then open the printed local URL. On your phone, open the same URL (if on the same network use your computer's LAN IP instead of `localhost`) and use "Add to Home Screen" to install it as a PWA.

## Build

```sh
npm run build
npm run preview
```

## Stack

- React + TypeScript + Vite
- `localforage` (IndexedDB) for local-only storage — see `src/lib/`
- `vite-plugin-pwa` for offline/installable support

No backend, no accounts — all data lives in your browser. See SPEC.md's "Technical Approach" section for why, and the known tradeoffs.
