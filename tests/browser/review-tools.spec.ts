import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {newGame} from '../../src/chess/rules';
import type {Game} from '../../src/chess/types';
async function games(page:Page):Promise<Game[]>{return page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('pion');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,query=db.transaction('games').objectStore('games').getAll();query.onsuccess=()=>{db.close();resolve(query.result);};};}));}
async function queue(page:Page,from:string,to:string){await page.getByLabel('Premove from').selectOption(from);await page.getByLabel('Premove to').selectOption(to);await page.getByRole('button',{name:'Queue move',exact:true}).click();}

test('imported PGN rewinds, follows actual analysis, and explains and shows the opponent reply',async({page})=>{
  await page.goto('/#settings');await page.getByLabel('Analysis profile',{exact:true}).selectOption('fast');await page.goto('/#review');await page.getByLabel('PGN import').fill('1. f3 e5 2. g4 Qh4#');await page.getByRole('button',{name:'Import PGN',exact:true}).click();
  await page.getByRole('button',{name:'Deep review',exact:true}).click();await expect(page.getByLabel('Review progress')).toContainText('Rewinding your game');await page.getByRole('button',{name:/Stop review/}).click();await expect(page.getByLabel('Review progress')).toHaveCount(0);expect((await games(page))[0]!.review?.completed).not.toBe(true);
  await page.getByRole('button',{name:'Run review',exact:true}).click();await expect(page.getByLabel('Positions analyzed')).toHaveAttribute('value','0');await expect(page.getByLabel('Review progress')).toContainText('Analyzing move');await expect(page.getByText('Review complete.',{exact:false})).toBeVisible({timeout:90000});
  await expect(page.locator('.move-navigation')).toContainText('Move 4 / 4');await page.locator('.move-list button').filter({hasText:'g4'}).click();
  const explanation=page.getByLabel('Mistake explanation',{exact:true});await expect(explanation).toContainText('Qh4#');await expect(explanation).toContainText('checkmate');await explanation.getByRole('button',{name:"Show Black's reply",exact:true}).click();await expect(page.locator('.reply-caption')).toContainText('Qh4#');await expect(page.getByTestId('chessboard')).toHaveAttribute('aria-label',/in check/);
  await explanation.getByRole('button',{name:'Return to played position',exact:true}).click();await expect(page.locator('.reply-caption')).toHaveCount(0);
  await page.getByRole('button',{name:'Retry this position',exact:true}).click();await expect(page.getByLabel('Mistake explanation',{exact:true})).toContainText('Qh4#');await expect(page.getByLabel('Mistake explanation',{exact:true})).not.toContainText('A stronger choice');
  for(const mode of ['dark','light']){await page.getByRole('button',{name:`Switch to ${mode} mode`,exact:true}).click();expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);}
});

test('board arrows work by touch, keyboard, and right drag without playing moves or canceling premoves',async({page})=>{
  await page.goto('/#settings');await page.getByLabel('Bot response pace').selectOption('thoughtful');await page.goto('/#play');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await page.clock.install();await page.getByLabel('Legal move').selectOption('e2e4');await page.getByRole('button',{name:'Play move',exact:true}).click();await page.clock.pauseAt(new Date(Date.now()+100));await queue(page,'g1','f3');
  const before=(await games(page))[0]!.moves;
  await page.getByRole('button',{name:'Draw arrows',exact:true}).click();await page.getByLabel('Arrow from',{exact:true}).selectOption('e2');await page.getByLabel('Arrow to',{exact:true}).selectOption('e4');await page.getByRole('button',{name:'Add arrow',exact:true}).click();await page.clock.runFor(40);await expect(page.locator('svg.cg-shapes line')).toHaveCount(1);await expect(page.locator('.premove-status')).toContainText('Premoves 1/5');
  const surface=page.getByLabel('Arrow drawing surface',{exact:true});await surface.scrollIntoViewIfNeeded();const bounds=await surface.boundingBox();if(!bounds)throw new Error('Missing drawing surface');
  const mark=async(x:number,y:number)=>{const position={x:bounds.width*x,y:bounds.height*y};if(test.info().project.name==='mobile')await surface.tap({position});else await surface.click({position});};await mark(.4375,.8125);await mark(.4375,.5625);await page.clock.runFor(40);await expect(page.locator('svg.cg-shapes line')).toHaveCount(2);
  await page.getByRole('button',{name:'Done drawing',exact:true}).click();const board=page.getByTestId('chessboard').locator('cg-board');await board.scrollIntoViewIfNeeded();const b=await board.boundingBox();if(!b)throw new Error('Missing board');await page.mouse.move(b.x+b.width*.6875,b.y+b.height*.8125);await page.mouse.down({button:'right'});await page.mouse.move(b.x+b.width*.6875,b.y+b.height*.5625,{steps:12});await page.clock.runFor(80);await page.mouse.up({button:'right'});await page.clock.runFor(40);await expect(page.locator('svg.cg-shapes line')).toHaveCount(3);await expect(page.locator('.premove-status')).toContainText('Premoves 1/5');
  await page.getByRole('button',{name:'Flip',exact:true}).click();await page.clock.runFor(40);await expect(page.locator('svg.cg-shapes line')).toHaveCount(3);expect((await games(page))[0]!.moves).toEqual(before);
  await page.getByRole('button',{name:'Clear board annotations',exact:true}).click();await page.clock.runFor(40);await expect(page.locator('svg.cg-shapes line')).toHaveCount(0);await expect(page.locator('.premove-status')).toContainText('Premoves 1/5');
  await page.clock.resume();await page.getByRole('button',{name:'Draw arrows',exact:true}).click();expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);await page.getByRole('button',{name:'Done drawing',exact:true}).click();
});

test('a premoved recapture on a friendly occupied square executes only after the enemy capture',async({page})=>{
  await page.goto('/#settings');await page.getByLabel('Bot response pace').selectOption('thoughtful');
  const game={...newGame('pebble','w','bot',300),startFen:'5r1k/5N2/8/8/8/8/8/KB3RR1 b - - 0 1'};
  await page.evaluate(record=>new Promise<void>((resolve,reject)=>{const request=indexedDB.open('pion');request.onsuccess=()=>{const db=request.result,tx=db.transaction('games','readwrite');tx.objectStore('games').put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};}),game);
  await page.goto(`/#play/${game.id}`);await queue(page,'f1','f7');await expect(page.locator('.premove-status')).toContainText('f1 → f7');expect((await games(page))[0]!.moves).toEqual([]);
  await expect.poll(async()=>(await games(page))[0]!.moves.length,{timeout:30000}).toBeGreaterThanOrEqual(2);expect((await games(page))[0]!.moves.slice(0,2)).toEqual(['f8f7','f1f7']);await expect(page.getByLabel('Move history')).toContainText('Rxf7');
});
