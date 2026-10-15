import type {Game,Preferences} from './types';

export const isRatedActive=(game:Pick<Game,'mode'|'status'>|undefined|null)=>game?.mode==='rated'&&game.status==='active';
/** One policy for every player-facing assistance surface. Bot search is separate. */
export function assistance(game:Game|null|undefined,preferences:Preferences){
  const allowed=!isRatedActive(game);
  return {evaluation:allowed&&preferences.showEval,coach:allowed&&preferences.coach!=='off',hints:allowed&&preferences.practiceHints,undo:game?.mode!=='rated'&&preferences.practiceUndo,feedback:allowed&&preferences.practiceFeedback,highlights:allowed&&preferences.highlights};
}
