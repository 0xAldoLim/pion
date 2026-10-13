import {useEffect,useRef,useState} from 'react';
import {Chess,type Color} from 'chess.js';
import {ArrowRight,Flag,FlipVertical2,Lightbulb,Pause,Play as PlayIcon,RotateCcw,Undo2,Download} from 'lucide-react';
import {Board} from '../../components/Board';
import {Character} from '../../components/Character';
import {Coach} from '../../components/Coach';
import {EvalBar} from '../../components/Evaluation';
import {useApp} from '../../app/context';
import {BOTS,botById,chooseBotMove} from '../bots/bots';
import {newGame,outcome,playUci,replay,uciOf,exportPgn} from '../../chess/rules';
import type {Game,Evaluation} from '../../chess/types';
import {engine} from '../../engine/manager';
import {db,saveGame} from '../../storage/db';
import {downloadFile} from '../../storage/backup';
import {positionAdvice,moveFacts} from '../../coach/facts';
import {progressiveHint,describeMove} from '../../coach/commentary';
import {playSound} from '../../components/sound';
import {settleClock} from '../../chess/clocks';

export default function PlayScreen(){
  const {preferences,navigate,notify,selectedId}=useApp();
  const [game,setGame]=useState<Game|null>(null);const gameRef=useRef<Game|null>(null);gameRef.current=game;
  const [botId,setBotId]=useState('pebble');const [color,setColor]=useState('w');const [mode,setMode]=useState<'bot'|'hotseat'>('bot');
  const [seconds,setSeconds]=useState(0);const [increment,setIncrement]=useState(0);
  const [flipped,setFlipped]=useState(false);const [thinking,setThinking]=useState(false);const [error,setError]=useState('');const [paused,setPaused]=useState(false);
  const [coachText,setCoachText]=useState('Before you move, look for checks, captures, and threats.');const [hintLevel,setHintLevel]=useState(0);const [evalResult,setEvalResult]=useState<Evaluation>();const [resetKey,setResetKey]=useState(0);
  const [retry,setRetry]=useState(0);const clockTick=useRef(performance.now());
  useEffect(()=>{let alive=true;(async()=>{const saved=selectedId?await db.games.get(selectedId):await db.games.where('status').equals('active').last();if(alive&&saved){setGame(saved);setBotId(saved.botId);setCoachText(positionAdvice(replay(saved).fen()));}})().catch(e=>notify(String(e)));return()=>{alive=false;};},[selectedId,notify]);
  useEffect(()=>()=>{if(gameRef.current)void saveGame(gameRef.current);},[]);
  const commit=(next:Game)=>{gameRef.current=next;setGame(next);void saveGame(next).catch(e=>{setError(`Saving failed: ${String(e)}. Export this game now.`);});};
  useEffect(()=>{
    clockTick.current=performance.now();if(!game?.initialSeconds||game.status!=='active'||paused)return;
    const interval=setInterval(()=>{
      const current=gameRef.current;if(!current||current.status!=='active')return;
      const elapsed=(performance.now()-clockTick.current)/1000;clockTick.current=performance.now();
      const turn=replay(current).turn();const clocks=settleClock(current,turn,elapsed);
      const timeout=clocks[turn]<=0;
      const next={...current,clocks,...(timeout?{status:'finished' as const,result:turn==='w'?'0-1':'1-0',reason:'Time expired'}:{})};
      commit(next);
    },500);
    return()=>clearInterval(interval);
    // The ref carries clock/move updates without restarting the timer each tick.
  },[game?.id,game?.status,paused]);
  const fen=game?replay(game).fen():new Chess().fen();const bot=botById(game?.botId??botId);const chess=new Chess(fen);
  const playerTurn=!!game&&(game.mode==='hotseat'||chess.turn()===game.playerColor);
  function move(uci:string){
    const current=gameRef.current;if(!current||current.status!=='active'||paused)return;
    const c=replay(current);const before=c.fen();
    try {
      const now=performance.now();const clocks=settleClock(current,c.turn(),(now-clockTick.current)/1000);clockTick.current=now;
      if(current.initialSeconds&&clocks[c.turn()]===0){commit({...current,clocks,status:'finished',result:c.turn()==='w'?'0-1':'1-0',reason:'Time expired'});setResetKey(k=>k+1);return;}
      const m=playUci(c,uci);const result=outcome(c);
      if(current.initialSeconds)clocks[m.color]+=current.increment;
      const next={...current,moves:[...current.moves,uciOf(m)],san:[...current.san,m.san],clocks,review:undefined,...(result?{...result,status:'finished' as const}:{})};
      commit(next);setHintLevel(0);setEvalResult(undefined);setError('');
      const facts=moveFacts(before,uci);
      const important=facts.some(f=>['hanging','allowsMate','fork','mate','pin','skewer','discoveredAttack','promotion'].includes(f.kind));
      if(preferences.coach!=='important'||important||result)setCoachText(describeMove(before,uci,preferences.explanation,preferences.coach==='training'));
      if(current.mode==='bot'&&m.color!==current.playerColor&&m.captured)setCoachText(text=>`${text} ${botById(current.botId).name}: “${botById(current.botId).lines.capture}”`);
      if(preferences.sound)playSound(!!m.captured,result?.reason==='Checkmate');
    }catch(e){setError(e instanceof Error?e.message:'Illegal move.');setResetKey(k=>k+1);}
  }
  const searchKey=game?`${game.id}:${game.moves.join(',')}:${paused}:${retry}`:'';
  useEffect(()=>{
    const current=gameRef.current;if(!current||current.status!=='active'||current.mode!=='bot'||paused||replay(current).turn()===current.playerColor){setThinking(false);return;}
    const controller=new AbortController();const identity=current.id+':'+current.moves.join(',');setThinking(true);setError('');
    const bot=botById(current.botId);const pace={quick:0.5,standard:1,thoughtful:3}[preferences.botPace??'standard'];const settings={...preferences.engine,pack:'lite' as const,depth:bot.depth,timeMs:Math.max(100,Math.round(bot.timeMs*pace*(0.8+Math.random()*0.4))),multiPv:bot.skill<10?8:4,profile:'custom' as const};
    engine.analyze(replay(current).fen(),settings,{signal:controller.signal,priority:10,skill:bot.skill}).then(result=>{
      if(controller.signal.aborted||gameRef.current?.id+':'+gameRef.current?.moves.join(',')!==identity)return;
      move(chooseBotMove(bot,replay(current).fen(),result,current.san));
    }).catch(e=>{if(!controller.signal.aborted)setError(`Bot engine: ${e instanceof Error?e.message:String(e)}`);}).finally(()=>{if(!controller.signal.aborted)setThinking(false);});
    return()=>controller.abort();
    // Only the position identity changes the search; clock ticks cannot restart it.
  },[searchKey]);
  useEffect(()=>{
    const current=gameRef.current;if(!current||current.status!=='active'||!playerTurn||paused||(!preferences.showEval&&preferences.coach!=='training'))return;
    const controller=new AbortController();const position=replay(current).fen();
    engine.analyze(position,{...preferences.engine,pack:'lite',timeMs:Math.min(1000,preferences.engine.timeMs),multiPv:1},{signal:controller.signal,priority:3}).then(result=>{if(!controller.signal.aborted&&gameRef.current&&replay(gameRef.current).fen()===position)setEvalResult(result);}).catch(()=>{/* Manual hints/analysis expose recoverable engine errors. */});
    return()=>controller.abort();
  },[searchKey,playerTurn,preferences.showEval,preferences.coach]);
  function start(){const selected:Color=color==='random'?(Math.random()<0.5?'w':'b'):color as Color;const created=newGame(botId,selected,mode,seconds,increment);commit(created);setFlipped(false);setPaused(false);setError('');setCoachText(botById(botId).lines.hello);}
  async function hint(){if(!game||game.status!=='active'||thinking)return;const position=fen;setThinking(true);try{const result=await engine.analyze(position,{...preferences.engine,multiPv:1},{priority:10});if(replay(gameRef.current!).fen()!==position)return;setEvalResult(result);const level=hintLevel+1;setHintLevel(level);setCoachText(progressiveHint(position,result.candidates[0]!.pv,Math.min(3,level)));}catch(e){setError(String(e));}finally{setThinking(false);}}
  function undo(){if(!game||!game.moves.length)return;const count=game.mode==='bot'&&replay(game).turn()===game.playerColor?2:1;commit({...game,moves:game.moves.slice(0,-count),san:game.san.slice(0,-count),status:'active',result:'*',reason:'',review:undefined});setCoachText('Position restored. Clocks retain their remaining practice time.');setEvalResult(undefined);}
  function finish(result:string,reason:string){if(game)commit({...game,status:'finished',result,reason});}
  const orientation=(game?.playerColor==='b')!==flipped?'black':'white';
  if(!game)return <>
    <div className="page-intro"><div><span className="eyebrow">A WORTHY OPPONENT</span><h1>Find your next challenge.</h1><p>Start small. Think a little deeper. Every game is a chance to grow.</p></div><Character seed={bot.shape} color={bot.color} mood="happy" size={120}/></div>
    <div className="bot-grid">{BOTS.map(b=><button className={`bot-card ${b.id===botId?'selected':''}`} key={b.id} onClick={()=>setBotId(b.id)} aria-pressed={b.id===botId}><Character seed={b.shape} color={b.color} size={86}/><strong>{b.name}</strong><span>{b.band}</span><small>≈ {b.rating} · estimate</small></button>)}</div>
    <section className="setup-card card"><div><h2>{bot.name} is ready.</h2><p>{bot.tagline}</p><small className="muted">Strength bands are provisional until calibration is supported by repeated games.</small></div><div className="setup-fields"><label>Mode<select aria-label="Mode" value={mode} onChange={e=>setMode(e.target.value as 'bot'|'hotseat')}><option value="bot">Play a bot</option><option value="hotseat">Local hotseat</option></select></label><label>Your color<select aria-label="Your color" value={color} onChange={e=>setColor(e.target.value)}><option value="w">White</option><option value="b">Black</option><option value="random">Random</option></select></label><label>Time control<select aria-label="Time control" value={seconds} onChange={e=>setSeconds(Number(e.target.value))}><option value={0}>Casual · no clock</option><option value={180}>3 minutes</option><option value={300}>5 minutes</option><option value={600}>10 minutes</option><option value={1800}>30 minutes</option><option value={seconds||900}>Custom</option></select></label><label>Custom seconds<input type="number" min={0} max={86400} value={seconds} onChange={e=>setSeconds(Math.min(86400,Math.max(0,Number(e.target.value))))}/></label><label>Increment (sec)<input type="number" min={0} max={600} value={increment} onChange={e=>setIncrement(Math.min(600,Math.max(0,Number(e.target.value))))}/></label></div><button className="primary" onClick={start}>Start game <ArrowRight size={18}/></button></section>
  </>;
  return <>
    <div className="page-intro compact"><div><span className="eyebrow">PLAY & DISCOVER</span><h1>{game.mode==='hotseat'?'A game for two.':`Your move, your journey.`}</h1></div><button onClick={()=>setGame(null)}>Choose another opponent</button></div>
    {error&&<div className="error" role="alert">{error} <button onClick={()=>setRetry(r=>r+1)}>Retry engine</button></div>}
    <div className="game-layout"><div className="board-column"><div className="player-strip"><Character seed={bot.shape} color={bot.color} size={45}/><div><strong>{game.mode==='hotseat'?'Black':bot.name}</strong><small>{thinking?'Thinking…':bot.band}</small></div><span className="clock">{clock(game.clocks[game.mode==='hotseat'?'b':game.playerColor==='w'?'b':'w'],game.initialSeconds)}</span></div><div className="board-row">{preferences.showEval&&<EvalBar score={evalResult?.candidates[0]?.score}/>}<Board fen={fen} orientation={orientation} enabled={game.status==='active'&&playerTurn&&!paused&&!thinking} onMove={move} lastMove={game.moves.at(-1)} resetKey={resetKey} animation={preferences.animation&&!preferences.reducedMotion}/></div><div className="player-strip you"><span className="player-icon">♙</span><div><strong>{game.mode==='hotseat'?'White':'You'}</strong><small>{game.status==='finished'?`${game.result} · ${game.reason}`:paused?'Clocks paused':`${chess.turn()==='w'?'White':'Black'} to move${chess.inCheck()?' · Check':''}`}</small></div><span className="clock">{clock(game.clocks[game.mode==='hotseat'?'w':game.playerColor],game.initialSeconds)}</span></div><div className="board-controls"><button onClick={()=>setFlipped(v=>!v)}><FlipVertical2 size={16}/> Flip</button><button onClick={undo} disabled={!game.moves.length}><Undo2 size={16}/> Undo</button><button onClick={hint} disabled={thinking||game.status!=='active'}><Lightbulb size={16}/> Hint</button>{game.initialSeconds>0&&<button onClick={()=>setPaused(v=>!v)}>{paused?<PlayIcon size={16}/>:<Pause size={16}/>} {paused?'Resume':'Pause'}</button>}<button onClick={()=>downloadFile('pion-game.pgn',exportPgn(game),'application/x-chess-pgn')}><Download size={16}/> PGN</button></div></div>
      <aside className="game-side"><section className="card"><span className="eyebrow">THE GAME SO FAR</span><h2>{thinking?'A moment to think.':game.status==='finished'?game.reason:'Make it count.'}</h2><div className="move-list" aria-label="Move history">{game.san.length?game.san.map((san,i)=><span key={i}>{i%2===0?<small>{i/2+1}.</small>:null}{san}</span>):<p className="muted">Your moves will appear here.</p>}</div><div className="captured"><small>Captured</small><span>{replay(game).history({verbose:true}).filter(m=>m.captured).map(m=>({p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'})[m.captured!]).join(' ')||'—'}</span></div><p className="save-note">Saved automatically on this device.</p></section><Coach text={coachText} thinking={thinking} preferences={preferences} mood={game.status==='finished'?'celebrate':'idle'} onHint={hint}/><div className="game-actions">{game.status==='active'?<><button onClick={()=>finish(game.playerColor==='w'?'0-1':'1-0','Resigned')}><Flag size={16}/> Resign</button>{game.mode==='hotseat'&&<button onClick={()=>finish('1/2-1/2','Draw agreed locally')}>Agree draw</button>}</>:<><button className="primary" onClick={()=>navigate('review',game.id)}>Review this game <ArrowRight size={17}/></button><button onClick={()=>{commit(newGame(game.botId,game.playerColor,game.mode==='hotseat'?'hotseat':'bot',game.initialSeconds,game.increment));setPaused(false);}}><RotateCcw size={16}/> Rematch</button></>}</div></aside></div>
  </>;
}
function clock(value:number,timed:number):string{if(!timed)return '∞';const s=Math.ceil(value);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
