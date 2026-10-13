import {Chess,type Color,type Square} from 'chess.js';
import {playUci} from './rules';

export const MAX_PREMOVES=5;

/** A preview only: no move enters the game until it passes normal chess legality. */
export function projectPremoves(fen:string,moves:readonly string[],color:Color):string {
  const chess=new Chess(fen);
  for(const uci of moves){
    if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci))throw new Error('Invalid premove.');
    const from=uci.slice(0,2) as Square,to=uci.slice(2,4) as Square;
    const piece=chess.get(from),target=chess.get(to);
    if(!piece||piece.color!==color||target?.color===color||target?.type==='k')throw new Error('Choose one of your pieces and an available destination.');
    if(!premoveDestinations(chess.fen(),color).get(from)?.includes(to))throw new Error('That piece cannot move to this square.');
    if(piece.type==='p'&&(to[1]==='1'||to[1]==='8')&&!uci[4])throw new Error('Choose a promotion piece.');
    chess.remove(from);chess.remove(to);
    chess.put({...piece,type:piece.type==='p'&&uci[4]?uci[4] as 'q'|'r'|'b'|'n':piece.type},to);
    if(piece.type==='k'&&Math.abs(from.charCodeAt(0)-to.charCodeAt(0))===2){
      const rookFrom=(to[0]==='g'?'h':'a')+from[1] as Square,rookTo=(to[0]==='g'?'f':'d')+from[1] as Square;
      const rook=chess.remove(rookFrom);if(rook)chess.put(rook,rookTo);
    }
  }
  return chess.fen();
}

/** Geometric choices include possible captures after the opponent's future reply. */
export function premoveDestinations(fen:string,color:Color):Map<Square,Square[]> {
  const chess=new Chess(fen),dests=new Map<Square,Square[]>(),rights=fen.split(' ')[2]??'';
  for(const piece of chess.board().flat()){
    if(!piece||piece.color!==color)continue;
    const from=piece.square,fx=from.charCodeAt(0)-97,fy=Number(from[1]),choices:Square[]=[];
    for(let x=0;x<8;x++)for(let y=1;y<=8;y++){
      const to=(String.fromCharCode(97+x)+y) as Square,target=chess.get(to);
      if(to===from||target?.color===color||target?.type==='k')continue;
      const dx=Math.abs(x-fx),dy=Math.abs(y-fy),direction=color==='w'?1:-1;
      const rook=chess.get(((x===6?'h':'a')+fy) as Square);
      const castle=piece.type==='k'&&from===(color==='w'?'e1':'e8')&&y===fy&&
        ((x===6&&rights.includes(color==='w'?'K':'k'))||(x===2&&rights.includes(color==='w'?'Q':'q')))&&
        rook?.type==='r'&&rook.color===color&&
        (x===6?['f','g']:['b','c','d']).every(file=>chess.get((file+fy) as Square)?.color!==color);
      const possible=piece.type==='p'?dx<=1&&(y-fy===direction||(dx===0&&fy===(color==='w'?2:7)&&y-fy===2*direction)):
        piece.type==='n'?dx*dy===2:piece.type==='b'?dx===dy:piece.type==='r'?dx===0||dy===0:
        piece.type==='q'?dx===dy||dx===0||dy===0:Math.max(dx,dy)===1||castle;
      if(possible)choices.push(to);
    }
    dests.set(from,choices);
  }
  return dests;
}

export function isLegalPremove(fen:string,uci:string,color:Color):boolean {
  try{const chess=new Chess(fen);if(chess.turn()!==color||chess.isGameOver())return false;playUci(chess,uci);return true;}catch{return false;}
}
