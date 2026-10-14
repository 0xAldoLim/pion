import {Chess} from 'chess.js';
import type {Game,Repertoire} from '../chess/types';
import {playUci,START_FEN,replay} from '../chess/rules';
import {isBookMove,identifyOpening} from '../data/openings';
import {positionKey} from './teaching';
import {repertoireIndex} from './graph';
import {sameRepertoire} from './practice';
import {db,type PionDatabase} from '../storage/db';
import {freshRepetition} from '../learning/repetition';
export interface RepertoireDecision {ply:number;fen:string;move:string;status:'studied'|'known-alternative'|'deviation'|'unfamiliar'|'line-ended';lineIds:string[];tacticalMistake:boolean}
export function compareRepertoire(game:Game,lines:Repertoire[]):RepertoireDecision[]{
  const mine=lines.filter(r=>r.color===game.playerColor),index=repertoireIndex(mine),ends=new Set(mine.map(r=>positionKey(replay({startFen:r.startFen??START_FEN,moves:r.moves}).fen()))),board=new Chess(game.startFen),decisions:RepertoireDecision[]=[];
  for(const [i,move] of game.moves.slice(0,20).entries()){const fen=board.fen(),own=board.turn()===game.playerColor,key=positionKey(fen),node=index.get(key);if(own){const ids=node?.get(move)??[],row=game.review?.moves[i];decisions.push({ply:i+1,fen,move,lineIds:ids.length?ids:[...(node?.values()??[])].flat(),status:ids.length?'studied':node?isBookMove(fen,move)?'known-alternative':'deviation':ends.has(key)?'line-ended':'unfamiliar',tacticalMistake:!!game.review?.completed&&!!row&&row.color===game.playerColor&&row.scores.pion.loss>=0.05});}playUci(board,move);}
  return decisions;
}
export async function saveReviewBranch(game:Game,ply:number,parent?:Repertoire,database:PionDatabase=db){
  if(ply<1||ply>Math.min(game.moves.length,20))throw new Error('Choose a played opening position first.');
  const row=game.review?.completed?game.review.moves[ply-1]:undefined,moves=[...game.moves.slice(0,ply-1),...(row?.before.candidates[0]?.pv.slice(0,6)??[game.moves[ply-1]!])];
  replay({startFen:game.startFen,moves});const lines=await database.repertoire.toArray();const branch={startFen:game.startFen,moves,color:game.playerColor};const old=lines.find(r=>sameRepertoire(r,branch));if(old)return old;
  const record:Repertoire={id:crypto.randomUUID(),openingId:parent?.openingId??identifyOpening(replay({startFen:game.startFen,moves},Math.min(6,moves.length)).fen())?.id??'review',name:`${parent?.name??'Reviewed opening'} · move ${ply}`.slice(0,200),...branch,folder:(parent?.folder??parent?.name??'Game review').slice(0,100),parentId:parent?.id,sourceGameId:game.id,notes:row?`Local Stockfish candidate at move ${ply}. Review depth ${row.before.candidates[0]?.depth}.`:'Saved from the played opening position.',...freshRepetition()};await database.repertoire.add(record);return record;
}

