import {describe,it,expect} from 'vitest';
import {learningFocus,skillProfiles,issueTrend} from '../../src/learning/recommendations';
import {CURRICULUM} from '../../src/data/curriculum';
import {freshLesson} from '../../src/learning/progress';
import {importPgn,positionIdentity,playUci} from '../../src/chess/rules';
import {Chess} from 'chess.js';
import {moveFacts} from '../../src/coach/facts';
import {SCORING_VERSION} from '../../src/chess/scoring';
import {DEFAULT_PREFS,type ReviewMove} from '../../src/chess/types';
function reviewed(id:string,at:number){const game={...importPgn('1. f3 e5 2. g4 Qh4#'),id,updatedAt:at},board=new Chess(game.startFen);const rows=game.moves.map((uci,i)=>{const before=board.fen(),move=playUci(board,uci);return {ply:i+1,color:move.color,san:move.san,uci,fenBefore:before,fenAfter:board.fen(),status:'complete',phase:'opening',evidence:moveFacts(before,uci),scores:{pion:{loss:i===2?0.4:0}}} as ReviewMove;});return {...game,review:{completed:true,moves:rows,settings:DEFAULT_PREFS.engine,version:SCORING_VERSION,positionId:positionIdentity(game)}};}
describe('grounded learning recommendations',()=>{
  it('uses an introductory path with unknown evidence instead of invented mastery',()=>{expect(learningFocus([]).lessonId).toBe('board-vision');expect(learningFocus([]).gameCount).toBe(0);expect(skillProfiles([],[],[],[]).every(s=>s.state==='Unknown')).toBe(true);const first=CURRICULUM[0]!,p={...freshLesson(first),currentStep:'summary',completedExercises:['practice','understand','transfer']};expect(learningFocus([],[],Date.now(),[p]).lessonId).toBe('coordinates');});
  it('requires distinct completed reviews for a recurring game pattern',()=>{const now=10000000000,a=reviewed('a',now),b=reviewed('b',now);expect(learningFocus([a],[],now).message).toContain('one game');const focus=learningFocus([a,b],[],now);expect(focus.lessonId).toBe('king-safety');expect(focus.gameCount).toBe(2);expect(focus.sources).toHaveLength(2);expect(focus.message).toContain('recurs across games');expect(learningFocus([{...a,review:{...a.review,completed:false}}],[],now).gameCount).toBe(0);expect(learningFocus([{...a,headers:{PionAssisted:'true'}}],[],now).gameCount).toBe(0);});
  it('keeps guided, hinted transfer, independent transfer and spaced recall distinct',()=>{const base={version:1 as const,lessonId:'board-vision',stepId:'transfer',positionId:'p',skill:'board-vision' as const,at:1,success:true,hints:0,errors:0,firstSeen:true};const skills=skillProfiles([],[],[{...base,id:'1',kind:'guided'},{...base,id:'2',kind:'transfer',hints:1},{...base,id:'3',kind:'transfer'},{...base,id:'4',kind:'recall',firstSeen:false},{...base,id:'5',kind:'recall',firstSeen:false,spaced:true}],[]);expect(skills.find(s=>s.skill==='board-vision')).toMatchObject({independent:1,assisted:2,retained:1,freshPuzzles:0});});
  it('does not count a boundary game in both trend periods',()=>{const now=10000000000,game=reviewed('boundary',now-7*86400000);const trend=issueTrend([game],'king-safety',now);expect(trend[0]!.games).toBe(0);expect(trend[1]!.games).toBe(1);});
});

