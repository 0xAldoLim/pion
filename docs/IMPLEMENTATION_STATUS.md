# Implementation status

Updated 2026-10-13. This ledger records verified scope and remaining limits.

| Milestone | Status |
|---|---|
| 0 Audit/tooling | Verified: Patzer source audit, REA investigation/registration, exact dependency lock, official engine hashes and license inventory |
| 1 Offline gameplay | Verified: real WASM, legal hotseat/bot play, clocks, promotion, reload recovery, offline games; durable per-game URLs, five legal-validated premoves with clock charging and promotion |
| 2 Review/scoring | Verified: real complete reviews, independent scoring modes, ten classifications, destination-piece icons, graph/navigation, comparison arrows, legal evidence restoration |
| 3 Bots/coach | Verified: twelve policies across seven supplied-reference characters, cancellable minimum response pacing, grounded hints/feedback, three explanation depths, animated live evaluation; strength estimates remain provisional |
| 4 Puzzles/masters | Verified core: 4,070 legal puzzles, two Morphy positions, adaptive/rush/mistake workflows, explicit student color, full mistake-line replay, imports and early-repeat protection |
| 5 Openings/learning | Verified core: 3,865 legal opening lines, wider library, curated SSS–C learning tiers and sourced player notes, repertoire recall, nine captioned legal lesson demos and endgame exercises |
| 6 Progress/UX | Verified: real activity/skill records, separate local Blitz/Rapid Elo, direct Play now duration prompt, ±20 matching, atomic settlement and backup, light/dark navbar toggle, larger type, seven boards/four SVG sets; consistent responsive board/player/evaluation frames and focus-managed dialogs; 23 main/active accessibility scans, eight duration-dialog scans and 168 responsive states pass |
| 7 Hardening/release | Verified board/premove release: all 78 Ubuntu browser scenarios passed across Chromium, mobile and Firefox. Rated launch update: strict build/lint, 70 unit checks and 18 affected desktop/mobile scenarios pass; expanded Ubuntu CI runs 81 scenarios. Optional full-engine tamper rejection/offline execution and license/advisory audit remain verified; current remote workflow evidence is available in GitHub Actions |

Remote was empty at initialization. Required SSH origin is retained; authentication uses an HTTPS push URL for the same authorized repository. Verify each push against its advertised SHA; never reset or force-push existing history.

Resume by reading recent commits, this file, TEST_RESULTS.md and KNOWN_ISSUES.md, then inspecting actual workspace status. Run assets preparation after installing dependencies; engine binaries and browser evidence are intentionally ignored.
