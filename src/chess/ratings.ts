import type {Color} from 'chess.js';
import type {Rating,RatingCategory} from './types';

export const INITIAL_RATING=600;
/** Pion groups short clocks into Blitz and clocks of 10+ effective minutes into Rapid. */
export function ratingCategory(seconds:number,increment:number):RatingCategory {
  return seconds+40*increment>=600?'rapid':'blitz';
}
export function freshRating(id:RatingCategory):Rating {
  return {id,value:INITIAL_RATING,games:0,wins:0,losses:0,draws:0,updatedAt:0};
}
export function matchRating(value:number,rng=Math.random):number {
  return Math.max(100,Math.round(value)+Math.floor(rng()*41)-20);
}
export function ratingChange(value:number,opponent:number,result:string,color:Color):number {
  const actual=result==='1/2-1/2'?0.5:result===(color==='w'?'1-0':'0-1')?1:0;
  const expected=1/(1+10**((opponent-value)/400));
  return Math.round(32*(actual-expected));
}
