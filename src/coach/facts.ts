// Static-exchange concept adapted from Patzer (MIT). See THIRD_PARTY_NOTICES.md.
import { Chess, type Color, type Square } from 'chess.js';
import { other, playUci, uciOf } from '../chess/rules';
import type { TacticalEvidence } from '../chess/types';
import {lineMotifs,positionFeatures} from './features';
import {NAMES,VALUES} from './material';
export {NAMES,VALUES} from './material';

/** Bounded legal capture exchange. Pinned attackers are excluded by chess.js. */
export function staticExchange(fen:string,square:Square,remaining=16):number {
  if(!remaining)return 0;
  const c=new Chess(fen);
  const captures=c.moves({verbose:true}).filter(m=>m.to===square && m.captured);
  if(!captures.length)return 0;
  const move=captures.reduce((a,b)=>VALUES[a.piece]<=VALUES[b.piece]?a:b);
  const gain=VALUES[move.captured!]+(move.promotion?VALUES[move.promotion]-1:0);
  c.move(move);
  return Math.max(0,gain-staticExchange(c.fen(),square,remaining-1));
}
export function material(fen:string,color:Color):number {
  return new Chess(fen).board().flat().reduce((sum,p)=>sum+(p?.color===color?VALUES[p.type]:0),0);
}
export function moveFacts(fen:string,uci:string):TacticalEvidence[] {
  const c=new Chess(fen);const move=playUci(c,uci);const facts:TacticalEvidence[]=[];
  const add=(kind:string,text:string,squares:string[],line?:string[])=>facts.push({kind,text,squares,line,position:fen});
  if(c.isCheckmate())add('mate',`${move.san} is checkmate: the king has no legal escape.`,[move.to],[uci]);
  else if(c.inCheck())add('check',`${NAMES[move.piece]} to ${move.to} gives check.`,[move.to]);
  if(move.captured)add('capture',`${move.san} captures a ${NAMES[move.captured]}${move.isEnPassant()?' en passant':''}.`,[move.to]);
  if(move.promotion)add('promotion',`The pawn promotes to a ${NAMES[move.promotion]}.`,[move.to]);
  if(move.isKingsideCastle()||move.isQueensideCastle())add('castling','Castling brings the king and rook into new positions.',[move.to]);
  const targets=c.board().flat().filter(p=>p?.color===other(move.color) && c.attackers(p.square,move.color).includes(move.to));
  const valuable=targets.filter(p=>p && (p.type==='k'||VALUES[p.type]>VALUES[move.promotion??move.piece]));
  // Verify moved piece is not pinned to its own king before calling a fork.
  const ownKing=c.board().flat().find(p=>p?.type==='k'&&p.color===move.color);
  const clone=new Chess(c.fen());clone.remove(move.to);
  const pinned=ownKing ? clone.isAttacked(ownKing.square,other(move.color)):true;
  if(valuable.length>=2 && !pinned)add('fork',`The ${NAMES[move.promotion??move.piece]} on ${move.to} attacks ${valuable.map(p=>`${NAMES[p!.type]} on ${p!.square}`).join(' and ')}. These are threats; the opponent may defend.`,[move.to,...valuable.map(p=>p!.square)]);
  const captures=c.moves({verbose:true}).filter(m=>m.captured && m.captured!=='p');
  for(const capture of captures.slice(0,12)) {
    const gain=staticExchange(c.fen(),capture.to);
    if(gain>0)add('hanging',`The opponent has the legal capture ${capture.san}; the bounded exchange yields about ${gain} pawn${gain===1?'':'s'} of material.`,[capture.to,capture.from],[uci,uciOf(capture)]);
  }
  const mate=c.moves().find(m=>m.endsWith('#'));
  if(mate)add('allowsMate',`The opponent can play ${mate}, checkmate.`,[],[uci,uciOf(c.moves({verbose:true}).find(m=>m.san===mate)!)]);
  if((move.piece==='n'||move.piece==='b') && move.from[1]===(move.color==='w'?'1':'8') && move.to[1]!==move.from[1])add('development',`The ${NAMES[move.piece]} leaves its starting rank. Before your next move, check captures and threats.`,[move.from,move.to]);
  // A legally immobile enemy piece on a king-ray is an absolute pin.
  const enemyKing=c.board().flat().find(p=>p?.type==='k'&&p.color===c.turn());
  if(enemyKing)for(const row of c.board())for(const piece of row) {
    if(!piece||piece.color!==c.turn()||piece.type==='k')continue;
    const without=new Chess(c.fen());without.remove(piece.square);
    if(!c.isAttacked(enemyKing.square,move.color)&&without.isAttacked(enemyKing.square,move.color))add('pin',`The ${NAMES[piece.type]} on ${piece.square} shields its king: moving off that line would expose check.`,[piece.square,enemyKing.square]);
  }
  for(const motif of lineMotifs(fen,c.fen(),move.from,move.to,move.color))facts.push({...motif,line:[uci]});
  for(const feature of positionFeatures(c.fen()).filter(f=>['passedPawn','backRank'].includes(f.kind)))facts.push({...feature,position:fen,line:[uci]});
  return facts.slice(0,12);
}
export function phase(fen:string):'opening'|'middlegame'|'endgame' {
  const c=new Chess(fen);const nonPawn=c.board().flat().reduce((sum,p)=>sum+(p&&p.type!=='p'?VALUES[p.type]:0),0);
  return nonPawn<=20?'endgame':Number(fen.split(' ')[5])<=10?'opening':'middlegame';
}
export function positionAdvice(fen:string):string {
  const c=new Chess(fen);
  if(c.isCheckmate())return 'Checkmate. Review the last few moves to find where the threat became decisive.';
  if(c.isDraw())return 'This position is a draw under the standard rules.';
  if(c.inCheck())return 'Your king is in check. Find a legal capture, block, or king move.';
  const mate=c.moves().find(m=>m.endsWith('#'));if(mate)return 'There is a mate in one. Look for forcing checks.';
  const capture=c.moves({verbose:true}).find(m=>m.captured&&staticExchange(fen,m.to)>0);
  if(capture)return `An opponent's piece on ${capture.to} is vulnerable to a legal capture. Calculate the replies before committing.`;
  const feature=positionFeatures(fen).find(f=>f.kind==='passedPawn')??positionFeatures(fen).find(f=>f.kind==='center'||f.kind==='endgame');
  if(feature)return feature.text;
  return phase(fen)==='opening'?'Develop your minor pieces, contest the center, and check your king’s safety.':'Start with checks, captures, and threats for both sides. Then compare your candidate moves.';
}
