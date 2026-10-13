# Implementation status

Updated 2026-10-13. Treat this as a resumption ledger, not a completion claim.

| Milestone | Status |
|---|---|
| 0 Audit/tooling | Verified: source audit, REA investigation/registration, exact dependency lock, initial production scaffold build |
| 1 Offline gameplay | Verified: real WASM, legal complete hotseat game, bot moves, reload recovery, production offline gameplay |
| 2 Review/scoring | Verified core: real-engine complete review, both modes, 10-category precedence, root consistency/mate, lines/navigation, legal evidence backup restoration; conservative sacrifice policy remains depth-dependent |
| 3 Bots/coach | Verified: 12 distinct legal policies, 48-game real WASM reference harness, original animations, grounded motifs/three depths/frequency/training prompts, adjustable pace, live practice evaluation. Elo remains provisional; 40 games ended at cutoff |
| 4 Puzzles/masters | Core verified: 4,070 legal puzzles, two verified Morphy exercises, hints/adaptive/rush/mistake workflows; broader pack tests pending |
| 5 Openings/learning | Core verified: 3,865 legal opening lines, search/tree/repertoire recall, original lessons/endgame exercise; richer teaching notes pending |
| 6 Progress/UX | Core verified: recorded-data progress, preferences, backup restore, desktop/mobile layout and dashboard accessibility; wider audit pending |
| 7 Hardening/release | In progress: 44 unit/integration checks; all 24 desktop/mobile/Firefox scenarios pass on Ubuntu CI; integrity/license/security audits pass; local Firefox host prerequisite blocked |

Remote was empty at initialization. Required SSH origin retained; SSH authentication unavailable. HTTPS push to the same authorized repository succeeded for milestone 0 (1065ba6). Verify every later main push against its advertised SHA.

Resume by inspecting status, recent commits, this file, known issues and actual checks. Avoid rewriting existing history. Run assets preparation after dependency installation; binaries are ignored.

