import type {Color} from 'chess.js';
import type {Game} from './types';
export function settleClock(game:Game,turn:Color,elapsed:number):Game['clocks'] {
  if(!game.initialSeconds)return {...game.clocks};
  return {...game.clocks,[turn]:Math.max(0,game.clocks[turn]-Math.max(0,elapsed))};
}
