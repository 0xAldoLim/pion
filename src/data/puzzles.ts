import data from './puzzles.json';
import type {Puzzle} from '../chess/types';
import {MASTER_PUZZLES} from './masters';
import {Chess} from 'chess.js';
import {playUci} from '../chess/rules';
export const DEFAULT_PUZZLES=data.puzzles as Puzzle[];
export const allDefaultPuzzles=[...DEFAULT_PUZZLES,...MASTER_PUZZLES];
export function puzzleStart(puzzle:Puzzle):{fen:string;solution:string[]} {
  const c=new Chess(puzzle.fen);if(puzzle.setup)playUci(c,puzzle.moves[0]!);
  return {fen:c.fen(),solution:puzzle.moves.slice(puzzle.setup?1:0)};
}
export function dailyPuzzle(date=new Date()):Puzzle {
  const day=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86_400_000);
  return DEFAULT_PUZZLES[day%DEFAULT_PUZZLES.length]!;
}
