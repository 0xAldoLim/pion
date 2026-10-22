# Dataset provenance

- Default puzzle pack: Lichess CC0 database, compact selection from Patzer e217c46eab956a6f46e136a6577b0732dc4fb84d `server/src/chess/tacticsSet.json`. Upstream extraction script: `scripts/build-tactics-set.mjs`. Retain IDs, ratings and themes; canonical source is `https://lichess.org/training/{id}`. Missing original GameUrl in this compact selection is disclosed; do not fabricate it.
- Opening names/ECO/lines: lichess-org/chess-openings CC0 TSV exports. Exact upstream revision recorded in data metadata during conversion. Legal sequence validation required for every line.
- Master exercises: only independently verified factual game scores/metadata with redistributable provenance. Original teaching annotations. Unverified modern-game records excluded.
- Original lessons and endgame positions: Pion authors, GPL-3.0-or-later. Ratings for authored exercises are illustrative difficulty bands rather than calibrated Elo.

Optional imports retain source, license and attribution fields. Import validation completes before existing data is mutated.

Opening family/player notes were checked against Chess.com's original opening guides on 2026-10-13. Exact guide paths live in `src/data/opening-profiles.ts`; notes are short factual summaries, not copied articles. SSS–C tiers and teaching plans are original editorial recommendations. Historic names such as Steinitz are explicitly labeled historical proponents. The rating does not carry over as a claim about every named variation.

Each original lesson now includes a legal, captioned replay in `src/data/demos.ts`, covered by sequence validation. Character vectors adapt the user's supplied seven-character reference; the reference raster is not redistributed. Master exercises remain two verified positions from Morphy's Opera Game; uncertain published continuations of other historical games are excluded.


## Historical study expansion — 22 October 2026

The original fourteen Lichess CC BY-SA broadcast studies remain intact. Two historical scores add different eras and themes: [Capablanca–Tartakower, 1924](https://fr.wikipedia.org/w/index.php?title=Jos%C3%A9_Ra%C3%BAl_Capablanca&oldid=240413648) (king/passed-pawn coordination; date/round checked against [US Chess](https://new.uschess.org/news/spring-ahead-improving-endgame)) and [Byrne–Fischer, 1956](https://en.wikipedia.org/w/index.php?title=Game_of_the_Century_(chess)&oldid=1380744643) (forcing calculation). Their complete normalized PGNs, exact decisions, legal replies and final result are tested. New hashes cover normalized PGN, not the article HTML. Metadata and original Pion study annotations retain CC BY-SA 4.0. No copyrighted analysis is imported. The games’ Dutch/Grunfeld openings are explored by actual positions rather than misattributed to one of the twelve courses.
