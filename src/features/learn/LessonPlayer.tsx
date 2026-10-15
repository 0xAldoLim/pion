import {useEffect,useRef,useState} from 'react';
import {Chess} from 'chess.js';
import type {Key} from '@lichess-org/chessground/types';
import {Board} from '../../components/Board';
import {Coach} from '../../components/Coach';
import {useApp} from '../../app/context';
import {db} from '../../storage/db';
import {playUci} from '../../chess/rules';
import {assessmentFeedback,satisfies} from '../../learning/assessment';
import {freshLesson,lessonStatus} from '../../learning/progress';
import {schedule} from '../../learning/repetition';
import type {InteractiveLesson,LessonProgress,LearningEvidence} from '../../learning/models';
import {moveFacts} from '../../coach/facts';
import {Glossary} from './Glossary';

export function LessonPlayer({lesson,onExit}:{lesson:InteractiveLesson;onExit:()=>void}){
  const {preferences,navigate,notify}=useApp();
  const [progress,setProgress]=useState<LessonProgress>();const latest=useRef<LessonProgress|undefined>(undefined);
  const [result,setResult]=useState(''),[played,setPlayed]=useState(''),[reset,setReset]=useState(0),[busy,setBusy]=useState(false);
  const [demoPly,setDemoPly]=useState(0),[running,setRunning]=useState(false);const saving=useRef(Promise.resolve());
  useEffect(()=>{let alive=true;void db.lessonProgress.get(lesson.id).then(p=>{if(alive){const current=p??freshLesson(lesson);latest.current=current;setProgress(current);}});return()=>{alive=false;};},[lesson]);
  function persist(next:LessonProgress){latest.current=next;saving.current=saving.current.then(()=>db.lessonProgress.put(next)).then(()=>{if(latest.current===next)setProgress(next);}).catch(e=>notify(`Lesson save failed: ${String(e)}`));}
  const index=progress?Math.max(0,lesson.steps.findIndex(s=>s.id===progress.currentStep)):0,step=lesson.steps[index]!;
  useEffect(()=>{if(!progress||progress.viewedSteps.includes(step.id))return;persist({...progress,viewedSteps:[...progress.viewedSteps,step.id],lastVisited:Date.now()});},[progress,step.id]);
  useEffect(()=>{setResult('');setPlayed('');setDemoPly(0);setRunning(false);setReset(n=>n+1);},[step.id]);
  useEffect(()=>{if(!running||step.type!=='demonstration')return;const timer=setTimeout(()=>{if(demoPly<step.moves.length)setDemoPly(n=>n+1);else setRunning(false);},1500);return()=>clearTimeout(timer);},[running,demoPly,step]);
  if(!progress)return <p role="status">Loading your saved lesson…</p>;
  const completed=progress.completedExercises.includes(step.id),interactive=step.type==='move'||step.type==='question';
  const board=new Chess(step.fen);if(step.type==='demonstration')for(const move of step.moves.slice(0,demoPly))playUci(board,move);if(played)playUci(board,played);
  const hintLevel=progress.stepHints[step.id]??0,status=lessonStatus(lesson,progress);
  const last=played||(step.type==='demonstration'?step.moves[demoPly-1]:undefined);
  const facts=played?moveFacts(step.fen,played):[];
  const fork=facts.find(f=>f.kind==='fork');
  const shapes=fork?fork.squares.slice(1).map(dest=>({orig:fork.squares[0]!,dest,brush:'green'})):last?[{orig:last.slice(0,2),dest:last.slice(2,4),brush:'green'}]:step.arrows??[];
  function hint(){const p=latest.current!;const level=Math.min(3,(p.stepHints[step.id]??0)+1);persist({...p,hintCount:p.hintCount+1,stepHints:{...p.stepHints,[step.id]:level}});setResult(step.hints[level-1]!);}
  async function assess(success:boolean,feedback:string,move=''){
    if(busy||completed)return;setBusy(true);
    try{
      const p=latest.current!,errors=(p.stepErrors[step.id]??0)+Number(!success),hints=p.stepHints[step.id]??0;
      setResult(feedback);setReset(n=>n+1);
      if(!success){persist({...p,stepErrors:{...p.stepErrors,[step.id]:errors}});return;}
      setPlayed(move);
      const positionId=step.fen.split(' ').slice(0,4).join(' '),old=await db.learningEvidence.where('positionId').equals(positionId).toArray();
      const independent=interactive&&step.independent,kind=independent?(step.id==='recall'||old.length?'recall':'transfer'):'guided';
      const evidence:LearningEvidence[]=lesson.skills.map(skill=>({version:1,id:crypto.randomUUID(),lessonId:lesson.id,stepId:step.id,positionId,skill,at:Date.now(),success,hints,errors,kind,firstSeen:!old.length,spaced:kind==='recall'&&Date.now()>=p.due}));
      const independentIds=evidence.filter(e=>e.kind==='transfer'&&e.firstSeen&&e.hints===0&&e.errors===0).map(e=>e.id);
      const next={...p,completedExercises:[...new Set([...p.completedExercises,step.id])],masteryEvidence:[...p.masteryEvidence,...independentIds],...(independent?schedule(p,hints===0&&errors===0,hints):{}),lastVisited:Date.now()};
      await saving.current;await db.transaction('rw',db.learningEvidence,db.lessonProgress,async()=>{await db.learningEvidence.bulkPut(evidence);await db.lessonProgress.put(next);});persist(next);
    }catch(e){notify(`Could not record this answer: ${String(e)}`);}finally{setBusy(false);}
  }
  function move(uci:string){if(step.type!=='move')return;try{const success=satisfies(step.fen,uci,step.goal);void assess(success,success?`${playUci(new Chess(step.fen),uci).san} meets this objective. ${moveFacts(step.fen,uci)[0]?.text??step.hints[1]}`:assessmentFeedback(step.fen,uci,step.goal,step.failure),success?uci:'');}catch(e){setResult(String(e));setReset(n=>n+1);}}
  function go(next:number){if(next<0||next>=lesson.steps.length)return;setPlayed('');setResult('');persist({...latest.current!,currentStep:lesson.steps[next]!.id,lastVisited:Date.now()});}
  return <><div className="page-intro"><div><span className="eyebrow">{lesson.category}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><button onClick={onExit}>All lessons</button></div>
    <div className="learning-progress" aria-label="Lesson progress"><span>Step {index+1} of {lesson.steps.length}</span><progress max={lesson.steps.length} value={index+1}/><span>{status.viewed?'Viewed':'Not viewed'} · {status.practiced?'Practiced':'Practice in progress'} · {status.demonstrated?'Independent evidence recorded':'Independent evidence pending'}</span></div>
    <section className="study-objective"><span className="mini-tag">{step.type==='move'?'Try the idea':step.type==='question'?'Check your understanding':step.type}</span><h2>{step.objective}</h2><p>{step.type==='demonstration'&&demoPly?step.captions[demoPly-1]:step.explanation}</p></section><div className="study-layout"><section className="study-board"><div className="turn-prompt"><strong>{board.turn()==='w'?'White':'Black'} to move</strong><span>{interactive&&step.independent?'Independent challenge':step.type==='demonstration'?'Demonstration':'Guided learning'}</span></div><Board fen={board.fen()} enabled={step.type==='move'&&!completed&&!busy} onMove={move} animation={preferences.animation&&!preferences.reducedMotion} resetKey={reset} lastMove={last} arrows={shapes.map(a=>({...a,orig:a.orig as Key,dest:a.dest as Key}))}/>
    {step.type==='demonstration'&&<div className="study-actions"><button onClick={()=>{setRunning(false);setDemoPly(n=>Math.max(0,n-1));}} disabled={!demoPly}>Previous move</button><button onClick={()=>setRunning(v=>!v)} disabled={preferences.reducedMotion}>{running?'Pause':'Play demonstration'}</button><button onClick={()=>{setRunning(false);setDemoPly(n=>Math.min(step.moves.length,n+1));}} disabled={demoPly===step.moves.length}>Next move</button><button onClick={()=>{setRunning(false);setDemoPly(0);}}>Replay demonstration</button></div>}</section>
    <section className="study-panel">
    {step.type==='question'&&<div className="answer-options">{[...step.choices].sort((a,b)=>((Number(a.id)+[...lesson.id].reduce((n,c)=>n+c.charCodeAt(0),0))%3)-((Number(b.id)+[...lesson.id].reduce((n,c)=>n+c.charCodeAt(0),0))%3)).map(choice=><button key={choice.id} disabled={busy||completed} onClick={()=>void assess(choice.correct,choice.feedback)}>{choice.text}</button>)}</div>}
    <Coach context={!interactive||completed?{fen:board.fen(),beforeFen:played?step.fen:undefined,lastMove:played||undefined,idea:step.explanation}:undefined} text={result||(hintLevel?step.hints[hintLevel-1]!:step.type==='demonstration'&&demoPly?step.captions[demoPly-1]!:step.explanation)} preferences={preferences} mood={completed?'happy':'idle'} onHint={interactive&&!completed?hint:undefined}/><p role="status" className="study-feedback">{result|| (completed?'This exercise is recorded. Continue or revisit the position.':'')}</p>
    {interactive&&hintLevel>0&&<p className="save-note">Hint {hintLevel}/3 · An assisted answer records practice, not independent evidence.</p>}
    <div className="study-actions"><button disabled={index===0||busy} onClick={()=>go(index-1)}>Back</button>{interactive&&<button onClick={()=>{setResult('Position restored for another look. Earlier hints and errors remain recorded.');setPlayed('');setReset(n=>n+1);const p=latest.current!;persist({...p,completedExercises:p.completedExercises.filter(id=>id!==step.id)});}} disabled={busy}>Retry exercise</button>}{index<lesson.steps.length-1&&step.type!=='summary'?<button className="primary" disabled={interactive&&!completed||busy} onClick={()=>go(index+1)}>Continue</button>:<button className="primary" onClick={onExit}>Return to path</button>}{step.type==='summary'&&<button onClick={()=>{const p=latest.current!;persist({...p,completedExercises:p.completedExercises.filter(id=>id!=='recall'),stepErrors:{...p.stepErrors,recall:0},stepHints:{...p.stepHints,recall:0},currentStep:'recall'});}}>Practice recall</button>}</div>
    {interactive&&!completed&&<button className="text-button" onClick={()=>go(index+1)}>Skip this step · no completion credit</button>}
    <Glossary/><details><summary>Related practice</summary><div className="study-actions">{lesson.related.map(id=><button key={id} onClick={()=>navigate('learn',id)}>{id.replaceAll('-',' ')}</button>)}<button onClick={()=>navigate('learn',`masters:${lesson.id}`)}>Study a master example</button><button onClick={()=>navigate(lesson.stage===3?'openings':'puzzles')}>Put it into practice</button><button onClick={()=>navigate('play')}>Try a bot game</button></div></details>
    </section></div></>;
}



