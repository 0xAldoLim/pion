import 'fake-indexeddb/auto';
import {afterEach,describe,it,expect} from 'vitest';
import {PionDatabase} from '../../src/storage/db';
import {createBackup,restoreBackup} from '../../src/storage/backup';
import {DEFAULT_PREFS} from '../../src/chess/types';
import {importPgn} from '../../src/chess/rules';
import {adaptiveRating,freshRepetition,schedule} from '../../src/learning/repetition';
import {Chess} from 'chess.js';
import {positionIdentity,playUci} from '../../src/chess/rules';
import {SCORING_VERSION} from '../../src/chess/scoring';
import type {Evaluation,ReviewMove} from '../../src/chess/types';
import Dexie from 'dexie';
import {CURRICULUM} from '../../src/data/curriculum';
import {freshLesson} from '../../src/learning/progress';
const databases:PionDatabase[]=[];function createDb(){const db=new PionDatabase(`test-${crypto.randomUUID()}`);databases.push(db);return db;}
afterEach(async()=>{for(const db of databases)await db.delete();databases.length=0;});
describe('persistence and backups',()=>{
  it('upgrades version six without changing saved ratings, study progress, repertoire or game history',async()=>{
    const name=`v6-${crypto.randomUUID()}`,legacy=new Dexie(name);
    legacy.version(6).stores({games:'id,updatedAt,status,botId,createdAt',preferences:'id',attempts:'id,puzzleId,at,solved',mistakes:'id,gameId,due,*tags',repertoire:'id,openingId,due',training:'id,at,kind',puzzles:'id,rating,*themes',packs:'id',ratings:'id',lessonProgress:'lessonId,lastVisited,due',learningEvidence:'id,lessonId,positionId,skill,at',openingStudy:'id,openingId,positionId,due'});
    const game=importPgn('1. e4 e5'),rating={id:'rapid',value:731,games:8,wins:5,losses:3,draws:0,updatedAt:12},lesson={...freshLesson(CURRICULUM[0]!),currentStep:'practice',stepHints:{practice:2}},line={id:'keep',openingId:'italian',name:'My branch',moves:['e2e4','e7e5'],color:'w',...freshRepetition(12)},attempt={id:'seen',puzzleId:'p1',at:12,solved:false,hints:1,firstSeen:true,rating:600,themes:['fork'],duration:300,mode:'practice'};
    await legacy.table('games').put(game);await legacy.table('ratings').put(rating);await legacy.table('lessonProgress').put(lesson);await legacy.table('repertoire').put(line);await legacy.table('attempts').put(attempt);await legacy.table('preferences').put({...DEFAULT_PREFS,practiceHints:undefined,practiceUndo:undefined,practiceFeedback:undefined});legacy.close();
    const migrated=new PionDatabase(name);databases.push(migrated);await migrated.open();expect(await migrated.games.get(game.id)).toEqual(game);expect(await migrated.ratings.get('rapid')).toEqual(rating);expect(await migrated.lessonProgress.get(lesson.lessonId)).toEqual(lesson);expect(await migrated.repertoire.get('keep')).toEqual(line);expect(await migrated.attempts.get('seen')).toEqual(attempt);expect(await migrated.preferences.get('main')).toMatchObject({practiceHints:true,practiceUndo:true,practiceFeedback:false});
    const backup=JSON.parse(await createBackup(migrated));backup.version=3;delete backup.preferences[0].practiceHints;delete backup.preferences[0].practiceUndo;delete backup.preferences[0].practiceFeedback;await restoreBackup(JSON.stringify(backup),migrated);expect(await migrated.preferences.get('main')).toMatchObject({practiceHints:true,practiceUndo:true,practiceFeedback:false});expect(await migrated.ratings.get('rapid')).toEqual(rating);
  });
  it('migrates version-one clocks and coach preferences without losing a game',async()=>{
    const name=`legacy-${crypto.randomUUID()}`,legacy=new Dexie(name);
    legacy.version(1).stores({games:'id,updatedAt,status,botId',preferences:'id',attempts:'id,puzzleId,at,solved',mistakes:'id,gameId,due,*tags',repertoire:'id,openingId,due',training:'id,at,kind',puzzles:'id,rating,*themes',packs:'id'});
    const game=importPgn('1. e4');await legacy.table('games').put({...game,clocks:undefined,increment:undefined});await legacy.table('preferences').put({...DEFAULT_PREFS,botPace:undefined,colorMode:undefined,premoves:undefined,showEval:false,practiceHints:undefined,practiceUndo:undefined,practiceFeedback:undefined});legacy.close();
    const migrated=new PionDatabase(name);databases.push(migrated);await migrated.open();expect((await migrated.games.get(game.id))!.moves).toEqual(['e2e4']);expect((await migrated.games.get(game.id))!.clocks).toEqual({w:0,b:0});expect((await migrated.preferences.get('main'))!.botPace).toBe('standard');expect((await migrated.preferences.get('main'))!).toMatchObject({colorMode:'light',showEval:true,premoves:true,practiceHints:true,practiceUndo:true,practiceFeedback:false});
  });
  it('round trips preferences, games and progress transactionally',async()=>{const source=createDb();const game=importPgn('1. e4 e5 2. Nf3 Nc6');await source.games.add(game);await source.preferences.add(DEFAULT_PREFS);await source.training.add({id:'lesson1',at:10,kind:'lesson',target:'board-vision',success:true,hints:0});const target=createDb();await restoreBackup(await createBackup(source),target);expect((await target.games.get(game.id))?.moves).toEqual(game.moves);expect(await target.preferences.get('main')).toEqual(DEFAULT_PREFS);expect(await target.training.count()).toBe(1);});
  it('rejects malformed or inconsistent backups before mutation',async()=>{const db=createDb();const game=importPgn('1. e4 e5');await db.games.add(game);const original=await createBackup(db);const bad=JSON.parse(original) as {games:{moves:string[]}[]};bad.games[0]!.moves=['e2e5'];await expect(restoreBackup(JSON.stringify(bad),db)).rejects.toThrow();expect(await createBackup(db)).toContain(game.id);await expect(restoreBackup('{broken',db)).rejects.toThrow();expect(await db.games.count()).toBe(1);});
  it('preserves bounded legal review evidence and reconstructs current scoring',async()=>{
    const source=createDb(),target=createDb();const game=importPgn('1. e4');const c=new Chess(game.startFen);const before=c.fen();playUci(c,'e2e4');
    const evaluation:Evaluation={fen:before,engine:'Stockfish 19.0.1',settings:DEFAULT_PREFS.engine,candidates:[{move:'e2e4',score:{kind:'cp',value:30},depth:18,pv:['e2e4','e7e5'],nodes:100}],bestMove:'e2e4',completed:true,timestamp:1};
    const scores={classification:'book' as const,accuracy:0,loss:0,version:SCORING_VERSION};
    const row:ReviewMove={ply:1,color:'w',san:'e4',uci:'e2e4',fenBefore:before,fenAfter:c.fen(),before:evaluation,after:evaluation,bestMove:'e2e4',bestSan:'e4',evidence:[],forced:false,book:true,sacrificeVerified:false,opportunity:false,phase:'opening',status:'complete',scores:{pion:scores,inspired:scores}};
    game.review={moves:[row],completed:true,settings:DEFAULT_PREFS.engine,version:SCORING_VERSION,positionId:positionIdentity(game)};await source.games.add(game);
    await restoreBackup(await createBackup(source),target);const saved=(await target.games.get(game.id))!.review!;expect(saved.completed).toBe(true);expect(saved.moves[0]!.before.candidates[0]!.pv).toEqual(['e2e4','e7e5']);expect(saved.moves[0]!.scores.pion.accuracy).toBeCloseTo(100,3);
    const malformed=JSON.parse(await createBackup(source));malformed.games[0].review.moves[0].before.candidates[0].pv=['e2e5'];await expect(restoreBackup(JSON.stringify(malformed),target)).rejects.toThrow();expect((await target.games.get(game.id))!.review!.completed).toBe(true);
  });
  it('keeps repetition separate from unseen puzzle estimates',()=>{expect(adaptiveRating(600,600,true,0,false)).toBe(600);expect(adaptiveRating(600,600,true,0,true)).toBeGreaterThan(600);expect(adaptiveRating(600,600,true,1,true)).toBeLessThan(600);const fresh=freshRepetition(0);const first=schedule(fresh,true,0,0);expect(first.interval).toBe(1);expect(schedule(first,true,0,first.due).interval).toBe(3);expect(schedule(first,true,0,0)).toEqual(first);expect(schedule(first,false,0,0).successes).toBe(1);expect(schedule(first,false,0,0).failures).toBe(1);});
});
