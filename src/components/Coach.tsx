import {useEffect,useState} from 'react';
import {Lightbulb,Volume2} from 'lucide-react';
import {Character} from './Character';
import type {Preferences} from '../chess/types';
import {Chess} from 'chess.js';
import {uciOf} from '../chess/rules';
import {coachAnswer,type CoachContext} from '../coach/actions';
export function Coach({text,thinking=false,mood='idle',preferences,onHint,context}: {text:string;thinking?:boolean;mood?:'idle'|'happy'|'sad'|'surprised'|'celebrate';preferences:Preferences;onHint?:()=>void;context?:CoachContext}) {
  const [speaking,setSpeaking]=useState(false),[answer,setAnswer]=useState(''),[candidate,setCandidate]=useState('');
  const contextKey=JSON.stringify(context);
  useEffect(()=>{setAnswer('');setCandidate('');},[text,contextKey]);
  useEffect(()=>()=>{if('speechSynthesis'in window)speechSynthesis.cancel();},[]);
  if(preferences.coach==='off')return null;
  function speak(){if(!('speechSynthesis'in window))return;const voice=speechSynthesis.getVoices().find(v=>v.localService&&v.lang.startsWith('en'));if(!voice)return;const speech=new SpeechSynthesisUtterance(answer||text);speech.voice=voice;speech.onend=()=>setSpeaking(false);speech.onerror=()=>setSpeaking(false);speechSynthesis.cancel();setSpeaking(true);speechSynthesis.speak(speech);}
  return <section className="coach-card" aria-label="Local chess coach"><div className="coach-top"><span className="eyebrow">YOUR CORNER</span><span className="mini-tag">Local coach</span></div><div className="coach-content"><Character seed={0} color="#e4a52c" mood={thinking?'thinking':speaking?'speaking':mood} size={74}/><div><strong>Ponke, your coach</strong><p aria-live="polite">{thinking?'Checking the position with Stockfish…':answer||text}</p></div></div><div className="coach-actions">{onHint&&<button className="text-button" onClick={onHint} disabled={thinking}><Lightbulb size={16}/> Get a hint</button>}{preferences.voice&&<button className="text-button" onClick={speak} title="Uses an installed local English voice when available"><Volume2 size={16}/> Read aloud</button>}</div>{context&&!thinking&&<details className="coach-questions"><summary>Ask about this position</summary><div className="study-actions"><button onClick={()=>setAnswer(coachAnswer(context,'why',preferences))}>Why is this useful?</button><button onClick={()=>setAnswer(coachAnswer(context,'threats',preferences))}>What is threatened?</button><button onClick={()=>setAnswer(coachAnswer(context,'idea',preferences))}>Explain the idea</button></div><label>What if I play…<select aria-label="Coach candidate move" value={candidate} onChange={e=>{setCandidate(e.target.value);if(e.target.value)setAnswer(coachAnswer(context,'whatif',preferences,e.target.value));}}><option value="">Choose a legal candidate</option>{new Chess(context.fen).moves({verbose:true}).map(m=><option key={uciOf(m)} value={uciOf(m)}>{m.san}</option>)}</select></label></details>}</section>;
}
