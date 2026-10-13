import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {DEFAULT_PUZZLES,puzzleStart} from '../../src/data/puzzles';
import {MASTER_PUZZLES,OPERA_PGN} from '../../src/data/masters';
import {OPENINGS,isBookMove} from '../../src/data/openings';
import {importPuzzleCsv,validatePuzzle} from '../../src/storage/validation';
import {playUci,START_FEN} from '../../src/chess/rules';
describe('offline content integrity',()=>{
  it('validates every puzzle sequence and provenance',()=>{const seen=new Set<string>();for(const p of DEFAULT_PUZZLES){validatePuzzle(p);expect(seen.has(p.id)).toBe(false);seen.add(p.id);const start=puzzleStart(p);expect(start.solution.length).toBeGreaterThan(0);}expect(seen.size).toBe(4070);},60_000);
  it('validates every ECO line and identifies actual book moves',()=>{for(const o of OPENINGS){const c=new Chess();for(const m of o.moves)playUci(c,m);expect(c.fen()).toBe(o.fen);}expect(isBookMove(START_FEN,'e2e4')).toBe(true);const unusual=new Chess();for(const move of ['a2a4','a7a5','h2h4','h7h5'])playUci(unusual,move);expect(isBookMove(unusual.fen(),'a1a3')).toBe(false);},60_000);
  it('ties master puzzles to legal historical score positions',()=>{const c=new Chess();c.loadPgn(OPERA_PGN);expect(c.isCheckmate()).toBe(true);for(const p of MASTER_PUZZLES){validatePuzzle(p);const replay=new Chess(p.fen);for(const uci of p.moves)playUci(replay,uci);expect(replay.isCheckmate()).toBe(true);expect(p.master?.white).toBe('Paul Morphy');expect(p.master?.date).toBe('1858.??.??');}});
  it('imports bounded Lichess CSV without changing opponent-first semantics',()=>{const p=DEFAULT_PUZZLES[0]!;const csv=`PuzzleId,FEN,Moves,Rating,Themes\n${p.id},${p.fen},${p.moves.join(' ')},${p.rating},${p.themes.join(' ')}`;const imported=importPuzzleCsv(csv);expect(imported[0]?.setup).toBe(true);expect(puzzleStart(imported[0]!).fen).toBe(puzzleStart(p).fen);expect(()=>importPuzzleCsv('garbage')).toThrow();expect(()=>validatePuzzle({...p,moves:['e2e9']})).toThrow();});
});
