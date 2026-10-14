import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {CURRICULUM} from '../../src/data/curriculum';
import {playUci,validFen} from '../../src/chess/rules';
import {satisfies,legalSolutions,assessmentFeedback} from '../../src/learning/assessment';
import {freshLesson,lessonStatus} from '../../src/learning/progress';
import {PionDatabase} from '../../src/storage/db';
import {createBackup,restoreBackup} from '../../src/storage/backup';
import {freshRepetition} from '../../src/learning/repetition';
describe('interactive learning',()=>{
  it('provides at least thirty complete lessons with every stage represented',()=>{expect(CURRICULUM.length).toBeGreaterThanOrEqual(30);for(let stage=1;stage<=6;stage++)expect(CURRICULUM.filter(l=>l.stage===stage).length).toBeGreaterThanOrEqual(5);});
  it('verifies the claimed forced queen offer and every mating demonstration',()=>{for(const l of CURRICULUM){const demo=l.steps.find(s=>s.type==='demonstration')!;if(demo.type!=='demonstration')throw new Error();const c=new Chess(demo.fen);for(const [i,move] of demo.moves.entries()){playUci(c,move);if(/^[A-Za-z0-9=+x-]+#/.test(demo.captions[i]!))expect(c.isCheckmate(),`${l.id}/${i}`).toBe(true);if(l.id==='sacrifices'&&i===0)expect(c.moves()).toEqual(['Rxg8']);}}});
  it('validates every step, demonstration and intended answer',()=>{for(const l of CURRICULUM){expect(new Set(l.steps.map(s=>s.id)).size).toBe(l.steps.length);expect(l.steps.filter(s=>s.type==='move'||s.type==='question').length).toBeGreaterThanOrEqual(3);for(const s of l.steps){validFen(s.fen);if(s.type==='demonstration'){const c=new Chess(s.fen);expect(s.moves.length).toBe(s.captions.length);for(const m of s.moves)playUci(c,m);}if(s.type==='move'){for(const m of s.examples)expect(satisfies(s.fen,m,s.goal),`${l.id}/${s.id}/${m}`).toBe(true);expect(legalSolutions(s.fen,s.goal).length).toBeGreaterThan(0);}if(s.type==='question')expect(s.choices.filter(c=>c.correct)).toHaveLength(1);}}});
  it('accepts alternate checkmates and rejects an ordinary queen move',()=>{const s=CURRICULUM.find(l=>l.id==='queen-mate')!.steps.find(s=>s.type==='move')!;if(s.type!=='move')throw new Error();expect(legalSolutions('7k/5K2/6Q1/8/8/8/8/8 w - - 0 1',s.goal).length).toBeGreaterThan(1);expect(satisfies(s.fen,'g6h5',s.goal)).toBe(false);expect(assessmentFeedback(s.fen,'g6h5',s.goal,s.failure)).toContain('legal response');});
  it('never equates viewing or guided work with demonstrated understanding',()=>{const l=CURRICULUM[0]!,p=freshLesson(l);expect(lessonStatus(l,p)).toEqual({viewed:false,practiced:false,demonstrated:false});p.viewedSteps=['idea'];expect(lessonStatus(l,p).demonstrated).toBe(false);p.completedExercises=['practice','understand'];expect(lessonStatus(l,p)).toEqual({viewed:true,practiced:true,demonstrated:false});});
  it('evaluates the actual capturing piece rather than another cheaper attacker',()=>{const fen='7k/8/4p3/3r4/8/1B6/8/3Q3K w - - 0 1';expect(satisfies(fen,'b3d5',{kind:'safeCapture'})).toBe(true);expect(satisfies(fen,'d1d5',{kind:'safeCapture'})).toBe(false);});
  it('round trips step and hint progress and rejects forged independent evidence',async()=>{const a=new PionDatabase(crypto.randomUUID()),b=new PionDatabase(crypto.randomUUID());try{const l=CURRICULUM[0]!,p={...freshLesson(l),currentStep:'practice',stepHints:{practice:2},hintCount:2};await a.lessonProgress.put(p);await a.repertoire.put({id:'old',openingId:'old',name:'old',moves:['e2e4'],color:'w',...freshRepetition(4)});await restoreBackup(await createBackup(a),b);expect(await b.lessonProgress.get(l.id)).toEqual(p);expect(await b.repertoire.get('old')).toEqual(await a.repertoire.get('old'));const bad=JSON.parse(await createBackup(a));bad.lessonProgress[0].masteryEvidence=['made-up'];await expect(restoreBackup(JSON.stringify(bad),b)).rejects.toThrow('Independent evidence');expect((await b.lessonProgress.get(l.id))!.currentStep).toBe('practice');const legacy=JSON.parse(await createBackup(a));legacy.version=3;delete legacy.lessonProgress;delete legacy.learningEvidence;delete legacy.openingStudy;await restoreBackup(JSON.stringify(legacy),b);expect(await b.lessonProgress.count()).toBe(0);expect(await b.repertoire.count()).toBe(1);}finally{await a.delete();await b.delete();}});
});



