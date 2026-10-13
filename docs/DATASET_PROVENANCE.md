# Dataset provenance

- Default puzzle pack: Lichess CC0 database, compact selection from Patzer e217c46eab956a6f46e136a6577b0732dc4fb84d `server/src/chess/tacticsSet.json`. Upstream extraction script: `scripts/build-tactics-set.mjs`. Retain IDs, ratings and themes; canonical source is `https://lichess.org/training/{id}`. Missing original GameUrl in this compact selection is disclosed; do not fabricate it.
- Opening names/ECO/lines: lichess-org/chess-openings CC0 TSV exports. Exact upstream revision recorded in data metadata during conversion. Legal sequence validation required for every line.
- Master exercises: only independently verified factual game scores/metadata with redistributable provenance. Original teaching annotations. Unverified modern-game records excluded.
- Original lessons and endgame positions: Pion authors, GPL-3.0-or-later. Ratings for authored exercises are illustrative difficulty bands rather than calibrated Elo.

Optional imports retain source, license and attribution fields. Import validation completes before existing data is mutated.
