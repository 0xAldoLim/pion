import { Chess, validateFen, type Color, type Move } from 'chess.js';
import type { Game } from './types';

export const START_FEN = new Chess().fen();
export const other = (color: Color): Color => color === 'w' ? 'b' : 'w';
export const uciOf = (move: Move) => move.from + move.to + (move.promotion ?? '');
export function playUci(chess: Chess, uci: string): Move {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) throw new Error('Move must be legal UCI, for example e2e4.');
  return chess.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});
}
export function validFen(fen: string): string {
  if (fen.length > 160 || !validateFen(fen).ok) throw new Error('Invalid FEN. Supply all six fields and both kings.');
  const c = new Chess(fen);
  const inactive = other(c.turn());
  const king = c.board().flat().find(p => p?.type === 'k' && p.color === inactive);
  if (king && c.isAttacked(king.square, c.turn())) throw new Error('Illegal FEN: the inactive king is in check.');
  return c.fen();
}
export function replay(game: Pick<Game,'startFen'|'moves'>, end = game.moves.length): Chess {
  const chess = new Chess(game.startFen);
  for (const move of game.moves.slice(0,end)) playUci(chess,move);
  return chess;
}
export function lineSan(fen: string, moves: string[]): string[] {
  const c = new Chess(fen);
  const sans: string[] = [];
  for (const uci of moves) {try {sans.push(playUci(c,uci).san);} catch {break;}}
  return sans;
}
export function outcome(chess: Chess): {result: string; reason: string} | null {
  if (chess.isCheckmate()) return {result:chess.turn() === 'w' ? '0-1':'1-0',reason:'Checkmate'};
  if (chess.isStalemate()) return {result:'1/2-1/2',reason:'Stalemate'};
  if (chess.isThreefoldRepetition()) return {result:'1/2-1/2',reason:'Threefold repetition'};
  if (chess.isInsufficientMaterial()) return {result:'1/2-1/2',reason:'Insufficient material'};
  if (chess.isDrawByFiftyMoves()) return {result:'1/2-1/2',reason:'Fifty-move rule'};
  return null;
}
export function newGame(botId = 'pebble', playerColor: Color = 'w', mode: Game['mode'] = 'bot', seconds = 0, increment = 0): Game {
  return {id:crypto.randomUUID(),createdAt:Date.now(),updatedAt:Date.now(),startFen:START_FEN,moves:[],san:[],botId,playerColor,mode,status:'active',result:'*',reason:'',initialSeconds:seconds,increment,clocks:{w:seconds,b:seconds}};
}
export function importPgn(text: string): Game {
  if (new TextEncoder().encode(text).length > 1_000_000) throw new Error('PGN exceeds the 1 MB limit.');
  const c = new Chess();
  try {c.loadPgn(text, {strict:false});} catch {throw new Error('Invalid PGN. No saved games were changed.');}
  const history = c.history({verbose:true});
  if (history.length > 1000) throw new Error('PGN exceeds 1,000 half-moves.');
  const headers = c.getHeaders();
  const terminal=outcome(c);const result=terminal?.result??headers.Result??'*';
  return {...newGame('import','w','import'),startFen:validFen(headers.FEN ?? START_FEN),moves:history.map(uciOf),san:history.map(m=>m.san),status:'finished',result,reason:terminal?.reason??'Imported game',headers:{...headers,Result:result}};
}
export function exportPgn(game: Game, mode: 'inspired'|'pion' = 'pion', annotated = false): string {
  const c = new Chess(game.startFen);
  c.setHeader('Event','Pion local training');
  c.setHeader('White',game.headers?.White ?? (game.playerColor === 'w' ? 'You' : game.botId));
  c.setHeader('Black',game.headers?.Black ?? (game.playerColor === 'b' ? 'You' : game.botId));
  c.setHeader('Result',game.result);
  for (const [i,move] of game.moves.entries()) {
    playUci(c,move);
    const row = game.review?.moves[i];
    if (annotated && row) c.setComment(`Pion ${mode} ${row.scores[mode].version}: ${row.scores[mode].classification}; accuracy ${row.scores[mode].accuracy.toFixed(1)}; best ${row.bestSan}. ${row.evidence.map(e=>e.text).join(' ')}`);
  }
  return c.pgn({maxWidth:90});
}
export function positionIdentity(game: Pick<Game,'startFen'|'moves'>): string {return JSON.stringify([game.startFen,game.moves]);}
