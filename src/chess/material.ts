import type {Chess,Color,PieceSymbol} from 'chess.js';

export const CAPTURE_ORDER=['p','n','b','r','q'] as const;
export type CapturedPiece=typeof CAPTURE_ORDER[number];
export interface MaterialSummary {pieces:Record<CapturedPiece,number>;advantage:number}
const values:Record<PieceSymbol,number>={p:1,n:3,b:3,r:5,q:9,k:0};
const empty=():MaterialSummary=>({pieces:{p:0,n:0,b:0,r:0,q:0},advantage:0});

/** Actual captures belong to the capturer; material points come from the current board. */
export function capturedMaterial(position:Chess):Record<Color,MaterialSummary>{
  const summary={w:empty(),b:empty()};
  for(const move of position.history({verbose:true})){
    if(move.captured&&move.captured!=='k')summary[move.color].pieces[move.captured]++;
  }
  const totals={w:0,b:0};
  for(const piece of position.board().flat())if(piece)totals[piece.color]+=values[piece.type];
  summary.w.advantage=Math.max(0,totals.w-totals.b);
  summary.b.advantage=Math.max(0,totals.b-totals.w);
  return summary;
}
