import {useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {Chess} from 'chess.js';
import {useApp} from '../../app/context';
import {LESSONS,type Lesson} from '../../data/lessons';
import {Board} from '../../components/Board';
import {playUci} from '../../chess/rules';
import {db} from '../../storage/db';
import {LessonDemo} from '../../components/LessonDemo';
import {LESSON_DEMOS} from '../../data/demos';
import {exerciseFeedback} from '../../coach/commentary';
export default function Learn(){
  const {preferences,notify,navigate}=useApp();const training=useLiveQuery(()=>db.training.toArray(),[],[]);const [lesson,setLesson]=useState<Lesson>();const [fen,setFen]=useState('');const [text,setText]=useState('');const [reset,setReset]=useState(0);const [done,setDone]=useState(false);
  function open(item:Lesson){setLesson(item);setFen(item.fen??'');setText('');setDone(false);}
  async function complete(success=true){if(!lesson||done)return;await db.training.add({id:crypto.randomUUID(),at:Date.now(),kind:lesson.fen?'endgame':'lesson',target:lesson.id,success,hints:0});setDone(true);notify('Learning activity recorded. Revisit it when you want a refresher.');}
  async function move(uci:string){if(!lesson)return;try{const c=new Chess(fen);playUci(c,uci);const accepted=lesson.solution?.includes(uci)||c.isCheckmate();if(accepted){setFen(c.fen());setText('Well played. The exercise’s objective is satisfied.');await complete();}else{setText(exerciseFeedback(fen,uci,lesson.solution??[]));setReset(r=>r+1);}}catch(e){setText(String(e));setReset(r=>r+1);}}
  if(lesson)return <><div className="page-intro"><div><span className="eyebrow">{lesson.category}</span><h1>{lesson.title}</h1></div><button onClick={()=>setLesson(undefined)}>All lessons</button></div><article className="lesson-text"><div className="lesson-layout"><LessonDemo key={lesson.id} demo={LESSON_DEMOS[lesson.id]!} reducedMotion={preferences.reducedMotion||!preferences.animation}/><div><p>{lesson.summary}</p>{lesson.paragraphs.map((p,i)=><p key={i}>{p}</p>)}{lesson.fen&&<div className="lesson-exercise"><div className="turn-prompt"><strong>{done?"Exercise complete":`${new Chess(fen).turn()==="w"?"White":"Black"} to move`}</strong><span>Try it yourself</span></div><h2>{lesson.objective}</h2><Board fen={fen} enabled={!done} onMove={uci=>void move(uci)} resetKey={reset} animation={preferences.animation&&!preferences.reducedMotion}/><p role="status">{text}</p><button onClick={()=>open(lesson)}>Retry exercise</button></div>}{!lesson.fen&&<button className="primary" onClick={()=>void complete()} disabled={done}>{done?'Activity recorded':'Mark as studied'}</button>}<button style={{marginLeft:10}} onClick={()=>navigate(lesson.category==='Openings'?'openings':'puzzles')}>Put it into practice</button><p className="save-note">Study activity measures participation. Skill evidence comes from unseen positions and successful recall.</p></div></div></article></>;
  return <><div className="page-intro"><div><span className="eyebrow">UNDERSTAND THE IDEAS</span><h1>Learn at your own pace.</h1><p>Original lessons, practical exercises, and advanced tools. No rating gates.</p></div></div><div className="library-grid">{LESSONS.map(item=><button key={item.id} className="library-card" onClick={()=>open(item)}><span className="mini-tag">{item.category}</span><h2>{item.title}</h2><p>{item.summary}</p><small>{training.some(t=>t.target===item.id&&t.success)?'Studied · revisit →':item.fen?'Try the board exercise →':'Read & practice →'}</small></button>)}</div></>;
}
