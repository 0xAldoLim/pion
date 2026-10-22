# Opening teaching and navigation audit

22 October 2026. All twelve curated families, 36 variations and 3,865 ECO entries are retained.

## Delivered

- Discovery cards put side, learning burden, style, tactical load, strategic planning, memory, objective and cautions first. Structure/benefits and the original SSS–D/player notes remain accessible disclosures. Load labels are Pion editorial guidance, not engine strength or popularity statistics.
- Twelve important decisions (one per family) now include an authored position-specific explanation, next considerations and 25 legal reply examples. Every claimed moved-piece attack/defense and every response is checked on the actual board. Existing annotations remain; uncurated moves transparently use rule facts.
- French Exchange commentary now distinguishes Black’s e6-pawn recapture from White’s preceding capture, despite identical SAN. Italian ...Bc5 no longer invents a future knight route as its motive.
- Each family offers a decision exercise using the existing guided player. A different known continuation can be explored without full-line recall credit. Guided, hidden-help recall and configurable practical games remain distinct.
- Nonbook comparisons distinguish engine-supported, provisionally dubious and too-shallow/uncertain outcomes. A verified mate reply is a tactical error; being outside the repertoire is not. Uncertain searches do not add an error. Actual legal searched replies are shown where available.
- Practice/detail/review links carry exact FEN, root move sequence, side, name and return context. Explorer can save that branch, practice its next decision, and return to the selected reviewed half-move. Context is validated before use and survives reload; appearance changes do not reset the tree.
- Imported games also find a relevant curated family through actual anchor positions, without requiring a saved repertoire. Completed current review connects repertoire status, curated facts and the opponent’s legal resource with relevant concept study, missed-continuation recall, exploration and branch saving. Stale review data cannot establish the tactical-loss marker.

## Export verification

The installed chess.js 1.4.0 accepts `importPgn('')`. The existing repertoire PGN constructor is preserved. Unit checks roundtrip both a standard start and custom-FEN mate. Browser checks download the actual file and reimport it, preserve edited notes/folders through reload and remove/undo, and retain side-specific lines. Personal annotations and schedules are preserved by full JSON backup, rather than misrepresented as PGN fields.

## Verification and limits

Unit checks replay all 36 annotated variations, twelve decision nodes and legal responses, graph/transpositions, both-color scheduling, uncertainty and PGN roundtrips. Desktop/mobile journeys cover discovery, all existing practice modes, alternatives, exact-position explorer saving and review return. The earlier layout assertions remain, opening the now-optional tier disclosure before checking it. See TEST_RESULTS.md for final counts and the responsive/Axe report.

This is an improvement to selected educational positions. Thousands of ECO entries are not individually authored explanations. Conditional plans are not unique-best claims, database frequencies or promises that a book move is sound. Short searches remain provisional.
