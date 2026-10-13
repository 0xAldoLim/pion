import { Chess } from 'chess.js';
import type { Candidate, EngineSettings, Evaluation } from '../chess/types';
import { parseInfo } from './uci';
import { playUci } from '../chess/rules';

export interface WorkerLike {
  postMessage(message: string): void; terminate(): void;
  onmessage: ((event: {data: unknown})=>void) | null;
  onerror: ((event: {message?: string})=>void) | null;
}
export type WorkerFactory = (url: string) => WorkerLike;
export interface SearchOptions {signal?: AbortSignal; priority?: number; rootMoves?: string[]; skill?: number; onProgress?: (lines: Candidate[])=>void}
interface Job {fen: string; settings: EngineSettings; options: SearchOptions; resolve: (v: Evaluation)=>void; reject: (e: Error)=>void; key: string; cleanup: ()=>void; aborted: boolean}
const aborted = () => new DOMException('Analysis canceled','AbortError');
export const engineUrl = (pack: 'lite'|'deep') => `${import.meta.env.BASE_URL}engines/${pack === 'deep' ? 'deep/stockfish-19-single.js':'stockfish-19-lite-single.js'}`;

/** One active worker limits total CPU. Gameplay has priority over background review. */
export class EngineManager {
  private worker: WorkerLike | null = null;
  private ready: Promise<void> | null = null;
  private waiting: {token:string; resolve:()=>void; reject:(e:Error)=>void; timer:ReturnType<typeof setTimeout>} | null = null;
  private current: Job | null = null;
  private queue: Job[] = [];
  private candidates = new Map<number,Candidate>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private cache = new Map<string,Evaluation>();
  private pack = '';
  private disposed = false;
  readonly version = 'Stockfish 19.0.1';
  constructor(private factory: WorkerFactory = url=>{
    const native=new Worker(url);
    const wrapper:WorkerLike={onmessage:null,onerror:null,postMessage:message=>native.postMessage(message),terminate:()=>native.terminate()};
    native.onmessage=event=>wrapper.onmessage?.({data:event.data as unknown});
    native.onerror=event=>wrapper.onerror?.({message:event.message});
    return wrapper;
  }) {}

  private waitFor(token:string, timeout=30_000): Promise<void> {
    return new Promise((resolve,reject)=>{
      const timer = setTimeout(()=>{this.waiting=null;reject(new Error(`Engine did not send ${token}. Reinstall offline engine assets.`));},timeout);
      this.waiting={token,resolve,reject,timer};
    });
  }
  private async initialize(pack: 'lite'|'deep'): Promise<void> {
    if (this.worker && this.pack === pack && this.ready) return this.ready;
    this.worker?.terminate(); this.pack=pack;
    this.worker=this.factory(engineUrl(pack));
    this.worker.onmessage=e=>this.receive(String(e.data));
    this.worker.onerror=e=>this.fail(new Error(e.message ?? 'Stockfish worker crashed.'));
    this.ready=(async()=>{
      const uci=this.waitFor('uciok'); this.worker!.postMessage('uci'); await uci;
      const ready=this.waitFor('readyok'); this.worker!.postMessage('isready'); await ready;
    })();
    return this.ready;
  }
  private receive(message:string) {
    for (const line of message.split('\n')) {
      if (this.waiting?.token === line.trim()) {clearTimeout(this.waiting.timer);this.waiting.resolve();this.waiting=null;}
      const job=this.current;
      if (!job) continue;
      const parsed=parseInfo(line,new Chess(job.fen).turn());
      if (parsed && !job.aborted) {
        this.candidates.set(parsed.rank,parsed.candidate);
        job.options.onProgress?.([...this.candidates.values()]);
      }
      if (line.startsWith('bestmove ')) {
        const bestMove=line.split(' ')[1] ?? '';
        if (job.aborted) this.finish(aborted());
        else {
          try {
            const chess=new Chess(job.fen); playUci(chess,bestMove);
            const candidates=[...this.candidates].sort((a,b)=>a[0]-b[0]).map(([,c])=>c).filter(c=>{
              try {const replay=new Chess(job.fen);for (const move of c.pv) playUci(replay,move);return true;} catch {return false;}
            });
            if (!candidates.length) throw new Error('Engine returned no valid evaluation lines.');
            const result: Evaluation={fen:job.fen,engine:this.version,settings:job.settings,candidates,bestMove,completed:true,timestamp:Date.now()};
            this.cache.set(job.key,result);if (this.cache.size>256) this.cache.delete(this.cache.keys().next().value!);
            this.finish(undefined,result);
          } catch(e) {this.finish(e instanceof Error ? e : new Error('Invalid engine response.'));}
        }
      }
    }
  }
  private finish(error?:Error,result?:Evaluation) {
    const job=this.current;this.current=null;this.candidates.clear();
    if (this.timer) clearTimeout(this.timer);this.timer=null;
    if (job) {job.cleanup();if(error) job.reject(error);else job.resolve(result!);}
    void this.pump();
  }
  private fail(error:Error) {
    if (this.waiting) {clearTimeout(this.waiting.timer);this.waiting.reject(error);this.waiting=null;}
    this.worker?.terminate();this.worker=null;this.ready=null;this.pack='';
    this.finish(error);
  }
  private stop(job:Job) {
    job.aborted=true;
    if (this.current===job) {
      this.worker?.postMessage('stop');
      if (this.timer) clearTimeout(this.timer);
      this.timer=setTimeout(()=>this.fail(aborted()),2000);
    } else {this.queue=this.queue.filter(j=>j!==job);job.cleanup();job.reject(aborted());}
  }
  private async pump() {
    if (this.current || this.disposed) return;
    const job=this.queue.shift();if(!job)return;
    this.current=job;
    try {
      await this.initialize(job.settings.pack);
      if (this.current!==job) return;
      if (job.aborted) {this.finish(aborted());return;}
      const s=job.settings;
      this.worker!.postMessage(`setoption name Hash value ${Math.min(256,Math.max(16,s.hashMb))}`);
      this.worker!.postMessage('setoption name Threads value 1');
      this.worker!.postMessage(`setoption name MultiPV value ${Math.min(8,Math.max(1,s.multiPv))}`);
      this.worker!.postMessage(`setoption name Skill Level value ${job.options.skill ?? 20}`);
      this.worker!.postMessage('setoption name Clear Hash');
      this.worker!.postMessage(`position fen ${job.fen}`);
      this.timer=setTimeout(()=>this.fail(new Error('Engine search timed out. Try a smaller hash or the lite pack.')),s.timeMs+15_000);
      this.worker!.postMessage(`go depth ${s.depth} movetime ${s.timeMs}${job.options.rootMoves?.length ? ` searchmoves ${job.options.rootMoves.join(' ')}`:''}`);
    } catch(e) {if(this.current===job)this.fail(e instanceof Error?e:new Error(String(e)));}
  }
  analyze(fen:string,settings:EngineSettings,options:SearchOptions={}):Promise<Evaluation> {
    if(this.disposed)return Promise.reject(new Error('Engine manager disposed.'));
    const c=new Chess(fen);if(c.isGameOver())return Promise.reject(new Error('Terminal position has no engine move.'));
    if(options.rootMoves)for(const m of options.rootMoves)playUci(new Chess(fen),m);
    if(options.signal?.aborted)return Promise.reject(aborted());
    const key=JSON.stringify([this.version,fen,settings,options.rootMoves,options.skill]);
    const cached=this.cache.get(key);if(cached)return Promise.resolve(cached);
    return new Promise((resolve,reject)=>{
      const job:Job={fen,settings:{...settings},options,resolve,reject,key,aborted:false,cleanup:()=>options.signal?.removeEventListener('abort',onAbort)};
      const onAbort=()=>this.stop(job);options.signal?.addEventListener('abort',onAbort,{once:true});
      this.queue.push(job);this.queue.sort((a,b)=>(b.options.priority??0)-(a.options.priority??0));
      if(this.current && (options.priority??0)>(this.current.options.priority??0))this.stop(this.current);
      void this.pump();
    });
  }
  clearCache(){this.cache.clear();}
  dispose(){this.disposed=true;this.worker?.terminate();this.worker=null;if(this.timer)clearTimeout(this.timer);if(this.waiting){clearTimeout(this.waiting.timer);this.waiting.reject(aborted());this.waiting=null;}for(const job of [this.current,...this.queue])if(job){job.cleanup();job.reject(aborted());}this.current=null;this.queue=[];}
}
export const engine=new EngineManager();
