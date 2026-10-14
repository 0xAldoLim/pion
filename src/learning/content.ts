import {Chess} from 'chess.js';
import type {Goal} from './models';
export const position=(line:string)=>{const c=new Chess();for(const san of line.split(/\s+/).filter(Boolean))c.move(san);return c.fen();};
export const oppositeSquare=(square:string)=>square[0]+String(9-Number(square[1]));
export const oppositeMove=(move:string)=>oppositeSquare(move.slice(0,2))+oppositeSquare(move.slice(2,4))+move.slice(4);
/** Color/rank reflection preserves legal chess relationships, including pawn direction. */
export function oppositePosition(fen:string){const [board,turn,rights,ep]=fen.split(' ');return `${board!.split('/').reverse().map(row=>[...row].map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join('')).join('/')} ${turn==='w'?'b':'w'} ${rights==='-'?'-':[...rights!].map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).sort((a,b)=>'KQkq'.indexOf(a)-'KQkq'.indexOf(b)).join('')} ${ep==='-'?'-':oppositeSquare(ep!)} 0 1`;}
export function oppositeGoal(goal:Goal):Goal{return goal.kind==='curated'?{...goal,moves:goal.moves.map(oppositeMove)}:{...goal,...(goal.target?{target:oppositeSquare(goal.target)}:{})};}
