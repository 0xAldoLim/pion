import {it,expect} from 'vitest';
import {assistance} from '../../src/chess/assistance';
import {newGame} from '../../src/chess/rules';
import {DEFAULT_PREFS} from '../../src/chess/types';
import {opponentThreats} from '../../src/coach/actions';
it('blocks every assistance surface while rated play is active, even with all practice options on',()=>{
  const game=newGame('pebble','w','rated',180),prefs={...DEFAULT_PREFS,practiceFeedback:true};
  expect(Object.values(assistance(game,prefs))).toEqual([false,false,false,false,false,false]);
  expect(assistance({...game,status:'finished'},prefs)).toMatchObject({evaluation:true,coach:true,hints:true,feedback:true});
  expect(assistance({...game,mode:'bot'},{...prefs,practiceHints:false,practiceUndo:false,showEval:false})).toMatchObject({evaluation:false,hints:false,undo:false,feedback:true});
});
it('answers actual check without constructing an illegal opposite-turn position',()=>{
  expect(opponentThreats('4k3/8/8/8/8/8/4r3/4K3 w - - 0 1')).toContain('Your king is in check');
  expect(opponentThreats('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1')).toContain('checkmate');
});
