# Validation evidence

Updated 2026-10-15. Exact release runs are recorded in [LEARNING_VALIDATION.md](LEARNING_VALIDATION.md).

- TypeScript, ESLint, Vitest and production build use the real application. Unit checks cover all 31 lesson FENs/demos/objectives, alternative mates, actual capture profitability, opening annotations/recovery, graph/transpositions, both-color practice/scheduling, recommendations, assistance restrictions, fourteen complete master scores, additive migrations and transactional backups.
- Browser workflows exercise wrong answers/hints, exact-step reload, independent transfer, Italian branches/recall, Black recall, legal alternatives, custom repertoire PGN, schedules, review-derived branches and repeated actual reviewed losses leading to lessons and puzzles.
- Rated games hide evaluation/coach/hints/classifications/PVs while bot play continues. Review is gated until the result is saved. Optional provisional practice feedback uses full-strength analysis separately from the weakened opponent. Real-engine Fool's Mate verifies the g4 blunder, legal mate evidence and same-root played-move evaluation.
- Master studies exercise legal alternatives, actual Stockfish comparison, replay, related lesson and both-palette Axe scans. Fully offline tests load unopened lazy routes, complete/resume a lesson, recall Black repertoire, compare a master position with WASM and solve a puzzle with no external requests.
- V1 and V6 database upgrades preserve histories/preferences; the V6 fixture also checks ratings, exact lesson/hint state, repertoire and attempts. Backup versions 1–4 remain accepted. Invalid histories/evidence are rejected before mutation.
- Retained regressions cover captures/material/promotion/en passant, clocks, rating settlement, bot delay, score modes, review badges, premoves, keyboard, focus dialogs, six route widths, flipped frames and active 1440×720 play. CSS splitting exposed a real ordering regression; Chessground base CSS now loads before Pion overrides. No geometry assertion was removed.
- Main application JS: 240.30 KB / 76.85 KB gzip, down from the monolithic learning build's ~640 KB gzip. Precache: 104 entries / 5242.40 KiB including legal texts; optional full engine excluded. Every essential lazy chunk is precached.
- Four-game actual-result calibration smoke check: both colors for lowest/full-strength endpoints, scaled budgets, no adjudications/cutoffs and no new Elo claim. See BOT_CALIBRATION.md and raw report.
- M6 source 0bd177f3f0cf214aaec96f542338faeb077099a7 passed [Ubuntu CI](https://github.com/0xAldoLim/pion/actions/runs/38530648125), including Chromium/mobile/Firefox, real engines, optional full-pack tamper/offline checks, licenses, build and units. New results are recorded separately.

Commands: pnpm typecheck; pnpm lint; pnpm test; pnpm build; pnpm exec playwright test --project=chromium --project=mobile --workers=1; pnpm assets:deep; pnpm audit:licenses. Ubuntu runs pnpm test:e2e on all three projects. Local Firefox remains a host limitation.

Full-matrix diagnostic run 38661300173 passed 118/120 scenarios and exposed two lazy-route test synchronization issues. Artifact review confirmed the Firefox page was still at the loading placeholder with UI timers frozen. Explicit route readiness and freezing after setup preserve all original assertions; twelve desktop/mobile repetitions pass. The final full matrix passed all 123 scenarios on source 42122f7b3650df1266d936d8ae3740e976e7b45d: https://github.com/0xAldoLim/pion/actions/runs/38663926040.

Final validation: 20 unit files / 110 checks; 123 browser scenarios / 41 per project; zero skips or retries. Ubuntu run 38663926040 passed on 2026-10-15, including typecheck, lint, licenses, engine assets/build, real engines, offline operation and every regression. Linux package inventory: 462; Windows: 464; both have zero unknown declarations. See LEARNING_VALIDATION.md for the source SHA, links and screenshots.


Learning UI follow-up (2026-10-15): 21 unit files / 115 tests, typecheck, lint and build pass. All 26 affected desktop/mobile browser scenarios pass after an existing dashboard selector was narrowed to the introductory paragraph; the lesson/streak integration was rechecked in both projects. Four widths in both palettes produce 40 passing layout/Axe scans. See [LEARNING_POLISH.md](LEARNING_POLISH.md) and [audit report](LEARNING_POLISH_VISUAL_AUDIT.json).


Opening/spacing follow-up: 18 opening/layout workflows plus four updated tier/dashboard browser scenarios pass on desktop/mobile. The 104-view layout/Axe audit passes after targeted rechecks of four progress scroll regions. Previous learning polish commit bb7fd91 also completed the full 123-scenario Ubuntu workflow successfully (38688429101). Details: [OPENING_SPACING.md](OPENING_SPACING.md).


Rated-side/live-opening follow-up: 22 unit files / 120 checks, typecheck, lint and build pass. All 22 unique desktop/mobile browser cases pass after the side tile tap-target correction and targeted final rechecks. The 18-view responsive/Axe audit passes in both palettes, including 320×480 dialogs. See [PLAY_CHOICES.md](PLAY_CHOICES.md).
