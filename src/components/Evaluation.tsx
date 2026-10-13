import type {ReviewMove,Score} from '../chess/types';
import {formatScore,winPercent} from '../chess/scoring';
export function EvalBar({score}: {score?:Score}) {return <div className="eval-bar" aria-label={`White evaluation ${formatScore(score)}`}><div style={{height:`${score?100-winPercent(score):50}%`}}/><span>{formatScore(score)}</span></div>;}
export function EvalGraph({rows,current,onSelect}: {rows:ReviewMove[];current:number;onSelect:(ply:number)=>void}) {
  if(!rows.length)return <p className="muted">Run a review to see the evaluation timeline.</p>;
  const points=rows.map((r,i)=>`${i/Math.max(1,rows.length-1)*600},${100-winPercent(r.after.candidates[0]!.score)}`).join(' ');
  return <div className="graph" aria-label="Evaluation timeline"><svg viewBox="0 0 600 100" role="img" aria-label="White win percentage after each move"><path d="M0 50H600" stroke="currentColor" strokeDasharray="3 5" opacity=".3"/><polyline points={points} fill="none" stroke="#658e5b" strokeWidth="2"/><line x1={(current-1)/Math.max(1,rows.length-1)*600} x2={(current-1)/Math.max(1,rows.length-1)*600} y1="0" y2="100" stroke="#c87d4c" strokeWidth="2"/></svg><input type="range" aria-label="Evaluation graph move" min={0} max={rows.length} value={current} onChange={e=>onSelect(Number(e.target.value))}/></div>;
}
