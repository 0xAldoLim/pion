import {useEffect,useRef,useState} from 'react';
import {Chess,type Square} from 'chess.js';
import {Chessground} from '@lichess-org/chessground';
import type {Api} from '@lichess-org/chessground/api';
import type {Key} from '@lichess-org/chessground/types';
import {uciOf} from '../chess/rules';
import type {Classification} from '../chess/types';
import {MoveBadge} from './MoveBadge';
import '@lichess-org/chessground/assets/chessground.base.css';

export function Board({fen,orientation='white',enabled=false,onMove,arrows=[],lastMove,resetKey=0,animation=true,classification}: {fen:string;orientation?:'white'|'black';enabled?:boolean;onMove?:(move:string)=>void;arrows?:{orig:Key;dest:Key;brush:string}[];lastMove?:string;resetKey?:number;animation?:boolean;classification?:Classification}) {
  const host=useRef<HTMLDivElement>(null);const api=useRef<Api|null>(null);
  const latest=useRef({fen,onMove});latest.current={fen,onMove};
  const [promotion,setPromotion]=useState<{from:Key;to:Key}|null>(null);
  const [selected,setSelected]=useState('');
  const chess=new Chess(fen);const legal=chess.moves({verbose:true});
  const destination=lastMove?.slice(2,4);const file=destination?destination.charCodeAt(0)-97:0;const rank=destination?Number(destination[1])-1:0;
  const markerStyle={left:`${(orientation==='white'?file:7-file)*12.5+10.5}%`,top:`${(orientation==='white'?7-rank:rank)*12.5+2}%`};
  useEffect(()=>{
    api.current=Chessground(host.current!,{fen,coordinates:true,orientation,turnColor:chess.turn()==='w'?'white':'black',movable:{free:false,color:undefined,events:{after:(from,to)=>{
      const c=new Chess(latest.current.fen);const piece=c.get(from as Square);
      if(piece?.type==='p' && (to[1]==='1'||to[1]==='8'))setPromotion({from,to});else latest.current.onMove?.(from+to);
    }}},premovable:{enabled:false},drawable:{enabled:true},animation:{enabled:animation,duration:180}});
    const observer=new ResizeObserver(()=>api.current?.redrawAll());observer.observe(host.current!);
    const refresh=()=>api.current?.redrawAll();window.addEventListener('scroll',refresh,true);
    return ()=>{observer.disconnect();window.removeEventListener('scroll',refresh,true);api.current?.destroy();api.current=null;};
    // Mounted once; callbacks read the current position through latest.
  },[]);
  const arrowKey=JSON.stringify(arrows);
  useEffect(()=>{
    const c=new Chess(fen);const dests=new Map<Key,Key[]>();
    for(const m of c.moves({verbose:true})){const from=m.from as Key;const list=dests.get(from)??[];if(!list.includes(m.to as Key))list.push(m.to as Key);dests.set(from,list);}
    api.current?.set({fen,orientation,turnColor:c.turn()==='w'?'white':'black',check:c.inCheck(),lastMove:lastMove?[lastMove.slice(0,2) as Key,lastMove.slice(2,4) as Key]:undefined,movable:{free:false,color:enabled?(c.turn()==='w'?'white':'black'):undefined,dests:enabled?dests:new Map()},animation:{enabled:animation,duration:180}});
    api.current?.setAutoShapes(JSON.parse(arrowKey));
    setSelected('');setPromotion(null);
  },[fen,orientation,enabled,lastMove,resetKey,animation,arrowKey]);
  return <div className="board-container">
    <div className="board-stage"><div className="chessboard" ref={host} role="img" aria-label={`Chessboard, ${chess.turn()==='w'?'White':'Black'} to move${chess.inCheck()?', in check':''}`} data-testid="chessboard" />{classification&&destination&&<div className="board-markers"><span className="move-marker" style={markerStyle} data-square={destination}><MoveBadge kind={classification}/></span></div>}</div>
    {promotion&&<div className="promotion" role="dialog" aria-modal="true" aria-label="Choose promotion"><strong>Promote your pawn</strong><div>{(['q','r','b','n']as const).map((piece,i)=><button key={piece} autoFocus={i===0} onClick={()=>{onMove?.(promotion.from+promotion.to+piece);setPromotion(null);}}>{({q:'Queen',r:'Rook',b:'Bishop',n:'Knight'})[piece]}</button>)}</div><button onClick={()=>{setPromotion(null);api.current?.set({fen});}}>Cancel promotion</button></div>}
    {enabled&&<form className="keyboard-move" onSubmit={e=>{e.preventDefault();if(selected)onMove?.(selected);}}><label htmlFor="legal-move">Keyboard move</label><select id="legal-move" aria-label="Legal move" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose a legal move</option>{legal.map(m=><option key={uciOf(m)} value={uciOf(m)}>{m.san}</option>)}</select><button disabled={!selected} type="submit">Play move</button></form>}
  </div>;
}
