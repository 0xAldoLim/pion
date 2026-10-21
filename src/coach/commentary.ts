import type { ReviewMove } from '../chess/types';
import { lineSan } from '../chess/rules';
import { formatScore } from '../chess/scoring';
import { moveFacts, positionAdvice } from './facts';
import {positionFeatures} from './features';
import {Chess} from 'chess.js';
import {playUci} from '../chess/rules';
import {NAMES} from './material';
import {moveConsequence} from './consequences';

export function explain(row:ReviewMove,depth:'quick'|'educational'|'deep',mode:'inspired'|'pion'):string {
  const score=row.scores[mode];
  const intro=`${row.san} is ${score.classification}.`;
  const facts=row.evidence.filter(e=>e.position===row.fenBefore);
  const reason=score.loss>=0.05?moveConsequence(row).reason:facts.find(e=>['allowsMate','hanging','fork','pin','mate','sacrifice'].includes(e.kind))?.text ?? facts[0]?.text ?? `The engine evaluates the played continuation at ${formatScore(row.after.candidates[0]?.score)} from White’s perspective.`;
  if(depth==='quick')return `${intro} ${reason}`;
  const alternative=row.uci!==row.bestMove?` Compare ${row.bestSan}, the engine’s first choice.`:'';
  const forced=row.forced?' This was the only legal move.':'';
  const replyLine=score.loss>=0.05?moveConsequence(row).line:[];
  const text=`${intro} ${reason}${replyLine.length>1?` One engine continuation is ${replyLine.slice(0,6).join(' → ')}.`:''}${alternative}${forced}`;
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
  const c=new Chess(fen);const side=c.turn()==='w'?'White':'Black';const move=playUci(c,pv[0]!);const facts=moveFacts(fen,pv[0]!);
  if(level>=3)return `${side}: try ${line.slice(0,6).join(' ')}. Replay this legal line and check the final position.`;
  const fork=facts.find(f=>f.kind==='fork'||f.kind==='doubleAttack');const pin=facts.find(f=>f.kind==='pin'||f.kind==='skewer'||f.kind==='discoveredAttack');
  const concepts=c.isCheckmate()?['Find a check that covers every escape square. Which defenders keep the king boxed in?','There is a mating finish. Check the king’s escape squares before choosing your check.']:new Chess(fen).inCheck()?['Your king is in check. Compare capturing the attacker, blocking the line, and moving the king.','Answer the check first. Which legal response also improves your position?']:fork?['Look for one piece that can attack two targets at once. A check may force the opponent to leave the other target.','Find a double attack. Name both targets and calculate whether the attacker can be captured.']:pin?['Look for pieces lined up with a king or queen. Can you exploit the line with a pin, skewer, or discovered attack?','Inspect the long diagonals and open files. Which piece is shielding a more valuable target?']:move.promotion?['A pawn is ready to promote. Compare checks, captures, and stalemate after choosing the new piece.']:move.captured?['Compare your legal captures. Count defenders and calculate the recapture; taking the most valuable piece first is not always best.','A capture is worth investigating. Work out the full exchange and your opponent’s forcing checks.']:c.inCheck()?['Start with forcing checks. For each one, calculate the opponent’s legal replies before extending your attack.','Look for a check that changes the position. Include captures and blocks in the opponent’s responses.']:move.isKingsideCastle()||move.isQueensideCastle()?['Consider king safety and rook activity together. Can castling improve both?']:['A quiet move is a candidate here. Look at piece activity, pawn breaks, and your opponent’s immediate threats.','Check your opponent’s threats, then improve a piece or strengthen a key square. A forcing move is not always required.'];
  const choice=[...fen].reduce((sum,char)=>sum+char.charCodeAt(0),0)%concepts.length;
  if(level<=1)return `${side} to move. ${concepts[choice]}`;
  const reply=line[1];const replyType=reply?.endsWith('#')?'checkmate':reply?.includes('+')?'a check':reply?.includes('x')?'a capture':'a positional reply';
  return `Look at your ${NAMES[move.piece]} on ${move.from}. ${move.captured?`It can capture an enemy ${NAMES[move.captured]}.`:move.san.includes('+')||move.san.includes('#')?'Look for a forcing check.':move.promotion?'Consider its promotion.':'Compare its activity and defensive duties.'}${reply?` The supplied continuation includes ${replyType} by ${side==='White'?'Black':'White'}; calculate that response.`:''}`;
}
export function exerciseFeedback(fen:string,uci:string,solution:string[]):string {
  const c=new Chess(fen);const move=playUci(c,uci);const facts=moveFacts(fen,uci);
  const warning=facts.find(f=>f.kind==='allowsMate')??facts.find(f=>f.kind==='hanging');
  return warning?`${move.san}: ${warning.text} Your position is restored; try another idea.`:`${move.san} is legal. ${progressiveHint(fen,solution,1)} Your position is restored; try another candidate.`;
}
