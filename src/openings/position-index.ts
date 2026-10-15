import {Chess} from 'chess.js';
import {playUci,START_FEN} from '../chess/rules';
import type {Repertoire} from '../chess/types';
export const positionKey=(fen:string)=>new Chess(fen).fen().split(' ').slice(0,4).join(' ');
export type RepertoireIndex=Map<string,Map<string,string[]>>;
export function repertoireIndex(lines:Repertoire[]):RepertoireIndex{
  const index:RepertoireIndex=new Map();
  for(const line of lines){const board=new Chess(line.startFen??START_FEN);for(const move of line.moves){const key=positionKey(board.fen()),moves=index.get(key)??new Map<string,string[]>();moves.set(move,[...(moves.get(move)??[]),line.id]);index.set(key,moves);playUci(board,move);}}
  return index;
}
