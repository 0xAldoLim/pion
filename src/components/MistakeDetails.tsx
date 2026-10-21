import type {ReviewMove} from '../chess/types';
import {moveConsequence} from '../coach/consequences';
export function MistakeDetails({row,showAlternative=true,onReply,showingReply=false}:{row:ReviewMove;showAlternative?:boolean;onReply?:()=>void;showingReply?:boolean}){
  const consequence=moveConsequence(row);
  return <section className="card mistake-details" aria-label="Mistake explanation"><span className="eyebrow">UNDERSTAND THE CONSEQUENCE</span><h3>Why {row.san} needs another look</h3><p>{consequence.reason}</p>{consequence.line.length>0&&<div className="opponent-continuation"><strong>{consequence.opponent}'s response</strong><p>{consequence.line.join(' → ')}</p><small>A legal engine continuation; other replies may be possible.</small></div>}{showAlternative&&row.bestMove!==row.uci&&<p><strong>A stronger choice: {row.bestSan}.</strong> Compare its continuation with the position your move allowed.</p>}{onReply&&consequence.replyFen&&<button onClick={onReply}>{showingReply?'Return to played position':`Show ${consequence.opponent}'s reply`}</button>}</section>;
}
