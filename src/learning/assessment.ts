import {Chess,type Square} from 'chess.js';
import {playUci,uciOf} from '../chess/rules';
import {moveFacts,staticExchange,VALUES,NAMES} from '../coach/facts';
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
    case 'evadeAttack':return staticExchange(board.fen(),move.to)===0;
    case 'enPassant':return move.isEnPassant();
    case 'defend':return !!goal.target&&board.get(goal.target as Square)?.color===move.color&&board.attackers(goal.target as Square,move.color).includes(move.to);
    case 'fork':return moveFacts(fen,uci).some(f=>f.kind==='fork'&&f.squares[0]===move.to);
    case 'pin':return ['b','r','q'].includes(move.piece)&&moveFacts(fen,uci).some(f=>f.kind==='pin');
    case 'preventMate':return !board.isStalemate()&&!board.moves().some(m=>m.endsWith('#'));
    case 'safeCapture':return !!move.captured&&VALUES[move.captured]+(move.promotion?VALUES[move.promotion]-1:0)-staticExchange(board.fen(),move.to)>=(goal.minimum??1);
    case 'developAttack':return ['n','b'].includes(move.piece)&&move.from[1]===(move.color==='w'?'1':'8')&&!!goal.target&&board.attackers(goal.target as Square,move.color).includes(move.to);
  }
}
export function assessmentFeedback(fen:string,uci:string,goal:Goal,fallback:string):string {
  const board=new Chess(fen),move=playUci(board,uci),facts=moveFacts(fen,uci),side=board.turn()==='w'?'White':'Black';
  const change=`${move.san} moves your ${NAMES[move.piece]} from ${move.from} to ${move.to}${move.captured?`, capturing a ${NAMES[move.captured]}`:''}.`;
  const danger=facts.find(f=>f.kind==='allowsMate')??facts.find(f=>f.kind==='hanging'&&f.squares[0]===move.to)??facts.find(f=>f.kind==='hanging');
  if(board.isStalemate())return `${change} ${side} has no legal move and is not in check: this is stalemate, a draw. ${fallback}`;
  if(danger)return `${change} ${danger.text} ${fallback} Check that reply before choosing again.`;
  if(goal.kind==='mate'){
    const reply=board.moves()[0];return `${change} ${board.inCheck()?`It gives check, but ${side} still has a legal response${reply?`: ${reply}`:''}.`:`It does not give check, so it cannot be checkmate.${reply?` ${side} can legally reply ${reply}.`:''}`} ${fallback}`;
  }
  if(goal.kind==='safeCapture'){
    const recapture=board.moves({verbose:true}).find(m=>m.to===move.to&&m.captured),gain=move.captured?VALUES[move.captured]+(move.promotion?VALUES[move.promotion]-1:0)-staticExchange(board.fen(),move.to):0;
    return `${change} ${move.captured?`The bounded exchange gains about ${gain} pawns${recapture?`; ${side} can answer ${recapture.san}`:''}, short of this task’s target.`:'This move captures no piece; first locate a legal, profitable capture.'} ${fallback}`;
  }
  if(goal.kind==='fork'){
    const targets=board.board().flat().filter(p=>p&&p.color===board.turn()&&board.attackers(p.square,move.color).includes(move.to));
    return `${change} From ${move.to}, that piece attacks ${targets.length?targets.map(p=>`${NAMES[p!.type]} on ${p!.square}`).join(', '):'no enemy piece'}. ${board.inCheck()?'The king is checked; now identify a second valuable target.':'Find a square that checks the king and attacks another valuable target.'} ${fallback}`;
  }
  if(goal.kind==='developAttack')return `${change} ${['b','n'].includes(move.piece)&&move.from[1]===(move.color==='w'?'1':'8')?'It develops a minor piece':'It does not develop a minor piece from the starting rank'}, and ${goal.target&&board.attackers(goal.target as Square,move.color).includes(move.to)?`it attacks ${goal.target}`:`the moved piece does not attack ${goal.target}`}. This task needs both. ${fallback}`;
  if(goal.kind==='defend')return `${change} ${goal.target&&board.attackers(goal.target as Square,move.color).includes(move.to)?`The moved piece controls ${goal.target}, but check that the target remains your own piece.`:`The moved piece does not defend ${goal.target}.`} A defender must have a real attack on the friendly piece’s square. ${fallback}`;
  if(goal.kind==='castle')return `${change} This is an ordinary move, rather than castling. Check the king’s start, crossing and destination squares before moving king and rook together. ${fallback}`;
  if(goal.kind==='promotion')return `${change} ${move.promotion?`You promoted to a ${NAMES[move.promotion]}; this task asks for a queen without stalemate.`:'The pawn must reach its last rank and become a new piece.'} ${fallback}`;
  if(goal.kind==='check')return `${change} ${side}’s king is not checked by the required piece. Trace the attack to the king, including blockers. ${fallback}`;
  return `${change} ${goal.kind==='curated'?goal.reason:fallback} ${goal.kind==='curated'&&goal.reason!==fallback?fallback:''} This is a comparison with the lesson objective, not a claim that every other legal move is bad.`;
}
export function legalSolutions(fen:string,goal:Goal):string[]{return new Chess(fen).moves({verbose:true}).map(uciOf).filter(move=>satisfies(fen,move,goal));}
