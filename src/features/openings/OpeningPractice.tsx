import {useEffect,useRef,useState} from 'react';
import type {Color} from 'chess.js';
import {Board} from '../../components/Board';
import {Coach} from '../../components/Coach';
import {useApp} from '../../app/context';
import {replay,START_FEN,lineSan} from '../../chess/rules';
import {db} from '../../storage/db';
import {schedule} from '../../learning/repetition';
import {openingExplanation} from '../../openings/teaching';
export function OpeningPractice({name,moves,color,onExit}:{name:string;moves:string[];color:Color;onExit:()=>void}){
  const {preferences,notify}=useApp();const [line,setLine]=useState<string[]>([]),[errors,setErrors]=useState(0),[hints,setHints]=useState(0),[text,setText]=useState(''),[reset,setReset]=useState(0),[finished,setFinished]=useState(false);const recorded=useRef(false);
  const board=replay({startFen:START_FEN,moves:line});
  useEffect(()=>{if(line.length>=moves.length||board.turn()===color)return;const timer=setTimeout(()=>setLine(p=>[...p,moves[p.length]!]),600);return()=>clearTimeout(timer);},[line,board,color,moves]);
  useEffect(()=>{if(line.length<moves.length||recorded.current)return;recorded.current=true;void(async()=>{const old=await db.repertoire.toArray();const record=old.find(r=>r.color===color&&r.moves.join(',')===moves.join(','));if(record)await db.repertoire.put({...record,...schedule(record,errors===0,hints)});await db.training.add({id:crypto.randomUUID(),at:Date.now(),kind:'opening',target:name,success:errors===0,hints});setFinished(true);notify('Opening recall recorded.');})();},[line.length,moves,color,errors,hints,name,notify]);
  const expected=moves[line.length];
  function move(uci:string){if(uci!==expected){setErrors(n=>n+1);setReset(n=>n+1);setText('This legal move is outside the selected recall sequence. Recall the intended move; this is not a blunder judgment.');return;}setText(openingExplanation(board.fen(),uci));setLine(p=>[...p,uci]);}
  return <div className="study-layout"><section className="study-board"><div className="turn-prompt"><strong>{board.turn()==='w'?'White':'Black'} to move</strong><span>You practice {color==='w'?'White':'Black'}</span></div><Board fen={board.fen()} enabled={!finished&&line.length<moves.length&&board.turn()===color} orientation={color==='w'?'white':'black'} onMove={move} resetKey={reset} animation={preferences.animation&&!preferences.reducedMotion}/></section><section className="study-panel"><h2>{finished?'Line complete':`Recall ${name}`}</h2><p>Retrieve a short starting line first, then explore its longer variations.</p><Coach preferences={preferences} text={text||'Play your next repertoire move from memory.'} onHint={!finished&&expected&&board.turn()===color?()=>{setHints(n=>n+1);setText(`Recall ${lineSan(board.fen(),[expected])[0]}. ${openingExplanation(board.fen(),expected)}`);}:undefined}/><p role="status">{finished?'Opening recall recorded. Your schedule is preserved.':text}</p><p className="save-note">{errors} errors · {hints} hints · {line.length}/{moves.length} half-moves</p><button onClick={onExit}>Return to opening</button></section></div>;
}

