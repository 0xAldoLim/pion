import type {Attempt,Game,ReviewMove,Repertoire} from '../chess/types';
import type {LearningEvidence,OpeningStudyProgress,Skill,LessonProgress} from './models';
import {CURRICULUM} from '../data/curriculum';
import {lessonStatus,evidenceActivity} from './progress';
import {SCORING_VERSION} from '../chess/scoring';
import {positionIdentity,playUci} from '../chess/rules';
import {Chess} from 'chess.js';
import {moveFacts} from '../coach/facts';
import {positionKey,repertoireIndex} from '../openings/position-index';
export const SKILL_NAMES:Record<Skill,string>={'board-vision':'Board vision','threat-recognition':'Threat recognition',calculation:'Tactical calculation','opening-fundamentals':'Opening fundamentals','opening-recall':'Opening recall','king-safety':'King safety',planning:'Middlegame planning',endgames:'Endgame technique',defense:'Defensive resources'};
/** Identical move histories are one analytical example even when imported repeatedly. */
export function learningGameKey(game:Game){return JSON.stringify([positionKey(game.startFen),game.moves]);}
export function reviewedGames(games:Game[]){
 const valid=games.filter(g=>g.status==='finished'&&g.headers?.PionAssisted!=='true'&&g.review?.completed&&g.review.version===SCORING_VERSION&&g.review.positionId===positionIdentity(g)&&g.review.moves.length===g.moves.length&&g.review.moves.every(r=>r.status==='complete'));
 const unique=new Map<string,Game>();
 for(const game of valid.sort((a,b)=>a.updatedAt-b.updatedAt||a.id.localeCompare(b.id))){const key=`${learningGameKey(game)}|${game.playerColor}`;if(!unique.has(key))unique.set(key,game);}
 return [...unique.values()];
}
export function applicationEvidence(e:LearningEvidence){
 const step=CURRICULUM.find(l=>l.id===e.lessonId)?.steps.find(s=>s.id===e.stepId);
 return e.activity?e.activity==='application':step?.type==='move'&&step.activity==='recognition'?false:evidenceActivity(e)==='application';
}

const issueCache=new WeakMap<ReviewMove,Skill>();
export function issueSkill(row:ReviewMove):Skill {
  const cached=issueCache.get(row);if(cached)return cached;
  const kinds=row.evidence.map(e=>e.kind),played=row.after?.candidates[0],score=played?.score;
  let skill:Skill;
  // A geometric back-rank observation concerns the next side to move. It is not
  // evidence that the mover exposed their own king or caused the reviewed loss.
  if(kinds.includes('allowsMate')||score?.kind==='mate'&&score.winner!==row.color&&row.scores.pion.loss>=0.05)skill='king-safety';
  else if(kinds.includes('hanging'))skill='board-vision';
  else {
    let tacticalReply=false;
    if(played?.pv[0]===row.uci&&played.pv[1])try{tacticalReply=moveFacts(row.fenAfter,played.pv[1]).some(e=>['fork','pin','skewer','doubleAttack','discoveredAttack'].includes(e.kind));}catch{/* A missing/invalid reply cannot support a tactical recommendation. */}
    skill=tacticalReply?'threat-recognition':row.phase==='opening'?'opening-fundamentals':row.phase==='endgame'?'endgames':'calculation';
  }
  issueCache.set(row,skill);return skill;
}
export const lessonFor:Record<Skill,string>={'board-vision':'board-vision','threat-recognition':'forks',calculation:'calculation','opening-fundamentals':'development','opening-recall':'development','king-safety':'king-safety',planning:'open-files',endgames:'queen-mate',defense:'defensive-resources'};
const themeFor:Record<Skill,string>={'board-vision':'hangingPiece','threat-recognition':'fork',calculation:'mateIn2','opening-fundamentals':'opening','opening-recall':'opening','king-safety':'mateIn1',planning:'quietMove',endgames:'endgame',defense:'defensiveMove'};
export function learningFocus(games:Game[],repertoire:Repertoire[]=[],now=Date.now(),progress:LessonProgress[]=[],evidence:LearningEvidence[]=[]){
  const recent=reviewedGames(games).filter(g=>g.updatedAt>=now-30*86400000),issues=recent.flatMap(g=>g.review!.moves.filter(r=>r.color===g.playerColor&&r.scores.pion.loss>=0.05).map(row=>({game:g,row,skill:issueSkill(row)})));
  const groups=(Object.keys(SKILL_NAMES) as Skill[]).map(skill=>({skill,items:issues.filter(i=>i.skill===skill)})).sort((a,b)=>new Set(b.items.map(i=>learningGameKey(i.game))).size-new Set(a.items.map(i=>learningGameKey(i.game))).size||b.items.reduce((n,i)=>n+i.row.scores.pion.loss,0)-a.items.reduce((n,i)=>n+i.row.scores.pion.loss,0)||b.items.length-a.items.length);
  const top=groups.find(g=>g.items.length),count=new Set(top?.items.map(i=>learningGameKey(i.game))).size;
  const assisted=evidence.filter(e=>e.at>=now-30*86400000&&(e.hints>0||e.errors>0)),hinted=(Object.keys(SKILL_NAMES) as Skill[]).map(skill=>({skill,count:assisted.filter(e=>e.skill===skill).length})).sort((a,b)=>b.count-a.count)[0];
  const active=[...progress].sort((a,b)=>b.lastVisited-a.lastVisited).find(p=>p.currentStep!=='summary'&&!(p.currentStep==='recall'&&p.completedExercises.includes('recall'))),next=CURRICULUM.find(l=>l.id===active?.lessonId)??CURRICULUM.find(l=>!lessonStatus(l,progress.find(p=>p.lessonId===l.id)).practiced)??CURRICULUM[0]!;
  const skill=top?.skill??(hinted&&hinted.count>=2?hinted.skill:next.skills[0]!),earlyQueen=issues.filter(i=>i.row.phase==='opening'&&i.row.ply<=8&&playUci(new Chess(i.row.fenBefore),i.row.uci).piece==='q');
  const queenRecurring=new Set(earlyQueen.map(i=>learningGameKey(i.game))).size>=2&&skill==='opening-fundamentals';
  const unfamiliar=recent.flatMap(g=>{const index=repertoireIndex(repertoire.filter(r=>r.color===g.playerColor));return g.review!.moves.filter(r=>r.ply<=20&&r.color===g.playerColor&&r.scores.pion.loss>=0.05&&!index.get(positionKey(r.fenBefore))?.has(r.uci)).map(r=>({gameId:learningGameKey(g),positionId:positionKey(r.fenBefore),ply:r.ply}));}),frequencies=new Map<string,Set<string>>();
  for(const item of unfamiliar){const set=frequencies.get(item.positionId)??new Set();set.add(item.gameId);frequencies.set(item.positionId,set);}
  const repeatedOpeningPositions=[...frequencies].filter(([,ids])=>ids.size>=2).length;
  return {successCriterion:'Compare first-attempt errors and hint use on new positions, then check the same issue per reviewed move in later distinct games. Small samples remain uncertain.',skill,lessonId:queenRecurring?'early-queen':top||hinted&&hinted.count>=2?lessonFor[skill]:next.id,theme:themeFor[skill],gameCount:count,issueCount:top?.items.length??0,repeatedOpeningPositions,sources:top?.items.slice(0,3).map(i=>({gameId:i.game.id,ply:i.row.ply,san:i.row.san}))??[],message:top?`${count} recent completed review${count===1?'':'s'} contain${count===1?'s':''} ${top.items.length} move${top.items.length===1?'':'s'} with a verified loss related to ${SKILL_NAMES[skill].toLowerCase()}. ${count>=2?'This pattern recurs across games.':'This is one game, so treat it as a starting observation.'}`:hinted&&hinted.count>=2?`${hinted.count} recorded exercise completions in ${SKILL_NAMES[skill].toLowerCase()} used hints or followed an earlier error. Try the concept independently, then return for spaced recall.`:progress.length?`Next on your saved learning path: ${next.title}. Practice moves the path forward; independent evidence remains a separate observation.`:'Start by spotting undefended pieces and one-move threats. There is no completed review evidence yet; this is an introductory recommendation.'};
}
export function skillProfiles(games:Game[],attempts:Attempt[],evidence:LearningEvidence[],openings:OpeningStudyProgress[]){
  const themes:Record<Skill,string[]>={'board-vision':['hangingPiece','capturingDefender'],'threat-recognition':['fork','pin','skewer','discoveredAttack','doubleCheck'],calculation:['mateIn2','mateIn3','long','veryLong','sacrifice'],'opening-fundamentals':['opening'],'opening-recall':[],'king-safety':['mateIn1','backRankMate'],planning:['quietMove','zugzwang'],endgames:['endgame','pawnEndgame','rookEndgame'],defense:['defensiveMove']};
  const reviews=reviewedGames(games);const uniqueOpenings=new Map<string,OpeningStudyProgress>();for(const record of openings){const key=`${record.color}|${record.positionId}|${record.move}`,old=uniqueOpenings.get(key);if(!old||record.recallSuccesses>old.recallSuccesses)uniqueOpenings.set(key,record);}
  return (Object.keys(SKILL_NAMES) as Skill[]).map(skill=>{const events=evidence.filter(e=>e.skill===skill),fresh=attempts.filter(a=>a.firstSeen&&a.themes.some(t=>themes[skill].includes(t))),independent=events.filter(e=>e.kind==='transfer'&&applicationEvidence(e)&&e.firstSeen&&e.success&&e.hints===0&&e.errors===0),assisted=events.filter(e=>e.kind==='guided'||e.hints>0||e.errors>0),retained=events.filter(e=>e.kind==='recall'&&e.spaced===true&&e.success&&!e.hints&&!e.errors),reviewIssues=reviews.flatMap(g=>g.review!.moves.filter(r=>r.color===g.playerColor&&r.scores.pion.loss>=0.05&&issueSkill(r)===skill));
    return {skill,name:SKILL_NAMES[skill],recognized:events.filter(e=>!applicationEvidence(e)&&e.success).length,independent:new Set(independent.map(e=>e.positionId)).size,assisted:assisted.length,retained:retained.length,freshPuzzles:fresh.length,puzzleWins:fresh.filter(a=>a.solved&&!a.hints).length,reviewIssues:reviewIssues.length,openingPositions:skill==='opening-recall'?[...uniqueOpenings.values()].filter(s=>s.recallSuccesses>0).length:0,state:independent.length||fresh.length||skill==='opening-recall'&&[...uniqueOpenings.values()].some(s=>s.recallSuccesses>0)?'Observed examples · limited sample':assisted.length?'Guided practice only':reviewIssues.length?'Review evidence available':'Unknown'};});
}
export function issueTrend(games:Game[],skill:Skill,now=Date.now()){return [{label:'Previous 23 days',start:now-30*86400000,end:now-7*86400000},{label:'Last 7 days',start:now-7*86400000,end:now+1}].map(period=>{const sample=reviewedGames(games).filter(g=>g.updatedAt>=period.start&&g.updatedAt<period.end),moves=sample.flatMap(g=>g.review!.moves.filter(r=>r.color===g.playerColor)),issues=moves.filter(r=>r.scores.pion.loss>=0.05&&issueSkill(r)===skill);return {...period,games:new Set(sample.map(learningGameKey)).size,moves:moves.length,issues:issues.length,rate:moves.length?issues.length/moves.length*100:null};});}




/** Completion observations, not a competence score; unanswered attempts are not estimated. */
export function learningOutcomes(evidence:LearningEvidence[],skill:Skill,now=Date.now()){
 return [{label:'Previous 23 days',start:now-30*86400000,end:now-7*86400000},{label:'Last 7 days',start:now-7*86400000,end:now+1}].map(period=>{
  const events=evidence.filter(e=>e.skill===skill&&e.at>=period.start&&e.at<period.end),unique=new Map<string,LearningEvidence>();
  for(const e of events.filter(e=>e.kind==='transfer'&&e.firstSeen&&applicationEvidence(e)).sort((a,b)=>a.at-b.at))if(!unique.has(e.positionId))unique.set(e.positionId,e);
  const fresh=[...unique.values()],errors=fresh.filter(e=>e.errors>0).length,hinted=fresh.filter(e=>e.hints>0).length;
  return {...period,positions:fresh.length,errors,hinted,unaided:fresh.filter(e=>e.success&&!e.errors&&!e.hints).length,errorRate:fresh.length?errors/fresh.length:null,hintRate:fresh.length?hinted/fresh.length:null,retained:events.filter(e=>e.kind==='recall'&&e.spaced&&e.success&&!e.hints&&!e.errors).length};
 });
}
