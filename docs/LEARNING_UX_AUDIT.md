# Learning UX audit — 2026-10-14

Remote and local baseline: `34541fd77d211732e4333afa19fa6ffd95d6fe6c`, verified using the existing HTTPS transport. No newer upstream changes.

## Confirmed gaps

- Learn contains nine lessons. Six use “Mark as studied”; three have a single fixed board task. Demo loops are legal and captioned, but separate from assessment. There is no step resume, guided curriculum, search, glossary, or independent transfer assessment.
- Opening discovery exposes editorial tiers prominently. Practice compares a move with one exact sequence, although a different legal book move need not be an error. Branch lookup scans history prefixes, missing transposed continuations.
- The ECO data already indexes final positions and book moves by the first four FEN fields. It must retain turn, castling and en passant state. Its counts describe named lines, never player statistics.
- Repertoire schedules correctly survive duplicate saves and early successful repeats. Custom legal PGN import exists. Folders, personal notes, position-level recall, and review-to-repertoire transfer are missing.
- Mistakes come from real completed Stockfish review rows. Progress honestly separates fresh puzzle accuracy and repetition from participation, but lacks lesson-level evidence and targeted lesson navigation.
- Active rated play disables hints and undo, but still exposes evaluation and automatic coaching. Those leaks require explicit suppression.

## Preserve

Keep Chessground framing, keyboard moves, promotion, premoves, capture racks, actual Stockfish worker/priority queue, independent classifications, atomic local rating settlement, all 3,865 ECO records, validated puzzles, accessibility preferences, local backups and offline service worker. Keep original characters and contrast themes. Do not rebuild these systems.

## Migration

Add versioned lesson progress, individual learning evidence and position study tables through an additive Dexie version. Never translate legacy reading events into mastery. Preserve every legacy repertoire identifier and repetition field. Extend backup schemas with optional new arrays, strict validation and transactional restoration; earlier backups remain valid.

## Validation plan

Validate every instructional FEN, legal demo and correct response; validate objective predicates against alternatives and wrong answers. Test saved-step reload, hint/error dependence, reading versus practice versus transfer, position graph state and transpositions, both practice colors, schedule preservation, old backups and database upgrades. Browser workflows cover incorrect feedback, Italian branching/recall, sound alternatives, evidence-based recommendations, offline learning/engine, responsive frames, keyboard navigation and Axe. Retain regression semantics and document any selector migrations. Run typecheck, lint, units, real-engine integration, production build, Chromium/mobile/Firefox and licenses before release.

## Execution

M0 audit → M1 resumable lesson framework → M2 six-stage curriculum → M3 discovery/detail → M4 position explorer → M5 repertoire/practice/review → M6 adaptive evidence → M7 integrity/content/performance → M8 release validation. Each implementation milestone receives checks and an ordinary commit/push to the existing repository.

## Post-implementation findings — 2026-10-15

The audited gaps now have working lesson/explorer/repertoire/recommendation flows. Rated evaluation/coaching leaks are closed and active review is blocked; practice assistance has independent controls. Lesson objectives sit before the board on mobile. Master studies ask for a prediction and compare alternatives rather than marking every different move wrong. Splitting the large bundle exposed a base-CSS ordering regression in the existing six-width frame checks; moving the base stylesheet to the entry point preserves Pion overrides without weakening geometry assertions. Final evidence and honest remaining content/calibration limits are in LEARNING_VALIDATION.md and KNOWN_ISSUES.md.
