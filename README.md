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

## Deploy (GitHub Pages)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys automatically on every push to `main`.

One-time setup:

1. Push this repo to GitHub (`git push -u origin main`) — the repo backing this is `fated-list-of-minor-recipes`.
2. **The repo name must be `fated-list-of-minor-recipes`** — `vite.config.ts`'s `base` path (`/fated-list-of-minor-recipes/`) is hardcoded to match, since GitHub Pages serves project sites at `https://<username>.github.io/<repo-name>/`. If you ever rename the repo, update `base` in `vite.config.ts` to match.
3. On GitHub: **Settings → Pages → Source → GitHub Actions**.
4. Push to `main` (or re-run the workflow from the Actions tab). The site will be live at `https://<username>.github.io/fated-list-of-minor-recipes/` a minute or two later.

After that, every push to `main` redeploys automatically — no further manual steps.

## Stack

- React + TypeScript + Vite
- `localforage` (IndexedDB) for local-only storage — see `src/lib/`
- `vite-plugin-pwa` for offline/installable support

No backend, no accounts — all data lives in your browser. See SPEC.md's "Technical Approach" section for why, and the known tradeoffs.
