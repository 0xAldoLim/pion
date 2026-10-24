# Validation evidence

Updated 2026-10-23. The final educational-depth application source passes **145 unit checks and all 177 Chromium/mobile/Firefox scenarios**; 92 responsive/Axe checks including rechecks have zero findings. [Exact-source release run](https://github.com/0xAldoLim/pion/actions/runs/39737346328). Earlier checkpoints are retained below; full final-source details are at the end.

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
- At this checkpoint: **144 unit checks in 26 files**, typecheck, lint and production build pass. Every lesson/transfer/sequence, twelve new opening decision nodes and replies, duplicate-game accounting, early-repeat completion, optional backup fields, exact study context, PGN roundtrip and calibration-statistics fixtures are included.
- Thirty-eight distinct affected desktop/mobile journeys have passed across learning, opening discovery/variations, both-color practice, real-engine review links, duplicate imports, historical studies, fully offline operation and actual repertoire download/reimport/notes/folder/undo. Earlier diagnostic failures identified the early-repeat completion defect and test selectors needing the new disclosure/current-step semantics; original chess/layout assertions remain.
- **72 responsive/Axe views pass**, zero horizontal overflow and zero WCAG 2 A/AA or 2.1 AA findings: nine representative learning, discovery, annotated opening, decision, contextual explorer, repertoire, progress, reviewed mistake and historical-study screens at 320, 390, 768 and 1440 pixels in both themes. Raw results: [EDUCATIONAL_DEPTH_VISUAL_AUDIT.json](EDUCATIONAL_DEPTH_VISUAL_AUDIT.json). Screenshots are stored in the local `outputs/educational-depth-evidence` artifact folder.
- Lite/full engine integrity passes; all **7,935** installed puzzle/opening records validate; **464 dependencies**, zero unknown license declarations. No production bot parameter, player rating, review score mode or database migration changed.
- Checkpoint bundle: `index-CqTdTkGk.js`; 105 precache entries / 5312.29 KiB. Essential lazy content and lite WASM remain offline; optional full engine is not automatically precached.

The full retained desktop/mobile suite and exact-source Ubuntu/Firefox gate are recorded below when completed. No browser retry/skip or relaxed geometry assertion was introduced. Correctness checks do not establish real-world rating gains.


Full local release run: all **116 Chromium/mobile scenarios passed** in 12.7 minutes on application source 772cff0, including real engines, optional full-pack integrity/offline use, rated integrity, premoves/arrows, exports and all new journeys. Four final-source imported-opening views also pass, bringing the visual/Axe audit to **76 views**, zero findings.

Ubuntu diagnostic run [39733346401](https://github.com/0xAldoLim/pion/actions/runs/39733346401) passed 173/174 scenarios and all unit/static/engine/license gates. Firefox exposed a genuine 8-pixel overflow in four opening cards: “Straightforward” was wider than a narrow two-column profile cell under its font metrics. The profile now chooses columns from a 140-pixel readable minimum and wraps safely. A direct value-cell containment assertion covers all six retained widths; no original geometry assertion or tolerance is relaxed. The corrective release gate is recorded below.


Corrective local verification: typecheck, lint and production build pass; all eight affected desktop/mobile geometry and opening-layout cases pass. Eight final opening-profile sizing/Axe rechecks at the four requested widths in both themes pass, bringing the recorded audit to **84 checks including rechecks**, zero overflow or accessibility findings. Corrective bundle: `index-CMy2V4nW.js`; 105 precache entries / 5312.39 KiB.


Final content-audit correction: the pawn-defender objective now requires the named piece; a legal queen defense receives a factual piece-requirement explanation rather than completion. **145 unit checks**, lint, typecheck and production build pass. All six affected desktop/mobile lesson journeys pass, including queen rejection, correct pawn defense, retained earlier-error exclusion, capture feedback and conversion reload. Final application bundle: `index-Dtz241Ro.js`; 105 precache entries / 5312.54 KiB. Exact-source full browser gate follows.


Eight final-source wrong-answer feedback layout/Axe checks pass at 320, 390, 768 and 1440 pixels in both themes. The raw visual audit now records **92 checks including rechecks**, zero findings; its final-feedback entry identifies source `a0a2ac73c9a01247616adba912827332fdd382b0` and bundle `index-Dtz241Ro.js`.


The layout correction passed the complete Ubuntu matrix on source `c15bdef1f40e0717571aec1b5b30fd3e0de33da9`: **174/174 scenarios**, zero retries/skips, 12.4 minutes, alongside 144 unit checks and all static/build/engine/license gates. [Run 39736511661](https://github.com/0xAldoLim/pion/actions/runs/39736511661). This run precedes the final pawn-objective correction; the final release gate below covers that later source separately.


## Final educational-depth release — verified 23 October 2026

Application source: `a0a2ac73c9a01247616adba912827332fdd382b0`. [Ubuntu release run 39737346328](https://github.com/0xAldoLim/pion/actions/runs/39737346328) completed successfully on 22 October 2026 and was verified against its job logs on 23 October.

- **145 unit checks / 26 files pass.** Typecheck, lint, engine integrity, dependency license inventory and production build pass.
- **177/177 browser scenarios pass**, across Chromium, mobile Chromium and Firefox, in 14.0 minutes with one worker, zero retries and zero skipped scenarios. The complete retained suite includes real Stockfish, optional full-engine integrity/offline use, rated assistance/settlement, review, premoves/arrows, board geometry, exports, persistence/migrations, PWA/offline and the new educational journeys.
- **92 responsive/Axe checks including rechecks pass**, with no horizontal overflow or WCAG 2 A/AA or 2.1 AA findings. Requested widths: 320, 390, 768 and 1440 pixels; both themes. Raw checks identify their source/bundle checkpoints; the final feedback views use this application source.
- All **7,935** installed puzzle/opening records passed local validation. Dependencies: 464 on Windows, 462 in Ubuntu CI; both inventories have zero unknown license declarations. The platform difference is dependency resolution, not missing application content.
- Final bundle: `index-Dtz241Ro.js`; main JavaScript 123.29 KB gzip; 105 precache entries / 5312.54 KiB. Essential content and lite WASM remain offline; optional full engine remains opt-in. Large puzzle/ECO chunks retain the documented build advisory.

Milestones 0–7 are complete. Release documentation follows this tested source in a documentation-only commit; application, tests, dependencies and workflow are unchanged. No real-world rating gain is inferred. Remaining educational and calibration limits are recorded in KNOWN_ISSUES.md and EDUCATIONAL_DEPTH_AUDIT.md.


## CI timeout correction — 24 October 2026

[Run 39877273765](https://github.com/0xAldoLim/pion/actions/runs/39877273765), on documentation-only source `2aa597c187512f5a543f1cdc4244e7fccaed8566`, was cancelled by the 20-minute job limit. GitHub's annotation confirms the timeout. Ubuntu package downloads fetched 53.7 MB in 14 minutes 40 seconds at about 61 kB/s; browser installation took 15 minutes 8 seconds. The browser suite therefore started with only about three minutes remaining. Unit/static/build/engine/license steps had passed; the complete 177-scenario suite could not finish.

The workflow now pins `ubuntu-24.04`, matching the validated release host, and allows a 45-minute job with separate 20-minute browser-setup and browser-suite limits. Normal full-suite duration is about 14 minutes. Per-test timeouts, one worker, zero retries, all three projects, all 177 scenarios and artifact retention remain unchanged. This corrects orchestration capacity without changing application behavior or suppressing assertions. The replacement run is the validation gate for this workflow change.


The replacement workflow [40050562877](https://github.com/0xAldoLim/pion/actions/runs/40050562877) completed the suite rather than timing out, exposing three persistence assertions (174 passed). Lesson hint content was shown before its queued IndexedDB write committed; it now appears after a successful save and overlapping hint requests are guarded. The hint journey waits for the saved hint indicator before reload and retains its post-reload assertion. The folder journey previously accepted a group heading created by the preceding imported line; it now also requires the edited line to appear inside that committed group before reload. No repertoire storage defect was established, so its save implementation remains unchanged. No sleeps, retries, skipped cases or relaxed assertions were added.

Local verification of the persistence correction: 145 unit checks, typecheck, lint and production/PWA build pass. The two affected desktop/mobile journeys each passed three consecutive executions (12 executions total), with all reload, evidence, notes/folder, actual PGN download/reimport and undo assertions retained. Final local bundle: `index-0yPhFsIq.js`; 105 precache entries / 5312.66 KiB.
