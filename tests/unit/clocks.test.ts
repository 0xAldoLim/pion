import {describe,it,expect} from 'vitest';
import {settleClock} from '../../src/chess/clocks';
import {newGame} from '../../src/chess/rules';
describe('practice clock accounting',()=>{
  it('charges at least a tenth for premoves and flags before a move that exhausts time',()=>{const game=newGame('pebble','w','bot',10);expect(settleClock(game,'w',0.01,0.1)).toEqual({w:9.9,b:10});expect(settleClock(game,'w',0.2,0.1)).toEqual({w:9.8,b:10});expect(settleClock({...game,clocks:{w:0.05,b:10}},'w',0,0.1).w).toBe(0);});
  it('charges the moving side between timer ticks without charging its opponent',()=>{const game=newGame('pebble','w','hotseat',10,2);expect(settleClock(game,'w',0.25)).toEqual({w:9.75,b:10});expect(settleClock({...game,clocks:{w:9.75,b:10}},'b',0.5)).toEqual({w:9.75,b:9.5});});
  it('never underflows and ignores elapsed time in casual games',()=>{expect(settleClock(newGame('pebble','w','hotseat',1),'w',5)).toEqual({w:0,b:1});const casual=newGame('pebble');expect(settleClock(casual,'w',100)).toEqual(casual.clocks);});
});
