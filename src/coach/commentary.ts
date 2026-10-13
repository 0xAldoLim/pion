import type { ReviewMove } from '../chess/types';
import { lineSan } from '../chess/rules';
import { formatScore } from '../chess/scoring';
import { moveFacts, positionAdvice } from './facts';
import {positionFeatures} from './features';
import {Chess} from 'chess.js';
import {playUci} from '../chess/rules';

export function explain(row:ReviewMove,depth:'quick'|'educational'|'deep',mode:'inspired'|'pion'):string {
  const score=row.scores[mode];
  const intro=`${row.san} is ${score.classification}.`;
  const facts=row.evidence.filter(e=>e.position===row.fenBefore);
  const reason=facts.find(e=>['allowsMate','hanging','fork','pin','mate','sacrifice'].includes(e.kind))?.text ?? facts[0]?.text ?? `The engine evaluates the played continuation at ${formatScore(row.after.candidates[0]?.score)} from White’s perspective.`;
  if(depth==='quick')return `${intro} ${reason}`;
  const alternative=row.uci!==row.bestMove?` Compare ${row.bestSan}, the engine’s first choice.`:'';
  const forced=row.forced?' This was the only legal move.':'';
  const text=`${intro} ${reason}${alternative}${forced}`;
  return depth==='deep'?`${text} Verified line: ${lineSan(row.fenBefore,row.before.candidates[0]?.pv.slice(0,8)??[]).join(' ')}. Search depth ${row.before.candidates[0]?.depth}; loss ${(score.loss*100).toFixed(1)} percentage points. Practice checking the opponent’s forcing replies.`:text;
}
export function reactToMove(fen:string,uci:string):string {return moveFacts(fen,uci)[0]?.text ?? positionAdvice(fen);}
export function describeMove(fen:string,uci:string,depth:'quick'|'educational'|'deep',training=false):string {
  const facts=moveFacts(fen,uci);const priority=['mate','allowsMate','hanging','fork','discoveredAttack','doubleAttack','skewer','pin','passedPawn','backRank'];
  const main=facts.find(f=>priority.includes(f.kind))??facts[0];
  const c=new Chess(fen);playUci(c,uci);
  let text=main?.text??positionAdvice(c.fen());
  if(depth!=='quick'){const second=facts.find(f=>f!==main&&f.kind!=='capture'&&priority.includes(f.kind));if(second)text+=` ${second.text}`;}
  if(depth==='deep'){const feature=positionFeatures(c.fen()).find(f=>['material','passedPawn','backRank','endgame'].includes(f.kind));if(feature)text+=` ${feature.text}`;text+=' Compare candidate moves in Analysis, then practice a related position.';}
  if(training)text+=' Before moving, name two candidate moves and your opponent’s strongest reply. Ask for a hint only after calculating.';
  return text;
}
export function progressiveHint(fen:string,pv:string[],level:number):string {
  const line=lineSan(fen,pv);if(!line.length)return 'No verified hint is ready. Start analysis first.';
  if(level<=1)return `Focus on the ${pv[0]!.slice(2,4)} area. Check what each side can capture.`;
  if(level===2)return moveFacts(fen,pv[0]!)[0]?.text.replace(line[0]!, 'The candidate move') ?? 'Compare a forcing move with your quieter options. Calculate the opponent’s best reply.';
  return `Try ${line.slice(0,6).join(' ')}. This line was checked for legality.`;
}
