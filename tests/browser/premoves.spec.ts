import {test,expect,type Page} from '@playwright/test';
import {newGame} from '../../src/chess/rules';
import type {Game} from '../../src/chess/types';
import AxeBuilder from '@axe-core/playwright';

async function route(page:Page,name:string){await page.goto(`/#${name}`);await expect(page.locator('main h1')).toBeVisible();}
async function queue(page:Page,from:string,to:string){await page.getByLabel('Premove from').selectOption(from);await page.getByLabel('Premove to').selectOption(to);await page.getByRole('button',{name:'Queue move',exact:true}).click();}
async function start(page:Page){await route(page,'settings');await page.getByLabel('Bot response pace').selectOption('thoughtful');await route(page,'play');await page.getByLabel('Time control').selectOption('300');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.getByLabel('Legal move').selectOption('e2e4');await page.getByRole('button',{name:'Play move',exact:true}).click();}
async function saved(page:Page):Promise<Game>{return page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('pion');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,query=db.transaction('games').objectStore('games').getAll();query.onsuccess=()=>{db.close();resolve(query.result[0]);};};})) as Promise<Game>;}
async function square(page:Page,key:string){const surface=page.getByTestId('chessboard').locator('cg-board');await surface.evaluate(el=>el.scrollIntoView({block:'center'}));await expect(surface.locator('piece.anim')).toHaveCount(0);const box=await surface.boundingBox();if(!box)throw new Error('Board missing');await surface.click({position:{x:(key.charCodeAt(0)-97+0.5)*box.width/8,y:(8-Number(key[1])+0.5)*box.height/8}});}
async function drag(page:Page,from:string,to:string){const surface=page.getByTestId('chessboard').locator('cg-board');await surface.scrollIntoViewIfNeeded();const box=await surface.boundingBox();if(!box)throw new Error('Board missing');const point=(key:string)=>({x:box.x+(key.charCodeAt(0)-97+0.5)*box.width/8,y:box.y+(8-Number(key[1])+0.5)*box.height/8});const start=point(from),end=point(to);await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.waitForTimeout(50);await page.mouse.up();}

test('five premoves preview without altering history; cancellation and preference persist',async({page})=>{
  await page.clock.install();await start(page);await page.clock.pauseAt(new Date(Date.now()+100));
  for(const [i,move] of ['g1f3','f1c4','b1c3','d2d3','h2h3'].entries()){await queue(page,move.slice(0,2),move.slice(2,4));await expect(page.locator('.premove-status')).toContainText(`Premoves ${i+1}/5`);}
  expect((await saved(page)).moves).toEqual(['e2e4']);await page.getByLabel('Premove from').selectOption('g2');await page.getByLabel('Premove to').selectOption('g3');await expect(page.getByRole('button',{name:'Queue move',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Cancel premoves',exact:true}).click();await expect(page.locator('.premove-status')).toContainText('queue a premove');
  await queue(page,'g1','f3');await page.getByLabel('Premove from').press('Escape');await expect(page.getByRole('button',{name:'Cancel premoves',exact:true})).toHaveCount(0);
  await queue(page,'b1','c3');await page.getByTestId('chessboard').click({button:'right'});await expect(page.getByRole('button',{name:'Cancel premoves',exact:true})).toHaveCount(0);
  await queue(page,'g1','f3');await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.getByRole('button',{name:'Cancel premoves',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.clock.resume();await route(page,'settings');await page.getByLabel('Enable premoves in bot games').uncheck();
  await expect.poll(()=>page.evaluate(()=>new Promise<boolean>(resolve=>{const request=indexedDB.open('pion');request.onsuccess=()=>{const db=request.result,query=db.transaction('preferences').objectStore('preferences').get('main');query.onsuccess=()=>{db.close();resolve(query.result.premoves);};};}))).toBe(false);
  await page.reload();await expect(page.getByLabel('Enable premoves in bot games')).not.toBeChecked();await route(page,'play');await expect(page.getByLabel('Move history')).toContainText('e4');await expect(page.getByLabel('Premove from')).toHaveCount(0);
});

test('pointer premove and a following keyboard premove execute in order after real bot replies',async({page})=>{
  await start(page);await square(page,'g1');await square(page,'f3');await expect(page.locator('.premove-status')).toContainText('Premoves 1/5');await square(page,'f3');await expect(page.getByRole('button',{name:'Cancel premoves',exact:true})).toHaveCount(0);await drag(page,'g1','f3');await expect(page.locator('.premove-status')).toContainText('Premoves 1/5');await queue(page,'b1','c3');
  await expect.poll(async()=>(await saved(page)).moves.length,{timeout:30_000}).toBeGreaterThanOrEqual(5);
  const game=await saved(page);expect(game.moves.slice(0,3)).toEqual(['e2e4','e7e5','g1f3']);expect(game.moves[4]).toBe('b1c3');
  await page.getByRole('button',{name:'Resign',exact:true}).click();await expect(page.getByRole('button',{name:'Cancel premoves',exact:true})).toHaveCount(0);
});

test('illegal conditional capture is canceled; premove promotion retains the chosen knight',async({page})=>{
  await start(page);await queue(page,'e4','d5');await expect(page.getByRole('status').filter({hasText:'Premove canceled:'})).toBeVisible({timeout:30_000});expect((await saved(page)).moves).toEqual(['e2e4','e7e5']);await page.getByRole('button',{name:'Resign',exact:true}).click();
  const game={...newGame('pebble','w','bot',300),startFen:'8/P6k/8/8/8/8/8/4K3 b - - 0 1'};
  await page.evaluate(record=>new Promise<void>((resolve,reject)=>{const request=indexedDB.open('pion');request.onsuccess=()=>{const db=request.result,tx=db.transaction('games','readwrite');tx.objectStore('games').put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),game);
  await route(page,`play/${game.id}`);await queue(page,'a7','a8');await expect(page.getByRole('dialog',{name:'Choose promotion'})).toBeVisible();await page.getByRole('button',{name:'Knight',exact:true}).click();await expect(page.locator('.premove-status')).toContainText('a7 → a8 = N');
  for(const appearance of ['dark','light']){await page.getByRole('button',{name:`Switch to ${appearance} mode`}).click();await expect(page.locator('html')).toHaveAttribute('data-mode',appearance);expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);}
  await expect(page.getByLabel('Move history')).toContainText('a8=N',{timeout:30_000});
});
