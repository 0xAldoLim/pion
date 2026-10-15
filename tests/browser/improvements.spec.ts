import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Game,Rating} from '../../src/chess/types';
async function route(page:Page,name:string){await page.goto(`/#${name}`);await expect(page.locator('main h1')).toBeVisible();}
async function move(page:Page,uci:string){await page.getByLabel('Legal move').selectOption(uci);await page.getByRole('button',{name:'Play move',exact:true}).click();}
async function records<T>(page:Page,table:string):Promise<T[]>{return page.evaluate(name=>new Promise((resolve,reject)=>{const request=indexedDB.open('pion');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result;const query=db.transaction(name).objectStore(name).getAll();query.onerror=()=>reject(query.error);query.onsuccess=()=>{db.close();resolve(query.result);};};}),table) as Promise<T[]>;}
test('navbar appearance persists and both palettes meet dashboard AA contrast',async({page})=>{
  await route(page,'home');await page.getByRole('button',{name:'Switch to dark mode'}).click();await expect(page.locator('html')).toHaveAttribute('data-mode','dark');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-mode','dark');expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);await page.screenshot({path:'test-results/dark-dashboard.png',fullPage:true});await page.getByRole('button',{name:'Switch to light mode'}).click();await expect(page.locator('html')).toHaveAttribute('data-mode','light');expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);expect(await page.locator('.page-intro p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
});
test('seven reference characters, seven boards and four distinct piece sets',async({page})=>{
  await route(page,'play');await expect(page.locator('.bot-grid [data-character]')).toHaveCount(12);const names=await page.locator('.bot-grid [data-character]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-character')));expect(new Set(names)).toEqual(new Set(['Ponke','Lonke','Gonke','Konke','Bonke','Zonke','Donke']));await route(page,'settings');await expect(page.getByLabel('Board theme').locator('option')).toHaveCount(7);await expect(page.getByLabel('Piece set').locator('option')).toHaveCount(4);const images=new Set<string>();for(const set of ['classic','outline','neo','wood']){await page.getByLabel('Piece set').selectOption(set);await expect(page.locator('html')).toHaveAttribute('data-pieces',set);images.add(await page.locator('piece.white.king').evaluate(el=>getComputedStyle(el).backgroundImage));}expect(images.size).toBe(4);await page.getByLabel('Board theme').selectOption('ocean');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','ocean');await expect(page.locator('html')).toHaveAttribute('data-pieces','wood');
});
test('low-rating bot cannot execute its cached opening instantly; evaluation streams',async({page})=>{
  await route(page,'settings');await page.getByLabel('Bot response pace').selectOption('quick');await route(page,'play');await page.getByRole('button',{name:'Start game',exact:true}).click();const started=Date.now();await move(page,'e2e4');await page.waitForTimeout(600);await expect(page.getByLabel('Move history').locator('span')).toHaveCount(1);await expect(page.getByLabel('Move history').locator('span')).toHaveCount(2,{timeout:30_000});expect(Date.now()-started).toBeGreaterThanOrEqual(1500);await expect(page.locator('.eval-bar')).toHaveAttribute('aria-label',/White evaluation [^—]/,{timeout:30_000});await page.getByRole('button',{name:'Resign',exact:true}).click();
});
test('Play now duration starts a match and settles only its rating once; practice does not change Elo',async({page})=>{
  await route(page,'home');await page.locator('.nav-play').click();
  let dialog=page.getByRole('dialog',{name:'Choose your duration.'});
  await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'3 minutes · Blitz',exact:true}).click();
  await expect(dialog).toBeHidden();await expect(page.locator('.rated-status')).toContainText('BLITZ');
  let game=(await records<Game>(page,'games'))[0]!;
  expect(game).toMatchObject({mode:'rated',initialSeconds:180,increment:0,rated:{category:'blitz',before:600}});expect(Math.abs(game.rated!.opponent-600)).toBeLessThanOrEqual(20);
  await page.locator('.nav-play').click();await page.getByRole('dialog',{name:'Choose your duration.'}).getByRole('button',{name:'Cancel',exact:true}).click();await expect(page).toHaveURL(new RegExp(`#play/${game.id}$`));await expect(page.locator('.rated-status')).toContainText('BLITZ');expect(await records<Game>(page,'games')).toHaveLength(1);
  await page.getByRole('button',{name:'Resign',exact:true}).click();await expect(page.locator('.rated-status')).toContainText(/-1[567] points/);
  await page.reload();await expect(page.locator('.rated-status')).toContainText(/-1[567] points/);
  const ratings=await records<Rating>(page,'ratings');expect(ratings).toHaveLength(1);expect(ratings[0]).toMatchObject({id:'blitz',games:1,losses:1});
  await page.getByRole('button',{name:'Choose another opponent'}).click();await page.getByLabel('Mode',{exact:true}).selectOption('bot');await page.getByRole('button',{name:'Start game',exact:true}).click();await page.getByRole('button',{name:'Resign',exact:true}).click();expect(await records<Rating>(page,'ratings')).toEqual(ratings);
  await page.locator('.nav-play').click();dialog=page.getByRole('dialog',{name:'Choose your duration.'});
  await expect(dialog.getByRole('group',{name:'Blitz'})).toContainText(String(ratings[0]!.value));await expect(dialog.getByRole('group',{name:'Rapid'})).toContainText('600');
  await dialog.getByRole('button',{name:'10 minutes · Rapid',exact:true}).click();await expect(page.locator('.rated-status')).toContainText('RAPID');
  game=(await records<Game>(page,'games')).find(g=>g.status==='active')!;expect(game).toMatchObject({initialSeconds:600,rated:{category:'rapid',before:600}});expect(Math.abs(game.rated!.opponent-600)).toBeLessThanOrEqual(20);
  await page.getByRole('button',{name:'Resign',exact:true}).click();await expect.poll(async()=>(await records<Rating>(page,'ratings')).length).toBe(2);
  expect((await records<Rating>(page,'ratings')).find(r=>r.id==='blitz')).toEqual(ratings[0]);
});

test('every Play now entry opens an accessible duration dialog and cancellation creates no game',async({page})=>{
  await route(page,'home');
  for(const selector of ['.nav-play','.home-ratings .primary','.hero .primary']){
    const button=page.locator(selector);await button.click();const dialog=page.getByRole('dialog',{name:'Choose your duration.'});
    await expect(dialog).toBeVisible();await expect(page.locator('.app-shell')).toHaveAttribute('inert','');
    await dialog.getByRole('button',{name:'Cancel',exact:true}).focus();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Close time selection'})).toBeFocused();
    await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(button).toBeFocused();await expect(page).toHaveURL(/#home$/);
  }
  await route(page,'play');await page.locator('.rated-lobby .primary').click();await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click();expect(await records<Game>(page,'games')).toEqual([]);
  for(const appearance of ['dark','light']){
    await page.getByRole('button',{name:`Switch to ${appearance} mode`}).click();await expect(page.locator('html')).toHaveAttribute('data-mode',appearance);
    if(appearance==='dark')await route(page,'play/match');else await page.locator('.nav-play').click();
    const dialog=page.getByRole('dialog',{name:'Choose your duration.'});await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('group',{name:'Blitz'}).getByRole('button')).toHaveCount(3);await expect(dialog.getByRole('group',{name:'Rapid'}).getByRole('button')).toHaveCount(3);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await dialog.getByRole('button',{name:'Close time selection'}).click();
  }
  expect(await records<Game>(page,'games')).toEqual([]);expect(await records<Rating>(page,'ratings')).toEqual([]);
});
test('lesson loops, side-to-move prompts, opening tier stamps and on-piece review badges',async({page})=>{
  await route(page,'learn/forks');await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('.study-board')).toContainText('White to move');await page.getByRole('button',{name:'Next move',exact:true}).click();await expect(page.locator('.study-panel')).toContainText('Ne7');await expect(page.locator('.study-board')).toContainText('Black to move');await page.getByRole('button',{name:'Play demonstration',exact:true}).click();await expect(page.locator('.study-panel')).toContainText('Nxc8 takes the queen',{timeout:15_000});await page.getByRole('button',{name:'Replay demonstration'}).click();await expect(page.locator('.study-board')).toContainText('White to move');await route(page,'puzzles/master-morphy-opera-30');await expect(page.locator('.turn-prompt')).toContainText('White to move');await expect(page.locator('.turn-prompt')).toContainText('You play White');await route(page,'openings');await expect(page.locator('.tier-stamp')).toHaveCount(0);await expect(page.locator('.opening-library')).toContainText('introductory');await expect(page.locator('.opening-library .library-card')).toHaveCount(12);await route(page,'settings');await page.getByLabel('Analysis profile').selectOption('fast');await route(page,'review');await page.getByLabel('PGN import').fill('1. f3 e5 2. g4 Qh4#');await page.getByRole('button',{name:'Import PGN',exact:true}).click();await page.getByRole('button',{name:'Run review',exact:true}).click();await expect(page.getByText('Review complete.',{exact:false})).toBeVisible();await expect(page.locator('.move-marker')).toHaveAttribute('data-square','h4');await expect(page.locator('.move-marker [role=img]')).toHaveAttribute('aria-label',/move$/);await page.locator('.move-list button').filter({hasText:'g4'}).click();for(const appearance of ['dark','light']){await page.getByRole('button',{name:`Switch to ${appearance} mode`}).click();await expect(page.locator('html')).toHaveAttribute('data-mode',appearance);expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);}await page.locator('.move-list button').filter({hasText:'Qh4#'}).click();await page.getByRole('button',{name:'Show best move',exact:true}).click();await expect(page.getByText('Showing the position before Qh4#',{exact:false})).toBeVisible();await expect(page.locator('.move-marker')).toHaveCount(0);
});



