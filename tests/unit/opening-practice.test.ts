import {parseStudyContext,studyRoute} from '../../src/openings/context';
import 'fake-indexeddb/auto';
import {describe,it,expect,vi} from 'vitest';
import {Chess} from 'chess.js';
import {PionDatabase} from '../../src/storage/db';
import {recordOpeningPosition,assessOpeningMove,practiceGraph} from '../../src/openings/practice';
import {compareRepertoire,saveReviewBranch,curatedCourseInGame} from '../../src/openings/review';
import {DEFAULT_PREFS,type Repertoire} from '../../src/chess/types';
import {START_FEN,importPgn,playUci} from '../../src/chess/rules';
import {freshRepetition} from '../../src/learning/repetition';
import {createBackup,restoreBackup} from '../../src/storage/backup';
import {OPENING_COURSES} from '../../src/data/opening-courses';
import {positionKey} from '../../src/openings/teaching';
describe('opening retrieval and alternatives',()=>{
  it('recognizes another legal book move without inventing an error',async()=>{const result=await assessOpeningMove(START_FEN,'d2d4',['e2e4'],DEFAULT_PREFS.engine,new AbortController().signal);expect(result.kind).toBe('book');expect(result.explanation).toContain('known ECO alternative');});
  it('verifies immediate mate refutations before calling a deviation sound',async()=>{const c=new Chess();c.move('f3');c.move('e5');const result=await assessOpeningMove(c.fen(),'g2g4',[],DEFAULT_PREFS.engine,new AbortController().signal);expect(result.kind).toBe('different');expect(result.explanation).toContain('Qh4#');});
  it('preserves multiple legal responses indexed by position',()=>{const course=OPENING_COURSES[0]!,graph=practiceGraph(START_FEN,course.variations.map(v=>v.moves)),c=new Chess();for(const move of course.variations[0]!.moves.slice(0,5))playUci(c,move);expect(graph.get(positionKey(c.fen()))).toEqual(expect.arrayContaining(['f8c5','g8f6','f8e7']));});
  it('records guidance separately and does not inflate early independent recall',async()=>{const db=new PionDatabase(crypto.randomUUID());try{const input={openingId:'italian',fen:START_FEN,move:'e2e4',color:'w' as const,mode:'guided' as const,errors:0,hints:0,now:0};const guided=await recordOpeningPosition(input,db);expect(guided.recallSuccesses).toBe(0);const recalled=await recordOpeningPosition({...input,mode:'recall'},db);expect(recalled.recallSuccesses).toBe(1);const early=await recordOpeningPosition({...input,mode:'recall',now:1},db);expect(early.recallSuccesses).toBe(1);expect(early.successes).toBe(1);const hinted=await recordOpeningPosition({...input,mode:'recall',now:early.due,hints:1},db);expect(hinted.recallSuccesses).toBe(1);expect(hinted.failures).toBe(1);await expect(recordOpeningPosition({...input,color:'b'},db)).rejects.toThrow('learner');}finally{await db.delete();}});
  it('compares repertoire by position and adds a reviewed sibling without resetting its parent',async()=>{const a=new PionDatabase(crypto.randomUUID()),b=new PionDatabase(crypto.randomUUID());try{const original:Repertoire={id:'parent',openingId:'italian',name:'My Italian',moves:['e2e4','e7e5','g1f3','b8c6','f1c4'],color:'w',folder:'White ideas',notes:'Watch e4',favorite:true,...freshRepetition(50),successes:3,interval:9,due:999};await a.repertoire.put(original);const game=importPgn('1. e4 e5 2. Nc3 Nc6');expect(compareRepertoire(game,[original]).find(d=>d.ply===3)?.status).toBe('known-alternative');const branch=await saveReviewBranch(game,3,original,a);expect(branch.parentId).toBe('parent');expect(await a.repertoire.get('parent')).toEqual(original);await restoreBackup(await createBackup(a),b);expect(await b.repertoire.get('parent')).toEqual(original);expect(await b.repertoire.get(branch.id)).toEqual(branch);expect((await saveReviewBranch(game,3,original,a)).id).toBe(branch.id);}finally{await a.delete();await b.delete();}});
  it('uses actual local evaluation for a nonbook comparison',async()=>{const fen='6k1/8/8/8/8/8/8/R5K1 w - - 0 1',analyze=vi.fn().mockResolvedValueOnce({candidates:[{score:{kind:'cp',value:500},depth:18}]}).mockResolvedValueOnce({candidates:[{score:{kind:'cp',value:490},depth:18}]});const result=await assessOpeningMove(fen,'a1a4',[],DEFAULT_PREFS.engine,new AbortController().signal,{analyze} as never);expect(result.kind).toBe('sound');expect(analyze).toHaveBeenCalledTimes(2);expect(result.explanation).toContain('depths 18/18');});
});

it('preserves a legal study prefix and rejects a mismatched position',()=>{
 const c=new Chess();c.move('e4');c.move('e5');const context={mode:'explore' as const,name:'Italian',fen:c.fen(),startFen:START_FEN,moves:['e2e4','e7e5'],color:'w' as const,returnGameId:'game',returnPly:2};expect(parseStudyContext(studyRoute(context))).toEqual(context);expect(parseStudyContext(studyRoute({...context,fen:START_FEN}))).toBeUndefined();expect(parseStudyContext('study:{broken')).toBeUndefined();
});
it('keeps shallow engine comparisons uncertain without recording an error grade',async()=>{
 const fen='6k1/8/8/8/8/8/8/R5K1 w - - 0 1',analyze=vi.fn().mockResolvedValueOnce({candidates:[{score:{kind:'cp',value:500},depth:4}]}).mockResolvedValueOnce({candidates:[{score:{kind:'cp',value:0},depth:3,pv:['g8f7']} ]});const result=await assessOpeningMove(fen,'a1a4',[],DEFAULT_PREFS.engine,new AbortController().signal,{analyze} as never);expect(result.classification).toBe('uncertain');expect(result.verifiedLoss).toBeUndefined();expect(result.explanation).toContain('Kf7');
});
it('verifies the installed empty-PGN constructor and exact repertoire export roundtrip',async()=>{
 const {exportPgn,lineSan}=await import('../../src/chess/rules');expect(importPgn('').moves).toEqual([]);
 for(const record of [{startFen:START_FEN,moves:['e2e4','e7e5','g1f3']},{startFen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',moves:['g6g7']}]){const output=exportPgn({...importPgn(''),...record,san:lineSan(record.startFen,record.moves)}),again=importPgn(output);expect(again.startFen).toBe(record.startFen);expect(again.moves).toEqual(record.moves);}
});

it('finds the relevant curated family in imported games without a saved repertoire',()=>{
 const game=importPgn('1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. a3');expect(curatedCourseInGame(game)?.id).toBe('italian');expect(curatedCourseInGame(game,2)).toBeUndefined();
});
