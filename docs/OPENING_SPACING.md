# Opening presentation and shared spacing — 2026-10-15

The annotated opening page now groups each move number with White's move and Black's reply. The responsive list wraps complete move pairs, keeps the selected position visible through a contrasting state, and retains click/keyboard navigation. Board, navigation and move list are separate grid rows with 16px gaps. Study boards stay in document flow so the navbar cannot cover a sticky board or its controls.

Learning tiers and GM/master examples are visible on every opening card and detail page. The existing editorial ratings are retained, with a complete SSS–D legend explaining learning fit. Player associations apply to each opening family, with direct source links; no frequency or win-rate claims were added. The source guides were checked against the displayed associations, including the Ruy Lopez, Italian, Queen's Gambit, Caro-Kann, London, Scotch, Nimzo-Indian, French, Sicilian, King's Indian, Vienna and Scandinavian families.

Numbered lesson-row styling is now scoped to guided course cards, fixing the explorer's plain ECO search buttons. Shared spacing separates card headings, descriptions and actions; opening filters, profile tags, action grids and expanded study disclosures use consistent gaps. Narrow progress tables and the history chart have labelled focus targets for keyboard scrolling and a visible focus outline.

## Validation

- Typecheck, lint and production build complete. Final bundle: `index-DJ2k-EwO.js`, with 104 precache entries.
- 18 desktop/mobile browser scenarios pass, covering six-width board frames, navigation/dialogs, the new paired-move/visible-tier regression, annotated alternatives, both-color recall, transpositions, Stockfish, and practical opening games.
- The updated tier/review-marker regression and dashboard palette checks pass in desktop/mobile (four additional scenarios).
- Layout/accessibility audit: 104 views across all nine main pages, Ruy Lopez/Italian details, expanded ECO search, lesson and master views, four widths and both palettes. No horizontal overflow remains. Four narrow progress views initially exposed missing keyboard-scroll focus; targeted rechecks verify ArrowRight scrolling and zero remaining Axe findings. See `OPENING_SPACING_AUDIT.json`.
- Previous learning polish source `bb7fd9171a1ac06f6022684ea96ecb352eff5656` passed the full 123-scenario Ubuntu workflow: https://github.com/0xAldoLim/pion/actions/runs/38688429101.

Local screenshots are in `outputs/opening-spacing-evidence`, including discovery, visible player/tier panels and the separated move controls in both palettes.
