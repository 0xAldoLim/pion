import type {EngineSettings,Game} from '../../chess/types';
import {replay} from '../../chess/rules';
import {isRatedActive} from '../../chess/assistance';
/** Full-strength review policy, separate from the deliberately weakened opponent. */
export async function analyzePracticeMove(game:Game,ply:number,settings:EngineSettings,signal:AbortSignal){
  if(isRatedActive(game)||game.mode!=='bot'||ply<1||ply>game.moves.length)return undefined;
  const {analyzeGame}=await import('../review/analyze');
  if(signal.aborted)throw new DOMException('Canceled','AbortError');
  const segment={...game,startFen:replay(game,ply-1).fen(),moves:[game.moves[ply-1]!],san:[game.san[ply-1]!],review:undefined};
  const rows=await analyzeGame(segment,{...settings,pack:'lite',profile:'custom',depth:Math.min(18,settings.depth),timeMs:Math.min(500,settings.timeMs),multiPv:3},signal,()=>{});
  return rows[0]?{...rows[0],ply}:undefined;
}
