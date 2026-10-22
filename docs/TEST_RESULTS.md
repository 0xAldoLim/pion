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

Opening-header relocation: typecheck, lint and build pass; all six affected Chromium/mobile cases pass, including the preserved finished-game result. Four additional responsive/Axe scans at 390 and 1440 pixels in both palettes pass with zero overflow or accessibility findings. See the follow-up in [PLAY_CHOICES.md](PLAY_CHOICES.md).

Review and board tools (2026-10-21): typecheck, lint, production build and all 126 unit checks in 24 files pass. All 22 affected Chromium/mobile browser scenarios pass on the final build, including imported PGN rewind/cancellation, real analysis following, legal opponent-reply explanations and board replay, personal mistake-bank explanation, touch/keyboard/right-drag arrows, queue-preserving drawing, friendly-square recapture execution, rated-assistance suppression, existing premoves/promotions/cancellation, six-width/flipped/short-screen geometry, and saved-game review/scoring/backup recovery. Sixteen additional layout/Axe scans at 320, 390, 768 and 1440 pixels in both palettes have zero overflow or accessibility findings. Final bundle: `index-CjPjIQG4.js`; 105 precache entries / 5270.62 KiB. See [Review and board tools](REVIEW_BOARD_TOOLS.md) and [raw audit](REVIEW_BOARD_TOOLS_AUDIT.json). These are local Chromium/mobile results; the full Firefox matrix is separate.

Play now Practice entry (2026-10-21): typecheck, lint and production build pass; twelve affected Chromium/mobile scenarios pass, covering practice selection and rating isolation, an existing saved rated game, route reload, rated time/color selection, opening identification, focus and cancellation. Six layout/Axe views pass in both themes, including a short 320×480 screen. Details in [Play choices](PLAY_CHOICES.md).

Screen-fitting play board (2026-10-21): typecheck, lint and build pass; ten affected Chromium/mobile workflows and twenty-four responsive/Axe views pass. The starting board grows from 320 to 464 pixels at 1440×720, with both player rows and clocks still inside the viewport. At 1536×864 and 1920×1080 the board measures 608 and 824 pixels. The existing border, coordinate, evaluation-bar, capture, premove and flip assertions remain; a minimum board-edge assertion prevents the small-board regression. Details in [Play choices](PLAY_CHOICES.md).


## Educational depth checkpoint — 22 October 2026

- Latest remote baseline was fetched and matched to `78e66e5`. Baseline: 126 unit checks, typecheck/lint and seven existing Learn/Openings Chromium journeys passed.
- Current source: **144 unit checks in 26 files**, typecheck, lint and production build pass. Every lesson/transfer/sequence, twelve new opening decision nodes and replies, duplicate-game accounting, early-repeat completion, optional backup fields, exact study context, PGN roundtrip and calibration-statistics fixtures are included.
- Thirty-eight distinct affected desktop/mobile journeys have passed across learning, opening discovery/variations, both-color practice, real-engine review links, duplicate imports, historical studies, fully offline operation and actual repertoire download/reimport/notes/folder/undo. Earlier diagnostic failures identified the early-repeat completion defect and test selectors needing the new disclosure/current-step semantics; original chess/layout assertions remain.
- **72 responsive/Axe views pass**, zero horizontal overflow and zero WCAG 2 A/AA or 2.1 AA findings: nine representative learning, discovery, annotated opening, decision, contextual explorer, repertoire, progress, reviewed mistake and historical-study screens at 320, 390, 768 and 1440 pixels in both themes. Raw results: [EDUCATIONAL_DEPTH_VISUAL_AUDIT.json](EDUCATIONAL_DEPTH_VISUAL_AUDIT.json). Screenshots are stored in the local `outputs/educational-depth-evidence` artifact folder.
- Lite/full engine integrity passes; all **7,935** installed puzzle/opening records validate; **464 dependencies**, zero unknown license declarations. No production bot parameter, player rating, review score mode or database migration changed.
- Current bundle: `index-CqTdTkGk.js`; 105 precache entries / 5312.29 KiB. Essential lazy content and lite WASM remain offline; optional full engine is not automatically precached.

The full retained desktop/mobile suite and exact-source Ubuntu/Firefox gate are recorded below when completed. No browser retry/skip or relaxed geometry assertion was introduced. Correctness checks do not establish real-world rating gains.


Full local release run: all **116 Chromium/mobile scenarios passed** in 12.7 minutes on application source 772cff0, including real engines, optional full-pack integrity/offline use, rated integrity, premoves/arrows, exports and all new journeys. Four final-source imported-opening views also pass, bringing the visual/Axe audit to **76 views**, zero findings.

Ubuntu diagnostic run [39733346401](https://github.com/0xAldoLim/pion/actions/runs/39733346401) passed 173/174 scenarios and all unit/static/engine/license gates. Firefox exposed a genuine 8-pixel overflow in four opening cards: “Straightforward” was wider than a narrow two-column profile cell under its font metrics. The profile now chooses columns from a 140-pixel readable minimum and wraps safely. A direct value-cell containment assertion covers all six retained widths; no original geometry assertion or tolerance is relaxed. The corrective release gate is recorded below.


Corrective local verification: typecheck, lint and production build pass; all eight affected desktop/mobile geometry and opening-layout cases pass. Eight final opening-profile sizing/Axe rechecks at the four requested widths in both themes pass, bringing the recorded audit to **84 checks including rechecks**, zero overflow or accessibility findings. Corrective bundle: `index-CMy2V4nW.js`; 105 precache entries / 5312.39 KiB.
