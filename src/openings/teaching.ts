import {Chess} from 'chess.js';
import {playUci,uciOf} from '../chess/rules';
import {moveFacts,staticExchange,VALUES} from '../coach/facts';
import {CURATED_ANNOTATIONS,type OpeningCourse} from '../data/opening-courses';
import {positionKey} from './position-index';
export {positionKey};
export function openingExplanation(fen:string,move:string){return CURATED_ANNOTATIONS.get(`${positionKey(fen)}|${move}`)?.explanation??moveFacts(fen,move).find(f=>['mate','check','capture','fork','pin','castling','promotion'].includes(f.kind))?.text??`${playUci(new Chess(fen),move).san} is legal here. No specific strategic annotation is installed for this move; compare the opponent’s checks and captures.`;}
export interface OpeningMistake {before:string;fen:string;mistake:string;recovery:string;gain:number;explanation:string}
const mistakes=new Map<string,OpeningMistake>();
/** A legal caution diagram, not a popularity claim or an engine-best assertion. */
export function openingMistake(course:OpeningCourse):OpeningMistake|undefined{
  const cached=mistakes.get(course.id);if(cached)return cached;
  const board=new Chess();const line=course.variations[0]!.moves;
  for(let i=0;i<=line.length;i++){
    if(i)playUci(board,line[i-1]!);
    if(i<course.startPly)continue;
    for(const candidate of board.moves({verbose:true}).filter(m=>['q','r','b','n'].includes(m.piece)&&!m.captured&&!m.san.includes('+'))){
      const after=new Chess(board.fen());after.move(candidate);
      const gain=staticExchange(after.fen(),candidate.to);if(gain<2)continue;
      const capture=after.moves({verbose:true}).filter(m=>m.to===candidate.to&&m.captured).sort((a,b)=>VALUES[a.piece]-VALUES[b.piece])[0];if(!capture)continue;
      const example={before:board.fen(),fen:after.fen(),mistake:uciOf(candidate),recovery:uciOf(capture),gain,explanation:`${candidate.san} leaves a piece on ${candidate.to} that can be captured by ${capture.san}. The bounded legal exchange gains about ${gain} pawns. This illustrates overlooking an attack; it is not a claim about how often this move is played.`};mistakes.set(course.id,example);return example;
    }
  }
}
