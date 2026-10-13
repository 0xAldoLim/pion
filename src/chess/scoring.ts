import type { Color } from 'chess.js';
import type { Classification, ReviewMove, Score, ScoringMode } from './types';

export const SCORING_VERSION = 'pion-1.0.0';
export const clamp=(value:number,min=0,max=100)=>Math.min(max,Math.max(min,value));
export function winPercent(score:Score,color:Color='w'):number {
  if(score.kind==='mate')return score.winner===color?100:0;
  const cp=color==='w'?score.value:-score.value;
  return 50+50*(2/(1+Math.exp(-0.00368208*cp))-1);
}
/** Independent expected-points interpretation, never proprietary platform parity. */
export function expectedPoints(score:Score,color:Color='w'):number {
  if(score.kind==='mate')return score.winner===color?1:0;
  return 1/(1+Math.exp(-0.004*(color==='w'?score.value:-score.value)));
}
export function moveAccuracy(before:number,after:number):number {
  return clamp(103.1668*Math.exp(-0.04354*Math.max(0,before-after))-3.1669);
}
export function ordinaryCategory(loss:number,isBest:boolean):Classification {
  // Best additionally requires negligible loss; a contradictory search is not best.
  if(isBest && loss<=0.001)return 'best';
  if(loss<0.02)return 'excellent';
  if(loss<0.05)return 'good';
  if(loss<0.10)return 'inaccuracy';
  if(loss<0.20)return 'mistake';
  return 'blunder';
}
export interface ClassificationContext {loss:number; isBest:boolean; forced:boolean; book:boolean; sacrificeVerified:boolean; candidateGap:number; opportunity:boolean; depth:number}
export function classify(ctx:ClassificationContext):Classification {
  const base=ordinaryCategory(ctx.loss,ctx.isBest);
  if(ctx.forced)return base;
  // Genuine mistakes are never hidden by a known opening label.
  if(ctx.book && ctx.loss<0.05)return 'book';
  if(ctx.sacrificeVerified && ctx.isBest && ctx.loss<=0.001 && ctx.depth>=18)return 'brilliant';
  if(ctx.isBest && ctx.loss<=0.001 && ctx.candidateGap>=0.20 && ctx.depth>=14)return 'great';
  if(ctx.opportunity && ctx.loss>=0.05)return 'miss';
  return base;
}
export function scoreMove(row:Omit<ReviewMove,'scores'>,mode:ScoringMode):ReviewMove['scores'][ScoringMode] {
  const before=row.before.candidates[0]!.score;
  const after=row.after.candidates[0]!.score;
  const fn=mode==='pion' ? (s:Score)=>winPercent(s,row.color)/100 : (s:Score)=>expectedPoints(s,row.color);
  const loss=Math.max(0,fn(before)-fn(after));
  const second=row.before.candidates[1];
  const depth=Math.min(row.before.candidates[0]!.depth,row.after.candidates[0]!.depth);
  const classification=classify({loss,isBest:row.uci===row.bestMove,forced:row.forced,book:row.book,sacrificeVerified:row.sacrificeVerified,candidateGap:second ? fn(before)-fn(second.score):0,opportunity:row.opportunity,depth});
  return {classification,accuracy:mode==='pion' ? moveAccuracy(winPercent(before,row.color),winPercent(after,row.color)) : clamp(100*Math.exp(-8*loss)),loss,version:SCORING_VERSION};
}
export function deviation(xs:number[]):number {if(!xs.length)return 0;const mean=xs.reduce((a,b)=>a+b,0)/xs.length;return Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/xs.length);}
/** Volatility windows on the complete ply timeline, then per-side 50/50 weighted/harmonic blend. */
export function gameAccuracy(rows:ReviewMove[],color:Color,mode:ScoringMode):number|null {
  if(!rows.length)return null;
  const selected=rows.filter(row=>row.color===color);
  if(!selected.length)return null;
  if(mode==='inspired')return selected.reduce((sum,row)=>sum+row.scores[mode].accuracy,0)/selected.length;
  const timeline=[winPercent(rows[0]!.before.candidates[0]!.score),...rows.map(row=>winPercent(row.after.candidates[0]!.score))];
  const size=Math.min(timeline.length,clamp(Math.floor(rows.length/10),2,8));
  const windows:number[][]=[];
  for(let i=0;i<Math.max(0,size-2);i++)windows.push(timeline.slice(0,size));
  for(let i=0;i<=timeline.length-size;i++)windows.push(timeline.slice(i,i+size));
  const pairs=rows.map((row,index)=>({row,weight:clamp(deviation(windows[index] ?? timeline.slice(Math.max(0,index-size+2),index+2)),0.5,12)})).filter(p=>p.row.color===color);
  const weightSum=pairs.reduce((a,p)=>a+p.weight,0);
  const weighted=pairs.reduce((a,p)=>a+p.weight*p.row.scores.pion.accuracy,0)/weightSum;
  const accuracies=pairs.map(p=>p.row.scores.pion.accuracy);
  const harmonic=accuracies.some(a=>a===0)?0:accuracies.length/accuracies.reduce((a,b)=>a+1/b,0);
  return clamp((weighted+harmonic)/2);
}
export function formatScore(score?:Score):string {if(!score)return '—';return score.kind==='mate'?`${score.winner==='w'?'+':'−'}M${Math.abs(score.value)}`:`${score.value>=0?'+':''}${(score.value/100).toFixed(2)}`;}
/** Deliberately broad, uncalibrated heuristic band; never inferred rating. */
export function performanceBand(accuracy:number|null,moves:number):string {
  if(accuracy===null || moves<10)return 'Insufficient sample';
  const midpoint=clamp(300+accuracy*17,200,2400);
  return `${Math.max(100,Math.round((midpoint-500)/100)*100)}–${Math.round((midpoint+500)/100)*100} (experimental)`;
}
