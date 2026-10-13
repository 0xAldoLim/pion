import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {exportPgn,importPgn,newGame,outcome,playUci,replay,START_FEN,validFen} from '../../src/chess/rules';
describe('chess rules and imports',()=>{
  it('accepts only legal moves',()=>{const c=new Chess();expect(c.moves()).toHaveLength(20);expect(()=>playUci(c,'e2e5')).toThrow();expect(()=>playUci(c,'<script>')).toThrow();playUci(c,'e2e4');expect(c.turn()).toBe('b');});
  it('castles with legal king/rook movement',()=>{const c=new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');playUci(c,'e1g1');expect(c.get('f1')?.type).toBe('r');expect(c.get('g1')?.type).toBe('k');});
  it('captures en passant',()=>{const c=new Chess();for(const m of ['e2e4','a7a6','e4e5','d7d5','e5d6'])playUci(c,m);expect(c.get('d5')).toBeUndefined();expect(c.get('d6')?.type).toBe('p');});
  it.each(['q','r','b','n'])('supports promotion to %s',piece=>{const c=new Chess('8/P6k/8/8/8/8/8/4K3 w - - 0 1');playUci(c,`a7a8${piece}`);expect(c.get('a8')?.type).toBe(piece);});
  it('detects checkmate and check',()=>{const c=new Chess();for(const m of ['f2f3','e7e5','g2g4','d8h4'])playUci(c,m);expect(c.isCheck()).toBe(true);expect(outcome(c)).toEqual({result:'0-1',reason:'Checkmate'});});
  it('detects stalemate, fifty moves, repetition and material draws',()=>{
    expect(outcome(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'))?.reason).toBe('Stalemate');
    expect(outcome(new Chess('7k/8/8/8/8/8/8/K2R4 w - - 100 1'))?.reason).toBe('Fifty-move rule');
    expect(outcome(new Chess('7k/8/8/8/8/8/8/K7 w - - 0 1'))?.reason).toBe('Insufficient material');
    const c=new Chess();for(let i=0;i<2;i++)for(const move of ['g1f3','g8f6','f3g1','f6g8'])playUci(c,move);expect(outcome(c)?.reason).toBe('Threefold repetition');
  });
  it('preserves repetition history when resuming',()=>{const g=newGame();g.moves=['g1f3','g8f6','f3g1','f6g8','g1f3','g8f6','f3g1','f6g8'];expect(replay(g).isThreefoldRepetition()).toBe(true);});
  it('round trips PGN and FEN with nonstandard initial position',()=>{const g=importPgn('[SetUp "1"]\n[FEN "8/P6k/8/8/8/8/8/4K3 w - - 0 1"]\n\n1. a8=Q');const restored=importPgn(exportPgn(g));expect(restored.startFen).toBe(g.startFen);expect(restored.moves).toEqual(g.moves);});
  it('rejects malformed or illegal FEN and oversized PGN',()=>{expect(validFen(START_FEN)).toBe(START_FEN);expect(()=>validFen('nonsense')).toThrow();expect(()=>validFen('4k3/4Q3/8/8/8/8/8/4K3 w - - 0 1')).toThrow();expect(()=>importPgn('x'.repeat(1_000_001))).toThrow();});
});
