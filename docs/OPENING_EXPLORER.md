# Opening education and explorer

Discovery describes learning difficulty, style, position type, tactical/strategic complexity and memory burden. It preserves all 3,865 ECO sequences. Twelve original educational families contain 36 legal annotated variations, plans for both sides, pawn structures, benefits, drawbacks and related lessons. Earlier tier/GM metadata remains in an optional detail expander, never the discovery ranking.

Annotations are keyed by the first four fields of the exact legal FEN and UCI move. Curated text has priority over board-derived facts. Elsewhere the app says no specific strategic annotation is installed; engine scores must not be converted into invented motives.

Every family has a rule-verified caution diagram derived from a legal continuation: a piece moved to a square with a profitable legal capture. These illustrate the common error pattern of overlooking an attack. They are not claimed to be a popular error, book recommendation, or engine-best response. The material gain is explicitly a bounded exchange estimate. The learner tries a legal recovery capture on the same board.

Opening text is original Pion content under GPL-3.0-or-later. Named sequences come from the existing attributed lichess-org/chess-openings data. Historical associations retain the earlier source links. No popularity, win rate or frequency is inferred from named-line counts.

## Position graph

The explorer queries indexed book edges by canonical legal position; it never scans all move-history prefixes per move. The key retains side to move, castling rights and usable en passant while discarding move counters. Repertoire edges are separately indexed, including custom starting FENs. Candidate badges distinguish ECO, curated text, saved lines and requested Stockfish results. Uninstalled game-frequency statistics are explicitly unavailable.

Exploration retains sibling branches and recognizes equivalent positions reached by different move orders. FEN search validates the complete state. Named opening identification requires an exact installed position. A local tree can be saved to repertoire without replacing a previous schedule. Engine searches are requested, abort when the position changes and use the existing priority queue. PGN/backup and recall now preserve custom starting FENs.

## Practice and repertoire

Guided mode shows contextual ideas; recall hides explanations until an answer or hint. The learner only records moves of the selected color. Curated opponent responses are position-indexed, so switching branches or transposing never forces an illegal prewritten reply. Mixing responses uses the family’s available branches. Outside those branches the existing local engine supplies a legal continuation.

A legal different move is checked for a studied or ECO continuation. An immediate mating refutation is reported directly. Unbooked alternatives receive a bounded two-position Stockfish comparison (lite, depth cap 18, 1,200 ms, MultiPV 3); the UI names the observed depths and treats scores as provisional evidence. The player can retry the intended move or continue exploration. Alternative exploration does not advance the selected full-line recall schedule.

Position records separate guided recognition from independent recall, accumulate hints/errors and use existing repetition rules. Early successful repeats do not increase independent recall. Full-line schedules advance only for exact unaided retrieval of that saved line. Opening positions with no learner moves cannot earn recall.

Practical mode starts a normal unrated game against the chosen Stockfish bot from the selected position, with no synthetic preplayed moves in game statistics. Strength labels retain their estimated status. Full review follows the segment/game.

Repertoire supports both colors, folders, favorites, personal notes, main/sibling branches, position-level due/weak/recalled markers, custom FEN starts, one legal PGN main line per import and PGN export. Removing a line exposes an undo action and preserves position-study history. Game Review identifies studied choices, known ECO alternatives, deviations, uninstalled positions and the end of saved theory. It can save a played or analyzed branch under an existing folder without altering the parent’s schedule.
