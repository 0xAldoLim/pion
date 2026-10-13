import {Chess,type Color,type Square} from 'chess.js';
import type {TacticalEvidence} from '../chess/types';
import {NAMES,VALUES} from './material';
const other=(color:Color):Color=>color==='w'?'b':'w';
export function positionFeatures(fen:string):TacticalEvidence[]{
  const c=new Chess(fen),pieces=c.board().flat().filter(p=>p!==null);const facts:TacticalEvidence[]=[];
  const add=(kind:string,text:string,squares:string[])=>facts.push({kind,text,squares,position:fen});
  const totals={w:0,b:0};for(const p of pieces)totals[p.color]+=VALUES[p.type];
  const difference=totals.w-totals.b;
  if(difference)add('material',`${difference>0?'White':'Black'} has ${Math.abs(difference)} more pawn-units of material using 1/3/3/5/9 piece values. Activity and king safety still matter.`,[]);
  const center:Square[]=['d4','e4','d5','e5'];const controlled=center.filter(s=>c.isAttacked(s,c.turn()));
  if(controlled.length)add('center',`${c.turn()==='w'?'White':'Black'} attacks ${controlled.join(', ')} in the center. Compare the opponent’s replies before advancing pawns.`,controlled);
  const king=pieces.find(p=>p.color===c.turn()&&p.type==='k');
  if(king){
    const rank=Number(king.square[1]);const direction=king.color==='w'?1:-1;
    const cover=pieces.filter(p=>p.color===king.color&&p.type==='p'&&Number(p.square[1])===rank+direction&&Math.abs(p.square.charCodeAt(0)-king.square.charCodeAt(0))<=1);
    add('kingSafety',`The king on ${king.square} has ${cover.length} friendly pawn${cover.length===1?'':'s'} immediately ahead of it. Check open lines and forcing checks; pawn cover alone does not prove safety.`,[king.square,...cover.map(p=>p.square)]);
    if(rank===(king.color==='w'?1:8)&&!c.moves({verbose:true}).some(m=>m.piece==='k'))add('backRank',`The king on ${king.square} is on its back rank and currently has no legal king move. Keep checking rook and queen entries; other pieces may still defend.`,[king.square]);
  }
  for(const pawn of pieces.filter(p=>p.color===c.turn()&&p.type==='p')){
    const rank=Number(pawn.square[1]);const enemy=pieces.some(p=>p.color!==pawn.color&&p.type==='p'&&Math.abs(p.square.charCodeAt(0)-pawn.square.charCodeAt(0))<=1&&(pawn.color==='w'?Number(p.square[1])>rank:Number(p.square[1])<rank));
    if(!enemy)add('passedPawn',`The pawn on ${pawn.square} is passed: no enemy pawn is ahead on its file or either neighboring file. Calculate king and piece blockades before pushing it.`,[pawn.square]);
  }
  const nonPawn=pieces.reduce((n,p)=>n+(p.type==='p'?0:VALUES[p.type]),0);
  if(nonPawn<=20)add('endgame','With this reduced material, king activity, pawn races, opposition and stalemate deserve attention. Calculate the legal route before moving your king.',pieces.filter(p=>p.type==='k').map(p=>p.square));
  return facts;
}
/** Geometric motifs are reported as attacks, never a guaranteed material win. */
export function lineMotifs(beforeFen:string,afterFen:string,movedFrom:Square,movedTo:Square,color:Color):TacticalEvidence[]{
  const before=new Chess(beforeFen),after=new Chess(afterFen);const pieces=after.board().flat().filter(p=>p!==null);const facts:TacticalEvidence[]=[];
  const add=(kind:string,text:string,squares:string[])=>facts.push({kind,text,squares,position:beforeFen});
  const enemies=pieces.filter(p=>p.color!==color&&(p.type==='k'||VALUES[p.type]>=3));
  const attacked=enemies.filter(p=>after.attackers(p.square,color).includes(movedTo));
  if(attacked.length>=2)add('doubleAttack',`The piece on ${movedTo} attacks ${attacked.map(p=>`${NAMES[p.type]} on ${p.square}`).join(' and ')}. This double attack does not guarantee a win; check captures and defenses.`,[movedTo,...attacked.map(p=>p.square)]);
  for(const target of enemies)for(const attacker of after.attackers(target.square,color)){
    const p=after.get(attacker);
    if(attacker!==movedTo&&p&&['b','r','q'].includes(p.type)&&before.get(attacker)?.color===color&&!before.attackers(target.square,color).includes(attacker))add('discoveredAttack',`Moving from ${movedFrom} to ${movedTo} opens the ${NAMES[p.type]} on ${attacker} toward the ${NAMES[target.type]} on ${target.square}. Check whether the opponent can block or capture.`,[attacker,target.square,movedFrom]);
  }
  const directions:[number,number][]=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for(const slider of pieces.filter(p=>p.color===color&&['b','r','q'].includes(p.type)))for(const [dx,dy]of directions){
    if(slider.type==='b'&&(!dx||!dy)||slider.type==='r'&&dx&&dy)continue;
    let x=slider.square.charCodeAt(0)-97,y=Number(slider.square[1])-1;const targets=[];
    while((x+=dx)>=0&&x<8&&(y+=dy)>=0&&y<8){const square=(String.fromCharCode(97+x)+(y+1)) as Square;const piece=after.get(square);if(!piece)continue;if(piece.color===color)break;targets.push({...piece,square});if(targets.length===2)break;}
    const first=targets[0],second=targets[1];
    if(first&&second&&(first.type==='k'||VALUES[first.type]>VALUES[second.type])&&second.type!=='p')add('skewer',`The ${NAMES[slider.type]} on ${slider.square} lines up the ${NAMES[first.type]} on ${first.square} and ${NAMES[second.type]} on ${second.square}. If the front piece moves, the rear piece may become exposed; this is a skewer pattern.`,[slider.square,first.square,second.square]);
  }
  // Illegal pinned attackers cannot support a concrete double/discovered attack.
  const ownKing=pieces.find(p=>p.color===color&&p.type==='k');
  return facts.filter(f=>{const source=f.squares[0] as Square;if(!ownKing||source===ownKing.square)return true;const clone=new Chess(afterFen);clone.remove(source);return !clone.isAttacked(ownKing.square,other(color));}).slice(0,4);
}
