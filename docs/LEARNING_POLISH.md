# Learning interface polish — 2026-10-15

The guided lesson buttons inherited centered grid alignment from the global button style. Each row now has a fixed number column, a fluid left-aligned title/status group, and a consistent trailing chevron. Stage counts have their own spacing above the list. All 31 rows are checked for title/status alignment and containment at 320, 390, 768 and 1440 pixels in both palettes.

The lesson header uses a segmented step tracker with an accessible progress value, current phase and separate evidence indicators. Navigation, exact-step persistence, independent evidence and recall semantics are unchanged.

The orange Home streak disclosure explains which recorded activities count and how local calendar days work. The number now means consecutive active days, starting today or yesterday, rather than lifetime active days. Multiple activities on a day count once; a gap breaks the streak. Completed interactive lesson exercises now count alongside puzzle attempts, completed or reviewed games and opening practice. Today's activity count includes those lesson exercises and finished games too. Existing records are used; no database migration is required. Finished game activity uses its persisted update timestamp, which includes later reviews or imports.

All seven original vector characters use simpler silhouettes, fewer overlapping details, a consistent outline and a restrained palette. Their reference features remain recognizable: Ponke's high eyes, Lonke's gold eyes, Gonke's wink/overalls, Konke's orange fur, Bonke's orangutan crest, Zonke's yellow hat/banana, and Donke's tan face/nose. Shared character IDs, bot profiles and reduced-motion behavior remain intact.

The installed modern master collection contains fourteen games from **Tata Steel Masters 2024**, seven each from rounds **1** and **10**. The actual game dates are **13 January** and **24 January 2024** respectively. Cards and study headers now identify event, round and readable date; a collection note explains shared dates. Source PGN headers and full round tags remain available in the source details. No game dates were invented or changed. Master/library cards align their content to the top rather than inheriting centered button layout. Fifteen broken punctuation sequences were repaired in Pion annotations; verified PGN scores, source exports and source hashes remain unchanged. The master-data legality/integrity checks pass after cleanup.

## Verification

- 21 unit files / 115 checks pass, including five new streak cases: duplicate activities, yesterday grace, missing days, month boundaries, invalid/future timestamps and lesson inclusion.
- Typecheck, lint and production build pass.
- Responsive/Axe audit: 40 views across four widths and both palettes, with zero overflow, misaligned lesson rows or WCAG A/AA findings. Evidence is recorded in `LEARNING_POLISH_VISUAL_AUDIT.json`.
- All 26 affected desktop/mobile browser scenarios pass: 24 on the initial run and the two dashboard cases after narrowing an existing ambiguous paragraph selector. The lesson flow was then rerun in both projects with additional assertions for a real 1-day streak and three completed daily exercises. Master comparison, offline lessons, exact-step restore, rating settlement, accessible dialogs, board frames and premoves remain covered.
- Final production bundle: `index-Bba2V70i.js`; 104 precache entries / 5248.33 KiB.

Visual evidence is saved locally in `outputs/learning-polish-evidence`, including lesson lists, step tracker, master dates, orange streak and all seven characters at 128, 60 and 38 pixels.
