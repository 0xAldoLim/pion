import 'fake-indexeddb/auto';
import {describe,it,expect,afterEach,vi} from 'vitest';
import {Chess} from 'chess.js';
import {PionDatabase,saveGame} from '../../src/storage/db';
import {freshRating,matchRating,ratingCategory,ratingChange} from '../../src/chess/ratings';
import {newGame,playUci,validFen} from '../../src/chess/rules';
import {LESSON_DEMOS} from '../../src/data/demos';
import {LESSONS} from '../../src/data/lessons';
import {progressiveHint,exerciseFeedback} from '../../src/coach/commentary';
import {responseDelay,waitForResponse} from '../../src/features/bots/pacing';
import {createBackup,restoreBackup} from '../../src/storage/backup';
import {BOTS} from '../../src/features/bots/bots';
import {clockOutcome} from '../../src/chess/clocks';
const databases:PionDatabase[]=[];
function database(){const db=new PionDatabase(crypto.randomUUID());databases.push(db);return db;}
afterEach(async()=>{vi.useRealTimers();for(const db of databases)await db.delete();databases.length=0;});
describe('local ratings and response pacing',()=>{
  it('does not award a timeout win to a bare king',()=>{const fen='7k/8/8/8/8/8/Q7/K7 w - - 0 1';expect(clockOutcome(fen,'w').result).toBe('1/2-1/2');expect(clockOutcome(fen,'b').result).toBe('1-0');});
  it('matches within ±20 and separates clock categories with increments',()=>{for(const r of [100,600,2200])for(const rng of [0,0.5,0.999])expect(Math.abs(matchRating(r,()=>rng)-r)).toBeLessThanOrEqual(20);expect(ratingCategory(180,2)).toBe('blitz');expect(ratingCategory(300,10)).toBe('rapid');expect(ratingCategory(600,0)).toBe('rapid');expect(ratingChange(600,600,'1-0','w')).toBe(16);expect(ratingChange(600,600,'0-1','w')).toBe(-16);expect(ratingChange(600,600,'1/2-1/2','w')).toBe(0);});
  it('settles one rated outcome atomically and ignores stale autosaves',async()=>{const db=database();const active={...newGame('pebble','w','rated',180),rated:{category:'blitz' as const,opponent:600,before:600}};await saveGame(active,db);await Promise.all([saveGame({...active,status:'finished',result:'1-0'},db),saveGame({...active,status:'finished',result:'1-0'},db)]);await saveGame(active,db);expect(await db.ratings.get('blitz')).toMatchObject({value:616,games:1,wins:1});expect(await db.ratings.get('rapid')).toBeUndefined();expect(await db.games.get(active.id)).toMatchObject({status:'finished',rated:{delta:16,after:616}});await saveGame({...newGame(),status:'finished',result:'0-1'},db);expect((await db.ratings.get('blitz'))?.value).toBe(616);});
  it('preserves both standings and settled results through a backup',async()=>{const source=database(),target=database();await source.ratings.put(freshRating('rapid'));const active={...newGame('sprout','b','rated',180),rated:{category:'blitz' as const,opponent:600,before:600}};await saveGame({...active,status:'finished',result:'1-0'},source);await restoreBackup(await createBackup(source),target);await saveGame({...active,status:'finished',result:'1-0'},target);expect(await target.ratings.get('blitz')).toMatchObject({value:584,games:1,losses:1});expect(await target.ratings.get('rapid')).toMatchObject({value:600,games:0});});
  it('always gives thinking time, and cancellation prevents a deferred response',async()=>{expect(responseDelay('quick',()=>0)).toBe(1500);expect(responseDelay('standard',()=>0)).toBe(2800);expect(responseDelay('thoughtful',()=>1)).toBe(7500);vi.useFakeTimers();const controller=new AbortController();const completed=vi.fn();const pending=waitForResponse(2800,controller.signal).then(completed);await vi.advanceTimersByTimeAsync(1000);expect(completed).not.toHaveBeenCalled();await vi.advanceTimersByTimeAsync(1800);await pending;expect(completed).toHaveBeenCalledOnce();const canceled=new AbortController();const second=waitForResponse(3000,canceled.signal);canceled.abort();await expect(second).rejects.toHaveProperty('name','AbortError');});
});
describe('visible, grounded learning content',()=>{
  it('provides a legal captioned demonstration for every lesson',()=>{for(const lesson of LESSONS){const demo=LESSON_DEMOS[lesson.id]!;expect(demo).toBeDefined();validFen(demo.fen);expect(demo.captions).toHaveLength(demo.moves.length);const c=new Chess(demo.fen);for(const move of demo.moves)playUci(c,move);}});
  it('varies hints by tactical purpose and returns a concrete legal refutation',()=>{const fork=LESSON_DEMOS.forks!;expect(progressiveHint(fork.fen,fork.moves,1)).toMatch(/two targets|double attack/);expect(progressiveHint(fork.fen,fork.moves,2)).toContain('knight on c6');expect(progressiveHint(fork.fen,fork.moves,3)).toContain('Ne7+');const mate=LESSON_DEMOS['queen-mate']!;expect(progressiveHint(mate.fen,mate.moves,1)).toMatch(/mating|escape/);const initial=new Chess();for(const move of ['f2f3','e7e5'])playUci(initial,move);expect(exerciseFeedback(initial.fen(),'g2g4',['g1h3'])).toContain('Qh4#');expect(new Set(BOTS.map(b=>b.name)).size).toBe(7);});
});
