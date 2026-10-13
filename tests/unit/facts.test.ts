import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {moveFacts,staticExchange} from '../../src/coach/facts';
import {playUci} from '../../src/chess/rules';
import {progressiveHint} from '../../src/coach/commentary';
describe('grounded coaching',()=>{
  it('confirms mate legally and does not invent a sacrifice',()=>{const c=new Chess();for(const m of ['f2f3','e7e5','g2g4'])playUci(c,m);const facts=moveFacts(c.fen(),'d8h4');expect(facts.some(f=>f.kind==='mate')).toBe(true);expect(facts.some(f=>f.kind==='sacrifice')).toBe(false);});
  it('verifies referenced squares and legal lines',()=>{const c=new Chess();const facts=moveFacts(c.fen(),'e2e4');for(const fact of facts){expect(fact.position).toBe(c.fen());for(const square of fact.squares)expect(square).toMatch(/^[a-h][1-8]$/);if(fact.line){const replay=new Chess(c.fen());for(const move of fact.line)playUci(replay,move);}}});
  it('excludes pinned captures from static exchange',()=>{const fen='4k3/4n3/2Q5/8/8/8/8/4R1K1 b - - 0 1';expect(staticExchange(fen,'c6')).toBe(0);});
  it('reveals hints progressively and validates legality',()=>{const fen=new Chess().fen();const pv=['e2e4','e7e5'];expect(progressiveHint(fen,pv,1)).not.toContain('e4 e5');expect(progressiveHint(fen,pv,3)).toContain('e4 e5');expect(progressiveHint(fen,['e2e9'],3)).toContain('No verified hint');});
});
