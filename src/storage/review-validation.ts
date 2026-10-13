import {z} from 'zod';
import {Chess} from 'chess.js';
import type {Game,ReviewMove} from '../chess/types';
import {CLASSES} from '../chess/types';
import {playUci,positionIdentity} from '../chess/rules';
import {SCORING_VERSION,scoreMove} from '../chess/scoring';
import {engineSchema,UCI} from './validation';

const score=z.discriminatedUnion('kind',[
  z.object({kind:z.literal('cp'),value:z.number().finite().min(-100000).max(100000)}),
  z.object({kind:z.literal('mate'),value:z.number().int().min(-1000).max(1000),winner:z.enum(['w','b'])}),
]);
const evaluation=z.object({fen:z.string().max(160),engine:z.string().min(1).max(100),settings:engineSchema,candidates:z.array(z.object({move:UCI,score,depth:z.number().int().min(0).max(128),pv:z.array(UCI).min(1).max(256),nodes:z.number().finite().min(0).max(Number.MAX_SAFE_INTEGER)})).min(1).max(8),bestMove:UCI,completed:z.literal(true),timestamp:z.number().finite().nonnegative()});
const scored=z.object({classification:z.enum(CLASSES),accuracy:z.number().finite().min(0).max(100),loss:z.number().finite().min(0).max(1),version:z.string().max(100)});
const row=z.object({ply:z.number().int().positive(),color:z.enum(['w','b']),san:z.string().max(30),uci:UCI,fenBefore:z.string().max(160),fenAfter:z.string().max(160),before:evaluation,after:evaluation,bestMove:UCI,bestSan:z.string().max(30),evidence:z.array(z.object({kind:z.string().max(80),text:z.string().max(4000),squares:z.array(z.string().regex(/^[a-h][1-8]$/)).max(64),line:z.array(UCI).max(256).optional(),depth:z.number().int().min(0).max(128).optional(),position:z.string().max(160)})).max(32),forced:z.boolean(),book:z.boolean(),sacrificeVerified:z.boolean(),opportunity:z.boolean(),phase:z.enum(['opening','middlegame','endgame']),status:z.literal('complete'),scores:z.object({pion:scored,inspired:scored})});
const schema=z.object({moves:z.array(row).max(1000),completed:z.boolean(),settings:engineSchema,version:z.string().max(100),positionId:z.string().max(20000)});

/** Backups are user-owned analysis records, never executable content. Validate
 * bounded shapes, full history identity and every evidence/PV's legal sequence. */
export function validateReview(raw:unknown,game:Game):Game['review'] {
  if(raw===undefined)return undefined;
  const review=schema.parse(raw);
  if(review.positionId!==positionIdentity(game)||review.moves.length>game.moves.length||(review.completed&&review.moves.length!==game.moves.length))throw new Error('Review does not match game history.');
  const chess=new Chess(game.startFen);
  for(const [index,entry]of review.moves.entries()){
    if(entry.ply!==index+1||entry.color!==chess.turn()||entry.uci!==game.moves[index]||entry.fenBefore!==chess.fen())throw new Error('Review move identity is inconsistent.');
    if(entry.forced!==(chess.moves().length===1))throw new Error('Forced-move metadata is inconsistent.');
    const move=playUci(chess,entry.uci);
    if(entry.san!==move.san||entry.fenAfter!==chess.fen())throw new Error('Review position is inconsistent.');
    for(const result of [entry.before,entry.after]){
      if(result.fen!==entry.fenBefore)throw new Error('Review evaluation uses the wrong root.');
      playUci(new Chess(result.fen),result.bestMove);
      for(const candidate of result.candidates){if(candidate.pv[0]!==candidate.move)throw new Error('PV starts with another move.');const c=new Chess(result.fen);for(const uci of candidate.pv)playUci(c,uci);}
    }
    if(entry.bestMove!==entry.before.bestMove||playUci(new Chess(entry.fenBefore),entry.bestMove).san!==entry.bestSan)throw new Error('Review best move is inconsistent.');
    for(const evidence of entry.evidence){if(evidence.position!==entry.fenBefore)throw new Error('Evidence uses the wrong position.');const c=new Chess(evidence.position);for(const uci of evidence.line??[])playUci(c,uci);}
    if(entry.sacrificeVerified&&!entry.evidence.some(e=>e.kind==='sacrifice'&&e.line?.[0]===entry.uci&&(e.depth??0)>=18))throw new Error('Sacrifice verification evidence is missing.');
    // Current formulas are reconstructed; imported numbers cannot inflate scores.
    if(review.version===SCORING_VERSION){const source=entry as ReviewMove;entry.scores={pion:scoreMove(source,'pion'),inspired:scoreMove(source,'inspired')};}
  }
  return review as NonNullable<Game['review']>;
}
