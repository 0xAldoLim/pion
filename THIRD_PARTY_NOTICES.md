# Third-party notices

## Patzer

Source: https://github.com/SikamikanikoBG/patzer at e217c46eab956a6f46e136a6577b0732dc4fb84d. Adapted static-exchange helpers and tactical grounding concepts; compact Lichess puzzle-pack selection.

MIT License

Copyright (c) 2026 the Patzer contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Chessground and Stockfish

Chessground: GPL-3.0-or-later, https://github.com/lichess-org/chessground. Stockfish: GPL-3.0, https://github.com/nmrugg/stockfish.js, version 19.0.1. Their respective notices are retained in generated assets or the installed source package. Source and installation instructions accompany distribution.

## Data and other libraries

Lichess puzzles and chess-openings: CC0, https://database.lichess.org/ and https://github.com/lichess-org/chess-openings. Puzzle IDs/source URLs remain with every record.

React/React DOM (MIT); chess.js (BSD-2-Clause); Dexie (Apache-2.0 — verify resolved package before release); Lucide (ISC); Zod (MIT). Build/test tooling licenses are recorded by the license inventory. Original Pion SVG characters and teaching text are GPL-3.0-or-later.

## Master-game study data

`src/data/master-studies.json` contains fourteen selected games from the Lichess official Tata Steel Masters 2024 broadcasts (rounds 1 and 10). The broadcast dataset uses **CC BY-SA 4.0**, separately from the CC0 puzzles/opening dataset. Source: https://database.lichess.org/#broadcasts. Each record retains original game/player/event/date/round attribution, its individual broadcast URL, export URL and SHA-256 of the downloaded round export.

Changes: selected games; normalized PGN; omitted clocks and imported evaluation/commentary; added original instructional objectives and annotations. This data adaptation and its Pion annotations are distributed under **CC BY-SA 4.0**: https://creativecommons.org/licenses/by-sa/4.0/. Full license: `public/licenses/CC-BY-SA-4.0.txt`, also precached offline. The application source retains its GPL license. There is no claim of endorsement by Lichess, the event, or the players. Historical choices are distinguished from engine recommendations and unique-best-move puzzles.
