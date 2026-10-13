import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {moveFacts,staticExchange} from '../../src/coach/facts';
import {playUci} from '../../src/chess/rules';
import {progressiveHint} from '../../src/coach/commentary';
import {positionFeatures} from '../../src/coach/features';
describe('grounded coaching',()=>{
  it('confirms mate legally and does not invent a sacrifice',()=>{const c=new Chess();for(const m of ['f2f3','e7e5','g2g4'])playUci(c,m);const facts=moveFacts(c.fen(),'d8h4');expect(facts.some(f=>f.kind==='mate')).toBe(true);expect(facts.some(f=>f.kind==='sacrifice')).toBe(false);});
  it('verifies referenced squares and legal lines',()=>{const c=new Chess();const facts=moveFacts(c.fen(),'e2e4');for(const fact of facts){expect(fact.position).toBe(c.fen());for(const square of fact.squares)expect(square).toMatch(/^[a-h][1-8]$/);if(fact.line){const replay=new Chess(c.fen());for(const move of fact.line)playUci(replay,move);}}});
  it('excludes pinned captures from static exchange',()=>{const fen='4k3/4n3/2Q5/8/8/8/8/4R1K1 b - - 0 1';expect(staticExchange(fen,'c6')).toBe(0);});
  it('reveals hints progressively and validates legality',()=>{const fen=new Chess().fen();const pv=['e2e4','e7e5'];expect(progressiveHint(fen,pv,1)).not.toContain('e4 e5');expect(progressiveHint(fen,pv,3)).toContain('e4 e5');expect(progressiveHint(fen,['e2e9'],3)).toContain('No verified hint');});
  it.each([
    ['skewer','4k1q1/8/8/8/8/8/8/2R4K w - - 0 1','c1c8'],
    ['discoveredAttack','4q1k1/8/8/8/8/8/4B3/4R1K1 w - - 0 1','e2b5'],
    ['fork','2q1k3/8/8/5N2/8/8/8/6K1 w - - 0 1','f5d6'],
    ['doubleAttack','2q1k3/8/8/5N2/8/8/8/6K1 w - - 0 1','f5d6'],
  ])('verifies %s geometry and legal evidence',(kind,fen,move)=>{const facts=moveFacts(fen,move);expect(facts.some(f=>f.kind===kind)).toBe(true);for(const fact of facts){const c=new Chess(fact.position);for(const uci of fact.line??[])playUci(c,uci);}});
  it('recognizes passed pawns, material and reduced-material technique without inventing mate',()=>{const facts=positionFeatures('7k/8/4P3/8/8/8/8/4K3 w - - 0 1');expect(facts.some(f=>f.kind==='passedPawn')).toBe(true);expect(facts.some(f=>f.kind==='material')).toBe(true);expect(facts.some(f=>f.kind==='endgame')).toBe(true);expect(facts.some(f=>f.kind==='mate')).toBe(false);});
  it('does not report a passed pawn blocked by an enemy neighboring pawn ahead',()=>expect(positionFeatures('7k/3p4/4P3/8/8/8/8/4K3 w - - 0 1').some(f=>f.kind==='passedPawn')).toBe(false));
});
