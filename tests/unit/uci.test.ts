import { describe,expect,it } from 'vitest';
import { normalizeScore,parseInfo } from '../../src/engine/uci';
describe('UCI scores',()=>{
  it('normalizes Black evaluations to White',()=>expect(normalizeScore('cp',100,'b')).toEqual({kind:'cp',value:-100}));
  it('keeps mate winners explicit including mate zero',()=>{expect(normalizeScore('mate',0,'b')).toEqual({kind:'mate',value:0,winner:'w'});expect(normalizeScore('mate',3,'b')).toEqual({kind:'mate',value:-3,winner:'b'});});
  it('parses MultiPV and ignores bound-only estimates',()=>{const line='info depth 12 multipv 2 score cp -31 nodes 1234 pv e2e4 e7e5';expect(parseInfo(line,'w')?.rank).toBe(2);expect(parseInfo(line+' lowerbound','w')).toBeNull();expect(parseInfo('info depth 1 nodes 2','w')).toBeNull();});
});
