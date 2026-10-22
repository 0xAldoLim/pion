import {useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '../../app/context';
import {db} from '../../storage/db';
import type {Game} from '../../chess/types';
import {lineSan,replay} from '../../chess/rules';
import {compareRepertoire,saveReviewBranch,curatedCourseInGame} from '../../openings/review';
import {studyRoute} from '../../openings/context';
import {openingExplanation} from '../../openings/teaching';
import {issueSkill,lessonFor} from '../../learning/recommendations';
import {validCachedReview} from '../../storage/backup';
import {OPENING_COURSES} from '../../data/opening-courses';
import {moveConsequence} from '../../coach/consequences';
export function OpeningReview({game,current,onSelect}:{game:Game;current:number;onSelect:(ply:number)=>void}){
 const {navigate,notify}=useApp(),lines=useLiveQuery(()=>db.repertoire.toArray(),[],[]),[parent,setParent]=useState('');
 const decisions=compareRepertoire(game,lines),first=decisions.find(d=>['deviation','known-alternative','line-ended'].includes(d.status)),selected=decisions.find(d=>d.ply===current),row=validCachedReview(game)&&game.review?.completed?game.review.moves[current-1]:undefined;
 const savedId=lines.find(l=>selected?.lineIds.includes(l.id))?.openingId??game.headers?.PionOpening,course=OPENING_COURSES.find(c=>c.id===savedId)??curatedCourseInGame(game,current);
 const fen=replay(game,current).fen(),openingId=course?.id,lesson=row&&row.scores.pion.loss>=0.05?lessonFor[issueSkill(row)]:'development';
 const context={mode:'explore' as const,fen,startFen:game.startFen,moves:game.moves.slice(0,current),name:'My reviewed opening',color:game.playerColor,openingId,returnGameId:game.id,returnPly:current};
 const candidate=row?.before.candidates[0]?.pv.slice(0,6),consequence=row&&row.scores.pion.loss>=0.05?moveConsequence(row):undefined;
 return <section className="card opening-review"><span className="eyebrow">CONNECT YOUR OPENING STUDY</span><h2>Your repertoire in this game</h2>{course&&<p>Related opening family: {course.name}. The game’s actual positions determine this link, even if later moves leave the installed line.</p>}<p>{first?`At half-move ${first.ply}, ${lineSan(first.fen,[first.move])[0]} ${first.status==='known-alternative'?'is another known ECO continuation':first.status==='line-ended'?'continues beyond the end of a saved line':'leaves a saved continuation'}.`:'No matching repertoire deviation was identified. Unstored positions are unfamiliar to the installed repertoire, not automatically mistakes.'}</p>
 <div className="study-actions">{decisions.map(d=><button key={d.ply} onClick={()=>onSelect(d.ply)}>{d.ply}. {lineSan(d.fen,[d.move])[0]} · {d.status.replaceAll('-',' ')}{d.tacticalMistake?' · reviewed tactical loss':''}</button>)}</div>
 {selected&&<p>{openingExplanation(selected.fen,selected.move)}</p>}{consequence&&<p>{consequence.reason}</p>}
 <p className="save-note">A repertoire deviation is not automatically an error. Only a completed current local review establishes the loss marker; the searched reply explains what your opponent could do.</p>
 <div className="study-actions"><button onClick={()=>navigate('openings',studyRoute(context))}>Explore the selected position</button>{candidate?.length&&row&&current<=20&&<button onClick={()=>navigate('openings',studyRoute({...context,mode:'practice',fen:row.fenBefore,moves:game.moves.slice(0,current-1),color:row.color,continuation:candidate,practiceMode:'recall'}))}>{row.scores.pion.loss>=0.05?'Practice the missed continuation':'Recall this continuation'}</button>}
 {OPENING_COURSES.some(c=>c.id===openingId)&&<button onClick={()=>navigate('openings',openingId)}>Open the matching opening lesson</button>}<button onClick={()=>navigate('learn',lesson)}>Study the relevant idea</button>
 <label>Save under<select aria-label="Repertoire destination" value={parent} onChange={e=>setParent(e.target.value)}><option value="">New review branch</option>{lines.filter(r=>r.color===game.playerColor).map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select></label><button disabled={current<1||current>20} onClick={()=>void saveReviewBranch(game,current,lines.find(r=>r.id===parent)).then(()=>notify('Reviewed variation saved. Existing line schedules are preserved.')).catch(e=>notify(String(e)))}>Save reviewed position</button><button onClick={()=>navigate('openings','repertoire')}>Study my repertoire</button></div></section>;
}
