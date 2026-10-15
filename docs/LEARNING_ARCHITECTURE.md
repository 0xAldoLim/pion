# Learning architecture

The board and engine are unchanged. `learning/models.ts` defines version-one discriminated lesson steps: explanation, legal demonstration, objective-based move, explanation choice and summary. Stable lesson/step identifiers survive reloads. The player keeps the board in one study column, exposes legal keyboard moves, obeys animation/reduced-motion settings and reuses Ponke’s existing Coach.

`learning/assessment.ts` evaluates mate, castling, safe promotion, verified forks/pins, legal capture exchanges, development with a specified target and prevention of mate. Curated responses have an explicit conceptual reason; they are not labelled blunders. Feedback prioritizes a legal refutation before the instructional fallback. Engine equality alone never proves an educational objective.

Dexie version six adds three tables without changing existing records. Lesson progress records exact step, viewed material, exercise completion, errors and hint levels. Guided answers are practice. Only an unaided, error-free first encounter with an independent transfer position can add independent evidence; this remains a small observation, not a mastery percentage. Recall uses the existing repetition engine. Legacy study events have no inferred independent evidence.

Backup version four includes the new tables, accepts versions one through three with empty new arrays, validates position state and independent evidence references, then restores transactionally. Repertoire schedules remain unchanged.

Content is original Pion writing, licensed with the project (GPL-3.0-or-later). Rule-derived predicates use chess.js. The existing bounded legal static-exchange implementation retains its documented MIT attribution. No runtime LLM or network service is used.

Version seven adds only practice-hint/undo/feedback defaults; older backups receive the same defaults. `chess/assistance.ts` centralizes rated restrictions. Practice classifications reuse the full-strength review pipeline on the actual move root and show observed depth/provisional status; they do not use the bot's weakened search or award learning evidence. Active rated review is gated until completion.

Coach context actions explain legal board facts, threats and candidate previews. Independent lesson/recall tasks do not expose untracked contextual assistance before completion. Hints remain explicit and counted. Historical master-study predictions are exploration and never independent mastery or rated puzzles.

Routes and large datasets load as separate chunks. The lightweight repertoire position index avoids pulling ECO data into Home recommendations. Every essential emitted chunk is precached; Chessground base CSS stays in the entry point before Pion overrides so lazy routes cannot reverse coordinate/frame styling.

Fourteen master-study records are a separately licensed CC BY-SA 4.0 data adaptation with verified official broadcast scores, metadata, source URLs/export checksums and original Pion annotations. See THIRD_PARTY_NOTICES.md. Historical moves, curated ideas and live engine comparisons are kept distinct.

## Recommendations and evidence

The daily focus uses completed, current-version, history-matching local reviews. Assisted opening segments are excluded from recurring game-error claims. Counts name actual reviewed moves and distinct games; one game is explicitly a starting observation, not a recurring pattern. Early queen recommendations require losses in multiple opening reviews. Outside stored repertoire is distinguished from an error; recurring unfamiliar positions require actual reviewed losses.

Without game evidence, saved path progress and recorded hint/error dependence guide the next activity. No rating gate is introduced. Direct actions lead to the lesson, a fresh-or-recall challenge, related puzzle theme, saved mistakes, short opening practice and an optional bot.

Nine skills are independently reported through exercise observations, fresh puzzle attempts, verified reviewed issues and opening retrieval. No mastery percentage is computed from lessons viewed. Lesson recall additionally records whether its due date was reached; old evidence lacking that field is not counted as spaced retention. The all-time evidence table and fixed 30-day review trend have explicit scopes.
