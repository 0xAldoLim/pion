# Validation evidence

Observed locally on 2026-10-13, Node 24.19 / Windows. Initial implementation checkpoint, not a stable-release claim.

- Strict TypeScript and ESLint: pass.
- Vitest: 7 files / 41 checks pass. Chess rules, UCI normalization, scoring boundaries, worker lifecycle/preemption/crash recovery, facts, all 4,070 puzzle and 3,865 opening legal sequences, IndexedDB backup validation and repetition.
- Production Vite build: pass; PWA precache ~4.8 MiB including default engine. Optional ~95 MB pack excluded from automatic caching.
- Playwright Chromium 8/8 and Pixel 7 Chromium emulation 8/8 pass. Complete hotseat mate/reload/review, real WASM UCI/MultiPV/mate, bot/undo/resign, puzzles/masters, repertoire/endgame, settings/backup, offline reload/bot/review/puzzles.
- Axe WCAG A/AA dashboard passes desktop/mobile; wider screen audit pending.
- Firefox: 8 launch failures; no application assertions executed. Incorrect side-by-side configuration on this host. CI includes Firefox on Ubuntu.
- Default/full official engine assets: published SHA-256 integrity checks pass.
- License inventory: 464 installed packages, no unknown declarations. See DEPENDENCY_LICENSES.json.
- pnpm advisory audit: 0 known vulnerabilities at all severities. Registry snapshot, not proof of absence.

Commands: pnpm typecheck, lint, test, build, test:e2e, assets:deep, audit:licenses, audit --json. Production preview http://127.0.0.1:4173. Offline checks disable networking after precache/controller readiness and assert no external requests.

An initial offline regression exposed duplicate icon entries with conflicting revisions. Manifest generation was corrected. Settings now update immediately while writes remain transactional.
