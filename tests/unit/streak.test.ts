import {describe,expect,it} from 'vitest';
import {activityStreak,stats} from '../../src/features/progress/stats';

const at=(day:number,hour=12)=>new Date(2026,9,day,hour).getTime();
describe('local calendar practice streak',()=>{
  it('starts empty and does not confuse lifetime activity with consecutive days',()=>{
    expect(activityStreak([],at(15))).toEqual({days:0,streak:0,activeToday:false});
    expect(activityStreak([at(1),at(5),at(11)],at(15))).toEqual({days:3,streak:0,activeToday:false});
  });
  it('counts one day for repeated activity and continues across midnight',()=>{
    expect(activityStreak([at(12),at(13),at(14),at(15,0),at(15,1)],at(15))).toEqual({days:4,streak:4,activeToday:true});
  });
  it('allows today to be completed after yesterday and breaks on a missing day',()=>{
    expect(activityStreak([at(12),at(13),at(14)],at(15))).toEqual({days:3,streak:3,activeToday:false});
    expect(activityStreak([at(12),at(14),at(15)],at(15)).streak).toBe(2);
    expect(activityStreak([at(12),at(13)],at(15)).streak).toBe(0);
  });
  it('uses calendar dates over month boundaries, ignoring future and invalid timestamps',()=>{
    const now=new Date(2026,10,1,12).getTime();
    expect(activityStreak([new Date(2026,9,30,23).getTime(),new Date(2026,9,31,23).getTime(),now,now+86_400_000,NaN],now)).toEqual({days:3,streak:3,activeToday:true});
  });
  it('includes completed interactive lessons in activity without manufacturing puzzle results',()=>{
    const data=stats([],[],[],[],0,[{at:Date.now()}]);
    expect(data.streak).toBe(1);expect(data.activeToday).toBe(true);expect(data.puzzles).toBe(0);expect(data.success).toBeNull();
  });
});
