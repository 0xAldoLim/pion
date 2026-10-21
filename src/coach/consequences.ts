import {Chess} from 'chess.js';
import type {ReviewMove} from '../chess/types';
import {playUci} from '../chess/rules';
import {NAMES,material,moveFacts,staticExchange} from './facts';
import {formatScore} from '../chess/scoring';

export interface Consequence {reason:string;reply?:string;replyUci?:string;replyFen?:string;line:string[];lineUci:string[];opponent:string}
/** Explain the played continuation, never substitute the best-move root line. */
export function moveConsequence(row:ReviewMove):Consequence {
  const opponent=row.color==='w'?'Black':'White';
  const c=new Chess(row.fenAfter),line:string[]=[],lineUci:string[]=[];
  const root=row.after.candidates[0]?.pv??[];
  const continuation=root[0]===row.uci?root.slice(1,9):[];
  // Old or shallow records can still contain a concrete, legally checked reply.
  const facts=continuation.length?[]:moveFacts(row.fenBefore,row.uci);
  const warning=facts.find(e=>e.kind==='allowsMate')??facts.find(e=>e.kind==='hanging');
  const moves=continuation.length?continuation:warning?.line?.slice(1)??[];
  let reason='',replyFen:string|undefined,replyUci:string|undefined;
  for(const uci of moves){
    try{
      const before=c.fen(),move=playUci(c,uci);line.push(move.san);lineUci.push(uci);
      if(line.length===1){
        replyFen=c.fen();replyUci=uci;
        reason=c.isCheckmate()?`${opponent} can answer ${move.san}, which is checkmate.`:
          move.captured?`${opponent} can answer ${move.san}, capturing your ${NAMES[move.captured]}${move.isEnPassant()?' en passant':` on ${move.to}`}.${staticExchange(before,move.to)>0?' The legal exchange on that square favors your opponent.':' Check the following recaptures before judging the exchange.'}`:
          move.promotion?`${opponent} can answer ${move.san} and promote to a ${NAMES[move.promotion]}.`:
          move.san.includes('+')?`${opponent} can answer ${move.san} with check, so you must respond to the king threat.`:
          `${opponent}'s engine reply is ${move.san}. With best play the evaluation was ${formatScore(row.before.candidates[0]?.score)}; after your move it is ${formatScore(row.after.candidates[0]?.score)} (White's perspective). The continuation below shows how the position can develop.`;
      }
    }catch{break;}
  }
  if(line.length>1){
    if(c.isCheckmate())reason+=` The shown continuation ends in checkmate for ${c.turn()==='w'?'Black':'White'}.`;
    else {
      const enemy=row.color==='w'?'b':'w';
      const change=(material(c.fen(),enemy)-material(c.fen(),row.color))-(material(row.fenAfter,enemy)-material(row.fenAfter,row.color));
      if(change>0)reason+=` In this continuation, ${opponent} gains ${change} pawn${change===1?'':'s'} of net material compared with the position after your move.`;
    }
  }
  return {reason:reason||warning?.text||'The engine finds a stronger continuation for your opponent. No concrete reply is available in this saved search; run a deeper review to investigate.',reply:line[0],replyUci,replyFen,line,lineUci,opponent};
}
