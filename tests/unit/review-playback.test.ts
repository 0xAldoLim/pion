import {afterEach,describe,expect,it,vi} from 'vitest';
import {rewindGame} from '../../src/features/review/playback';
afterEach(()=>vi.useRealTimers());
describe('review rewind',()=>{
  it('visits real positions in reverse and bounds animation time for a long PGN',async()=>{
    vi.useFakeTimers();const frames:number[]=[];
    const run=rewindGame(1000,ply=>frames.push(ply),new AbortController().signal);
    await vi.runAllTimersAsync();await run;
    expect(frames[0]).toBe(1000);expect(frames.at(-1)).toBe(0);expect(frames.length).toBeLessThanOrEqual(20);
    expect(frames.every((ply,i)=>Number.isInteger(ply)&&ply>=0&&(!i||ply<frames[i-1]!))).toBe(true);
  });
  it('stops immediately on cancellation and skips movement for reduced motion',async()=>{
    vi.useFakeTimers();const abort=new AbortController(),frames:number[]=[];
    const canceled=expect(rewindGame(20,ply=>frames.push(ply),abort.signal)).rejects.toMatchObject({name:'AbortError'});
    abort.abort();await canceled;await vi.runAllTimersAsync();expect(frames).toEqual([20]);
    const reduced:number[]=[];await rewindGame(20,ply=>reduced.push(ply),new AbortController().signal,true);expect(reduced).toEqual([0]);
  });
});
