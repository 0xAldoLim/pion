import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {Chess,type Color} from 'chess.js';
import {ArrowRight,Flag,FlipVertical2,Lightbulb,Pause,Play as PlayIcon,RotateCcw,Undo2,Download} from 'lucide-react';
import {Board} from '../../components/Board';
import {Character} from '../../components/Character';
import {CapturedPieces} from '../../components/CapturedPieces';
import {capturedMaterial} from '../../chess/material';
import {Coach} from '../../components/Coach';
import {MAX_PREMOVES,isLegalPremove,projectPremoves} from '../../chess/premoves';
import {useApp} from '../../app/context';
import {BOTS,botById,chooseBotMove} from '../bots/bots';
import {newGame,outcome,playUci,replay,uciOf,exportPgn} from '../../chess/rules';
import {assistance} from '../../chess/assistance';
import {MoveBadge} from '../../components/MoveBadge';
import {analyzePracticeMove} from './feedback';
import {explain} from '../../coach/commentary';
import type {Game,Evaluation,ReviewMove} from '../../chess/types';
import {engine} from '../../engine/manager';
import {db,saveGame} from '../../storage/db';
import {downloadFile} from '../../storage/backup';
import {positionAdvice,moveFacts} from '../../coach/facts';
import {progressiveHint,describeMove} from '../../coach/commentary';
import {playSound} from '../../components/sound';
import {settleClock,clockOutcome} from '../../chess/clocks';
import {useLiveQuery} from 'dexie-react-hooks';
import {freshRating,matchRating} from '../../chess/ratings';
import {matchedBot} from '../bots/bots';
import {responseDelay,waitForResponse} from '../bots/pacing';
const LiveOpening=lazy(()=>import('./LiveOpening'));

export default function PlayScreen(){
  const {preferences,navigate,openRatedPlay,notify,selectedId}=useApp();
  const [game,setGame]=useState<Game|null>(null);const gameRef=useRef<Game|null>(null);gameRef.current=game;
  const ratings=useLiveQuery(()=>db.ratings.toArray(),[],[]);
  const [botId,setBotId]=useState('pebble');const [color,setColor]=useState('w');const [mode,setMode]=useState<'bot'|'hotseat'>('bot');
  const [seconds,setSeconds]=useState(0);const [increment,setIncrement]=useState(0);
  const [flipped,setFlipped]=useState(false);const [thinking,setThinking]=useState(false);const [error,setError]=useState('');const [paused,setPaused]=useState(false);
  const [coachText,setCoachText]=useState('Before you move, look for checks, captures, and threats.');const [hintLevel,setHintLevel]=useState(0);const [evalResult,setEvalResult]=useState<Evaluation>();const [resetKey,setResetKey]=useState(0);
  const [retry,setRetry]=useState(0);const clockTick=useRef(performance.now());
  const [starting,setStarting]=useState(false);
  const [feedback,setFeedback]=useState<ReviewMove>();
  const assists=assistance(game,preferences);
  const ownPly=game?.moves.length?game.moves.length-(replay(game).turn()===game.playerColor?1:0):0;
  const feedbackKey=game&&ownPly>0?`${game.id}:${game.moves.slice(0,ownPly).join(',')}`:'';
  useEffect(()=>{
    setFeedback(undefined);if(!game||game.mode!=='bot'||!assists.feedback||ownPly<1)return;
    const controller=new AbortController();
    void analyzePracticeMove(game,ownPly,preferences.engine,controller.signal).then(row=>{if(!controller.signal.aborted)setFeedback(row);}).catch(()=>{/* Practice feedback is optional; full review remains available. */});
    return()=>controller.abort();
  },[feedbackKey,assists.feedback]);
  const [premoves,setPremoves]=useState<string[]>([]);const premovesRef=useRef<string[]>([]);
  function replacePremoves(queue:string[]){premovesRef.current=queue;setPremoves(queue);}
  function queuePremove(uci:string){
    const current=gameRef.current;if(!current||current.status!=='active'||!['bot','rated'].includes(current.mode)||paused||!preferences.premoves||replay(current).turn()===current.playerColor)return;
    const queue=premovesRef.current;if(queue.length>=MAX_PREMOVES)return;
    try{projectPremoves(replay(current).fen(),[...queue,uci],current.playerColor);replacePremoves([...queue,uci]);}catch(e){notify(e instanceof Error?e.message:'Cannot queue this move.');}
  }
  useEffect(()=>{replacePremoves([]);},[game?.id,game?.status,paused,preferences.premoves,resetKey]);
  useEffect(()=>{let alive=true;(async()=>{if(selectedId==='match'||selectedId==='practice')return;const saved=selectedId?await db.games.get(selectedId):await db.games.where('status').equals('active').last();if(alive&&saved){setGame(saved);setBotId(saved.botId);setCoachText(positionAdvice(replay(saved).fen()));}})().catch(e=>notify(String(e)));return()=>{alive=false;};},[selectedId,notify]);
  useEffect(()=>()=>{if(gameRef.current)void saveGame(gameRef.current);},[]);
  const commit=(next:Game)=>{gameRef.current=next;setGame(next);void saveGame(next).then(saved=>{if(saved.rated?.delta!==undefined&&gameRef.current?.id===saved.id){gameRef.current=saved;setGame(saved);}}).catch(e=>{setError(`Saving failed: ${String(e)}. Export this game now.`);});};
  useEffect(()=>{
    clockTick.current=performance.now();if(!game?.initialSeconds||game.status!=='active'||paused)return;
    const interval=setInterval(()=>{
      const current=gameRef.current;if(!current||current.status!=='active')return;
      const elapsed=(performance.now()-clockTick.current)/1000;clockTick.current=performance.now();
      const turn=replay(current).turn();const clocks=settleClock(current,turn,elapsed);
      const timeout=clocks[turn]<=0;
      const next={...current,clocks,...(timeout?{status:'finished' as const,...clockOutcome(replay(current).fen(),turn)}:{})};
      commit(next);
    },500);
    return()=>clearInterval(interval);
    // The ref carries clock/move updates without restarting the timer each tick.
  },[game?.id,game?.status,paused]);
  const chess=game?replay(game):new Chess(),fen=chess.fen();const material=capturedMaterial(chess);const bot=game?.rated?matchedBot(game.botId,game.rated.opponent):botById(game?.botId??botId);
  const playerTurn=!!game&&(game.mode==='hotseat'||chess.turn()===game.playerColor);
  function move(uci:string,isPremove=false){
    const current=gameRef.current;if(!current||current.status!=='active'||paused)return;
    const c=replay(current);const before=c.fen();
    if(isPremove&&!isLegalPremove(before,uci,current.playerColor))return;
    if(!isPremove&&c.turn()===current.playerColor)replacePremoves([]);
    try {
      const now=performance.now();const clocks=settleClock(current,c.turn(),(now-clockTick.current)/1000,isPremove?0.1:0);clockTick.current=now;
      if(current.initialSeconds&&clocks[c.turn()]===0){commit({...current,clocks,status:'finished',...clockOutcome(c.fen(),c.turn())});setResetKey(k=>k+1);return;}
      const m=playUci(c,uci);const result=outcome(c);
      if(current.initialSeconds)clocks[m.color]+=current.increment;
      const next={...current,moves:[...current.moves,uciOf(m)],san:[...current.san,m.san],clocks,review:undefined,...(result?{...result,status:'finished' as const}:{})};
      commit(next);setHintLevel(0);setError('');
      const facts=assistance(current,preferences).coach?moveFacts(before,uci):[];
      const important=facts.some(f=>['hanging','allowsMate','fork','mate','pin','skewer','discoveredAttack','promotion'].includes(f.kind));
      if(assistance(next,preferences).coach&&(preferences.coach!=='important'||important||result))setCoachText(describeMove(before,uci,preferences.explanation,preferences.coach==='training'));
      if(assistance(next,preferences).coach&&(current.mode==='bot'||current.mode==='rated')&&m.color!==current.playerColor&&m.captured)setCoachText(text=>`${text} ${botById(current.botId).name}: “${botById(current.botId).lines.capture}”`);
      if(preferences.sound)playSound(!!m.captured,result?.reason==='Checkmate');
    }catch(e){setError(e instanceof Error?e.message:'Illegal move.');setResetKey(k=>k+1);}
  }
  useEffect(()=>{
    const current=gameRef.current,queued=premovesRef.current;if(!current||!queued.length||current.status!=='active'||paused||replay(current).turn()!==current.playerColor)return;
    if(!isLegalPremove(replay(current).fen(),queued[0]!,current.playerColor)){replacePremoves([]);notify('Premove canceled: the opponent’s reply made it illegal.');return;}
    replacePremoves(queued.slice(1));move(queued[0]!,true);
  },[fen,game?.status,paused]);
  const searchKey=game?`${game.id}:${game.moves.join(',')}:${game.status}:${paused}:${retry}`:'';
  useEffect(()=>{
    const current=gameRef.current;if(!current||current.status!=='active'||!['bot','rated'].includes(current.mode)||paused||replay(current).turn()===current.playerColor){setThinking(false);return;}
    const controller=new AbortController();const identity=current.id+':'+current.moves.join(',');setThinking(true);setError('');
    const bot=current.rated?matchedBot(current.botId,current.rated.opponent):botById(current.botId);const pace={quick:0.5,standard:1,thoughtful:3}[preferences.botPace??'standard'];const settings={...preferences.engine,pack:'lite' as const,depth:bot.depth,timeMs:Math.max(100,Math.round(bot.timeMs*pace*(0.8+Math.random()*0.4))),multiPv:bot.skill<10?8:4,profile:'custom' as const};
    const started=performance.now();const delay=responseDelay(preferences.botPace??'standard');const position=replay(current).fen();let published=0;
    engine.analyze(position,settings,{signal:controller.signal,priority:10,skill:bot.skill,onProgress:lines=>{if(performance.now()-published<120)return;published=performance.now();if(assistance(current,preferences).evaluation&&!controller.signal.aborted&&gameRef.current?.id+':'+gameRef.current?.moves.join(',')===identity)setEvalResult({fen:position,engine:engine.version,settings,candidates:lines,bestMove:lines[0]?.move??'',completed:false,timestamp:Date.now()});}}).then(async result=>{
      if(!controller.signal.aborted&&assistance(current,preferences).evaluation)setEvalResult(result);
      await waitForResponse(delay-(performance.now()-started),controller.signal);
      if(controller.signal.aborted||gameRef.current?.status!=='active'||gameRef.current?.id+':'+gameRef.current?.moves.join(',')!==identity)return;
      move(chooseBotMove(bot,replay(current).fen(),result,current.san));
    }).catch(e=>{if(!controller.signal.aborted)setError(`Bot engine: ${e instanceof Error?e.message:String(e)}`);}).finally(()=>{if(!controller.signal.aborted)setThinking(false);});
    return()=>controller.abort();
    // Only the position identity changes the search; clock ticks cannot restart it.
  },[searchKey]);
  useEffect(()=>{
    const current=gameRef.current;if(!current||current.status!=='active'||!playerTurn||paused||!assistance(current,preferences).evaluation)return;
    const controller=new AbortController();const position=replay(current).fen();
    const settings={...preferences.engine,pack:'lite' as const,timeMs:Math.min(1000,preferences.engine.timeMs),multiPv:1};let published=0;
    engine.analyze(position,settings,{signal:controller.signal,priority:3,onProgress:lines=>{if(performance.now()-published<120)return;published=performance.now();if(!controller.signal.aborted&&gameRef.current&&replay(gameRef.current).fen()===position)setEvalResult({fen:position,engine:engine.version,settings,candidates:lines,bestMove:lines[0]?.move??'',completed:false,timestamp:Date.now()});}}).then(result=>{if(!controller.signal.aborted&&gameRef.current&&replay(gameRef.current).fen()===position)setEvalResult(result);}).catch(()=>{/* Manual hints/analysis expose recoverable engine errors. */});
    return()=>controller.abort();
  },[searchKey,playerTurn,preferences.showEval,preferences.coach]);
  async function launch(created:Game){setStarting(true);setError('');try{await saveGame(created);navigate('play',created.id);}catch(e){setError(`Could not start this game: ${String(e)}`);}finally{setStarting(false);}}
  function start(){const selected:Color=color==='random'?(Math.random()<0.5?'w':'b'):color as Color;const created=newGame(botId,selected,mode,seconds,increment);created.headers={White:selected==='w'?'You':botById(botId).name,Black:selected==='b'?'You':botById(botId).name};if(mode==='hotseat')created.headers={White:'White',Black:'Black'};void launch(created);}
  async function hint(){if(!game||game.status!=='active'||thinking||!assistance(game,preferences).hints)return;const position=fen;setThinking(true);try{const result=await engine.analyze(position,{...preferences.engine,multiPv:1},{priority:10});if(replay(gameRef.current!).fen()!==position)return;setEvalResult(result);const level=hintLevel+1;setHintLevel(level);setCoachText(progressiveHint(position,result.candidates[0]!.pv,Math.min(3,level)));}catch(e){setError(String(e));}finally{setThinking(false);}}
  function undo(){replacePremoves([]);setResetKey(k=>k+1);if(!game||!game.moves.length||!assistance(game,preferences).undo)return;const count=game.mode==='bot'&&replay(game).turn()===game.playerColor?2:1;commit({...game,moves:game.moves.slice(0,-count),san:game.san.slice(0,-count),status:'active',result:'*',reason:'',review:undefined});setCoachText('Position restored. Clocks retain their remaining practice time.');setEvalResult(undefined);}
  function finish(result:string,reason:string){replacePremoves([]);if(game)commit({...game,status:'finished',result,reason});}
  const orientation=(game?.playerColor==='b')!==flipped?'black':'white';
  const playerStrip=(side:Color,bottom=false)=>game&&<div className={`player-strip${bottom?' you':''}`}><Character seed={game.mode==='hotseat'||side===game.playerColor?0:bot.shape} color={game.mode==='hotseat'||side===game.playerColor?undefined:bot.color} size={45}/><div><strong>{game.mode==='hotseat'?(side==='w'?'White':'Black'):side===game.playerColor?'You':bot.name}</strong><small>{game.status==='finished'?`${game.result} · ${game.reason}`:paused?'Clocks paused':side!==game.playerColor&&thinking?'Thinking…':chess.turn()===side?`${side==='w'?'White':'Black'} to move${chess.inCheck()?' · Check':''}`:game.mode==='hotseat'?`Waiting for ${chess.turn()==='w'?'White':'Black'}`:side===game.playerColor?'Opponent’s turn':game.rated?`${game.rated.opponent} · ${game.rated.category}`:bot.band}</small><CapturedPieces summary={material[side]} color={side} pieceSet={preferences.pieces}/></div><span className="clock" aria-label={`${side==='w'?'White':'Black'} clock`}>{clock(game.clocks[side],game.initialSeconds)}</span></div>;
  if(!game)return <>
    <div className="page-intro"><div><span className="eyebrow">A WORTHY OPPONENT</span><h1>{selectedId==='practice'?'Practice at your own pace.':'Find your next challenge.'}</h1><p>{selectedId==='practice'?'Choose a bot, your side and a time control. Practice games never change your ratings.':'Start small. Think a little deeper. Every game is a chance to grow.'}</p></div><Character seed={bot.shape} color={bot.color} mood="happy" size={120}/></div>
    {selectedId!=='practice'&&<section className="rated-lobby card"><div><span className="eyebrow">PLAY AT YOUR LEVEL</span><h2>Meet your match.</h2><p>Choose your duration and meet an opponent within 20 points of your Blitz or Rapid rating.</p></div><div className="rating-pair">{(["blitz","rapid"] as const).map(category=><div key={category}><span>{category}</span><strong>{(ratings.find(r=>r.id===category)??freshRating(category)).value}</strong><small>{ratings.find(r=>r.id===category)?.games??0} games</small></div>)}</div><button className="primary" onClick={openRatedPlay}>Play now</button><p className="save-note">Wins and losses update the rating for your selected duration. Practice bots leave both ratings unchanged.</p></section>}<h2 className="practice-heading">Practice with the monkey crew</h2><p className="muted">Seven characters, twelve difficulty profiles. Pick a comfortable challenge.</p>{error&&<div className="error" role="alert">{error}</div>}<div className="bot-grid">{BOTS.map(b=><button className={`bot-card ${b.id===botId?'selected':''}`} key={b.id} onClick={()=>{setBotId(b.id);setMode("bot");}} aria-pressed={b.id===botId}><Character seed={b.shape} color={b.color} size={86}/><strong>{b.name}</strong><span>{b.band}</span><small>≈ {b.rating} · estimate</small></button>)}</div>
    <section className="setup-card card"><div><h2>{bot.name} is ready.</h2><p>{bot.tagline}</p><small className="muted">Strength bands are provisional until calibration is supported by repeated games.</small></div><div className="setup-fields"><label>Mode<select aria-label="Mode" value={mode} onChange={e=>setMode(e.target.value as 'bot'|'hotseat')}><option value="bot">Play a bot</option><option value="hotseat">Local hotseat</option></select></label><label>Your color<select aria-label="Your color" value={color} onChange={e=>setColor(e.target.value)}><option value="w">White</option><option value="b">Black</option><option value="random">Random</option></select></label><label>Time control<select aria-label="Time control" value={seconds} onChange={e=>setSeconds(Number(e.target.value))}><option value={0}>Casual · no clock</option><option value={180}>3 minutes</option><option value={300}>5 minutes</option><option value={600}>10 minutes</option><option value={1800}>30 minutes</option><option value={seconds||900}>Custom</option></select></label><label>Custom seconds<input type="number" min={0} max={86400} value={seconds} onChange={e=>setSeconds(Math.min(86400,Math.max(0,Number(e.target.value))))}/></label><label>Increment (sec)<input type="number" min={0} max={600} value={increment} onChange={e=>setIncrement(Math.min(600,Math.max(0,Number(e.target.value))))}/></label></div><button className="primary" disabled={starting} onClick={start}>Start game <ArrowRight size={18}/></button></section>
  </>;
  return <div className="play-screen">
    <div className="page-intro compact play-intro"><div><span className="eyebrow playing-side">{game.mode==='hotseat'?'Local hotseat':`You play ${game.playerColor==='w'?'White':'Black'}`}</span><h1>{game.mode==='hotseat'?'A game for two.':`Your move, your journey.`}</h1></div><button onClick={()=>setGame(null)}>Choose another opponent</button></div>
    {error&&<div className="error" role="alert">{error} <button onClick={()=>setRetry(r=>r+1)}>Retry engine</button></div>}
    <div className="game-layout"><div className="board-column">{playerStrip(orientation==='white'?'b':'w')}<div className="board-row"><Board annotations classification={assists.feedback&&assists.highlights&&feedback?.ply===game.moves.length?feedback.scores.pion.classification:undefined} evaluation={assists.evaluation?{score:game.status==="finished"&&game.reason==="Checkmate"?{kind:"mate",value:0,winner:game.result==="1-0"?"w":"b"}:game.status==="finished"&&game.result==="1/2-1/2"?{kind:"cp",value:0}:evalResult?.candidates[0]?.score}:undefined} showMoveControls={game.status==='active'} premove={preferences.premoves&&game.status==='active'&&['bot','rated'].includes(game.mode)&&!paused?{color:game.playerColor,queue:premoves,onQueue:queuePremove,onCancel:()=>replacePremoves([])}:undefined} fen={fen} orientation={orientation} enabled={game.status==='active'&&playerTurn&&!paused&&!thinking} onMove={move} lastMove={game.moves.at(-1)} resetKey={resetKey} animation={preferences.animation&&!preferences.reducedMotion}>{playerStrip(orientation==='white'?'w':'b',true)}</Board></div><div className="board-controls"><button onClick={()=>setFlipped(v=>!v)}><FlipVertical2 size={16}/> Flip</button><button onClick={undo} disabled={!game.moves.length||!assists.undo}><Undo2 size={16}/> Undo</button><button onClick={hint} disabled={thinking||game.status!=='active'||!assists.hints}><Lightbulb size={16}/> Hint</button>{game.initialSeconds>0&&game.mode!=="rated"&&<button onClick={()=>setPaused(v=>!v)}>{paused?<PlayIcon size={16}/>:<Pause size={16}/>} {paused?'Resume':'Pause'}</button>}<button onClick={()=>downloadFile('pion-game.pgn',exportPgn(game),'application/x-chess-pgn')}><Download size={16}/> PGN</button></div></div>
      <aside className="game-side">{game.rated&&<div className="rated-status" role="status"><strong>{game.rated.category.toUpperCase()} · Your rating {game.rated.after??game.rated.before}</strong><span>Opponent {game.rated.opponent}</span>{game.rated.delta!==undefined&&<span className={game.rated.delta>=0?'rating-gain':'rating-loss'}>{game.rated.delta>=0?'+':''}{game.rated.delta} points</span>}<small>Local training rating · hints, undo and pause are available in practice.</small></div>}<section className="card game-history"><Suspense fallback={<p className="opening-history-header" role="status">Identifying opening…</p>}><LiveOpening startFen={game.startFen} moves={game.moves}/></Suspense><div className="move-list" aria-label="Move history">{game.san.length?game.san.map((san,i)=><span key={i}>{i%2===0?<small>{i/2+1}.</small>:null}{san}</span>):<p className="muted">Your moves will appear here.</p>}</div>{game.status==='finished'&&<div className="game-history-result" role="status"><h3>{game.reason}</h3><span>{game.result}</span></div>}<p className="save-note">Saved automatically on this device.</p></section>{assists.feedback&&feedback&&<section className="card" aria-label="Provisional move feedback"><span className="eyebrow">PROVISIONAL · PRACTICE</span><h3><MoveBadge kind={feedback.scores.pion.classification}/> {feedback.san} · {feedback.scores.pion.classification}</h3><p>{explain(feedback,preferences.explanation,'pion')}</p><small>Local Stockfish · root depth {feedback.before.candidates[0]?.depth}, played depth {feedback.after.candidates[0]?.depth}. A deeper review may change this result.</small></section>}{!assists.coach&&assists.hints&&hintLevel>0&&<section className="card" aria-label="Practice hint"><span className="eyebrow">Hint {Math.min(3,hintLevel)}/3</span><p role="status">{coachText}</p></section>}{assists.coach&&<Coach text={coachText} thinking={thinking} preferences={preferences} mood={game.status==='finished'?'celebrate':'idle'} onHint={assists.hints&&game.status==='active'?hint:undefined} context={{fen,lastMove:game.moves.at(-1),beforeFen:game.moves.length?replay(game,game.moves.length-1).fen():undefined}}/>}<div className="game-actions">{game.status==='active'?<><button onClick={()=>finish(game.playerColor==='w'?'0-1':'1-0','Resigned')}><Flag size={16}/> Resign</button>{game.mode==='hotseat'&&<button onClick={()=>finish('1/2-1/2','Draw agreed locally')}>Agree draw</button>}</>:<><button className="primary" onClick={()=>navigate('review',game.id)}>Review this game <ArrowRight size={17}/></button><button disabled={starting} onClick={()=>{const next=newGame(game.botId,game.playerColor,game.mode==='rated'?'rated':game.mode==='hotseat'?'hotseat':'bot',game.initialSeconds,game.increment);if(game.rated){const rating=ratings.find(r=>r.id===game.rated!.category)??freshRating(game.rated.category);next.rated={category:game.rated.category,before:rating.value,opponent:matchRating(rating.value)};}next.headers=game.headers;void launch(next);}}><RotateCcw size={16}/> Rematch</button></>}</div></aside></div>
  </div>;
}
function clock(value:number,timed:number):string{if(!timed)return '∞';const s=Math.ceil(value);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
