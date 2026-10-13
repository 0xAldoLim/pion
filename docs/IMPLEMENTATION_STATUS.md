# Implementation status

Updated 2026-10-13. Treat this as a resumption ledger, not a completion claim.

| Milestone | Status |
|---|---|
| 0 Audit/tooling | Verified: source audit, REA investigation/registration, exact dependency lock, initial production scaffold build |
| 1 Offline gameplay | Verified: real WASM, legal complete hotseat game, bot moves, reload recovery, production offline gameplay |
| 2 Review/scoring | Core verified: completed real-engine review, both modes, lines, navigation; expanded classification fixtures in progress |
| 3 Bots/coach | Implemented: 12 distinct policies, original animated SVG, facts/hints/local voice; calibration and broader motifs in progress |
| 4 Puzzles/masters | Core verified: 4,070 legal puzzles, two verified Morphy exercises, hints/adaptive/rush/mistake workflows; broader pack tests pending |
| 5 Openings/learning | Core verified: 3,865 legal opening lines, search/tree/repertoire recall, original lessons/endgame exercise; richer teaching notes pending |
| 6 Progress/UX | Core verified: recorded-data progress, preferences, backup restore, desktop/mobile layout and dashboard accessibility; wider audit pending |
| 7 Hardening/release | In progress: 41 unit/integration checks, 16 Chromium desktop/mobile scenarios, integrity/license/security audits pass; Firefox host prerequisite blocked |

Remote was empty at initialization. Required SSH origin retained; SSH authentication unavailable. HTTPS push to the same authorized repository succeeded for milestone 0 (1065ba6). Verify every later main push against its advertised SHA.

Resume by inspecting status, recent commits, this file, known issues and actual checks. Avoid rewriting existing history. Run assets preparation after dependency installation; binaries are ignored.

