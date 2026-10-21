import {describe,expect,it} from 'vitest';
import {Chess} from 'chess.js';
import {moveConsequence} from '../../src/coach/consequences';
import {playUci} from '../../src/chess/rules';
import {DEFAULT_PREFS,type ReviewMove} from '../../src/chess/types';
import {explain} from '../../src/coach/commentary';
function row(fen:string,uci:string,pv:string[],best:string):ReviewMove{
  const c=new Chess(fen),move=playUci(c,uci),candidate={move:uci,score:{kind:'cp' as const,value:-500},depth:18,nodes:10,pv};
  const evaluation={fen,engine:'test',settings:DEFAULT_PREFS.engine,candidates:[candidate],bestMove:uci,completed:true,timestamp:1};
  const score={classification:'blunder' as const,accuracy:10,loss:0.4,version:'test'};
  return {ply:1,color:move.color,san:move.san,uci,fenBefore:fen,fenAfter:c.fen(),before:{...evaluation,bestMove:best,candidates:[{...candidate,move:best,pv:[best]}]},after:evaluation,bestMove:best,bestSan:playUci(new Chess(fen),best).san,evidence:[],forced:false,book:false,sacrificeVerified:false,opportunity:false,phase:'middlegame',status:'complete',scores:{pion:score,inspired:score}};
}
describe('played-move consequences',()=>{
  it('explains the actual opposing mate, rather than showing the alternative root line',()=>{
    const c=new Chess();for(const move of ['f2f3','e7e5'])playUci(c,move);
    const mistake=row(c.fen(),'g2g4',['g2g4','d8h4'],'g2g3'),result=moveConsequence(mistake);
    expect(result.reason).toContain('Black can answer Qh4#, which is checkmate');expect(result.line).toEqual(['Qh4#']);expect(new Chess(result.replyFen!).isCheckmate()).toBe(true);
    expect(explain(mistake,'quick','pion')).toContain('Qh4#');expect(explain(mistake,'educational','pion')).toContain('g3');
  });
  it('names the captured piece, legal reply, and net material consequence',()=>{
    const mistake=row('4k3/8/8/8/8/8/4q2P/4R1K1 w - - 0 1','h2h3',['h2h3','e2e1','g1h2'],'e1e2');
    const result=moveConsequence(mistake);expect(result.reason).toContain('capturing your rook on e1');expect(result.reason).toContain('5 pawns of net material');expect(result.line).toEqual(['Qxe1+','Kh2']);
  });
  it('does not relabel an unrelated root line as an opponent reply or replay an illegal move',()=>{
    const mistake=row(new Chess().fen(),'a2a3',['e2e4','e7e5'],'e2e4');expect(moveConsequence(mistake).reply).toBeUndefined();
    const invalid=row(new Chess().fen(),'a2a3',['a2a3','e7e4'],'e2e4');expect(moveConsequence(invalid).line).toEqual([]);
  });
});
