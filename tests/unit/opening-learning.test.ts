import {OPENING_INSIGHTS,INSIGHT_INDEX,OPENING_LOAD} from '../../src/data/opening-insights';
import {position} from '../../src/learning/content';
import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {OPENING_COURSES} from '../../src/data/opening-courses';
import {openingMistake,openingExplanation,positionKey} from '../../src/openings/teaching';
import {playUci,validFen} from '../../src/chess/rules';
import {staticExchange} from '../../src/coach/facts';
describe('opening education',()=>{
  it('has twelve complete families with several legal annotated responses each',()=>{expect(OPENING_COURSES).toHaveLength(12);for(const c of OPENING_COURSES){expect(c.variations.length).toBeGreaterThanOrEqual(3);expect(c.whitePlan.length).toBeGreaterThan(40);expect(c.blackPlan.length).toBeGreaterThan(40);for(const v of c.variations){const board=new Chess();expect(v.annotations).toHaveLength(v.moves.length);for(const [i,move] of v.moves.entries()){const annotation=v.annotations[i]!;expect(annotation.positionId).toBe(positionKey(board.fen()));expect(annotation.moveUci).toBe(move);playUci(board,move);validFen(board.fen());}expect(v.annotations.filter(a=>a.confidence==='curated').length).toBeGreaterThanOrEqual(2);}}});
  it('provides a legal material-recovery diagram for every family',()=>{for(const c of OPENING_COURSES){const caution=openingMistake(c);expect(caution,c.id).toBeDefined();validFen(caution!.before);validFen(caution!.fen);const board=new Chess(caution!.before);playUci(board,caution!.mistake);expect(board.fen()).toBe(caution!.fen);const target=playUci(new Chess(caution!.fen),caution!.recovery).to;expect(staticExchange(caution!.fen,target)).toBeGreaterThanOrEqual(2);}});
  it('describes Nf3 by its concrete e5 target and does not invent motives outside curated positions',()=>{const board=new Chess();board.move('e4');board.move('e5');expect(openingExplanation(board.fen(),'g1f3')).toContain('e5');expect(openingExplanation(new Chess().fen(),'a2a3')).toContain('No specific strategic annotation');});
});

it('verifies concrete targets and every reply in the authored opening decisions',()=>{
 expect(new Set(OPENING_INSIGHTS.map(n=>n.course)).size).toBe(12);
 for(const note of OPENING_INSIGHTS){const board=new Chess(position(note.prefix)),move=board.move(note.san);for(const target of [...note.attacks??[],...note.defends??[]])expect(board.attackers(target,move.color)).toContain(move.to);for(const reply of note.replies)expect(new Chess(board.fen()).move(reply.san)).toBeTruthy();expect(OPENING_LOAD[note.course]).toBeDefined();}
 expect(INSIGHT_INDEX.size).toBe(12);
 const french=OPENING_COURSES.find(c=>c.id==='french')!.variations[1]!.annotations[5]!;expect(french.explanation).toContain('Black’s e6 pawn');expect(french.replies).toHaveLength(2);
});
