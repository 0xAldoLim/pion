import {test,expect,type Page} from '@playwright/test';
import {Chess} from 'chess.js';
import {readFileSync} from 'node:fs';
import {MASTER_PUZZLES} from '../../src/data/masters';
import type {Puzzle,Mistake} from '../../src/chess/types';

async function route(page:Page,name:string){await page.goto(`/#${name}`);await expect(page.locator('main')).toBeVisible();}
async function move(page:Page,uci:string){await page.getByLabel('Legal move').selectOption(uci);await page.getByRole('button',{name:'Play move',exact:true}).click();}
async function clickSquare(page:Page,square:string){const box=await page.getByTestId('chessboard').boundingBox();if(!box)throw new Error('No board bounds');await page.mouse.click(box.x+(square.charCodeAt(0)-97+0.5)*box.width/8,box.y+(8-Number(square[1])+0.5)*box.height/8);}

test('pointer promotion chooser supports underpromotion and FEN export',async({page})=>{
  await route(page,'analysis');await page.getByLabel('FEN input').fill('8/P6k/8/8/8/8/8/4K3 w - - 0 1');await page.getByRole('button',{name:'Load FEN',exact:true}).click();await expect(page.getByLabel('Legal move')).toBeVisible();await clickSquare(page,'a7');await clickSquare(page,'a8');await expect(page.getByRole('dialog',{name:'Choose promotion'})).toBeVisible();await page.getByRole('button',{name:'Knight',exact:true}).click();await expect(page.getByLabel('FEN input')).toHaveValue(/^N7\/7k/);const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export FEN'}).click();expect((await download).suggestedFilename()).toBe('pion-position.fen');
});

test('custom clocks pause, resume, grant increment and terminate on timeout',async({page})=>{
  await page.clock.install({time:new Date("2026-10-13T00:00:00Z")});await page.clock.pauseAt(new Date("2026-10-13T00:01:00Z"));await route(page,'play');await page.getByLabel('Mode',{exact:true}).selectOption('hotseat');await page.getByLabel('Custom seconds',{exact:true}).fill('4');await page.getByLabel('Increment (sec)',{exact:true}).fill('2');await page.getByRole('button',{name:'Start game'}).click();await move(page,'e2e4');await expect(page.locator('.clock').last()).toHaveText('0:06');await page.getByRole('button',{name:'Pause',exact:true}).click();await page.clock.fastForward(2000);await expect(page.locator('.clock').first()).toHaveText('0:04');await page.getByRole('button',{name:'Resume',exact:true}).click();await page.clock.fastForward(4500);await expect(page.getByRole('heading',{name:'Time expired',exact:true})).toBeVisible();
});

test('bounded Lichess CSV pack installs and solves offline',async({page,context})=>{
  const puzzle=(JSON.parse(readFileSync('src/data/puzzles.json','utf8')) as {puzzles:Puzzle[]}).puzzles.find(p=>p.rating<500&&p.moves.length===2)!;
  const csv=`PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags\nimported-check,${puzzle.fen},${puzzle.moves.join(' ')},${puzzle.rating},75,100,50,${puzzle.themes.join(' ')},https://lichess.org/training/${puzzle.id},\n`;
  await route(page,'settings');await page.getByLabel('Install puzzle pack').setInputFiles({name:'sample.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});await expect(page.getByRole('status')).toContainText('1 validated puzzles installed');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await route(page,'puzzles/imported-check');await move(page,puzzle.moves[1]!);await expect(page.getByRole('status').filter({hasText:'Well found'})).toBeVisible();
});

test('personal mistakes replay engine continuation and early repeats do not inflate retention',async({page})=>{
  await route(page,'settings');await page.getByLabel('Analysis profile',{exact:true}).selectOption('fast');await route(page,'review');await page.getByLabel('PGN import').fill('1. f3 e5 2. g4 Qh4#');await page.getByRole('button',{name:'Import PGN',exact:true}).click();await page.getByRole('button',{name:'Run review',exact:true}).click();await expect(page.getByText('Review complete.',{exact:false})).toBeVisible();
  const mistake=await page.evaluate(()=>new Promise<Mistake>((resolve,reject)=>{const request=indexedDB.open('pion');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const database=request.result;const query=database.transaction('mistakes').objectStore('mistakes').getAll();query.onsuccess=()=>{database.close();resolve(query.result[0]);};};}));expect(mistake).toBeDefined();
  await route(page,'puzzles/mistakes');
  for(let repeat=0;repeat<2;repeat++){await page.getByRole('button',{name:repeat?'Retry':'My mistakes',exact:true}).click();for(let i=0;i<mistake.line.length;i+=2)await move(page,mistake.line[i]!);await expect(page.getByRole('status').filter({hasText:'Well found'})).toBeVisible();}
  await expect(page.getByText('0 unseen positions solved without hints.',{exact:false})).toBeVisible();await route(page,'progress');await expect(page.getByText('0 first encounters',{exact:false})).toBeVisible();const retained=page.locator('.stat-card').filter({hasText:'Retained mistakes'});await expect(retained.locator('strong')).toHaveText('0');
});

test('Morphy queen offer is verified by real Stockfish as mate in two',async({page})=>{
  await route(page,'analysis');const puzzle=MASTER_PUZZLES[0]!;
  const evidence=await page.evaluate(fen=>new Promise<{best:string;lines:string[]}>((resolve,reject)=>{const worker=new Worker('/engines/stockfish-19-lite-single.js'),lines:string[]=[];const timeout=setTimeout(()=>{worker.terminate();reject(new Error('Master verification timeout'));},30000);worker.onmessage=e=>{const line=String(e.data);lines.push(line);if(line==='uciok')worker.postMessage('isready');if(line==='readyok'){worker.postMessage(`position fen ${fen}`);worker.postMessage('go depth 18 movetime 1200');}if(line.startsWith('bestmove ')){clearTimeout(timeout);worker.terminate();resolve({best:line.split(' ')[1]!,lines});}};worker.postMessage('uci');}),puzzle.fen);
  expect(evidence.best).toBe(puzzle.moves[0]);expect(evidence.lines.some(line=>line.includes('score mate 2'))).toBe(true);const c=new Chess(puzzle.fen);for(const move of puzzle.moves)c.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});expect(c.isCheckmate()).toBe(true);
});

test('optional full engine checksum, cache installation and offline worker operation',async({page,context})=>{
  await route(page,'settings');const manifest=await page.evaluate(async()=>{const r=await fetch('/engines/manifest.json');return r.json() as Promise<{packs:{deep?:{files:{url:string;bytes:number}[]}}}>});test.skip(!manifest.packs.deep,'Deployment was prepared without the optional full pack.');
  const script=manifest.packs.deep!.files.find(f=>f.url.endsWith('.js'))!;
  await page.route('**/engines/deep/*.js?pion-download=*',route=>route.fulfill({body:Buffer.alloc(script.bytes),contentType:'text/javascript'}));
  await page.getByRole('button',{name:'Install full engine pack'}).click();await expect(page.getByRole('status')).toContainText('Engine integrity mismatch');await expect(page.locator('option[value="deep"]').last()).toHaveJSProperty('disabled',true);await page.unroute('**/engines/deep/*.js?pion-download=*');
  await page.getByRole('button',{name:'Install full engine pack'}).click();await expect(page.getByRole('status')).toContainText('Full engine verified and installed offline',{timeout:90000});await page.getByLabel('Installed engine',{exact:true}).selectOption('deep');await page.getByLabel('Analysis profile',{exact:true}).selectOption('fast');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await route(page,'analysis');await page.getByRole('button',{name:'Analyze locally',exact:true}).click();await expect(page.getByRole('button',{name:'Play this candidate'}).first()).toBeVisible({timeout:45000});await expect(page.getByText('fast profile · deep pack',{exact:false})).toBeVisible();
});
