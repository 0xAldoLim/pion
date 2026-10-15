export function OpeningMoveList({moves,ply,onChange}:{moves:string[];ply:number;onChange:(ply:number)=>void}){
  return <ol className="opening-moves" aria-label="Opening move sequence">
    {Array.from({length:Math.ceil(moves.length/2)},(_,turn)=><li key={turn} className="opening-move-pair"><span className="opening-move-number" aria-hidden="true">{turn+1}.</span>{moves.slice(turn*2,turn*2+2).map((san,side)=>{const position=turn*2+side+1;return <button type="button" key={position} aria-label={`After ${turn+1}${side?'...':'.'} ${san}`} aria-pressed={ply===position} aria-current={ply===position?'step':undefined} onClick={()=>onChange(position)}>{san}</button>;})}</li>)}
  </ol>;
}
