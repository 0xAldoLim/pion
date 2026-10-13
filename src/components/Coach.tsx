import {useEffect,useState} from 'react';
import {Lightbulb,Volume2} from 'lucide-react';
import {Character} from './Character';
import type {Preferences} from '../chess/types';
export function Coach({text,thinking=false,mood='idle',preferences,onHint}: {text:string;thinking?:boolean;mood?:'idle'|'happy'|'sad'|'surprised'|'celebrate';preferences:Preferences;onHint?:()=>void}) {
  const [speaking,setSpeaking]=useState(false);
  useEffect(()=>()=>{if('speechSynthesis'in window)speechSynthesis.cancel();},[]);
  if(preferences.coach==='off')return null;
  function speak(){if(!('speechSynthesis'in window))return;const voice=speechSynthesis.getVoices().find(v=>v.localService&&v.lang.startsWith('en'));if(!voice)return;const speech=new SpeechSynthesisUtterance(text);speech.voice=voice;speech.onend=()=>setSpeaking(false);speech.onerror=()=>setSpeaking(false);speechSynthesis.cancel();setSpeaking(true);speechSynthesis.speak(speech);}
  return <section className="coach-card" aria-label="Local chess coach"><div className="coach-top"><span className="eyebrow">YOUR CORNER</span><span className="mini-tag">Local coach</span></div><div className="coach-content"><Character seed={0} color="#cedcaf" mood={thinking?'thinking':speaking?'speaking':mood} size={74}/><div><strong>Meet Pip</strong><p aria-live="polite">{thinking?'Checking the position with Stockfish…':text}</p></div></div><div className="coach-actions">{onHint&&<button className="text-button" onClick={onHint} disabled={thinking}><Lightbulb size={16}/> Get a hint</button>}{preferences.voice&&<button className="text-button" onClick={speak} title="Uses an installed local English voice when available"><Volume2 size={16}/> Read aloud</button>}</div></section>;
}
