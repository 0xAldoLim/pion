# Interface and board audit

The October 13 refinement retains Pion’s monkey characters, forest identity, serif headings, and light/dark palettes.

Observed defects and changes:

- Grid and flex children could retain intrinsic minimum widths. Constrain them and wrap setup fields, filters, long game labels, lesson actions, and settings controls. Put dense tables/charts in bounded scrolling regions.
- Tablet content was squeezed by the desktop sidebar. Switch to a dismissible drawer at 900 px, trap its keyboard focus, restore the invoking control, and keep the background inert.
- Native file inputs and lesson demos overflowed narrow cards. Use full-width constrained inputs, a single-column lesson layout, and equal demo actions.
- Chessground measured a bordered host and rounded its playing dimensions for equal physical square sizes. Move the frame outside that host and center its rounded container. Use one thin frame for every board.
- Evaluation height included move controls. Share a grid row with the playing area alone, and derive its inset from the rendered squares. Observe both the host and Chessground's rounded inner container so later resize measurements stay aligned. Player rows follow the same board column and swap correctly when flipped. Coordinate labels stay inside the board with alternating square colors.
- Rebuilding the board DOM on scroll could detach a pointer target. Use Chessground’s existing scroll-bound invalidation and resize handling; our observer only measures the frame inset.
- Piece animation could momentarily extend the mobile layout during resize. Contain pieces within the rendered board, and constrain desktop play width using the viewport height so both player rows remain visible on a 720 px tall screen.
- Compact promotion/restore dialogs needed bounded dimensions and consistent keyboard focus. Keep promotion within its board, allow vertical scrolling, and support Escape.
- Appearance changes briefly combined the new text color with the old fading button background. Change the palette together and preserve the button press transform animation.

Reference: inspected the public [Chess.com computer board](https://www.chess.com/play/computer) for its flush square frame, internal coordinates, and adjacent player rows. Pion’s artwork and styling remain original.

Premoves are available in practice bot and local rated games. Queue up to five with clicks, drags, or keyboard selectors. A colored preview and list make the pending sequence visible. Cancel by right-click, tap on a queued piece, Escape, or Cancel premoves. Pause, undo, a new game, and a finished game clear the queue. Promotion asks for the piece when queued. Normal chess legality is checked after each reply; an illegal head move cancels the remaining sequence. Timed premoves consume at least 0.1 seconds before increment. Queues are transient and do not survive reloads.

The interaction follows the core behavior documented by [Chess.com’s premove guide](https://support.chess.com/en/articles/8562432-what-are-pre-moves-and-how-do-they-work). Pion uses a local clock and flags when the deduction exhausts the remaining time.

Verification evidence is recorded in TEST_RESULTS.md. Browser assertions cover centered borders, square dimensions, evaluation alignment, horizontal overflow, compact focus handling, real bot replies, queue limits/cancellation, conditional capture rejection, promotion, and preference persistence.
