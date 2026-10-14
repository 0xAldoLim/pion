import {z} from 'zod';
import {db, type PionDatabase} from './db';
import {engineSchema,MAX_BACKUP_BYTES,UCI,validatePuzzle} from './validation';
import {positionIdentity,replay,validFen} from '../chess/rules';
import {SCORING_VERSION} from '../chess/scoring';
import type {Game} from '../chess/types';
import {validateReview} from './review-validation';

const timestamp=z.number().finite().nonnegative();
const id=z.string().min(1).max(150);
const repetition={interval:z.number().min(0).max(36500),ease:z.number().min(1).max(5),due:timestamp,successes:z.number().int().min(0),failures:z.number().int().min(0)};
const count=z.number().int().min(0).max(100000);
const lessonProgress=z.object({version:z.literal(1),lessonId:id,currentStep:id,viewedSteps:z.array(id).max(200),completedExercises:z.array(id).max(200),hintCount:count,stepHints:z.record(id,z.number().int().min(0).max(3)),stepErrors:z.record(id,count),lastVisited:timestamp,masteryEvidence:z.array(id).max(10000),...repetition});
const learningEvidence=z.object({version:z.literal(1),id,lessonId:id,stepId:id,positionId:z.string().max(160),skill:z.enum(['board-vision','threat-recognition','calculation','opening-fundamentals','opening-recall','king-safety','planning','endgames','defense']),at:timestamp,success:z.boolean(),hints:count,errors:count,kind:z.enum(['guided','transfer','recall']),firstSeen:z.boolean()});
const openingStudy=z.object({version:z.literal(1),id,openingId:id,positionId:z.string().max(160),color:z.enum(['w','b']),reviewedAt:timestamp,errors:count,hintsUsed:count,recallSuccesses:count,mode:z.enum(['guided','recall']),move:UCI,...repetition});
const game=z.object({id,createdAt:timestamp,updatedAt:timestamp,startFen:z.string().max(160),moves:z.array(UCI).max(1000),san:z.array(z.string().max(30)).max(1000),mode:z.enum(['bot','hotseat','import','rated']),rated:z.object({category:z.enum(['blitz','rapid']),opponent:z.number().int().min(100).max(5000),before:z.number().int().min(100).max(5000),delta:z.number().int().min(-32).max(32).optional(),after:z.number().int().min(100).max(5000).optional()}).optional(),botId:z.string().max(100),playerColor:z.enum(['w','b']),status:z.enum(['active','finished']),result:z.enum(['*','1-0','0-1','1/2-1/2']),reason:z.string().max(500),initialSeconds:z.number().min(0).max(86400),increment:z.number().min(0).max(600),clocks:z.object({w:z.number().min(0).max(1_000_000),b:z.number().min(0).max(1_000_000)}),headers:z.record(z.string().max(100),z.string().max(1000)).optional(),review:z.unknown().optional()});
const preferences=z.object({premoves:z.boolean().default(true),botPace:z.enum(['quick','standard','thoughtful']).default('standard'),id:z.literal('main'),colorMode:z.enum(['light','dark']).default('light'),theme:z.enum(['forest','slate','sand','ocean','walnut','violet','tournament']),pieces:z.enum(['classic','outline','neo','wood']),sound:z.boolean(),animation:z.boolean(),reducedMotion:z.boolean(),largeText:z.boolean(),contrast:z.boolean(),coach:z.enum(['off','important','every','training']),explanation:z.enum(['quick','educational','deep']),voice:z.boolean(),highlights:z.boolean(),showEval:z.boolean(),engine:engineSchema,puzzleRating:z.number().min(100).max(4000),training:z.object({tactics:z.number().min(0).max(100),games:z.number().min(0).max(100),mistakes:z.number().min(0).max(100),openings:z.number().min(0).max(100),endgames:z.number().min(0).max(100)})});
const schema=z.object({format:z.literal('pion-backup'),version:z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4)]),lessonProgress:z.array(lessonProgress).max(5000).default([]),learningEvidence:z.array(learningEvidence).max(100000).default([]),openingStudy:z.array(openingStudy).max(20000).default([]),ratings:z.array(z.object({id:z.enum(['blitz','rapid']),value:z.number().int().min(100).max(5000),games:z.number().int().nonnegative(),wins:z.number().int().nonnegative(),losses:z.number().int().nonnegative(),draws:z.number().int().nonnegative(),updatedAt:timestamp})).max(2).default([]),createdAt:timestamp,games:z.array(game).max(5000),preferences:z.array(preferences).max(1),attempts:z.array(z.object({id,puzzleId:id,at:timestamp,solved:z.boolean(),hints:z.number().int().min(0).max(10),firstSeen:z.boolean(),rating:z.number().min(100).max(4000),themes:z.array(z.string().max(80)).max(25),duration:z.number().min(0),mode:z.enum(['practice','rush','mistake','master'])})).max(100_000),mistakes:z.array(z.object({id,gameId:id,ply:z.number().int().positive(),fen:z.string().max(160),move:UCI,line:z.array(UCI).max(50),tags:z.array(z.string().max(80)).max(25),source:z.string().max(2000),license:z.string().max(200),...repetition})).max(20_000),repertoire:z.array(z.object({id,openingId:id,name:z.string().max(500),moves:z.array(UCI).max(100),color:z.enum(['w','b']),...repetition})).max(5000),training:z.array(z.object({id,at:timestamp,kind:z.enum(['lesson','opening','endgame']),target:id,success:z.boolean(),hints:z.number().int().min(0).max(10)})).max(100_000),puzzles:z.array(z.unknown()).max(25_000)});

export async function createBackup(database:PionDatabase=db):Promise<string> {
  return database.transaction('r',database.tables.filter(t=>t.name!=='packs'),async()=>JSON.stringify({format:'pion-backup',version:4,lessonProgress:await database.lessonProgress.toArray(),learningEvidence:await database.learningEvidence.toArray(),openingStudy:await database.openingStudy.toArray(),ratings:await database.ratings.toArray(),createdAt:Date.now(),games:await database.games.toArray(),preferences:await database.preferences.toArray(),attempts:await database.attempts.toArray(),mistakes:await database.mistakes.toArray(),repertoire:await database.repertoire.toArray(),training:await database.training.toArray(),puzzles:await database.puzzles.toArray()},null,2));
}
export async function restoreBackup(text:string,database:PionDatabase=db):Promise<void> {
  if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('Backup exceeds the 20 MB limit.');
  const data=schema.parse(JSON.parse(text));
  const games:Game[]=data.games.map(g=>{
    if((g.mode==='rated')!==!!g.rated)throw new Error('Rated game metadata is inconsistent.');
    if(g.rated&&((g.rated.delta===undefined)!==(g.rated.after===undefined)||g.rated.after!==undefined&&g.rated.before+g.rated.delta! !==g.rated.after))throw new Error('Rating result is inconsistent.');
    validFen(g.startFen);const c=replay(g);if(c.history().join('|')!==g.san.join('|'))throw new Error(`Game ${g.id} has inconsistent move history.`);
    const restored={...g,review:undefined} as Game;
    return {...restored,review:validateReview(g.review,restored)};
  });
  for(const m of data.mistakes){validFen(m.fen);replay({startFen:m.fen,moves:m.line});replay({startFen:m.fen,moves:[m.move]});}
  for(const r of data.repertoire)replay({startFen:newGameFen,moves:r.moves});
  const puzzles=data.puzzles.map(validatePuzzle);
  for(const r of data.ratings)if(r.games!==r.wins+r.losses+r.draws)throw new Error('Rating statistics are inconsistent.');
  const sets=[games,data.preferences,data.attempts,data.mistakes,data.repertoire,data.training,puzzles,data.ratings,data.learningEvidence,data.openingStudy];
  for(const set of sets){const ids=set.map(x=>x.id);if(new Set(ids).size!==ids.length)throw new Error('Duplicate identifiers in backup.');}
  for(const e of data.learningEvidence)validFen(e.positionId+' 0 1');
  for(const s of data.openingStudy){validFen(s.positionId+' 0 1');replay({startFen:s.positionId+' 0 1',moves:[s.move]});}
  if(new Set(data.lessonProgress.map(p=>p.lessonId)).size!==data.lessonProgress.length)throw new Error('Duplicate lesson progress.');
  for(const p of data.lessonProgress)for(const evidenceId of p.masteryEvidence){const e=data.learningEvidence.find(e=>e.id===evidenceId);if(!e||e.lessonId!==p.lessonId||e.kind!=='transfer'||!e.firstSeen||!e.success||e.hints||e.errors)throw new Error('Independent evidence is inconsistent.');}
  await database.transaction('rw',database.tables.filter(t=>t.name!=='packs'),async()=>{
    for(const table of database.tables.filter(t=>t.name!=='packs'))await table.clear();
    await database.games.bulkPut(games);await database.preferences.bulkPut(data.preferences);await database.attempts.bulkPut(data.attempts);await database.mistakes.bulkPut(data.mistakes);await database.repertoire.bulkPut(data.repertoire);await database.training.bulkPut(data.training);await database.puzzles.bulkPut(puzzles);await database.ratings.bulkPut(data.ratings);await database.lessonProgress.bulkPut(data.lessonProgress);await database.learningEvidence.bulkPut(data.learningEvidence);await database.openingStudy.bulkPut(data.openingStudy);
  });
}
const newGameFen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export function validCachedReview(game:Game):boolean {return !!game.review&&game.review.version===SCORING_VERSION&&game.review.positionId===positionIdentity(game);}
export function downloadFile(name:string,text:string,type='application/json') {const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

