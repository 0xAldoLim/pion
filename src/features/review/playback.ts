/** Rewind real game positions in a bounded time, including very long imports. */
export async function rewindGame(total:number,onPosition:(ply:number)=>void,signal:AbortSignal,reducedMotion=false):Promise<void>{
  if(signal.aborted)throw new DOMException('Review canceled','AbortError');
  if(reducedMotion){onPosition(0);return;}
  const step=Math.max(1,Math.ceil(total/18));
  for(let ply=total;ply>0;ply-=step){
    onPosition(ply);
    await new Promise<void>((resolve,reject)=>{
      const cancel=()=>{clearTimeout(timer);reject(new DOMException('Review canceled','AbortError'));};
      const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},70);
      signal.addEventListener('abort',cancel,{once:true});
    });
  }
  onPosition(0);
}
