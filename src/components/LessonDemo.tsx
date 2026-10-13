import {useEffect,useState} from 'react';
import {Pause,Play,RotateCcw,StepForward} from 'lucide-react';
import {Board} from './Board';
import type {LessonDemo as Demo} from '../data/demos';
import {replay} from '../chess/rules';
export function LessonDemo({demo,reducedMotion}: {demo:Demo;reducedMotion:boolean}) {
  const [cursor,setCursor]=useState(0);const [playing,setPlaying]=useState(!reducedMotion);
  const c=replay({startFen:demo.fen,moves:demo.moves.slice(0,cursor)});
  useEffect(()=>{if(!playing||reducedMotion)return;const timer=setTimeout(()=>setCursor(n=>n>=demo.moves.length?0:n+1),cursor===demo.moves.length?3200:1800);return()=>clearTimeout(timer);},[playing,cursor,demo,reducedMotion]);
  return <aside className="lesson-demo"><section className="card"><span className="eyebrow">WATCH THE IDEA</span><h2>{demo.title}</h2><div className="turn-prompt"><strong>{c.isCheckmate()?'Checkmate':`${c.turn()==='w'?'White':'Black'} to move`}</strong><span>{cursor}/{demo.moves.length}</span></div><Board fen={c.fen()} lastMove={demo.moves[cursor-1]} animation={!reducedMotion}/><p className="demo-caption" aria-live={playing?'off':'polite'}>{cursor?demo.captions[cursor-1]:'Follow the moves, then explain the idea in your own words.'}</p><div className="board-controls"><button aria-label={playing?'Pause demo':'Play demo'} onClick={()=>setPlaying(v=>!v)} disabled={reducedMotion}>{playing?<Pause size={16}/>:<Play size={16}/>}<span>{playing?'Pause':'Play'}</span></button><button aria-label="Next move" onClick={()=>{setPlaying(false);setCursor(n=>n>=demo.moves.length?0:n+1);}}><StepForward size={16}/><span>Next</span></button><button aria-label="Reset demo" onClick={()=>{setCursor(0);setPlaying(false);}}><RotateCcw size={16}/><span>Reset</span></button></div>{reducedMotion&&<p className="save-note">Reduced motion: use Next move to explore.</p>}</section></aside>;
}
