# Implementation status

Updated 2026-10-13. This ledger records verified scope and remaining limits.

| Milestone | Status |
|---|---|
| 0 Audit/tooling | Verified: Patzer source audit, REA investigation/registration, exact dependency lock, official engine hashes and license inventory |
| 1 Offline gameplay | Verified: real WASM, legal hotseat/bot play, clocks, promotion, reload recovery, offline games; durable per-game URLs |
| 2 Review/scoring | Verified: real complete reviews, independent scoring modes, ten classifications, destination-piece icons, graph/navigation, comparison arrows, legal evidence restoration |
| 3 Bots/coach | Verified: twelve policies across seven supplied-reference characters, cancellable minimum response pacing, grounded hints/feedback, three explanation depths, animated live evaluation; strength estimates remain provisional |
| 4 Puzzles/masters | Verified core: 4,070 legal puzzles, two Morphy positions, adaptive/rush/mistake workflows, explicit student color, full mistake-line replay, imports and early-repeat protection |
| 5 Openings/learning | Verified core: 3,865 legal opening lines, wider library, curated SSS–C learning tiers and sourced player notes, repertoire recall, nine captioned legal lesson demos and endgame exercises |
| 6 Progress/UX | Verified: real activity/skill records, separate local Blitz/Rapid Elo, ±20 matching, atomic settlement and backup, light/dark navbar toggle, larger type, seven boards/four SVG sets; eighteen main-view accessibility scans pass |
| 7 Hardening/release | Locally verified: strict build/lint, 63 unit checks, all 38 real-engine desktop/mobile browser scenarios, optional full-engine tamper rejection/offline execution, license/advisory audit; expanded Ubuntu Firefox CI pending push |

Remote was empty at initialization. Required SSH origin is retained; authentication uses an HTTPS push URL for the same authorized repository. Verify each push against its advertised SHA; never reset or force-push existing history.

Resume by reading recent commits, this file, TEST_RESULTS.md and KNOWN_ISSUES.md, then inspecting actual workspace status. Run assets preparation after installing dependencies; engine binaries and browser evidence are intentionally ignored.
