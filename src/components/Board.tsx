import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {Chess,type Color,type Square} from 'chess.js';
import {Chessground} from '@lichess-org/chessground';
import type {Api} from '@lichess-org/chessground/api';
import type {Key} from '@lichess-org/chessground/types';
import {uciOf} from '../chess/rules';
import {MAX_PREMOVES,premoveDestinations,projectPremoves} from '../chess/premoves';
import type {Classification,Score} from '../chess/types';
import {MoveBadge} from './MoveBadge';
import {EvalBar} from './Evaluation';
import {useFocusDialog} from './useFocusDialog';
import '@lichess-org/chessground/assets/chessground.base.css';

interface PremoveInput {color:Color;queue:string[];onQueue:(move:string)=>void;onCancel:()=>void}
interface BoardProps {
  fen:string;orientation?:'white'|'black';enabled?:boolean;onMove?:(move:string)=>void;
  arrows?:{orig:Key;dest:Key;brush:string}[];lastMove?:string;resetKey?:number;animation?:boolean;
  classification?:Classification;evaluation?:{score?:Score};premove?:PremoveInput;showMoveControls?:boolean;children?:ReactNode;
}
export function Board({fen,orientation='white',enabled=false,onMove,arrows=[],lastMove,resetKey=0,animation=true,classification,evaluation,premove,showMoveControls=enabled,children}:BoardProps) {
  const host=useRef<HTMLDivElement>(null),frame=useRef<HTMLDivElement>(null),container=useRef<HTMLDivElement>(null);
  const api=useRef<Api|null>(null),moveId=useId();
  const cancelTap=useRef<{x:number;y:number}|null>(null);
  const chess=new Chess(fen),legal=chess.moves({verbose:true});
  const waiting=!!premove&&chess.turn()!==premove.color;
  const queue=waiting?premove.queue:[];
  let preview=fen;
  try{if(queue.length)preview=projectPremoves(fen,queue,premove!.color);}catch{/* Captured or displaced pieces cancel when their queued move is reached. */}
  const latest=useRef({fen,preview,onMove,premove,waiting,enabled});latest.current={fen,preview,onMove,premove,waiting,enabled};
  const [promotion,setPromotion]=useState<{from:Key;to:Key;premove:boolean}|null>(null);
  const [selected,setSelected]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState('');
  const dialog=useRef<HTMLDivElement>(null);
  const cancelPromotion=()=>{setPromotion(null);api.current?.cancelPremove();api.current?.set({fen:latest.current.preview});};
  useFocusDialog(dialog,!!promotion,cancelPromotion,false);
  useEffect(()=>{
    if(!premove?.queue.length||promotion)return;
    const cancel=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();latest.current.premove?.onCancel();api.current?.cancelMove();}};
    document.addEventListener('keydown',cancel);return()=>document.removeEventListener('keydown',cancel);
  },[premove?.queue.length,promotion]);
  const destination=lastMove?.slice(2,4),file=destination?destination.charCodeAt(0)-97:0,rank=destination?Number(destination[1])-1:0;
  const markerStyle={left:`clamp(14px, ${(orientation==='white'?file:7-file)*12.5+10.5}%, calc(100% - 14px))`,top:`clamp(14px, ${(orientation==='white'?7-rank:rank)*12.5+2}%, calc(100% - 14px))`};
  useEffect(()=>{
    function submit(from:Key,to:Key,isPremove:boolean){
      const current=latest.current;
      if(isPremove&&!current.waiting||!isPremove&&!current.enabled)return;
      const piece=new Chess(current.preview).get(from as Square);
      if(piece?.type==='p'&&(to[1]==='1'||to[1]==='8'))setPromotion({from,to,premove:isPremove});
      else if(isPremove)current.premove?.onQueue(from+to);else current.onMove?.(from+to);
      if(isPremove)api.current?.cancelPremove();
    }
    api.current=Chessground(host.current!,{fen,coordinates:true,orientation,turnColor:chess.turn()==='w'?'white':'black',
      movable:{free:false,color:undefined,rookCastle:false,events:{after:(from,to)=>submit(from,to,false)}},
      premovable:{enabled:false,events:{set:(from,to)=>submit(from,to,true)}},drawable:{enabled:true},animation:{enabled:animation,duration:180}});
    let redraw=0,observedContainer:HTMLElement|null=null;
    function refresh(){
      const inner=api.current?.state.dom.elements.container;
      if(inner&&inner!==observedContainer){if(observedContainer)observer.unobserve(observedContainer);observedContainer=inner;observer.observe(inner);}
      cancelAnimationFrame(redraw);
      redraw=requestAnimationFrame(()=>{
        const board=api.current?.state.dom.elements.board.getBoundingClientRect(),stage=frame.current?.getBoundingClientRect();
        if(board&&stage){const inset=Math.max(0,(stage.width-board.width)/2);container.current?.style.setProperty('--board-inset',`${inset}px`);frame.current?.style.setProperty('--board-inset',`${inset}px`);}
      });
    }
    const observer=new ResizeObserver(refresh);observer.observe(host.current!);refresh();
    return()=>{observer.disconnect();cancelAnimationFrame(redraw);api.current?.destroy();api.current=null;};
    // Mounted once; callbacks read the latest position and controls.
  },[]);
  const arrowKey=JSON.stringify(arrows),queueKey=queue.join(',');
  useEffect(()=>{
    const c=new Chess(fen),dests=new Map<Key,Key[]>(),highlights=new Map<Key,string>();
    for(const m of c.moves({verbose:true})){const from=m.from as Key,list=dests.get(from)??[];if(!list.includes(m.to as Key))list.push(m.to as Key);dests.set(from,list);}
    for(const move of queueKey.split(',').filter(Boolean)){highlights.set(move.slice(0,2) as Key,'queued-premove');highlights.set(move.slice(2,4) as Key,'queued-premove');}
    api.current?.cancelPremove();
    api.current?.set({fen:preview,orientation,turnColor:c.turn()==='w'?'white':'black',check:queueKey?false:c.inCheck(),
      lastMove:lastMove?[lastMove.slice(0,2) as Key,lastMove.slice(2,4) as Key]:undefined,
      highlight:{custom:highlights},movable:{free:false,color:enabled?(c.turn()==='w'?'white':'black'):waiting?(premove!.color==='w'?'white':'black'):undefined,dests:enabled?dests:new Map()},
      premovable:{enabled:waiting&&queueKey.split(',').filter(Boolean).length<MAX_PREMOVES,customDests:waiting?premoveDestinations(preview,premove!.color):new Map()},animation:{enabled:animation,duration:180}});
    api.current?.setAutoShapes(JSON.parse(arrowKey));
    setSelected('');setFrom('');setTo('');setPromotion(null);
  },[fen,preview,orientation,enabled,waiting,premove?.color,lastMove,resetKey,animation,arrowKey,queueKey]);
  function cancelPremoves(){premove?.onCancel();cancelPromotion();api.current?.cancelMove();}
  const choices=waiting?premoveDestinations(preview,premove!.color):new Map<Square,Square[]>();
  const targets=choices.get(from as Square)??[];
  return <div ref={container} className={`board-container${evaluation?' has-evaluation':''}`} onContextMenu={e=>{if(premove?.queue.length){e.preventDefault();cancelPremoves();}}} onKeyDown={e=>{if(e.key==='Escape'&&premove?.queue.length&&!promotion){e.preventDefault();cancelPremoves();}}}>
    {evaluation&&<EvalBar score={evaluation.score} orientation={orientation}/>}
    <div className="board-stage" ref={frame}><div className="chessboard" ref={host} role="img" aria-label={`Chessboard, ${chess.turn()==='w'?'White':'Black'} to move${queue.length?', premove preview':''}${chess.inCheck()?', in check':''}`} data-testid="chessboard" onPointerDownCapture={e=>{
      cancelTap.current=null;if(!queue.length||e.button!==0||api.current?.state.selected)return;
      const bounds=api.current?.state.dom.elements.board.getBoundingClientRect();if(!bounds)return;
      const x=Math.floor((e.clientX-bounds.left)/bounds.width*8),y=Math.floor((e.clientY-bounds.top)/bounds.height*8);
      const square=String.fromCharCode(97+(orientation==='white'?x:7-x))+(orientation==='white'?8-y:y+1);
      if(queue.some(move=>move.slice(2,4)===square))cancelTap.current={x:e.clientX,y:e.clientY};
    }} onPointerUpCapture={e=>{const start=cancelTap.current;cancelTap.current=null;if(start&&Math.hypot(start.x-e.clientX,start.y-e.clientY)<5){e.stopPropagation();cancelPremoves();}}}/>{classification&&destination&&<div className="board-markers"><span className="move-marker" style={markerStyle} data-square={destination}><MoveBadge kind={classification}/></span></div>}
    {promotion&&<div ref={dialog} tabIndex={-1} className="promotion" role="dialog" aria-modal="true" aria-label="Choose promotion"><strong>{promotion.premove?'Premove promotion':'Promote your pawn'}</strong><div>{(['q','r','b','n']as const).map((piece,i)=><button key={piece} autoFocus={i===0} onClick={()=>{const move=promotion.from+promotion.to+piece;if(promotion.premove)premove?.onQueue(move);else onMove?.(move);setPromotion(null);}}>{({q:'Queen',r:'Rook',b:'Bishop',n:'Knight'})[piece]}</button>)}</div><button onClick={cancelPromotion}>Cancel promotion</button></div>}
    </div>
    {children&&<div className="board-footer">{children}</div>}
    {showMoveControls&&<div className="board-inputs">
      {waiting?<form className="premove-form" onSubmit={e=>{e.preventDefault();if(from&&to){const piece=new Chess(preview).get(from as Square);if(piece?.type==='p'&&(to[1]==='1'||to[1]==='8'))setPromotion({from:from as Key,to:to as Key,premove:true});else premove!.onQueue(from+to);}}}><label htmlFor={`${moveId}-from`}>Premove from<select id={`${moveId}-from`} value={from} onChange={e=>{setFrom(e.target.value);setTo('');}}><option value="">Choose piece</option>{[...choices.keys()].map(key=><option key={key}>{key}</option>)}</select></label><label htmlFor={`${moveId}-to`}>Premove to<select id={`${moveId}-to`} value={to} onChange={e=>setTo(e.target.value)}><option value="">Choose square</option>{targets.map(key=><option key={key}>{key}</option>)}</select></label><button type="submit" disabled={!from||!to||queue.length>=MAX_PREMOVES}>Queue move</button></form>:
      <form className="keyboard-move" onSubmit={e=>{e.preventDefault();if(selected&&enabled)onMove?.(selected);}}><label htmlFor={moveId}>Keyboard move</label><select id={moveId} aria-label="Legal move" value={selected} disabled={!enabled} onChange={e=>setSelected(e.target.value)}><option value="">{enabled?'Choose a legal move':'Waiting for your turn'}</option>{legal.map(m=><option key={uciOf(m)} value={uciOf(m)}>{m.san}</option>)}</select><button disabled={!selected||!enabled} type="submit">Play move</button></form>}
      {premove&&<div className="premove-status"><span role="status">{premove.queue.length?`Premoves ${premove.queue.length}/${MAX_PREMOVES} · ${premove.queue.map(m=>`${m.slice(0,2)} → ${m.slice(2,4)}${m[4]?' = '+m[4].toUpperCase():''}`).join(' · ')}`:waiting?'Opponent’s turn · queue a premove':'Premoves on · 0.1 seconds per move'}</span>{premove.queue.length>0&&<button type="button" onClick={cancelPremoves}>Cancel premoves</button>}</div>}
    </div>}
  </div>;
}
