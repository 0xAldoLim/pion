import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const argument=(key,fallback)=>{const i=process.argv.indexOf(`--${key}`);return i<0?fallback:Number(process.argv[i+1]);};
const textArgument=(key,fallback)=>{const i=process.argv.indexOf(`--${key}`);return i<0?fallback:process.argv[i+1];};
const output=textArgument('output','docs/BOT_CALIBRATION_CURRENT.json');
if(!/^docs\/[A-Za-z0-9_-]+\.json$/.test(output)||output==='docs/BOT_CALIBRATION.json')throw new Error('Use a new JSON report inside docs; preserve the historical checkpoint.');
const options={rounds:argument('rounds',4),maxPlies:argument('max-plies',200),timeScale:argument('time-scale',1),seed:argument('seed',20261015),bots:textArgument('bots','').split(',').filter(Boolean),references:textArgument('references','5,15').split(',').map(Number)};
if(options.rounds<1||options.rounds>100||options.maxPlies<4||options.maxPlies>500||options.timeScale<0.1||options.timeScale>4)throw new Error('Invalid calibration bounds.');
const server=await createServer({server:{host:'127.0.0.1',port:5175,strictPort:true,hmr:false}});
let browser;
try{
  await server.listen();browser=await chromium.launch();const page=await browser.newPage();
  await page.exposeFunction('reportGame',result=>console.log(`${result.bot} vs ${result.reference} (${result.color}): ${result.result}, ${result.plies} plies${result.result==='*'?' · unresolved cutoff':''}`));
  await page.goto('http://127.0.0.1:5175');
  const games=await page.evaluate(async options=>{
    const {Chess}=await import('/node_modules/chess.js/dist/esm/chess.js');
    const {BOTS,chooseBotMove}=await import('/src/features/bots/bots.ts');
    const {EngineManager}=await import('/src/engine/manager.ts');
    const {playUci,outcome}=await import('/src/chess/rules.ts');
    const manager=new EngineManager();const games=[];let state=options.seed>>>0;
    const rng=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const references=[{id:'limited-skill-5',skill:5,depth:10,timeMs:300},{id:'limited-skill-15',skill:15,depth:14,timeMs:600}].filter(r=>options.references.includes(r.skill));
    const selectedBots=BOTS.filter(b=>!options.bots.length||options.bots.includes(b.id));
    if(!references.length||!selectedBots.length||options.bots.some(id=>!BOTS.some(b=>b.id===id)))throw new Error('Unknown bot or reference profile.');
    try{for(const bot of selectedBots)for(const reference of references)for(let round=0;round<options.rounds;round++)for(const color of ['w','b']){
      manager.clearCache();const c=new Chess();const history=[];const started=performance.now();let result;
      for(let ply=0;ply<options.maxPlies&&!c.isGameOver();ply++){
        const botTurn=c.turn()===color;const profile=botTurn?bot:reference;
        const settings={profile:'custom',pack:'lite',threads:1,depth:profile.depth,timeMs:Math.max(50,Math.round(profile.timeMs*options.timeScale)),multiPv:botTurn?(bot.skill<10?8:4):1,hashMb:32};
        const evaluation=await manager.analyze(c.fen(),settings,{skill:profile.skill});
        const move=botTurn?chooseBotMove(bot,c.fen(),evaluation,history,rng):evaluation.bestMove;
        history.push(playUci(c,move).san);
      }
      result=outcome(c);const record={bot:bot.id,profile:{skill:bot.skill,depth:bot.depth,timeMs:bot.timeMs},reference:reference.id,round,color,result:result?.result??'*',reason:result?.reason??'Ply cutoff; not adjudicated',plies:history.length,san:history,elapsedMs:Math.round(performance.now()-started)};
      games.push(record);await window.reportGame(record);
    }}finally{manager.dispose();}
    return games;
  },options);
  const summary=[...new Set(games.map(g=>g.bot))].map(bot=>{const selected=games.filter(g=>g.bot===bot),completed=selected.filter(g=>g.result!=='*'),wins=completed.filter(g=>g.result===(g.color==='w'?'1-0':'0-1')).length,draws=completed.filter(g=>g.result==='1/2-1/2').length;return {bot,games:selected.length,colors:{white:selected.filter(g=>g.color==='w').length,black:selected.filter(g=>g.color==='b').length},completed:completed.length,unresolved:selected.length-completed.length,wins,draws,losses:completed.length-wins-draws,completedScore:completed.length?(wins+draws/2)/completed.length:null,sufficientForElo:false};});
  await fs.writeFile(output,JSON.stringify({schemaVersion:2,date:new Date().toISOString(),engine:'Stockfish.js 19.0.1 lite single',options,limitations:['Local reference profiles are not independently rated players.','Cutoffs are unresolved, never fabricated wins or draws. Completed-only scores can be biased by censored games.','Scaled search budgets and small samples cannot establish Elo or monotonic strength.','Opening preferences and policy randomness use the production implementation.','The seed controls policy choices; Stockfish limited-skill randomness and machine-dependent search depth are not fully deterministic.'],summary,games},null,2));
  console.log(JSON.stringify(summary));
}finally{await browser?.close();await server.close();}
