import {Chess,type Color} from 'chess.js';
import type {EngineSettings,Repertoire,Game} from '../chess/types';
import {playUci,START_FEN,newGame,replay} from '../chess/rules';
import {isBookMove} from '../data/openings';
import {moveFacts} from '../coach/facts';
import {expectedPoints,formatScore} from '../chess/scoring';
import {engine,type EngineManager} from '../engine/manager';
import {db,type PionDatabase,saveGame} from '../storage/db';
import {freshRepetition,schedule} from '../learning/repetition';
import {positionKey,openingExplanation} from './teaching';
import type {OpeningStudyProgress} from '../learning/models';
export type OpeningPracticeMode='guided'|'recall'|'practical';
export function practiceGraph(startFen:string,branches:string[][]){const graph=new Map<string,string[]>();for(const line of branches){const board=new Chess(startFen);for(const move of line){const key=positionKey(board.fen());graph.set(key,[...new Set([...(graph.get(key)??[]),move])]);playUci(board,move);}}return graph;}
export interface AlternativeResult {kind:'studied'|'book'|'sound'|'different';explanation:string;verifiedLoss?:number}
export async function assessOpeningMove(fen:string,uci:string,studied:string[],settings:EngineSettings,signal:AbortSignal,manager:EngineManager=engine):Promise<AlternativeResult>{
  const board=new Chess(fen),color=board.turn(),move=playUci(board,uci);
  if(board.isCheckmate())return {kind:'sound',explanation:`${move.san} is verified checkmate.`};
  if(board.isDraw())return {kind:'different',explanation:`${move.san} ends this diagram in a rule-verified draw. This is a different outcome from continuing the opening study.`};
  if(studied.includes(uci))return {kind:'studied',explanation:openingExplanation(fen,uci)};
  const warning=moveFacts(fen,uci).find(f=>f.kind==='allowsMate');
  if(warning)return {kind:'different',explanation:`${move.san} allows a verified mating reply. ${warning.text}`};
  if(isBookMove(fen,uci))return {kind:'book',explanation:`${move.san} is a known ECO alternative. ${openingExplanation(fen,uci)} Book status does not guarantee move quality.`};
  const pinned={...settings,profile:'custom' as const,pack:'lite' as const,depth:18,timeMs:1200,multiPv:3};
  const before=await manager.analyze(fen,pinned,{signal,priority:2});const after=await manager.analyze(board.fen(),pinned,{signal,priority:2});
  const a=before.candidates[0],b=after.candidates[0];if(!a||!b)throw new Error('No completed comparison is available.');
  const loss=Math.max(0,expectedPoints(a.score,color)-expectedPoints(b.score,color));
  return {kind:loss<=0.04?'sound':'different',verifiedLoss:loss,explanation:`${move.san}: this limited local comparison changes White’s score from ${formatScore(a.score)} to ${formatScore(b.score)} (depths ${a.depth}/${b.depth}). ${loss<=0.04?'It remains close to the strongest candidate under these search limits.':'The engine finds a stronger continuation; examine its forcing replies.'} ${moveFacts(fen,uci).find(f=>f.kind==='hanging')?.text??''}`};
}
export async function recordOpeningPosition({openingId,fen,move,color,mode,errors,hints,now=Date.now()}:{openingId:string;fen:string;move:string;color:Color;mode:'guided'|'recall';errors:number;hints:number;now?:number},database:PionDatabase=db){
  const board=new Chess(fen);if(board.turn()!==color)throw new Error('Only the learner’s own moves can record recall.');playUci(board,move);const positionId=positionKey(fen),id=`${openingId}:${color}:${positionId}:${move}`;
  return database.transaction('rw',database.openingStudy,async()=>{const old=await database.openingStudy.get(id);const repetition=old??freshRepetition(now),independent=mode==='recall'&&errors===0&&hints===0;
    const next:OpeningStudyProgress={version:1,id,openingId,positionId,color,move,mode,reviewedAt:now,errors:(old?.errors??0)+errors,hintsUsed:(old?.hintsUsed??0)+hints,recallSuccesses:(old?.recallSuccesses??0)+Number(independent&&now>=repetition.due),...(mode==='recall'?schedule(repetition,errors===0,hints,now):repetition)};await database.openingStudy.put(next);return next;});
}
export async function launchOpeningBot({name,openingId,startFen=START_FEN,moves,color,botId}:{name:string;openingId:string;startFen?:string;moves:string[];color:Color;botId:string}):Promise<Game>{
  const game={...newGame(botId,color,'bot'),startFen:replay({startFen,moves}).fen(),headers:{Event:'Pion practical opening training',PionOpening:openingId,PionStudy:name}};
  await saveGame(game);return game;
}
export function sameRepertoire(a:Pick<Repertoire,'startFen'|'moves'|'color'>,b:Pick<Repertoire,'startFen'|'moves'|'color'>){return a.color===b.color&&positionKey(a.startFen??START_FEN)===positionKey(b.startFen??START_FEN)&&a.moves.join(',')===b.moves.join(',');}
