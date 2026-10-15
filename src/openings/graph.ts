import {Chess,type Color} from 'chess.js';
import {bookMovesAt,identifyOpening,isBookMove} from '../data/openings';
import {CURATED_ANNOTATIONS} from '../data/opening-courses';
import {positionKey} from './teaching';
import {playUci} from '../chess/rules';
import type {Evaluation} from '../chess/types';
import {repertoireIndex,type RepertoireIndex} from './position-index';
export {repertoireIndex};
export type {RepertoireIndex};
export function graphPosition(fen:string,saved:RepertoireIndex=new Map(),evaluation?:Evaluation){
  const board=new Chess(fen),key=positionKey(fen),user=saved.get(key)??new Map<string,string[]>();
  const engine=evaluation?.fen===fen?evaluation.candidates:[];
  const moves=[...new Set([...bookMovesAt(fen),...user.keys(),...engine.map(c=>c.move)])];
  return {id:key,opening:identifyOpening(board.fen()),turn:board.turn(),moves:moves.map(move=>{const next=new Chess(fen),legal=playUci(next,move);return {move,san:legal.san,to:positionKey(next.fen()),book:isBookMove(board.fen(),move),curated:CURATED_ANNOTATIONS.has(`${key}|${move}`),repertoire:user.get(move)??[],engine:engine.find(c=>c.move===move),opening:identifyOpening(next.fen())};})};
}
export interface VariationNode {id:number;parent?:number;fen:string;move?:string;san?:string;children:number[]}
export function appendVariation(nodes:VariationNode[],parent:number,move:string):{nodes:VariationNode[];selected:number}{
  const previous=nodes[parent]!;const existing=previous.children.find(id=>nodes[id]?.move===move);if(existing!==undefined)return {nodes,selected:existing};
  const board=new Chess(previous.fen),m=playUci(board,move),id=nodes.length;
  return {nodes:[...nodes.map(n=>n.id===parent?{...n,children:[...n.children,id]}:n),{id,parent,fen:board.fen(),move,san:m.san,children:[]}],selected:id};
}
export function variationPath(nodes:VariationNode[],id:number):VariationNode[]{const path:VariationNode[]=[];let current=nodes[id];while(current?.parent!==undefined){path.unshift(current);current=nodes[current.parent];}return path;}
export function learnerMoves(startFen:string,moves:string[],color:Color){const board=new Chess(startFen);return moves.filter(move=>{const own=board.turn()===color;playUci(board,move);return own;});}
