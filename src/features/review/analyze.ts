import {Chess} from 'chess.js';
import {playUci,positionIdentity,other} from '../../chess/rules';
import {engine, type EngineManager} from '../../engine/manager';
import type {EngineSettings,Evaluation,Game,ReviewMove,Score,TacticalEvidence} from '../../chess/types';
import {expectedPoints,SCORING_VERSION,scoreMove} from '../../chess/scoring';
import {material,moveFacts,phase,staticExchange,VALUES} from '../../coach/facts';
import {isBookMove} from '../../data/openings';
import {db} from '../../storage/db';
import {freshRepetition} from '../../learning/repetition';

async function resilientSearch(manager:EngineManager,fen:string,settings:EngineSettings,signal:AbortSignal,rootMoves?:string[]):Promise<Evaluation> {
  // A gameplay search may preempt a background review. User cancellation still stops.
  for(;;){try{return await manager.analyze(fen,settings,{signal,priority:0,rootMoves});}catch(e){if(signal.aborted||!(e instanceof DOMException)||e.name!=='AbortError')throw e;}}
}
async function verifySacrifice(fen:string,uci:string,root:Evaluation,played:Evaluation,signal:AbortSignal,manager:EngineManager):Promise<TacticalEvidence|null> {
  const c=new Chess(fen);const color=c.turn();const move=playUci(c,uci);
  const best=root.candidates[0]!;const actual=played.candidates[0]!;
  if(best.depth<18||actual.depth<18||uci!==root.bestMove||expectedPoints(best.score,color)-expectedPoints(actual.score,color)>0.001)return null;
  if(expectedPoints(best.score,color)>0.98||expectedPoints(actual.score,color)<0.45)return null;
  const captures=c.moves({verbose:true}).filter(m=>m.captured && m.captured!=='p' && staticExchange(c.fen(),m.to)>=2);
  const baseline=material(fen,color)-material(fen,other(color));
  for(const capture of captures.slice(0,3)) {
    if(staticExchange(c.fen(),capture.to)-(move.captured?VALUES[move.captured]:0)<2)continue;
    const after=new Chess(c.fen());after.move(capture);
    if(after.isGameOver())continue;
    const verification=await resilientSearch(manager,after.fen(),{...root.settings,depth:Math.max(20,root.settings.depth),timeMs:Math.max(2000,root.settings.timeMs),multiPv:1},signal);
    const line=verification.candidates[0]!;
    if(line.depth<18||expectedPoints(line.score,color)<0.45)continue;
    // Recapture that immediately restores material is an ordinary trade.
    const replay=new Chess(after.fen());for(const m of line.pv.slice(0,4))playUci(replay,m);
    const deficit=baseline-(material(replay.fen(),color)-material(replay.fen(),other(color)));
    if(deficit<2&&!replay.isCheckmate())continue;
    return {kind:'sacrifice',text:`The ${capture.captured} on ${capture.to} can be taken by ${capture.san}. A depth-${line.depth} search of the acceptance line maintains compensation; the immediate exchange does not restore material.`,squares:[capture.to],line:[uci,capture.from+capture.to,...line.pv],depth:line.depth,position:fen};
  }
  return null;
}
export async function analyzeGame(game:Game,settings:EngineSettings,signal:AbortSignal,onMove:(rows:ReviewMove[])=>Promise<void>|void,manager:EngineManager=engine):Promise<ReviewMove[]> {
  const c=new Chess(game.startFen);const rows:ReviewMove[]=[];
  for(const [index,uci]of game.moves.entries()) {
    if(signal.aborted)throw new DOMException('Review canceled','AbortError');
    const fenBefore=c.fen();const color=c.turn();const legalCount=c.moves().length;
    const before=await resilientSearch(manager,fenBefore,settings,signal);
    const move=playUci(c,uci);const fenAfter=c.fen();let after:Evaluation;
    if(c.isGameOver()) {
      const score:Score=c.isCheckmate()?{kind:'mate',value:0,winner:color}:{kind:'cp',value:0};
      after={...before,bestMove:uci,candidates:[{move:uci,score,depth:before.candidates[0]!.depth,nodes:0,pv:[uci]}]};
    } else {
      // Analyze the played move at the SAME root, time/depth/hash conventions.
      after=await resilientSearch(manager,fenBefore,{...settings,multiPv:1},signal,[uci]);
    }
    const evidence=moveFacts(fenBefore,uci);
    const sacrifice=await verifySacrifice(fenBefore,uci,before,after,signal,manager);
    if(sacrifice)evidence.push(sacrifice);
    const bestLine=before.candidates[0]!;
    const prev=rows.at(-1);
    const opportunity=(bestLine.score.kind==='mate'&&bestLine.score.winner===color) || (!!prev&&prev.scores.inspired.loss>=0.10&&expectedPoints(bestLine.score,color)>=0.7&&moveFacts(fenBefore,before.bestMove).some(e=>['fork','capture','mate'].includes(e.kind)));
    const bestSan=playUci(new Chess(fenBefore),before.bestMove).san;
    const row:Omit<ReviewMove,'scores'>={ply:index+1,color,san:move.san,uci,fenBefore,fenAfter,before,after,bestMove:before.bestMove,bestSan,evidence,forced:legalCount===1,book:isBookMove(fenBefore,uci),sacrificeVerified:!!sacrifice,opportunity,phase:phase(fenBefore),status:'complete'};
    rows.push({...row,scores:{inspired:scoreMove(row,'inspired'),pion:scoreMove(row,'pion')}});
    await onMove([...rows]);
  }
  return rows;
}
export async function rememberMistakes(game:Game,rows:ReviewMove[]) {
  const items=rows.filter(row=>row.color===game.playerColor&&row.scores.pion.loss>=0.05&&row.bestMove!==row.uci).map(row=>({
    id:`${game.id}:${row.ply}`,gameId:game.id,ply:row.ply,fen:row.fenBefore,move:row.bestMove,line:row.before.candidates[0]!.pv.slice(0,8),tags:[row.phase,...row.evidence.map(e=>e.kind)].filter((v,i,a)=>a.indexOf(v)===i),source:`pion:game/${game.id}`,license:'User-owned local game',...freshRepetition(),
  }));
  // Re-reviewing must not reset an existing repetition schedule.
  for(const item of items)if(!(await db.mistakes.get(item.id)))await db.mistakes.add(item);
}
export const reviewIdentity=(game:Game)=>({version:SCORING_VERSION,positionId:positionIdentity(game)});
