import {Chess,type Color} from 'chess.js';
import type {Game} from './types';
export function settleClock(game:Game,turn:Color,elapsed:number):Game['clocks'] {
  if(!game.initialSeconds)return {...game.clocks};
  return {...game.clocks,[turn]:Math.max(0,game.clocks[turn]-Math.max(0,elapsed))};
}
export function clockOutcome(fen:string,flagged:Color):Pick<Game,'result'|'reason'> {
  const c=new Chess(fen);const winner=flagged==='w'?'b':'w';
  if(!c.board().flat().some(p=>p?.color===winner&&p.type!=='k')||c.isInsufficientMaterial())return {result:'1/2-1/2',reason:'Time expired; opponent cannot mate with the remaining material'};
  return {result:winner==='w'?'1-0':'0-1',reason:'Time expired'};
}
