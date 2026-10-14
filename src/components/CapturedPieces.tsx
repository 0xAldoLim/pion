import type {Color} from 'chess.js';
import {CAPTURE_ORDER,type MaterialSummary} from '../chess/material';
import type {Preferences} from '../chess/types';

const names={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen'};

export function CapturedPieces({summary,color,pieceSet}:{summary:MaterialSummary;color:Color;pieceSet:Preferences['pieces']}){
  const owner=color==='w'?'White':'Black',opponent=color==='w'?'Black':'White',capturedColor=color==='w'?'b':'w';
  const groups=CAPTURE_ORDER.filter(piece=>summary.pieces[piece]>0);
  const pieces=groups.map(piece=>`${summary.pieces[piece]} ${opponent.toLowerCase()} ${names[piece]}${summary.pieces[piece]===1?'':'s'}`).join(', ');
  const label=`${pieces?`Captured by ${owner}: ${pieces}.`:`${owner} has not captured any pieces.`}${summary.advantage?` ${owner} is ahead by ${summary.advantage} material point${summary.advantage===1?'':'s'}.`:''}`;
  return <div className={`captured-pieces${groups.length?'':' empty'}`} data-capturer={color} role="img" aria-label={label} title={label}>
    {groups.map(piece=>{const count=summary.pieces[piece];return <span className="captured-group" key={piece} data-piece={piece} data-count={count} style={{width:26+(count-1)*10}} aria-hidden="true">{Array.from({length:count},(_,index)=><img className="captured-piece" key={index} style={{left:count===1?0:`calc(${index/(count-1)} * (100% - 26px))`}} src={`${import.meta.env.BASE_URL}assets/pieces/${pieceSet}-${capturedColor}${piece}.svg`} alt="" width={26} height={26}/>)}</span>;})}
    {summary.advantage>0&&<span className="material-advantage" aria-hidden="true">+{summary.advantage}</span>}
  </div>;
}
