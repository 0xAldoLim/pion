# Rated side choice and live opening names — 2026-10-15

Play now includes a native White / Black / Random radio group above the duration buttons. Selecting a duration starts the match immediately with that side. Random keeps an equal chance for each color. The saved player color drives board orientation, PGN player headers and rating settlement; Blitz/Rapid classification still comes from the selected duration. The entire tile is the input's tap target, including on phones, and keyboard focus remains inside the dialog. No storage migration is needed.

The move-history card displays the ECO code and opening name above the move log, replacing “The game so far” and its generic heading. The player's side remains above the board. Recognition uses the positions actually reached by the played moves, including transposed move orders and named custom starting positions. The latest recognized opening remains visible after a move leaves the installed named lines. Undo/reload rebuild recognition from the remaining saved history. Unknown positions receive an explicit neutral label. The metadata uses the existing offline opening dataset and does not request engine analysis or expose candidate moves. Existing rated assistance restrictions remain intact.

The opening label is a lazy component, memoized by starting position and move history so clock ticks do not repeat opening recognition. Finished-game reasons and results remain below the moves. The compact 1440×720 board layout is preserved.

## Validation

- Typecheck, ESLint, production build: pass. Final bundle `index-C1v11Tg9.js`; 104 precache entries / 5257.67 KiB.
- 22 unit files / 120 tests: pass. Five recognition cases cover starting positions, Italian/Ruy Lopez identification, out-of-book persistence, transpositions and undo/custom starts.
- 22 unique desktop/mobile browser scenarios pass across the regression run and targeted final rechecks. The initial mobile radio check exposed a tiny hit target; inputs now cover the full tiles and all four side/outcome cases pass without forced clicks. Both opening flows also pass after reload/undo. Retained tests cover rating settlement, practice isolation, all Play now entry points, focus/cancel behavior, both themes, six-width board geometry, premoves and the 1440×720 active frame.
- 18 responsive/Axe views pass with zero overflow or accessibility findings: live opening and dialog at 320, 390, 768 and 1440 pixels in both palettes, plus short 320×480 dialog views. The Rapid duration controls remain reachable through scrolling. See `PLAY_CHOICES_AUDIT.json`.

Local screenshots: `outputs/play-choices-evidence`, including the side selector and a real Italian opening reached through the hotseat move controls in both palettes.

## Move-history header follow-up

Typecheck, lint and production build pass after the relocation (`index-BBbCkvVF.js`; 104 precache entries / 5258.10 KiB). All six affected Chromium/mobile browser checks pass: side selection, opening updates/undo/reload/finished result, and active board frame/premoves/flipping. Four additional layout/Axe scans at 390 and 1440 pixels in both palettes have zero horizontal overflow or accessibility findings. Screenshots and raw audit: `outputs/history-header-evidence`.

## Practice entry

The Play now dialog includes a visible **Practice** button beside an explanation of unrated play. It opens `#play/practice`, where users choose a bot, side and time control before starting. This dedicated route skips automatic game resumption and presents the practice setup without the rated lobby, including after a reload. Opening it does not create a game, replace a saved rated game, or change ratings.

Typecheck, lint and production build pass (`index-DC6UwaQx.js`; 104 precache entries / 5271.24 KiB). All twelve affected desktop/mobile browser scenarios pass, including the new practice route, practice results leaving ratings unchanged, saved-rated-game isolation, rated duration/color selection, opening names, cancellation and focus. Six responsive/Axe views pass in both themes at 1440×1000, 390×844 and 320×480, with the Practice button reachable and no overflow or accessibility findings. Screenshots and raw audit: `outputs/practice-entry-evidence`.

## Screen-fitting play board

Active desktop games prioritize the board's available height. The page heading, navigation bar and player rows are compact; the move-history panel has a bounded width. Rated metadata appears beside the board so it does not push the playing surface down. Both player rows and clocks remain visible at the tested desktop sizes. Smaller screens retain the full-width stacked layout. Keyboard moves, annotation tools and other controls remain reachable below the board.

| Viewport | Previous board edge | Updated board edge |
| --- | --- | --- |
| 1440×720 | 320 px | 464 px |
| 1536×864 | 464 px | 608 px |
| 1920×1080 | 640 px | 824 px |

Typecheck, lint and build pass (`index-CTXX38pi.js`; 104 precache entries / 5272.85 KiB). Ten affected desktop/mobile workflows pass, including frame alignment, minimum board size at 1440×720, flipping, premoves, captures, annotations, color choice and rating settlement. Twenty-four responsive/Axe views pass for practice and rated play in both themes across six viewport sizes, with no overflow or accessibility findings. Local measurements and screenshots: `outputs/play-board-evidence`.


## Laptop-first board — 26 October 2026

The play board now gets available space before the move panel. On laptop-sized windows, the game title and view controls sit beside the board, player rows are compact, and the board fits the actual space above the bottom clock. Resizing the window, changing text size or growing a capture rack recalculates the fit. Piece geometry, coordinates and evaluation-bar alignment still belong to the shared Board component.

**Focus board**, beside the game title on desktop, temporarily hides navigation and the top bar for a larger playing surface. **Exit focus board** or Escape restores the normal view. Escape first respects an open dialog or a board action that consumes it. The game, clocks, moves and assistance policy continue normally. This view choice is temporary; no new preference or database migration is required. Phone layouts retain the full-width stacked board. Extra keyboard/annotation controls stay reachable below it.

| Browser viewport | Previous board edge | Normal board | Focus board |
| --- | --- | --- | --- |
| 1024×600 | 288 px | 424 px | 480 px |
| 1280×600 | 344 px | 424 px | 480 px |
| 1366×625 | 368 px | 448 px | 504 px |
| 1366×768 | 512 px | 592 px | 648 px |
| 1440×720 | 464 px | 544 px | 600 px |
| 1536×864 | 608 px | 688 px | 744 px |

These are measured CSS pixels, excluding browser chrome. Both clocks and player rows fit inside every tested laptop viewport, with an eight-pixel lower margin. The default board is larger without entering Focus view. The compact board-first approach and optional enlarged view follow the interaction described in [Chess.com’s board-size guide](https://support.chess.com/en/articles/8609533-how-do-i-change-my-board-size); Pion retains its own visual identity.

Regression checks retain all existing border, square, coordinate, flip, premove and capture assertions. The short-screen board minimum is strengthened from 450 to 520 pixels. A new laptop journey checks four viewport sizes, both clock positions, Focus/Exit/Escape, move/capture/flip persistence, reload and the mobile return layout. Validation details are in TEST_RESULTS.md and LAPTOP_BOARD_AUDIT.json; local images and before/after measurements are in `outputs/laptop-board-evidence`.
