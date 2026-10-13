import type {Attempt,Game,Mistake,TrainingEvent} from '../../chess/types';
import {gameAccuracy} from '../../chess/scoring';
export function stats(games:Game[],attempts:Attempt[],mistakes:Mistake[],training:TrainingEvent[],from=0){
  const recentAttempts=attempts.filter(a=>a.at>=from);const fresh=recentAttempts.filter(a=>a.firstSeen);
  const reviewed=games.filter(g=>g.updatedAt>=from&&g.review?.completed);
  const accuracies=reviewed.map(g=>gameAccuracy(g.review!.moves,g.playerColor,'pion')).filter((n):n is number=>n!==null);
  const tags=new Map<string,number>();for(const m of mistakes)for(const tag of m.tags)tags.set(tag,(tags.get(tag)??0)+1);
  const weakest=[...tags].sort((a,b)=>b[1]-a[1])[0];
  const days=new Set([...attempts.map(a=>a.at),...training.map(a=>a.at),...games.filter(g=>g.status==='finished').map(g=>g.updatedAt)].map(at=>new Date(at).toLocaleDateString('en-CA')));
  const botGames=games.filter(g=>g.mode==='bot'&&g.status==='finished'&&g.updatedAt>=from);
  return {puzzles:fresh.length,success:fresh.length?fresh.filter(a=>a.solved&&a.hints===0).length/fresh.length*100:null,hinted:recentAttempts.length?recentAttempts.filter(a=>a.hints>0).length/recentAttempts.length*100:null,accuracy:accuracies.length?accuracies.reduce((a,b)=>a+b,0)/accuracies.length:null,reviewed:reviewed.length,weakest:weakest?{tag:weakest[0],count:weakest[1]}:null,days:days.size,retained:mistakes.filter(m=>m.successes>=2).length,botGames:botGames.length,botWins:botGames.filter(g=>g.result===(g.playerColor==='w'?'1-0':'0-1')).length,training:training.filter(t=>t.at>=from)};
}
