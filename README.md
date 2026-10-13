# Pion

An open-source, browser-local chess training application. React + TypeScript + Vite, Chessground, chess.js, Stockfish WASM, and IndexedDB. No account, server database, telemetry, paid API, or LLM.

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
pnpm exec playwright install chromium
pnpm test:e2e
pnpm preview
```

Open the preview's local address. Installation and service-worker offline behavior require the production build, HTTPS or localhost. Keep the page open until the offline installation confirmation appears. Export backups regularly: browser storage can be cleared.

Run `pnpm assets:deep` before building to offer the optional full single-thread engine pack. This increases deployment size substantially. The default lite single-thread engine works without cross-origin isolation. Engine binaries are reproduced from the exact locked Stockfish npm package; generated files are intentionally excluded from Git. The asset script generates SHA-256 integrity metadata.

Source and assets must be served from the same origin. Deploy `dist/` to a static host with SPA fallback; no backend is required. An update is applied only after explicit user action so an ongoing game can be saved first.

See `docs/IMPLEMENTATION_STATUS.md`, `docs/TEST_RESULTS.md`, and `docs/KNOWN_ISSUES.md` for current verified scope and resumption instructions. Ratings and performance estimates are provisional; neither accuracy profile claims proprietary platform parity.

Licensed GPL-3.0-or-later. Component notices and dataset provenance are documented separately.
