import {schedule} from '../../src/learning/repetition';
import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {APPLICATION_TASKS} from '../../src/data/application-tasks';
import {CURRICULUM} from '../../src/data/curriculum';
import {validFen,playUci,uciOf} from '../../src/chess/rules';
import {oppositePosition} from '../../src/learning/content';
import {freshLesson,nextChallenge,isSpacedRecall} from '../../src/learning/progress';
import {assessmentFeedback} from '../../src/learning/assessment';
import {satisfies,legalSolutions} from '../../src/learning/assessment';

describe('authored application positions',()=>{
 it('replays every new position, goal, accepted answer and complete continuation',()=>{
  for(const [id,tasks] of Object.entries(APPLICATION_TASKS))for(const step of tasks){
   validFen(step.fen);
   const original=CURRICULUM.find(l=>l.id===id)!.steps[0]!.fen;
   expect(step.fen,id).not.toBe(original);expect(step.fen,id).not.toBe(oppositePosition(original));
   if(step.type==='move'){
    for(const answer of step.examples)expect(satisfies(step.fen,answer,step.goal),`${id}/${step.id}/${answer}`).toBe(true);
    if(step.goal.kind==='curated')for(const answer of step.goal.moves)playUci(new Chess(step.fen),answer);
    const wrong=new Chess(step.fen).moves({verbose:true}).map(uciOf).filter(m=>!satisfies(step.fen,m,step.goal));
    expect(wrong.length,step.id).toBeGreaterThan(0);
    expect(legalSolutions(step.fen,step.goal).length).toBeGreaterThan(0);
    if(step.sequence){const c=new Chess(step.fen);expect(step.sequenceCaptions).toHaveLength(step.sequence.length);for(const move of step.sequence)playUci(c,move);}
   }
  }
 });
 it('checks the actual pinned recapture, false fork and defensive fork resource',()=>{
  const pinned=APPLICATION_TASKS['board-vision']![1]!;const c=new Chess(pinned.fen);playUci(c,'b4d6');expect(c.moves()).not.toContain('exd6');
  const falseFork=APPLICATION_TASKS.forks!.find(s=>s.id==='apply-fork-refutation')!;const f=new Chess(falseFork.fen);playUci(f,'c6e7');expect(f.inCheck()).toBe(true);expect(f.moves()).toContain('Bxe7');playUci(f,'d6e7');expect(f.get('e7')?.type).toBe('b');
  const defense=APPLICATION_TASKS.forks!.find(s=>s.id==='apply-defend-fork')!;const d=new Chess(defense.fen);playUci(d,'a2a3');expect(d.moves()).toContain('Nd3+');playUci(d,'f4d3');expect(d.attackers('e1','b')).toContain('d3');
 });
 it('requires every conversion decision and verifies mate rather than stalemate',()=>{
  for(const id of ['queen-mate','rook-mate']){const step=APPLICATION_TASKS[id]![0]!;if(step.type!=='move')throw new Error();const c=new Chess(step.fen);for(const move of step.sequence!)playUci(c,move);expect(c.isCheckmate()).toBe(true);}
  const q=new Chess(APPLICATION_TASKS['queen-mate']![0]!.fen);playUci(q,'g4g6');expect(q.isStalemate()).toBe(true);
 });
});

it('prefers an unseen application and requires a real day before retention',()=>{
 const lesson=CURRICULUM.find(l=>l.id==='board-vision')!,p=freshLesson(lesson),first=nextChallenge(lesson,p,[]);
 expect(first.id).toBe('apply-exchange');p.completedExercises=[first.id];expect(nextChallenge(lesson,p,[]).id).toBe('apply-pinned-defender');
 const e={version:1 as const,id:'e',lessonId:lesson.id,stepId:first.id,positionId:first.fen.split(' ').slice(0,4).join(' '),skill:'board-vision' as const,at:1,success:true,hints:0,errors:0,kind:'transfer' as const,firstSeen:true};
 expect(isSpacedRecall(lesson.id,[],0,100000000)).toBe(false);expect(isSpacedRecall(lesson.id,[e],0,2)).toBe(false);expect(isSpacedRecall(lesson.id,[e],86400000,86400001)).toBe(true);
});
it('explains actual captures, target counts and a legal mate escape',()=>{
 const capture=assessmentFeedback('7k/8/4p3/3r4/8/1B6/8/3Q3K w - - 0 1','d1d5',{kind:'safeCapture'},'Count the exchange.');expect(capture).toContain('exd5');expect(capture).toContain('queen');
 const fork=assessmentFeedback('2q3k1/8/2N5/8/8/8/8/7K w - - 0 1','c6a7',{kind:'fork'},'Name both targets.');expect(fork).toContain('From a7');expect(fork).toContain('queen on c8');
 const mate=assessmentFeedback('7k/8/5KQ1/8/8/8/8/8 w - - 0 1','g6h5',{kind:'mate'},'Cover escapes.');expect(mate).toContain('legal response');expect(mate).toContain('Black');
});

it('an early repetition cannot overwrite new lesson completion fields',()=>{
 const record={interval:1,ease:2.5,due:100,successes:1,failures:0,currentStep:'previous',completedExercises:[],masteryEvidence:[]};
 expect(schedule(record,true,0,1)).toEqual({interval:1,ease:2.5,due:100,successes:1,failures:0});
 expect({...record,completedExercises:['new'],masteryEvidence:['e'],...schedule(record,true,0,1)}).toMatchObject({completedExercises:['new'],masteryEvidence:['e']});
});
