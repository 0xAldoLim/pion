# Review playback and board planning tools

## Review a game

Import a PGN in **Game review**, or open a saved game. **Run review** uses the configured analysis profile; **Deep review** uses the deeper profile for that run without changing preferences.

The board briefly rewinds through actual game positions, then follows each completed analysis result. The progress indicator counts analyzed positions. Selecting a move or disabling **Follow analyzed moves** lets you inspect a position without stopping analysis. **Stop review** cancels the current search and preserves completed results. Reduced-motion preferences, including the operating system setting, skip the rewind.

Long imports use a bounded rewind of at most eighteen animated steps. Analysis still examines every played move; animation does not skip analysis or simulate engine progress.

## Plan with arrows and premoves

Right-drag to draw an arrow during a game or review. **Draw arrows** provides a dedicated touch surface, two-tap selection, color choices, and keyboard square selectors. **Done drawing** restores normal piece interaction. **Clear** removes personal annotations. Drawings survive a board flip and queued previews, and clear when the actual position changes. They are temporary planning marks and are not written into PGN or backups.

Capture premoves include conditional recaptures onto currently friendly occupied squares. Previewing such a move does not alter saved pieces or game history. After the opponent replies, normal chess legality determines whether the queued move executes. An illegal first move clears the remaining queue. Promotion selection, check evasions, en passant, castling restrictions, and the minimum timed premove cost remain enforced.

Right-clicking without dragging cancels premoves; right-dragging draws without clearing the queue. Escape and **Cancel premoves** also clear queued moves. Self-drawn arrows remain available during rated play; engine assistance remains hidden until the game ends.

## Understand a mistake

Review explanations use the engine's continuation after the played move, separate from the alternative best-move line. The consequence card identifies a legal opponent reply, captures, checks, promotion, mate, and material changes found in that continuation. Quiet replies include an evaluation comparison. **Show the opponent's reply** displays its resulting position on the board.

The same consequence appears in the personal mistake bank. Its stronger alternative stays hidden until the position is solved or the final hint is requested. Explanations remain available when automatic coaching is off.

Every displayed reply is replayed for legality. Missing, shallow, or unrelated saved variations receive a limited explanation rather than an invented tactical claim. A displayed engine line is one continuation, not a claim that every opponent response is forced. Short practice searches can change in deeper review.

## Implementation and verification

- Rewind orchestration: `src/features/review/playback.ts` and `Review.tsx`.
- Conditional previews and actual legality: `src/chess/premoves.ts`; normal game move execution is unchanged.
- Personal drawing controls: `src/components/Board.tsx`, separate from engine auto-shapes.
- Reply evidence: `src/coach/consequences.ts`, shared commentary and `MistakeDetails.tsx`.
- No database migration or bot-strength changes are required.

Validation results are recorded in [Test results](TEST_RESULTS.md). Responsive screenshots and the raw accessibility audit are in the local `outputs/review-tools-evidence` deliverable.
