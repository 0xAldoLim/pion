import type { Color } from 'chess.js';
import type { Candidate, Score } from '../chess/types';
import { other } from '../chess/rules';

export function normalizeScore(kind: 'cp'|'mate', value: number, turn: Color): Score {
  if (kind === 'cp') return {kind,value:turn === 'w' ? value:-value};
  const winner = value > 0 ? turn : other(turn);
  return {kind,value:winner === 'w' ? Math.abs(value):-Math.abs(value),winner};
}
export function parseInfo(line: string, turn: Color): {rank: number; candidate: Candidate} | null {
  if (!line.startsWith('info ') || /\b(lowerbound|upperbound)\b/.test(line)) return null;
  const score = /\bscore (cp|mate) (-?\d+)/.exec(line);
  const pv = /\bpv (.+)$/.exec(line);
  const depth = /\bdepth (\d+)/.exec(line);
  if (!score || !pv || !depth) return null;
  const moves = pv[1]!.trim().split(/\s+/).filter(m=>/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m));
  if (!moves[0]) return null;
  return {rank:Number(/\bmultipv (\d+)/.exec(line)?.[1] ?? 1),candidate:{move:moves[0],score:normalizeScore(score[1] as 'cp'|'mate',Number(score[2]),turn),depth:Number(depth[1]),pv:moves,nodes:Number(/\bnodes (\d+)/.exec(line)?.[1] ?? 0)}};
}
