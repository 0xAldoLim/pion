export interface CalibrationGame {bot:string;color:string;result:string}
/** Wilson interval for decisive completed games only, never an Elo estimate. */
export function decisiveInterval(wins:number,losses:number):[number,number]|null {
 const n=wins+losses;if(!n)return null;const z=1.959963984540054,p=wins/n,den=1+z*z/n,center=(p+z*z/(2*n))/den,margin=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;
 return [Math.max(0,center-margin),Math.min(1,center+margin)];
}
export function summarizeCalibration(games:CalibrationGame[]){
 return [...new Set(games.map(g=>g.bot))].map(bot=>{
  const selected=games.filter(g=>g.bot===bot),completed=selected.filter(g=>g.result!=='*'),wins=completed.filter(g=>g.result===(g.color==='w'?'1-0':'0-1')).length,draws=completed.filter(g=>g.result==='1/2-1/2').length,losses=completed.length-wins-draws,unresolved=selected.length-completed.length,points=wins+draws/2;
  return {bot,games:selected.length,colors:{white:selected.filter(g=>g.color==='w').length,black:selected.filter(g=>g.color==='b').length},completed:completed.length,unresolved,wins,draws,losses,completedScore:completed.length?points/completed.length:null,scoreRangeIncludingCutoffs:[points/selected.length,(points+unresolved)/selected.length],decisiveCompletedGames:wins+losses,decisiveWinWilson95:decisiveInterval(wins,losses),sufficientForElo:false};
 });
}
