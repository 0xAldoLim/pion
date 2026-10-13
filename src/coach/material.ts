import type {PieceSymbol} from 'chess.js';
export const VALUES:Record<PieceSymbol,number>={p:1,n:3,b:3,r:5,q:9,k:0};
export const NAMES:Record<PieceSymbol,string>={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
