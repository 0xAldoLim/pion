import {Chess} from 'chess.js';
import {describeMove} from './commentary';
import {positionAdvice} from './facts';
import {NAMES} from './material';
import type {Preferences} from '../chess/types';
export interface CoachContext {fen:string;beforeFen?:string;lastMove?:string;idea?:string}
export function opponentThreats(fen:string){
  const board=new Chess(fen),side=board.turn(),opponent=side==='w'?'b':'w';
  if(board.isCheckmate())return 'This is checkmate. There is no legal answer to the check.';
  if(board.isGameOver())return 'The position is drawn under the board rules. Check the result before extending a line.';
  if(board.inCheck())return 'Your king is in check. A legal response must capture the checking piece, block its line, or move the king. Compare the legal replies on the board.';
  const attacked=board.board().flat().filter(p=>p&&p.color===side&&p.type!=='k'&&board.isAttacked(p.square,opponent));
  return attacked.length?`The opponent attacks ${attacked.slice(0,3).map(p=>`${NAMES[p!.type]} on ${p!.square}`).join(', ')}. These are geometric attacks, not proven wins. Count defenders and calculate checks and recaptures before deciding.`:'Start with the opponent’s legal checks and captures after each candidate. Then inspect king safety and pawn breaks; this quick board check does not prove that a position is safe.';
}
export function coachAnswer(context:CoachContext,action:'why'|'threats'|'idea'|'whatif',preferences:Preferences,move?:string){
  if(action==='threats')return opponentThreats(context.fen);
  if(action==='whatif'&&move)return `${describeMove(context.fen,move,preferences.explanation)} This is a board-fact preview; compare the opponent’s replies in Analysis for an engine assessment.`;
  if(action==='why'&&context.beforeFen&&context.lastMove)return describeMove(context.beforeFen,context.lastMove,preferences.explanation);
  return context.idea??positionAdvice(context.fen);
}
