# Pion

An open-source, browser-local chess training application. React + TypeScript + Vite, Chessground, chess.js, Stockfish WASM, and IndexedDB. No account, server database, telemetry, paid API, or LLM.

- Seven reference-inspired cartoon characters: Ponke, Lonke, Gonke, Konke, Bonke, Zonke, and Donke; twelve selectable practice difficulties.
- Play now opens a duration picker and immediately matches an estimated opponent within ±20 of the selected Blitz / Rapid rating. Choose 1, 3 or 5 minutes for Blitz; 10, 15 or 30 minutes for Rapid. Both start at 600 and use K=32 Elo. Practice bots leave these ratings unchanged.
- Bots take 2.8–4.8 seconds by default, even when a move is cached. Quick and Thoughtful pacing are available in Settings.
- Light/dark navbar toggle, larger type, seven board themes, four original SVG piece sets, and animated live evaluation.
- On-piece review badges, progressive position-specific hints, explicit side-to-move prompts, captioned lesson loops, and curated SSS–C opening learning tiers with sourced player examples.

Clock category uses initial seconds + 40 increments: below 600 seconds is Blitz, otherwise Rapid. Rated games require a clock; hints, undo and pause remain practice tools. Local ratings measure progress within Pion; opponent strength remains an estimate rather than a measured online rating.

## Development

Node 24.11+ and pnpm 11 are required. Enable pnpm using Corepack or install pnpm independently.

```sh
pnpm install --frozen-lockfile
pnpm assets
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium firefox
pnpm test:e2e
pnpm preview
```

Open the preview's local address. Installation and service-worker offline behavior require the production build, HTTPS or localhost. Keep the page open until the offline installation confirmation appears. Export backups regularly: browser storage can be cleared.

Run `pnpm assets:deep` before building to offer the optional full single-thread engine pack (~95 MB). The default lite single-thread engine (~1.8 MB WASM) works without cross-origin isolation. Engine binaries come from the official pinned Stockfish.js v19.0.1 release; generated files are intentionally excluded from Git. The asset script verifies published SHA-256 digests and generates integrity metadata.

Source and assets must be served from the same origin. Deploy `dist/` to a static host with SPA fallback; no backend is required. An update is applied only after explicit user action so an ongoing game can be saved first.

See `docs/IMPLEMENTATION_STATUS.md`, `docs/TEST_RESULTS.md`, and `docs/KNOWN_ISSUES.md` for current verified scope and resumption instructions. Ratings and performance estimates are provisional; neither accuracy profile claims proprietary platform parity.

Licensed GPL-3.0-or-later. Component notices and dataset provenance are documented separately.
