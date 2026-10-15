import {useMemo} from 'react';
import {BookOpen} from 'lucide-react';
import type {Color} from 'chess.js';
import {recognizeOpening} from '../../openings/recognition';
import {START_FEN} from '../../chess/rules';

export default function LiveOpening({startFen,moves,playerColor,hotseat}:{startFen:string;moves:string[];playerColor:Color;hotseat:boolean}){
  const match=useMemo(()=>recognizeOpening(startFen,moves),[startFen,moves]);
  const name=match?`${match.opening.eco} · ${match.opening.name}`:moves.length?'Opening not identified yet':startFen===START_FEN?'Starting position':'Custom starting position';
  return <span className="live-opening" role="status" aria-label="Current opening"><BookOpen size={15} aria-hidden="true"/><span className="live-opening-name">{name}</span><span className="live-playing-side">{hotseat?'Local hotseat':`You play ${playerColor==='w'?'White':'Black'}`}</span></span>;
}
