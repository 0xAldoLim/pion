# Educational depth audit

Baseline: `78e66e577f30b48b6d8b8ec9698f679c076caace`, fetched and matched to Pion main on 22 October 2026. This includes the board-size, practice-entry, review playback and annotation improvements after the brief's checkpoint. Working tree was clean.

## Verified baseline

126 unit checks in 24 files, typecheck and lint pass. Seven existing Chromium Learn/Openings journeys pass, including real Stockfish, wrong answers, reload, both-color recall, alternatives, repertoire and practical-game review. These are baseline results, not evidence for changes.

Preserve 31 lessons, six open stages, all lesson IDs/progress, twelve opening families/36 variations, 3,865 ECO entries, puzzle records, fourteen broadcast studies, two Morphy puzzles, both review scoring modes, bot policies, ratings, IndexedDB and offline PWA. No architecture replacement or automatic mastery conversion.

## Findings and focused plan

| Area | Classification | Observation and improvement | Verification |
| --- | --- | --- | --- |
| Transfer | Educational limitation | 22 extra lessons reflect the original diagram. Several other transfers repeat geometry. Retain orientation work; add authored changes of structure, decision and opponent resource. | Replay all FENs/answers/refutations; compare structures; fresh-challenge browser test. |
| Activities | Educational limitation | Common seven-step scaffold; endgame conversion mostly assesses its final move. Add concept-specific questions and short conversion sequences without a general editor. | Legal continuations, alternatives, retry/hint persistence. |
| Feedback | Content-quality limitation | Often falls back to “is legal”; mate feedback names no defender or reply. Explain actual targets, exchanges and legal replies deterministically. | Tactical fixtures and wrong-answer journeys. |
| Evidence | Confirmed defect | Recommendations group by game ID: duplicate imports manufacture recurrence. Existing recurrence test uses the same game twice. Deduplicate analytical samples by game moves and perspective, preserving saved records. | Duplicate vs genuinely distinct games, trends, browser imports. |
| Scheduling | Confirmed defect | An early successful repeat returns all fields of an extended lesson record, overwriting new completion/evidence. Return only repetition fields. | Consecutive applications before the due date; pure schedule regression. |
| Retention | Educational limitation | Quick challenge only chooses transfer/recall; reflections can earn conceptual evidence. Prefer unseen authored tasks, distinguish recognition/application/recall, report samples. | First encounter, hints/retry, early repeat, delayed recall, backup. |
| Discovery | Educational limitation | Tier/player blocks overshadow existing useful filters. Put practical learning profiles first; retain editorial details in disclosures. | Twelve profiles, keyboard, four requested widths/themes. |
| Commentary | Content-quality limitation | Many moves use rule facts; notes keyed by SAN within each variation. Improve important concrete positions with targets and legal response examples. | Replay annotation/response pairs; honest coverage audit. |
| Alternatives | Educational limitation | Studied/ECO/comparison exists, but no explicit low-depth uncertainty. Show bounded conclusions and legal opponent resources. | Real engine and low-depth/mate/material fixtures. |
| Navigation | Confirmed defect | Practice's explorer link resets the position; review study links also discard context. Carry FEN/context; expose matching lesson, missed continuation and branch actions. | Practice → explorer → repertoire; review → study. |
| Export | Unverified behavior | Export uses `importPgn('')`. Verify installed chess.js and downloaded normal/custom-FEN PGN reimport before changing it. | Download/reimport, folders, notes, remove/undo, backup restore. |
| Masters | Content-quality limitation | Fourteen full games from two 2024 rounds. Add a small sourced historical sample with separate game-study labels and licensing. | Source comparison, legal score, exact decision, engine. |
| Bots | Unverified behavior | Skill-limited bestmove respected; historical 48-game run has 40 cutoffs, current smoke only four scaled-budget games. Retain parameters/estimates; improve statistical reporting. | Policy regressions, report math, censoring/sample limits. |

## Delivery and limits

Commit/push each verified milestone to Pion, preserving history and HTTPS transport. Record concrete results in LESSON_QUALITY_VALIDATION.md, OPENING_ANNOTATION_AUDIT.md, LEARNING_OUTCOMES.md and TEST_RESULTS.md. Full regression, real engines, offline, data/license and responsive checks remain release gates. Automated correctness does not establish real-world rating gains; that requires longitudinal user evidence.


## Final implementation assessment

The audit produced targeted changes within the existing systems, rather than a replacement architecture. Confirmed defects were analytical duplicate-game inflation, lost study-position context and early-repeat scheduling overwriting new completion fields. The repertoire export constructor was verified to work and remains intact. Final objective checks also prevent straight promotion from satisfying capture-promotion and kingside castling from satisfying a named queenside task; safe queen retreats use actual legal exchange safety rather than an incomplete answer list. The pawn-defender objective now enforces its named piece and explains that requirement when a legal queen defense is offered.

The delivered content adds 31 application/decision tasks to the 31 retained lessons, including fork preparation/refutation/defense, exchange comparisons and conversion sequences. Twelve important opening nodes now connect concrete replies and conditional plans with guided decisions, hidden-help recall, repertoire and normal bot games. Review recommendations use distinct histories and expose separate recognition, application and delayed-recall observations. Two licensed historical studies add eras and themes while remaining separate from forced tactical puzzles.

No production bot tuning is supported by the current benchmark sample. Uncertainty reporting is improved; ratings remain estimates and no saved standing is changed. Existing scoring modes, database migrations, characters, puzzle/ECO records and all prior game tools are retained.

The requested-width/theme layout and accessibility audit records 84 checks including final-source rechecks, with zero findings. Full release evidence, including the diagnosed and corrected Firefox profile overflow, is in TEST_RESULTS.md. The remaining educational limits are depth, historical breadth and a lack of longitudinal user outcomes, rather than missing foundations. Once the release gates pass, a further feature cycle is not justified by this audit alone. Let the application mature through real practice and examine independent first attempts, hint use, delayed recall and recurring reviewed mistakes before deciding on more development.
