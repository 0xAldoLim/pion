# Implementation status

Updated 2026-10-15. This supersedes the earlier nine-lesson / single-line opening milestone.

| Milestone | Delivered behavior |
|---|---|
| M0 Audit | Latest remote baseline checked; working chess foundation preserved; gaps and migration requirements recorded. |
| M1 Interactive player | Stable steps, demonstrations, board objectives, explanation questions, progressive hints, grounded correction, exact-step resume, keyboard moves and shared Ponke coach. |
| M2 Curriculum | 31 complete short lessons across six unrestricted stages; path/library/glossary; separate viewed, practiced, independent transfer and spaced recall evidence. |
| M3 Opening education | Twelve families, 36 annotated variations, both-side plans, tradeoffs, mistake recovery and novice-length practice. Legacy tiers/player notes remain optional detail. |
| M4 Explorer | Position graph with turn/castling/en-passant state, manual exploration, sibling branches, transpositions, ECO identity, source badges, FEN and local analysis. |
| M5 Practice/repertoire | Guided/recall/practical bot modes; both colors; multiple replies; studied/book/engine-compared alternatives; position schedules, folders, favorites, notes, PGN, undoable removal and review-derived branches. |
| M6 Adaptive learning | Daily focus and nine skills from actual review/exercise evidence; matching activities and non-overlapping review trends. Commit 0bd177f passed full Ubuntu CI. |
| M7 Chess quality | Rated assistance suppression/review gate; configurable practice hints/undo/provisional classifications; structured local coach actions; real-engine classification checks; fourteen licensed modern game studies; calibration harness improvements; route splitting. |
| M8 Release | Verified: 110 unit checks and all 123 Chromium/mobile/Firefox scenarios pass; typecheck/lint/build/licenses/real engines/offline/migrations pass. 39 visual/Axe states have zero findings. [Final source run](https://github.com/0xAldoLim/pion/actions/runs/38663926040); details/screenshots in LEARNING_VALIDATION.md. |

Preserved: board/frame, promotion, premoves, clocks, capture racks, seven original monkey characters, seven board themes, four piece sets, 4,070 tactical puzzles plus two Morphy exercises, 3,865 ECO entries, scoring modes, separate local Blitz/Rapid ratings, saved games/reviews, engine installation and backups. No bot difficulty parameters were retuned in this milestone.

Dexie v6 adds learning tables; v7 fills three practice-assistance defaults. Backup v4 accepts v1–v4 with validated defaults. Reading never migrates into mastery. Existing IDs and schedules remain valid.

All essential chunks/data/lessons/studies/lite Stockfish are precached after offline readiness. Full Stockfish stays optional. Main JS is about 76.85 KB gzip; puzzle/ECO data remain larger separate chunks. See KNOWN_ISSUES.md.

Preserve SSH origin and use authenticated HTTPS pushes to the same Pion repository. No force push/reset. Generated engines, dist and browser artifacts stay ignored. Resume from actual Git status and validation evidence.


Learning UI follow-up: consistently aligned numbered lesson rows; accessible segmented step tracker; defined orange consecutive-day streak including lesson practice; readable event/round/date metadata explaining the two Tata Steel 2024 rounds; simplified versions of all seven original SVG characters. See [LEARNING_POLISH.md](LEARNING_POLISH.md) for validation and semantics.
