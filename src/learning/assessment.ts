import {Chess,type Square} from 'chess.js';
import {playUci,uciOf} from '../chess/rules';
import {moveFacts,staticExchange,VALUES} from '../coach/facts';
import type {Goal} from './models';

/** Educational objectives are evaluated on the resulting legal board, not engine equality. */
export function satisfies(fen:string,uci:string,goal:Goal):boolean {
  const board=new Chess(fen),move=playUci(board,uci);
  if(goal.kind==='curated')return goal.moves.includes(uci);
  if(goal.piece&&move.piece!==goal.piece)return false;
  switch(goal.kind){
    case 'mate':return board.isCheckmate();
    case 'castle':return move.isKingsideCastle()||move.isQueensideCastle();
    case 'promotion':return move.promotion==='q'&&!board.isStalemate();
    case 'check':return board.inCheck();
    case 'escapeCheck':return new Chess(fen).inCheck()&&!board.isAttacked(board.board().flat().find(p=>p?.type==='k'&&p.color===move.color)!.square,board.turn());
    case 'enPassant':return move.isEnPassant();
    case 'defend':return !!goal.target&&board.get(goal.target as Square)?.color===move.color&&board.attackers(goal.target as Square,move.color).includes(move.to);
    case 'fork':return moveFacts(fen,uci).some(f=>f.kind==='fork'&&f.squares[0]===move.to);
    case 'pin':return ['b','r','q'].includes(move.piece)&&moveFacts(fen,uci).some(f=>f.kind==='pin');
    case 'preventMate':return !board.isStalemate()&&!board.moves().some(m=>m.endsWith('#'));
    case 'safeCapture':return !!move.captured&&staticExchange(fen,move.to)>=(goal.minimum??1)&&VALUES[move.captured]>=1;
    case 'developAttack':return ['n','b'].includes(move.piece)&&move.from[1]===(move.color==='w'?'1':'8')&&!!goal.target&&board.attackers(goal.target as Square,move.color).includes(move.to);
  }
}
export function assessmentFeedback(fen:string,uci:string,goal:Goal,fallback:string):string {
  const board=new Chess(fen),move=playUci(board,uci),facts=moveFacts(fen,uci);
  const danger=facts.find(f=>f.kind==='allowsMate')??facts.find(f=>f.kind==='hanging');
  if(danger)return `${move.san}: ${danger.text} Compare another candidate. The exercise position is restored.`;
  if(goal.kind==='mate')return `${move.san} ${board.inCheck()?'gives check, but Black or White still has a legal response.':'does not give check, so it cannot be checkmate.'} ${fallback}`;
  if(goal.kind==='safeCapture')return `${move.san} ${move.captured?'makes a capture; count the legal recaptures before deciding the gain.':'does not capture the target.'} ${fallback}`;
  if(goal.kind==='developAttack')return `${move.san} does not meet both requirements: develop a minor piece and attack ${goal.target}. ${fallback}`;
  return `${move.san} is legal. ${fallback} This is feedback on the lesson objective, not a blunder classification.`;
}
export function legalSolutions(fen:string,goal:Goal):string[]{return new Chess(fen).moves({verbose:true}).map(uciOf).filter(move=>satisfies(fen,move,goal));}
