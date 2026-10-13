# Validation evidence

Observed locally on 2026-10-13, Node 24.19 / Windows. Initial implementation checkpoint, not a stable-release claim.

- Strict TypeScript and ESLint: pass.
- Vitest: 8 files / 44 checks pass. Chess rules, UCI normalization, scoring boundaries, worker lifecycle/preemption/crash recovery, facts, all 4,070 puzzle and 3,865 opening legal sequences, IndexedDB backup validation/review restoration, review orchestration and repetition.
- Production Vite build: pass; PWA precache ~4.8 MiB including default engine. Optional ~95 MB pack excluded from automatic caching.
- Playwright Chromium 8/8 and Pixel 7 Chromium emulation 8/8 pass. Complete hotseat mate/reload/review, real WASM UCI/MultiPV/mate, bot/undo/resign, puzzles/masters, repertoire/endgame, settings/backup, offline reload/bot/review/puzzles.
- Axe WCAG A/AA dashboard passes desktop/mobile; wider screen audit pending.
- Firefox: 8 local launch failures, incorrect mozglue side-by-side configuration on this Windows host. GitHub Ubuntu CI passed all steps and 24 browser scenarios including Firefox at foundation commit 56b5257: https://github.com/0xAldoLim/pion/actions/runs/38331588037.
- Default/full official engine assets: published SHA-256 integrity checks pass.
- License inventory: 464 installed packages, no unknown declarations. See DEPENDENCY_LICENSES.json.
- pnpm advisory audit: 0 known vulnerabilities at all severities. Registry snapshot, not proof of absence.

Commands: pnpm typecheck, lint, test, build, test:e2e, assets:deep, audit:licenses, audit --json. Production preview http://127.0.0.1:4173. Offline checks disable networking after precache/controller readiness and assert no external requests.

An initial offline regression exposed duplicate icon entries with conflicting revisions. Manifest generation was corrected. Settings now update immediately while writes remain transactional.

Review checkpoint adds full bounded review restoration, recomputed scores, identity/legal PV rejection before mutation. Both relevant real-browser backup/review scenarios pass after the change. Imported records cannot cryptographically prove original search provenance; search version/settings/depth remain visible.

Bot/coach checkpoint: 55 checks pass before the additional version-one migration fixture; focused real Chromium hotseat/review/backup, bot and offline regressions pass 3/3. New motif fixtures cover skewer, discovered attack, fork/double attack, passed pawn exclusions and legal evidence sequences. Clock accounting settles the outgoing player's elapsed time before granting increment. A 48-game real WASM reference run produced 8 actual results and 40 unresolved cutoffs; see BOT_CALIBRATION.md. No measured Elo claim.
