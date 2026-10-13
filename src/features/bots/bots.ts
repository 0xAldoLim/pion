import {Chess, type Move} from 'chess.js';
import type {Evaluation} from '../../chess/types';
import {playUci} from '../../chess/rules';
import {winPercent} from '../../chess/scoring';
export interface Bot {id:string;name:string;band:string;rating:number;tagline:string;color:string;shape:number;skill:number;depth:number;timeMs:number;errorRate:number;lossBudget:number;style:'casual'|'cautious'|'attack'|'positional'|'technical';opening:string[];lines:{hello:string;capture:string;end:string}}
const specs:[string,number,string,string,string,number,number,number,number,Bot['style'],string][]=[
  ['Pebble',150,'First steps','One square at a time.','#dda588',0,4,0.65,32,'casual','e4 e5'],
  ['Sprout',350,'Growing confidence','A little better every day.','#a8c785',1,6,0.50,24,'casual','d4 d5'],
  ['Milo',600,'Casual explorer','Let’s keep our pieces safe.','#b9afa1',3,8,0.35,16,'cautious','e4 e5 Nf3 Nc6'],
  ['Blitz',850,'Quick thinker','There’s always another threat.','#ecb663',5,9,0.30,12,'attack','e4 e5 Nf3 Nc6 Bc4'],
  ['Ivy',1000,'Opening enthusiast','A good beginning goes a long way.','#9cbfba',7,10,0.23,9,'positional','d4 d5 Nf3 Nf6 Bf4'],
  ['Gambit',1200,'Calculated risk','A pawn for the initiative? Deal.','#d88b83',9,11,0.20,7,'attack','e4 e5 f4'],
  ['Rook',1400,'Club attacker','Bring every piece to the party.','#aab6d2',11,12,0.15,5,'attack','e4 c5'],
  ['Sage',1600,'Patient defender','Give the position time to speak.','#b1bc91',13,14,0.10,4,'cautious','e4 c6 d4 d5'],
  ['Bishop',1800,'Technical strategist','Small advantages add up.','#baa4ca',15,15,0.07,3,'technical','d4 Nf6 c4 e6 Nc3 Bb4'],
  ['Knightfall',2000,'Tactical specialist','Look one move further.','#879da7',17,17,0.04,2,'attack','e4 c5 Nf3 d6'],
  ['Crown',2200,'Master style','Every tempo matters.','#d1bd78',19,20,0.01,1,'positional','d4 Nf6 c4 g6'],
  ['Monarch',2800,'Full engine strength','Let’s find the truth on the board.','#92968f',20,24,0,0,'technical',''],
];
export const BOTS:Bot[]=specs.map(([name,rating,band,tagline,color,skill,depth,errorRate,lossBudget,style,opening],shape)=>({id:name.toLowerCase(),name,rating,band,tagline,color,shape,skill,depth,errorRate,lossBudget,style,opening:opening.split(' ').filter(Boolean),timeMs:150+shape*100,lines:{hello:tagline,capture:style==='attack'?'A forcing move. What comes next?':style==='cautious'?'Let’s check the exchanges carefully.':'The material balance is changing.',end:style==='technical'?'A useful position to review.':'Every game gives us something to practice.'}}));
export const botById=(id:string)=>BOTS.find(b=>b.id===id)??BOTS[0]!;
function personality(move:Move,style:Bot['style']):number {
  const center=['d4','e4','d5','e5'].includes(move.to)?0.6:0;
  if(style==='attack')return (move.san.includes('+')?1.6:0)+(move.captured?1.2:0)+center;
  if(style==='cautious')return (move.isKingsideCastle()||move.isQueensideCastle()?1.5:0)+(move.piece==='p'?0.15:0)-Number(move.san.includes('+'))*0.3;
  if(style==='positional')return center+(['b','n'].includes(move.piece)?0.6:0);
  if(style==='technical')return move.captured?0.3:0;
  return (['p','n','b'].includes(move.piece)?0.6:0)+center;
}
/** Candidate loss budgets, errors, preferred openings and positional bias vary by bot. */
export function chooseBotMove(bot:Bot,fen:string,evaluation:Evaluation,historySan:string[],rng=Math.random):string {
  const c=new Chess(fen);
  if(bot.id==='monarch') {playUci(new Chess(fen),evaluation.bestMove);return evaluation.bestMove;}
  if(historySan.length<bot.opening.length&&historySan.every((m,i)=>m===bot.opening[i])) {
    try {return c.move(bot.opening[historySan.length]!).from+c.history({verbose:true}).at(-1)!.to;}catch{/* Leave repertoire when opponent deviates. */}
  }
  const best=evaluation.candidates[0];if(!best)throw new Error('No bot candidates.');
  const side=c.turn();const bestWin=winPercent(best.score,side);
  const error=rng()<bot.errorRate;
  const candidates=evaluation.candidates.map(candidate=>{
    const move=playUci(new Chess(fen),candidate.move);
    const loss=Math.max(0,bestWin-winPercent(candidate.score,side));
    return {candidate,loss,bias:personality(move,bot.style)};
  }).filter(p=>p.loss<=(error?bot.lossBudget:Math.min(1.5,bot.lossBudget)));
  if(!candidates.length)return best.move;
  const weights=candidates.map(p=>Math.exp((p.bias+(error?p.loss*0.07:-p.loss))/(error?1.8:0.8)));
  let pick=rng()*weights.reduce((a,b)=>a+b,0);
  for(const [i,item]of candidates.entries()){pick-=weights[i]!;if(pick<=0)return item.candidate.move;}
  return candidates.at(-1)!.candidate.move;
}
