import openingData from './openings.json';
import {Chess} from 'chess.js';
import {playUci,uciOf} from '../chess/rules';
export interface Opening {id:string;eco:string;name:string;moves:string[];fen:string}
export const OPENINGS=openingData.entries as Opening[];
const bookMoves=new Map<string,Set<string>>(Object.entries(openingData.book).map(([fen,moves])=>[fen,new Set(moves)]));
const positions=new Map<string,Opening>();
export const epd=(fen:string)=>fen.split(' ').slice(0,4).join(' ');
for(const opening of OPENINGS) {
  const key=epd(opening.fen);const previous=positions.get(key);if(!previous||previous.moves.length>opening.moves.length)positions.set(key,opening);
}
export const isBookMove=(fen:string,uci:string)=>bookMoves.get(epd(fen))?.has(uci)??false;
/** Position lookup: all indexed continuations, including transposed move orders. */
export const bookMovesAt=(fen:string)=>[...(bookMoves.get(epd(new Chess(fen).fen()))??[])];
export const indexedBookPositions=bookMoves.size;
export const identifyOpening=(fen:string)=>positions.get(epd(fen));
export function openingBranches(prefix:string[]):{move:string;san:string;count:number}[] {
  const matches=OPENINGS.filter(o=>prefix.every((m,i)=>o.moves[i]===m));const counts=new Map<string,number>();
  for(const opening of matches){const m=opening.moves[prefix.length];if(m)counts.set(m,(counts.get(m)??0)+1);}
  const c=new Chess();for(const m of prefix)playUci(c,m);
  return [...counts].map(([move,count])=>({move,count,san:playUci(new Chess(c.fen()),move).san})).sort((a,b)=>b.count-a.count);
}
export function openingIdea(fen:string,uci:string):string {
  const c=new Chess(fen);const m=playUci(c,uci);
  if(m.isKingsideCastle()||m.isQueensideCastle())return 'Castling relocates the king and brings a rook into play. Watch the remaining pawn cover.';
  if(['n','b'].includes(m.piece))return `${m.san} develops or repositions a minor piece. Compare its attacks and the opponent’s forcing replies.`;
  if(m.piece==='p' && ['c','d','e','f'].includes(m.to[0]!))return `${m.san} changes the central pawn structure. Identify the squares that are now controlled or weakened.`;
  return `${m.san} is in a verified opening line. Calculate threats before following theory automatically.`;
}
export function sanLineToUci(line:string):string[] {const c=new Chess();return line.split(/\s+/).filter(Boolean).map(san=>uciOf(c.move(san)));}
