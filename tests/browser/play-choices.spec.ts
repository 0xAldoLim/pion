import {expect,test,type Page} from '@playwright/test';
import type {Game} from '../../src/chess/types';

async function games(page:Page):Promise<Game[]>{return page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('pion');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const database=request.result,query=database.transaction('games').objectStore('games').getAll();query.onsuccess=()=>{database.close();resolve(query.result);};};}));}
async function move(page:Page,uci:string){await page.getByLabel('Legal move',{exact:true}).selectOption(uci);await page.getByRole('button',{name:'Play move',exact:true}).click();}

test('Play now honors White, Black and both random outcomes with the correct board orientation',async({page})=>{
  page.setDefaultTimeout(15000);await page.goto('/#home');await page.locator('main h1').waitFor();
  for(const choice of [{side:'White',random:.9,color:'w',duration:'3 minutes · Blitz'},{side:'Black',random:.1,color:'b',duration:'10 minutes · Rapid'},{side:'Random',random:.1,color:'w',duration:'3 minutes · Blitz'},{side:'Random',random:.9,color:'b',duration:'10 minutes · Rapid'}] as const){
    await page.locator('.nav-play').click();const dialog=page.getByRole('dialog',{name:'Choose your duration.'});
    await expect(dialog.getByRole('radio',{name:'Random',exact:true})).toBeChecked();
    await dialog.getByRole('radio',{name:choice.side,exact:true}).check();
    await page.evaluate(value=>{Math.random=()=>value;},choice.random);
    await dialog.getByRole('button',{name:choice.duration,exact:true}).click();await expect(dialog).toBeHidden();await expect(page.getByLabel('Current opening',{exact:true})).toContainText(`You play ${choice.color==='w'?'White':'Black'}`);
    const game=(await games(page)).find(g=>g.status==='active')!;expect(game.playerColor).toBe(choice.color);expect(game.headers?.[choice.color==='w'?'White':'Black']).toBe('You');
    await expect(async()=>{const board=await page.getByTestId('chessboard').boundingBox(),king=await page.getByTestId('chessboard').locator('piece.white.king').boundingBox();expect(!!board&&!!king).toBe(true);expect(king!.y>board!.y+board!.height/2).toBe(choice.color==='w');}).toPass();
    await expect(page.locator('.eval-bar')).toHaveCount(0);await expect(page.getByRole('button',{name:'Hint',exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'Resign',exact:true}).click();await expect(page.getByRole('button',{name:'Resign',exact:true})).toBeHidden();
  }
});

test('live opening names update from moves, persist outside theory, and restore after undo/reload',async({page})=>{
  page.setDefaultTimeout(15000);await page.goto('/#settings');await page.getByLabel('Feedback frequency',{exact:true}).selectOption('off');await page.getByLabel('Show evaluation in practice games',{exact:true}).uncheck();
  await page.goto('/#play');await page.getByLabel('Mode',{exact:true}).selectOption('hotseat');await page.getByRole('button',{name:'Start game',exact:true}).click();
  const opening=page.getByLabel('Current opening',{exact:true});await expect(opening).toContainText('Starting position');
  for(const uci of ['e2e4','e7e5','g1f3','b8c6','f1c4'])await move(page,uci);
  await expect(opening).toContainText('Italian');
  for(const uci of ['a7a5','a2a4','h7h5','a1a3'])await move(page,uci);
  await expect(opening).toContainText('Italian');await expect.poll(async()=>(await games(page)).find(g=>g.status==='active')!.moves.length).toBe(9);await page.reload();await expect(opening).toContainText('Italian');
  for(let i=0;i<5;i++)await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(opening).not.toContainText('Italian');await expect.poll(async()=>(await games(page)).find(g=>g.status==='active')!.moves.length).toBe(4);
  await page.reload();await expect(opening).not.toContainText('Italian');await move(page,'f1b5');await expect(opening).toContainText('Ruy Lopez');
});
