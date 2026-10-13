# REA investigation

2026-10-13. REA 6.4.0 locally installed under the task's work/tools, development-only. Runtime Node 24.19 satisfies upstream requirements (24.11+). Setup dry-run reviewed; Codex-only registration applied with `--client codex --skill=false --yes`. Existing configuration preserved with REA's backup. MCP visibility requires a Codex restart, so this session uses the equivalent CLI.

## Question

Which Patzer server dependencies prevent static offline browser operation?

## Observed facts

`analyze-javascript-application <absolute Patzer server/src> --json` parsed 71 files and emitted a sealed application/dependency evidence graph. The initial sandboxed run returned `access_denied / EPERM`; the authorized elevated run completed. Raw evidence retained outside the production source tree in work/rea-patzer.json.

Source inspection confirms chess/stockfish.ts imports Node child_process, engine.ts includes remote chess-api support, chess/openings.ts imports filesystem APIs, coach/explain.ts imports chatStream, and training/memory modules import the SQLite DB. The requested frontend pages use API/auth/lobby state.

## Engineering inferences

Pure chess.js facts and data are portable. Transport, engine processes, DB access, streamed LLM commentary and auth/PvP views need browser-local implementations. Static dependency observations support this decision; they do not prove runtime behavior.

## Unknowns and limits

Patzer's live server/LLM setup was not executed. No protected commercial code was inspected. Native-analysis providers are unnecessary for this source audit. Pion runtime behavior must be established separately by real WASM/browser/offline tests. Record subsequent source/DOM/screenshot evidence below when it actually runs.
