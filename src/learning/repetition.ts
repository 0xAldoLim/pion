import type {Repetition} from '../chess/types';
export function schedule(record:Repetition,success:boolean,hints=0,now=Date.now()):Repetition {
  const recalled=success&&hints===0;
  const ease=Math.max(1.3,Math.min(3,record.ease+(recalled?0.1:-0.2)));
  const interval=recalled?(record.successes===0?1:record.successes===1?3:Math.max(1,Math.round(record.interval*ease))):1;
  return {interval,ease,due:now+interval*86_400_000,successes:record.successes+(recalled?1:0),failures:record.failures+(!recalled?1:0)};
}
export const freshRepetition=(now=Date.now()):Repetition=>({interval:0,ease:2.5,due:now,successes:0,failures:0});
export function adaptiveRating(rating:number,puzzleRating:number,success:boolean,hints:number,firstSeen:boolean):number {
  if(!firstSeen)return rating;
  const expected=1/(1+10**((puzzleRating-rating)/400));
  return Math.min(3000,Math.max(100,Math.round(rating+24*((success&&hints===0?1:0)-expected))));
}
