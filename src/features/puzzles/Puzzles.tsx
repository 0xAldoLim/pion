import {useEffect,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {Chess} from 'chess.js';
import {ArrowRight,Lightbulb,RotateCcw} from 'lucide-react';
import {useApp} from '../../app/context';
import {Board} from '../../components/Board';
import {Coach} from '../../components/Coach';
import {db} from '../../storage/db';
import type {Attempt,Puzzle} from '../../chess/types';
import {allDefaultPuzzles,dailyPuzzle,puzzleStart} from '../../data/puzzles';
import {MASTER_PUZZLES} from '../../data/masters';
import {playUci} from '../../chess/rules';
import {engine} from '../../engine/manager';
import {winPercent} from '../../chess/scoring';
import {progressiveHint} from '../../coach/commentary';
import {positionAdvice} from '../../coach/facts';
import {adaptiveRating,schedule} from '../../learning/repetition';

type Mode='practice'|'rush'|'master'|'mistake';
export default function Puzzles(){
  const {preferences,setPreferences,selectedId,notify}=useApp();const attempts=useLiveQuery(()=>db.attempts.toArray(),[],[]);const imported=useLiveQuery(()=>db.puzzles.toArray(),[],[]);const mistakes=useLiveQuery(()=>db.mistakes.orderBy('due').toArray(),[],[]);
  const [mode,setMode]=useState<Mode>(selectedId==='mistakes'||selectedId?.startsWith('mistake:')?'mistake':'practice');const [theme,setTheme]=useState('all');const [rating,setRating]=useState(0);const [puzzle,setPuzzle]=useState<Puzzle>();const [fen,setFen]=useState('');const [cursor,setCursor]=useState(0);const [hints,setHints]=useState(0);const [message,setMessage]=useState('');const [solved,setSolved]=useState(false);const [failed,setFailed]=useState(false);const [busy,setBusy]=useState(false);const [reset,setReset]=useState(0);const [rushTime,setRushTime]=useState(300);const [rushScore,setRushScore]=useState(0);const [rushErrors,setRushErrors]=useState(0);const [rushActive,setRushActive]=useState(false);
  const started=useRef(Date.now());const generation=useRef(0);const recorded=useRef(false);const search=useRef<AbortController|null>(null);
  const pool=[...allDefaultPuzzles,...imported];
  function load(next:Puzzle){search.current?.abort();generation.current++;setPuzzle(next);setFen(puzzleStart(next).fen);setCursor(0);setHints(0);setSolved(false);setFailed(false);setBusy(false);setMessage('');started.current=Date.now();recorded.current=false;}
  useEffect(()=>{let active=true;(async()=>{
    if(selectedId&&selectedId!=='mistakes'){const chosen=allDefaultPuzzles.find(p=>p.id===selectedId)??await db.puzzles.get(selectedId);if(chosen&&active){load(chosen);return;}}
    if(active)load(dailyPuzzle());
  })();return()=>{active=false;search.current?.abort();generation.current++;};},[selectedId]);
  useEffect(()=>{if(!rushActive)return;const start=performance.now();const timer=setInterval(()=>setRushTime(Math.max(0,300-Math.floor((performance.now()-start)/1000))),250);return()=>clearInterval(timer);},[rushActive]);
  useEffect(()=>{if(rushActive&&(rushTime===0||rushErrors>=3)){setRushActive(false);notify(`Puzzle rush finished: ${rushScore} solved, ${rushErrors} errors.`);}},[rushActive,rushTime,rushErrors,rushScore,notify]);
  function next(nextMode=mode){
    if(nextMode==='mistake'){
      const due=mistakes.find(m=>m.id!==puzzle?.id.slice(8)&&m.due<=Date.now())??mistakes[0];
      if(!due){notify('Review a game to add positions to your mistake bank.');return;}
      load({id:`mistake:${due.id}`,fen:due.fen,moves:[due.move],rating:800,themes:due.tags,source:due.source,license:due.license,attribution:'Your personal mistake bank',setup:false});return;
    }
    const base=nextMode==='master'?MASTER_PUZZLES:pool.filter(p=>!p.master&&!p.id.startsWith('mistake:'));
    const filtered=base.filter(p=>(theme==='all'||p.themes.includes(theme))&&(!rating||Math.abs(p.rating-rating)<=250));
    if(!filtered.length){notify('No installed puzzles match these filters. Change difficulty or install a pack in Settings.');return;}
    const target=rating||preferences.puzzleRating;const seen=new Set(attempts.map(a=>a.puzzleId));
    const sorted=[...filtered].sort((a,b)=>Number(seen.has(a.id))-Number(seen.has(b.id))||Math.abs(a.rating-target)-Math.abs(b.rating-target));
    const candidate=sorted.filter(p=>p.id!==puzzle?.id).slice(0,12);load(candidate[Math.floor(Math.random()*candidate.length)]??sorted[0]!);
  }
  async function record(success:boolean,usedHints=hints){
    if(!puzzle||recorded.current)return;recorded.current=true;
    const firstSeen=!(await db.attempts.where('puzzleId').equals(puzzle.id).first());
    const attempt:Attempt={id:crypto.randomUUID(),puzzleId:puzzle.id,at:Date.now(),solved:success,hints:usedHints,firstSeen,rating:puzzle.rating,themes:puzzle.themes,duration:Date.now()-started.current,mode};
    await db.attempts.add(attempt);await setPreferences({puzzleRating:adaptiveRating(preferences.puzzleRating,puzzle.rating,success,usedHints,firstSeen)});
    if(puzzle.id.startsWith('mistake:')){const old=await db.mistakes.get(puzzle.id.slice(8));if(old)await db.mistakes.put({...old,...schedule(old,success,usedHints)});}
  }
  async function move(uci:string){
    if(!puzzle||busy||solved||(mode==='rush'&&!rushActive))return;const id=generation.current;const solution=puzzleStart(puzzle).solution;const expected=solution[cursor];if(!expected)return;
    const c=new Chess(fen);try{playUci(c,uci);}catch{setMessage('Choose a legal move.');setReset(r=>r+1);return;}
    let accepted=uci===expected||c.isCheckmate();let alternative=false;setBusy(true);
    if(!accepted&&!puzzle.themes.some(t=>/^mateIn[2-9]|long|veryLong/.test(t))){
      const controller=new AbortController();search.current=controller;
      try{
        const settings={...preferences.engine,depth:20,timeMs:Math.max(1200,preferences.engine.timeMs),multiPv:1};
        const expectedEval=await engine.analyze(fen,settings,{signal:controller.signal,priority:5,rootMoves:[expected]});
        const playedEval=await engine.analyze(fen,settings,{signal:controller.signal,priority:5,rootMoves:[uci]});
        const expectedLine=expectedEval.candidates[0]!;const actual=playedEval.candidates[0]!;
        const expectedScore=expectedLine.score;const actualScore=actual.score;
        accepted=Math.min(expectedLine.depth,actual.depth)>=16&&(expectedScore.kind==='mate'?actualScore.kind==='mate'&&actualScore.winner===expectedScore.winner&&Math.abs(actualScore.value)<=Math.abs(expectedScore.value):actualScore.kind==='cp'&&winPercent(expectedScore,new Chess(fen).turn())-winPercent(actualScore,new Chess(fen).turn())<=1&&Math.abs(expectedScore.value-actualScore.value)<=20);
        alternative=accepted;
      }catch{/* Without enough engine evidence, preserve the supplied solution criterion. */}
    }
    if(generation.current!==id)return;
    setBusy(false);
    if(!accepted){setMessage('That move does not meet this exercise’s solution. Check the forcing replies and try again.');setFailed(true);setReset(r=>r+1);if(mode==='rush')setRushErrors(v=>v+1);await record(false);return;}
    let nextCursor=cursor+1;
    if(!alternative&&!c.isGameOver()&&solution[nextCursor]){playUci(c,solution[nextCursor]!);nextCursor++;}
    setFen(c.fen());setCursor(nextCursor);
    if(alternative||nextCursor>=solution.length||c.isCheckmate()){
      setSolved(true);setMessage(alternative?'An equally strong alternative, verified by local Stockfish.':'Well found. You followed the forcing line.');await record(!failed);
      if(mode==='rush'&&!failed)setRushScore(v=>v+1);
    }else setMessage('Good. The opponent has replied; find your next move.');
  }
  function hint(){if(!puzzle||solved)return;const level=Math.min(3,hints+1);setHints(level);setMessage(progressiveHint(fen,puzzleStart(puzzle).solution.slice(cursor),level));}
  if(!puzzle||!fen)return <p>Loading your local puzzle library…</p>;
  const themes=['all','mateIn1','mateIn2','fork','pin','skewer','discoveredAttack','defensiveMove','endgame','sacrifice'];
  return <><div className="page-intro"><div><span className="eyebrow">NOTICE. CALCULATE. DISCOVER.</span><h1>Build your chess vision.</h1><p>{allDefaultPuzzles.length.toLocaleString()} installed exercises, plus your own learning positions.</p></div></div><div className="practice-mode">{(['practice','rush','master','mistake']as Mode[]).map(item=><button key={item} className={mode===item?'active':''} onClick={()=>{setMode(item);setRushActive(false);if(item!=='rush')next(item);}}>{({practice:'Practice',rush:'Puzzle rush',master:'Learn from the masters',mistake:'My mistakes'})[item]}</button>)}</div><div className="filters"><label className="field-inline">Theme<select aria-label="Puzzle theme" value={theme} onChange={e=>{setTheme(e.target.value);}}>{themes.map(t=><option key={t} value={t}>{t==='all'?'All themes':t}</option>)}</select></label><label className="field-inline">Difficulty<select value={rating} onChange={e=>setRating(Number(e.target.value))}><option value={0}>Adaptive · ≈ {preferences.puzzleRating}</option>{[400,800,1200,1600,2000,2400,2800].map(r=><option value={r} key={r}>{r} ±250</option>)}</select></label><button onClick={()=>next()}>Apply filters / next puzzle</button></div>
    <div className="game-layout"><div className="board-column"><Board fen={fen} orientation={new Chess(puzzleStart(puzzle).fen).turn()==='w'?'white':'black'} enabled={!solved&&!busy&&(mode!=='rush'||rushActive)} onMove={uci=>void move(uci)} resetKey={reset} animation={preferences.animation&&!preferences.reducedMotion}/><div className="board-controls"><button onClick={()=>load(puzzle)}><RotateCcw size={15}/> Retry</button><button disabled={mode==='rush'} onClick={hint}><Lightbulb size={15}/> Hint {Math.min(hints,3)}/3</button><button className="primary" onClick={()=>next()}>Next <ArrowRight size={15}/></button></div></div><aside className="game-side">{solved&&<div className="puzzle-success" role="status"><strong>{failed||hints?'Solved with practice':'Well found!'}</strong><p>{message}</p><p>{puzzle.explanation??'The supplied continuation was replayed legally. Focus on your opponent’s strongest replies.'}</p></div>}<section className="card"><span className="eyebrow">{mode==='master'?'A MOMENT IN CHESS HISTORY':'YOUR NEXT POSITION'}</span><h2>{puzzle.master?`${puzzle.master.white}’s vision`:mode==='mistake'?'Try it with fresh eyes.':'Find the best move.'}</h2><p style={{marginTop:12}}>Approximate puzzle rating {puzzle.rating} · {puzzle.themes.join(', ')||'calculation'}</p>{puzzle.master&&<p>{puzzle.master.white} vs {puzzle.master.black}<br/>{puzzle.master.event}, {puzzle.master.date}<br/>Move {puzzle.master.moveNumber}. Exact day unknown.</p>}{mode==='rush'&&<><span className="rush-clock">{Math.floor(rushTime/60)}:{String(rushTime%60).padStart(2,'0')}</span><p>{rushScore} solved · {rushErrors}/3 errors</p><button className="primary" onClick={()=>{setRushScore(0);setRushErrors(0);setRushTime(300);setRushActive(true);next('practice');}}>Start 5-minute rush</button></>}<p className="save-note">{attempts.filter(a=>a.firstSeen&&a.solved&&a.hints===0).length} unseen positions solved without hints. Repeated puzzles do not raise the training estimate.</p>{solved&&puzzle.source.startsWith('https://')&&<a className="source-link" href={puzzle.source} target="_blank" rel="noreferrer">Source & attribution ↗</a>}</section><Coach text={message||positionAdvice(fen)} thinking={busy} preferences={preferences} mood={solved?'happy':'idle'} onHint={mode==='rush'?undefined:hint}/><section className="card"><span className="eyebrow">YOUR PRACTICE HISTORY</span>{attempts.slice(-5).reverse().map(a=><p style={{fontSize:11}} key={a.id}>{new Date(a.at).toLocaleDateString()} · {a.solved?'Solved':'Needs practice'} · {a.hints} hints {a.firstSeen?'· first encounter':'· repetition'}</p>)}</section></aside></div></>;
}
