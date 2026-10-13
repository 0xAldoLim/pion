# Validation evidence

Observed locally on 2026-10-13, Node 24.19 / Windows. Results describe the tested implementation and do not establish measured bot Elo.

- Strict TypeScript, ESLint and production Vite build: pass.
- Vitest: 11 files / 63 checks pass. Covers chess rules, UCI normalization, review scoring and legal evidence, worker lifecycle/preemption/crash recovery, grounded motifs/hints, all 4,070 puzzle and 3,865 opening legal sequences, all nine lesson demos, repetition, migration and transactional backup, clock outcomes, abortable bot pacing, separate ratings and duplicate/stale settlement protection.
- Playwright: 19/19 desktop Chromium and 19/19 Pixel 7 Chromium emulation scenarios pass (38 total). Includes complete hotseat mate/reload/review/backup; real WASM UCI, MultiPV and mate; Black-side bot play, undo/resignation; promotion; deterministic pause/increment/timeout; puzzles/Morphy/repetition; full mistake-line replay; repertoire/endgames; CSV installation; settings; entirely offline production play; full-engine integrity rejection/install/offline execution; both appearance modes; seven characters/boards and four piece sets; minimum response pacing; streamed evaluation; local Blitz/Rapid matching/settlement; lesson loops; opening tiers; destination-piece review badges and comparison arrows.
- Axe: all nine main views in both light and dark modes pass WCAG 2 A/AA and 2.1 AA scans (18 scans, zero violations). Desktop/mobile dashboard scans also pass within the browser suite. These scans do not cover every possible active-game or dialog state.
- Production PWA: 71 precache entries, approximately 4,999.53 KiB including the default engine. Optional approximately 95 MB full engine is excluded from automatic caching. Main application chunk is approximately 606.20 KB gzip; Vite reports its size warning.
- Default/full official engine assets: published size and SHA-256 checks pass. A deliberately corrupted full-pack download is rejected before installation; verified installation runs the real worker offline.
- License inventory: 464 installed packages, no unknown declarations. See DEPENDENCY_LICENSES.json.
- pnpm advisory audit: zero known vulnerabilities at every severity in this registry snapshot; this is not proof that no vulnerabilities exist.
- Local Firefox cannot launch because of this Windows host's mozglue side-by-side configuration. The earlier Ubuntu workflow passed all 24 then-existing browser scenarios at c22a4ae: https://github.com/0xAldoLim/pion/actions/runs/38333445572. Expanded Ubuntu/Firefox acceptance will be recorded after the current feature commit is pushed.

Commands: pnpm typecheck, pnpm lint, pnpm test, pnpm build, pnpm exec playwright test --project=chromium --project=mobile --workers=2, pnpm assets:deep, pnpm audit:licenses, pnpm audit --json. The production preview is http://127.0.0.1:4173. Offline checks disable networking after precache/controller readiness and assert no external requests.

Regression checks now guard the previously observed duplicate precache revisions, restored review identities/PVs, initial preference-write race, game-launch URL/save race, elapsed time before increment, minimum bot response on cached book moves, rating settlement on reload, and early repetition credit. Historical master metadata remains explicit where the exact date is unknown.

A separate 48-game real WASM reference run produced eight actual results and forty unresolved cutoffs; see BOT_CALIBRATION.md. Opponent strengths and locally matched Elo remain estimates, and the simulation does not establish a calibrated rating scale.
