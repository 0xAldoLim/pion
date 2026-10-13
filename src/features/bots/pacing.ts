import type {Preferences} from '../../chess/types';
/** Search may finish instantly; visible response pacing is independent of engine depth. */
export function responseDelay(pace:Preferences['botPace'],rng=Math.random):number {
  const ranges={quick:[1500,2500],standard:[2800,4800],thoughtful:[5000,7500]} as const;
  const [min,max]=ranges[pace];return Math.round(min+rng()*(max-min));
}
export function waitForResponse(ms:number,signal:AbortSignal):Promise<void>{
  return new Promise((resolve,reject)=>{
    if(signal.aborted){reject(new DOMException('Canceled','AbortError'));return;}
    const abort=()=>{clearTimeout(timer);reject(new DOMException('Canceled','AbortError'));};
    const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},Math.max(0,ms));
    signal.addEventListener('abort',abort,{once:true});
  });
}
