import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {BOTS,chooseBotMove} from '../../src/features/bots/bots';
import {PROFILES,type Evaluation} from '../../src/chess/types';
import {playUci} from '../../src/chess/rules';
describe('distinct bot policies',()=>{
  const fen=new Chess().fen();const evaluation:Evaluation={fen,engine:'fixture',settings:PROFILES.fast,bestMove:'e2e4',completed:true,timestamp:0,candidates:[{move:'e2e4',score:{kind:'cp',value:50},depth:12,pv:['e2e4'],nodes:1},{move:'d2d4',score:{kind:'cp',value:30},depth:12,pv:['d2d4'],nodes:1},{move:'g1f3',score:{kind:'cp',value:20},depth:12,pv:['g1f3'],nodes:1}]};
  it('has 12 unique profiles and legal deterministic opening preferences',()=>{expect(new Set(BOTS.map(b=>b.id)).size).toBe(12);expect(new Set(BOTS.map(b=>b.skill)).size).toBe(12);for(const bot of BOTS){const move=chooseBotMove(bot,fen,evaluation,[],()=>0.2);expect(()=>playUci(new Chess(fen),move)).not.toThrow();}});
  it('Monarch always uses the unrestricted engine first choice',()=>{for(const random of [0,0.5,0.999])expect(chooseBotMove(BOTS.at(-1)!,fen,evaluation,[],()=>random)).toBe(evaluation.bestMove);});
  it('deviated repertoires stay legal and bounded under seeded sampling',()=>{for(const bot of BOTS)for(const random of [0,0.1,0.8,0.999])expect(()=>playUci(new Chess(fen),chooseBotMove(bot,fen,evaluation,['deviated'],()=>random))).not.toThrow();});
});
