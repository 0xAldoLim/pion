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
