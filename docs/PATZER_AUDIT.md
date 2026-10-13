# Patzer source audit

Audited 2026-10-13. Upstream: https://github.com/SikamikanikoBG/patzer, commit `e217c46eab956a6f46e136a6577b0732dc4fb84d` (7.18.1). Reference checkout is outside this repository in the task's work/references/patzer directory.

## Decisions by subsystem

| Files inspected | Decision | Evidence and changes |
|---|---|---|
| chess/classifier.ts, accuracy.ts, keyMoments.ts | Adapt selected pure helpers; independently implement scoring | Upstream uses mate centipawn sentinels, a ply-based Book fallback, an eleventh Forced label, heuristic sacrifice detection, and a hand-calibrated accuracy shift/Elo curve. Pion uses tagged mate scores, verified opening paths, Forced metadata, explicit evidence, and documented independent formulas. |
| chess/stockfish.ts, engine.ts | Rewrite transport | Node child_process and DB settings; engine.ts has a remote chess-api fallback. Browser workers replace both; no remote fallback. |
| chess/openings.ts, openingTrainer.ts | Adapt concepts, replace persistence | Filesystem/SQLite coupling; verified legal repertoire sequences and EPD matching are useful. Full CC0 Lichess opening TSVs become local data. |
| chess/tactics.ts, tacticsSet.json | Reuse CC0 dataset, replace orchestration | Compact pipe-separated 4,000-puzzle export with IDs, UCI sequences, rating/themes. Validate every record and apply the opponent's setup move before presenting it. Replace SQLite rating/attempt storage with Dexie. |
| coach/tactics.ts, facts.ts, facts-utils.ts, moves.ts | Adapt deterministic chess facts | chess.js legal moves and piece references provide useful grounding. Pseudo-legal attacker lists do not prove a material win; verify legal capture sequences before claiming hanging pieces. Remove prompt construction and multilingual LLM inventory text. |
| coach/memory.ts | Adapt mistake tags and recurrence concepts | SQLite/user-ID coupling and cached global memory replaced with position-identified IndexedDB records and spaced repetition. |
| coach/explain.ts | Replace | Imports chatStream; deterministic templates replace all generated prose, fallback retries, and remote streaming. |
| ChessBoard.tsx | Adapt architectural lessons | Stable event callbacks, promotion picker, legal destinations, and ResizeObserver. Upstream premove/PvP behavior removed. Add keyboard-accessible move entry. |
| CoachPanel.tsx, EvalBar.tsx, EvalGraph.tsx, ClassificationBadge.tsx | Rewrite UI, retain interaction concepts | CoachPanel uses SSE/fetch/auth; chart/badge components use i18n/platform styles. Original visual identity and local data. |
| OpeningTrainer.tsx; GameAnalyzer, Review, Play, Train, Openings, Insights pages | Rewrite views | React Query/API/auth/lobby/WebSocket dependencies throughout. No backend transplanted. Preserve review navigation, retry errors, progressive hints, charts and repertoire learning patterns. |

README, THIRD_PARTY_NOTICES, package manifests, FAQ and test inventory inspected. Existing tests cover classifier, review perspective, PGN round trips, tactics, openings, coaching, server engine, resume and PvP; only browser-independent assertions are applicable.

## Missing or unsuitable capabilities

Upstream is a self-hosted server application, not an offline static PWA. It does not provide the required worker lifecycle, durable browser backups, optional WASM asset packs, twelve independently behaving bots, conservative deep sacrifice certification or proven strength calibration. Displayed rating estimates must not be treated as measured Elo.

## Removal plan

Do not import server runtime, auth, accounts/admin, SQLite, Hono, WebSocket rooms, invites, online game synchronization, Ollama, vLLM, DeepSeek, chatStream or remote Stockfish providers. REA remains development-only.

## Validation

Test rules and PGN/FEN; UCI parser and scheduler with failure injection plus real browser WASM; exact scoring boundaries/mate perspective; evidence-backed special labels; complete puzzle sequence legality; transactional restore; game reload/resume; production service worker offline gameplay/analysis; desktop/mobile accessibility. Never equate build success or mocks with real engine evidence.

## Attribution

Preserve Patzer's MIT notice for adapted helpers and compact puzzle-pack extraction. Lichess puzzles and opening data are CC0. Chessground and Stockfish are GPL-3.0; Pion's distributed combined work uses GPL-3.0-or-later. No Patzer proprietary artwork or platform assets are reused.
