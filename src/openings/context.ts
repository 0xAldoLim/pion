import type {Color} from 'chess.js';
import {validFen,replay,START_FEN} from '../chess/rules';
export interface StudyContext {mode:'explore'|'practice';fen:string;openingId?:string;name:string;color:Color;startFen?:string;moves?:string[];continuation?:string[];practiceMode?:'guided'|'recall';returnGameId?:string;returnPly?:number}
export const studyRoute=(context:StudyContext)=>`study:${JSON.stringify(context)}`;
export const reviewRoute=(gameId:string,ply:number)=>`${gameId}:ply:${Math.max(0,Math.floor(ply))}`;
export function parseStudyContext(id?:string):StudyContext|undefined {
 if(!id?.startsWith('study:')||id.length>16000)return;
 try{
  const value=JSON.parse(id.slice(6)) as StudyContext;
  if(!['explore','practice'].includes(value.mode)||!['w','b'].includes(value.color)||typeof value.name!=='string'||value.name.length>200)return;
  if(value.openingId!==undefined&&(typeof value.openingId!=='string'||value.openingId.length>150))return;
  if(value.practiceMode!==undefined&&!['guided','recall'].includes(value.practiceMode))return;
  value.fen=validFen(value.fen);if(value.startFen)value.startFen=validFen(value.startFen);
  if(value.moves){if(!Array.isArray(value.moves)||value.moves.length>100||replay({startFen:value.startFen??START_FEN,moves:value.moves}).fen()!==value.fen)return;}
  if(value.continuation){if(!Array.isArray(value.continuation)||value.continuation.length>100)return;replay({startFen:value.fen,moves:value.continuation});}
  if(value.mode==='practice'&&!value.continuation?.length)return;
  if(value.returnGameId!==undefined&&(typeof value.returnGameId!=='string'||value.returnGameId.length>150))return;
  if(value.returnPly!==undefined&&(!Number.isInteger(value.returnPly)||value.returnPly<0||value.returnPly>1000))return;
  return value;
 }catch{return;}
}
