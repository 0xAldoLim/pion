import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {analyzeGame} from '../../src/features/review/analyze';
import {importPgn,playUci,uciOf} from '../../src/chess/rules';
import {CLASSES,PROFILES,type Evaluation} from '../../src/chess/types';
import type {EngineManager} from '../../src/engine/manager';
import {gameAccuracy} from '../../src/chess/scoring';

describe('review orchestration',()=>{
  it('scores every ply independently, honors restricted roots and preserves terminal mate',async()=>{
    const roots:string[]=[];
    const manager={analyze:async(fen:string,settings:typeof PROFILES.fast,options?:{rootMoves?:string[]}):Promise<Evaluation>=>{
      roots.push(fen);const c=new Chess(fen);const move=options?.rootMoves?.[0]??uciOf(c.moves({verbose:true})[0]!);const mate=playUci(c,move).san.endsWith('#');
      return {fen,settings,engine:'fixture',completed:true,timestamp:1,bestMove:move,candidates:[{move,score:mate?{kind:'mate',value:1,winner:new Chess(fen).turn()}:{kind:'cp',value:0},depth:14,pv:[move],nodes:10}]};
    }} as unknown as EngineManager;
    const game=importPgn('1. f3 e5 2. g4 Qh4#');const progress:number[]=[];
    const rows=await analyzeGame(game,PROFILES.fast,new AbortController().signal,p=>{progress.push(p.length);},manager);
    expect(progress).toEqual([1,2,3,4]);expect(roots[0]).toBe(roots[1]);expect(rows.at(-1)!.after.candidates[0]!.score).toEqual({kind:'mate',value:0,winner:'b'});
    for(const mode of ['pion','inspired'] as const){expect(rows.every(r=>CLASSES.includes(r.scores[mode].classification))).toBe(true);expect(CLASSES.reduce((n,label)=>n+rows.filter(r=>r.scores[mode].classification===label).length,0)).toBe(game.moves.length);expect(gameAccuracy(rows,'w',mode)).toBeGreaterThanOrEqual(0);expect(gameAccuracy(rows,'b',mode)).toBeLessThanOrEqual(100);}
    expect(rows.at(-1)!.evidence.some(e=>e.kind==='mate')).toBe(true);
  });
  it('cancels before touching the engine',async()=>{const abort=new AbortController();abort.abort();await expect(analyzeGame(importPgn('1. e4'),PROFILES.fast,abort.signal,()=>undefined)).rejects.toMatchObject({name:'AbortError'});});
});
