import {z} from 'zod';
import {Chess} from 'chess.js';
import {playUci,validFen} from '../chess/rules';
import type {Puzzle} from '../chess/types';

export const MAX_BACKUP_BYTES=20_000_000;
export const UCI=z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
export const engineSchema=z.object({profile:z.enum(['fast','balanced','deep','custom']),depth:z.number().int().min(1).max(40),timeMs:z.number().int().min(100).max(30_000),multiPv:z.number().int().min(1).max(8),hashMb:z.number().int().min(16).max(256),threads:z.literal(1),pack:z.enum(['lite','deep'])});
const safeText=z.string().max(2000);
const license=z.string().min(1).max(200);
export const puzzleSchema=z.object({id:z.string().min(1).max(100),fen:z.string().max(160),moves:z.array(UCI).min(1).max(40),rating:z.number().int().min(100).max(4000),themes:z.array(z.string().max(80)).max(25),source:z.string().max(2000),license,attribution:safeText,setup:z.boolean(),explanation:safeText.optional(),master:z.object({white:safeText,black:safeText,event:safeText,date:z.string().max(30),moveNumber:z.number().int().positive(),gamePgn:z.string().max(100_000)}).optional()});
export function validatePuzzle(value:unknown):Puzzle {
  const puzzle=puzzleSchema.parse(value);validFen(puzzle.fen);
  const chess=new Chess(puzzle.fen);for(const move of puzzle.moves)playUci(chess,move);
  if(puzzle.setup && puzzle.moves.length<2)throw new Error('Puzzle requires a setup move and a solution.');
  if(!/^(https?:\/\/|pion:)/.test(puzzle.source))throw new Error('Puzzle source must identify its provenance.');
  return puzzle;
}
/** Bounded CSV parser supporting quotes, commas and CRLF; no executable annotations. */
export function parseCsv(text:string):string[][] {
  if(new TextEncoder().encode(text).length>10_000_000)throw new Error('Puzzle imports are limited to 10 MB. Split large exports into packs.');
  const rows:string[][]=[];let row:string[]=[];let field='';let quoted=false;
  for(let i=0;i<text.length;i++) {
    const ch=text[i]!;
    if(ch==='"') {if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(ch===','&&!quoted){row.push(field);field='';}
    else if(ch==='\n'&&!quoted){row.push(field.replace(/\r$/,''));if(row.some(f=>f.length))rows.push(row);row=[];field='';if(rows.length>25_001)throw new Error('Import at most 25,000 puzzles per pack.');}
    else field+=ch;
  }
  if(quoted)throw new Error('Unterminated CSV quote.');
  if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}
  return rows;
}
export function importPuzzleCsv(text:string):Puzzle[] {
  const [header,...rows]=parseCsv(text);if(!header)throw new Error('Empty CSV.');
  const required=['PuzzleId','FEN','Moves','Rating','Themes'];for(const field of required)if(!header.includes(field))throw new Error(`Missing CSV field ${field}.`);
  return rows.map(row=>{
    const read=(key:string)=>row[header.indexOf(key)]??'';
    return validatePuzzle({id:read('PuzzleId'),fen:read('FEN'),moves:read('Moves').trim().split(/\s+/),rating:Number(read('Rating')),themes:read('Themes').trim().split(/\s+/).filter(Boolean),source:read('GameUrl')||`https://lichess.org/training/${read('PuzzleId')}`,license:'CC0-1.0',attribution:'Lichess puzzle database',setup:true});
  });
}
