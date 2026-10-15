import {useMemo} from 'react';
import {BookOpen} from 'lucide-react';
import {recognizeOpening} from '../../openings/recognition';
import {START_FEN} from '../../chess/rules';

export default function LiveOpening({startFen,moves}:{startFen:string;moves:string[]}){
  const match=useMemo(()=>recognizeOpening(startFen,moves),[startFen,moves]);
  const name=match?match.opening.name:moves.length?'Opening not identified yet':startFen===START_FEN?'Starting position':'Custom starting position';
  return <div className="opening-history-header" role="status" aria-label="Current opening"><div className="opening-history-meta"><BookOpen size={15} aria-hidden="true"/><span>{match?`${match.opening.eco} · Opening`:'Opening'}</span></div><h2 className="opening-history-name">{name}</h2></div>;
}
