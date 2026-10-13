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

Patzer's live server/LLM setup was not executed. No protected commercial code was inspected. Native-analysis providers are unnecessary for this source audit. Static graph semantic expansion was incomplete due to its result budget; source inspection supplied the remaining module findings.

## Pion browser observation

REA passively inspected the built Pion dashboard in a dedicated headless Chrome profile via loopback CDP. DOM/accessibility evidence: ev_c062e5201a45f28417d583c5fdb6fa0d6266f1d5a0ff52026a7b096410cb98d0. Screenshot evidence: ev_5bb5781da54922560867bfa3edfa9749d6758529757e204eab86b1e33711e355. Raw JSON is retained outside source under work/rea-pion-*.json.

Observed: dashboard headings/navigation and original SVG board are present. The capture covers the visible viewport only; its network window starts at attachment. Storage values/script sources/console text were deliberately excluded, resources with unsupported URLs filtered, workers outside target scope excluded. No values truncated, but policy-filtered and attach-limited sections prevent a claim of comprehensive runtime coverage. Playwright independently establishes transitions, legality, persistence and offline behavior.
