import {useEffect,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import type {Key} from '@lichess-org/chessground/types';
import {ArrowRight,Download,FlipVertical2,Square,Upload} from 'lucide-react';
import {Board} from '../../components/Board';
import {MoveBadge} from '../../components/MoveBadge';
import {Coach} from '../../components/Coach';
import {EvalGraph} from '../../components/Evaluation';
import {MoveNavigation,ScoringToggle} from '../../components/controls';
import {useApp} from '../../app/context';
import {db,saveGame} from '../../storage/db';
import {exportPgn,importPgn,lineSan,positionIdentity,replay} from '../../chess/rules';
import {CLASSES,type Game,type ReviewMove,type ScoringMode} from '../../chess/types';
import {formatScore,gameAccuracy,performanceBand} from '../../chess/scoring';
import {analyzeGame,rememberMistakes,reviewIdentity} from './analyze';
import {explain} from '../../coach/commentary';
import {downloadFile,validCachedReview} from '../../storage/backup';
import {identifyOpening} from '../../data/openings';
import {botById} from '../bots/bots';

export default function Review(){
  const {selectedId,navigate,preferences,notify}=useApp();const library=useLiveQuery(()=>db.games.orderBy('updatedAt').reverse().toArray(),[],[]);
  const [compare,setCompare]=useState(false);const [game,setGame]=useState<Game>();const [rows,setRows]=useState<ReviewMove[]>([]);const [current,setCurrent]=useState(0);const [mode,setMode]=useState<ScoringMode>('pion');const [running,setRunning]=useState(false);const [error,setError]=useState('');const [pgn,setPgn]=useState('');const [flipped,setFlipped]=useState(false);const controller=useRef<AbortController|null>(null);
  useEffect(()=>{let alive=true;if(selectedId)void db.games.get(selectedId).then(g=>{if(alive&&g){setGame(g);setRows(validCachedReview(g)?g.review!.moves:[]);setCurrent(g.moves.length);}});return()=>{alive=false;controller.current?.abort();};},[selectedId]);
  async function importGame(){try{const g=importPgn(pgn);await saveGame(g);navigate('review',g.id);}catch(e){setError(String(e));}}
  async function run(){if(!game||!game.moves.length)return;controller.current?.abort();const abort=new AbortController();controller.current=abort;setRunning(true);setRows([]);setError('');
    const settings={...preferences.engine,multiPv:Math.max(3,preferences.engine.multiPv)};const identity=positionIdentity(game);
    try{const analyzed=await analyzeGame(game,settings,abort.signal,async partial=>{
      const latest=await db.games.get(game.id);if(!latest||positionIdentity(latest)!==identity){abort.abort();throw new Error('The game changed. Restart its review.');}
      setRows(partial);await db.games.update(game.id,{review:{moves:partial,completed:false,settings,...reviewIdentity(game)}});
    });
    const review={moves:analyzed,completed:true,settings,...reviewIdentity(game)};await db.games.update(game.id,{review});setGame({...game,review});await rememberMistakes(game,analyzed);notify('Review saved. Instructive mistakes are ready to practice.');
    }catch(e){if(abort.signal.aborted)notify('Review stopped. Completed moves remain saved.');else setError(String(e));}finally{setRunning(false);}
  }
  async function retryMistake(row:ReviewMove){if(!game)return;await rememberMistakes(game,[row]);const id=`mistake:${game.id}:${row.ply}`;await db.puzzles.put({id,fen:row.fenBefore,moves:row.before.candidates[0]!.pv.slice(0,8),rating:800,themes:[row.phase,...row.evidence.map(e=>e.kind)],source:`pion:game/${game.id}`,license:'User-owned local game',attribution:'Your personal mistake bank',setup:false,explanation:`Compare the engine's suggested ${row.bestSan}. ${row.evidence[0]?.text??''}`});navigate('puzzles',id);}
  if(!selectedId||!game)return <>
    <div className="page-intro"><div><span className="eyebrow">UNDERSTAND YOUR GAME</span><h1>Every game has a lesson.</h1><p>Review a saved game or bring a PGN. Analysis stays on your device.</p></div></div>
    {error&&<div className="error" role="alert">{error}</div>}
    <section className="card" style={{marginBottom:24}}><h2>Bring a game</h2><p>Paste one PGN (up to 1 MB), including optional FEN headers.</p><label style={{margin:'15px 0'}}>PGN<textarea aria-label="PGN import" value={pgn} onChange={e=>setPgn(e.target.value)} placeholder={'[White "You"]\n[Black "Opponent"]\n\n1. e4 e5 2. Nf3 Nc6'}/></label><div className="settings-actions"><button className="primary" onClick={()=>void importGame()} disabled={!pgn.trim()}><Upload size={15}/> Import PGN</button><label className="file-label">Or choose a .pgn file<input type="file" accept=".pgn,text/plain" onChange={e=>{const file=e.target.files?.[0];if(file){if(file.size>1_000_000){setError('PGN exceeds 1 MB.');return;}void file.text().then(setPgn);}}}/></label></div></section>
    <h2 style={{marginBottom:16}}>Your game library</h2>{library.length?<div className="game-table">{library.map(g=><button key={g.id} onClick={()=>navigate('review',g.id)}><span className="game-icon">♜</span><span><strong>{g.headers?.White??'You'} vs {g.headers?.Black??botById(g.botId).name}</strong><small>{g.moves.length} half-moves · {new Date(g.updatedAt).toLocaleDateString()}</small></span><span className="mini-tag">{g.review?.completed?'Reviewed':g.result}</span><ArrowRight size={16}/></button>)}</div>:<div className="empty-inline">Play a game to start your library, or import a PGN above.</div>}
  </>;
  const row=rows[current-1];const fen=replay(game,current).fen();const score=current?row?.after.candidates[0]?.score:rows[0]?.before.candidates[0]?.score;const white=gameAccuracy(rows,'w',mode);const black=gameAccuracy(rows,'b',mode);
  const arrows=row&&compare&&preferences.highlights?[{orig:row.bestMove.slice(0,2) as Key,dest:row.bestMove.slice(2,4) as Key,brush:'green'}]:[];
  const boardFen=row&&compare?row.fenBefore:fen;
  const counts=CLASSES.map(label=>({label,count:rows.filter(r=>r.scores[mode].classification===label).length}));const opening=[...rows].reverse().map(r=>identifyOpening(r.fenAfter)).find(Boolean);
  return <>
    <div className="page-intro compact"><div><span className="eyebrow">SEE THE TURNING POINTS</span><h1>Your game, understood.</h1><p>{game.headers?.White??'You'} vs {game.headers?.Black??botById(game.botId).name} · {game.result}</p></div><button onClick={()=>navigate('review')}>Game library</button></div>
    <div className="filters"><ScoringToggle mode={mode} onChange={setMode}/><span className="mini-tag">{preferences.engine.profile} · {preferences.engine.timeMs} ms / position</span>{running?<button onClick={()=>controller.current?.abort()}><Square size={14}/> Stop review · {rows.length}/{game.moves.length}</button>:<button className="primary" onClick={()=>void run()} disabled={!game.moves.length}>Run {rows.length?'new ':''}review <ArrowRight size={15}/></button>}<button onClick={()=>navigate('settings')}>Analysis settings</button></div>
    {error&&<div className="error" role="alert">{error}</div>}
    <div className="game-layout"><div className="board-column"><div className="board-row"><Board evaluation={{score}} classification={row&&!compare?row.scores[mode].classification:undefined} fen={boardFen} orientation={flipped?'black':'white'} arrows={arrows} lastMove={game.moves[current-1]} animation={preferences.animation&&!preferences.reducedMotion}/></div>{row&&compare&&<p className="save-note">Showing the position before {row.san}; green arrow = engine candidate.</p>}<MoveNavigation current={current} total={game.moves.length} onChange={setCurrent}/><div className="board-controls"><button aria-pressed={compare} onClick={()=>setCompare(v=>!v)}>{compare?"Show played move":"Show best move"}</button><button onClick={()=>setFlipped(v=>!v)}><FlipVertical2 size={14}/> Flip</button><button onClick={()=>downloadFile('pion-review.pgn',exportPgn({...game,review:{moves:rows,completed:rows.length===game.moves.length,settings:preferences.engine,...reviewIdentity(game)}},mode,true),'application/x-chess-pgn')}><Download size={14}/> Annotated PGN</button><button onClick={()=>navigate('analysis',encodeURIComponent(fen))}>Explore position</button></div><section className="card" style={{marginTop:18}}><span className="eyebrow">EVALUATION TIMELINE</span><EvalGraph rows={rows} current={Math.min(current,rows.length)} onSelect={setCurrent}/><p className="save-note">White’s win percentage · {rows.length} completed positions. {running||rows.length<game.moves.length?'Partial analysis; game totals are provisional.':'Review complete.'}</p></section></div>
    <aside className="game-side"><section className="card"><div className="accuracy-grid">{([{name:'White',value:white},{name:'Black',value:black}]).map(side=><div className="accuracy-card" key={side.name}><span>{side.name}</span><strong>{side.value===null?'—':side.value.toFixed(1)}</strong><small>{mode==='pion'?'Independent accuracy':'Expected-points accuracy'}</small></div>)}</div><div className="badge-totals">{counts.map(({label,count})=><span key={label} className={`classification ${label}`}><MoveBadge kind={label}/>{label} {count}</span>)}</div><p className="save-note">{opening?`${opening.eco} · ${opening.name}`:'No named opening identified yet.'}</p><p className="save-note">Performance band: {performanceBand(game.playerColor==='w'?white:black,rows.filter(r=>r.color===game.playerColor).length)}. Uncalibrated heuristic (300 + 17 × accuracy, ±500), not a rating.</p></section>
    <section className="card"><span className="eyebrow">MOVE BY MOVE</span><div className="move-list">{game.san.map((san,i)=><button key={i} onClick={()=>setCurrent(i+1)} className={current===i+1?'active':''}>{i%2===0?<small>{i/2+1}.</small>:null}{san}{rows[i]&&<span className={`classification ${rows[i]!.scores[mode].classification}`}><MoveBadge kind={rows[i]!.scores[mode].classification}/>{rows[i]!.scores[mode].classification}</span>}</button>)}</div></section>
    <Coach text={row?explain(row,preferences.explanation,mode):'Choose an analyzed move to see its verified explanation.'} preferences={preferences} thinking={false} mood={row?.scores[mode].classification==='brilliant'?'surprised':row?.scores[mode].loss&&row.scores[mode].loss>=0.1?'sad':'idle'}/>
    {row&&<section className="card"><span className="eyebrow">ENGINE LINES · {formatScore(row.before.candidates[0]?.score)}</span><div className="review-lines">{row.before.candidates.map((candidate,i)=><p key={i}>{formatScore(candidate.score)} · {lineSan(row.fenBefore,candidate.pv.slice(0,8)).join(' ')} <small>(d{candidate.depth})</small></p>)}</div>{row.bestMove!==row.uci&&<button className="primary" style={{marginTop:16}} onClick={()=>void retryMistake(row)}>Retry this position</button>}</section>}
    </aside></div>
    {!!rows.length&&<section className="card" style={{marginTop:25}}><h2>What to remember</h2><div className="library-grid" style={{marginTop:20}}>{(['opening','middlegame','endgame']as const).map(phase=><div key={phase}><h3 style={{textTransform:'capitalize',marginBottom:10}}>{phase}</h3><p>{rows.filter(r=>r.phase===phase).length} analyzed half-moves; {rows.filter(r=>r.phase===phase&&r.scores[mode].loss>=0.1).length} mistakes or missed opportunities.</p></div>)}</div><div className="branch-list">{[...rows].sort((a,b)=>b.scores[mode].loss-a.scores[mode].loss).slice(0,5).map(r=><button key={r.ply} onClick={()=>setCurrent(r.ply)}>Move {r.ply}: {r.san} <span className={`classification ${r.scores[mode].classification}`}>{r.scores[mode].classification}</span></button>)}</div></section>}
  </>;
}
