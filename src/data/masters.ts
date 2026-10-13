import {Chess} from 'chess.js';
import {uciOf} from '../chess/rules';
import type {Puzzle} from '../chess/types';
/** Factual score of the public-domain 1858 game; teaching annotations are original. */
export const OPERA_PGN='[Event "Paris Opera consultation game"]\n[Site "Paris"]\n[Date "1858.??.??"]\n[White "Paul Morphy"]\n[Black "Duke Karl / Count Isouard"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0';
const c=new Chess();c.loadPgn(OPERA_PGN);const history=c.history({verbose:true});
export const MASTER_PUZZLES:Puzzle[]=[30,32].map((ply,i)=>({
  id:`master-morphy-opera-${ply}`,fen:history[ply]!.before,moves:history.slice(ply).map(uciOf),rating:i===0?1100:400,themes:i===0?['sacrifice','mateIn2']:['mateIn1'],setup:false,
  source:'https://en.wikipedia.org/wiki/Opera_Game',license:'Public-domain factual game score (1858); Pion annotations GPL-3.0-or-later',attribution:'Paul Morphy vs Duke Karl of Brunswick and Count Isouard, Paris, 1858. Exact day unknown.',
  explanation:i===0?'The queen gives check on b8. After the forced knight capture, Rd8 is checkmate; the bishop on g5 guards d8.':'The rook goes to d8 with check. The bishop on g5 protects it, and the king has no legal escape.',
  master:{white:'Paul Morphy',black:'Duke Karl / Count Isouard',event:'Paris Opera consultation game',date:'1858.??.??',moveNumber:i===0?16:17,gamePgn:OPERA_PGN},
}));
