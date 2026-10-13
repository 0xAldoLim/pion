import {describe,it,expect} from 'vitest';
import {classify,expectedPoints,moveAccuracy,ordinaryCategory,winPercent} from '../../src/chess/scoring';
describe('independent scoring',()=>{
  it('has symmetric probabilities and known anchors',()=>{expect(winPercent({kind:'cp',value:0})).toBe(50);expect(winPercent({kind:'cp',value:100})).toBeCloseTo(59.102,2);expect(expectedPoints({kind:'cp',value:100})+expectedPoints({kind:'cp',value:-100})).toBeCloseTo(1,12);});
  it('does not feed mates through a centipawn sigmoid',()=>{expect(winPercent({kind:'mate',value:0,winner:'w'},'b')).toBe(0);expect(winPercent({kind:'mate',value:3,winner:'w'})).toBe(100);});
  it.each([[0.019999,'excellent'],[0.02,'good'],[0.049999,'good'],[0.05,'inaccuracy'],[0.10,'mistake'],[0.20,'blunder']] as const)('boundary %s maps to %s',(loss,label)=>expect(ordinaryCategory(loss,false)).toBe(label));
  it('requires negligible loss for best',()=>expect(ordinaryCategory(0.2,true)).toBe('blunder'));
  it('implements the requested accuracy formula',()=>{expect(moveAccuracy(60,55)).toBeCloseTo(103.1668*Math.exp(-0.04354*5)-3.1669,10);expect(moveAccuracy(0,100)).toBeCloseTo(99.9999);expect(moveAccuracy(100,0)).toBe(0);});
  const ctx={loss:0,isBest:true,forced:false,book:false,sacrificeVerified:false,candidateGap:0,opportunity:false,depth:20};
  it('supports all special categories with explicit precedence',()=>{
    expect(classify({...ctx,book:true})).toBe('book');expect(classify({...ctx,sacrificeVerified:true})).toBe('brilliant');expect(classify({...ctx,candidateGap:0.2})).toBe('great');expect(classify({...ctx,isBest:false,loss:0.1,opportunity:true})).toBe('miss');expect(classify({...ctx,book:true,loss:0.2})).toBe('blunder');expect(classify({...ctx,forced:true,sacrificeVerified:true})).toBe('best');expect(classify({...ctx,sacrificeVerified:true,depth:12})).toBe('best');
  });
});
