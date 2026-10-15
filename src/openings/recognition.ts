import {Chess} from 'chess.js';
import {identifyOpening,type Opening} from '../data/openings';
import {playUci} from '../chess/rules';

/** Identify played positions, retaining the latest match after leaving named theory. */
export function recognizeOpening(startFen:string,moves:readonly string[]):{opening:Opening;ply:number}|undefined{
  const board=new Chess(startFen),initial=identifyOpening(board.fen());
  let latest=initial?{opening:initial,ply:0}:undefined;
  for(const [index,move] of moves.entries()){
    playUci(board,move);const opening=identifyOpening(board.fen());
    if(opening)latest={opening,ply:index+1};
  }
  return latest;
}
