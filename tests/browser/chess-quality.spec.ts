import {test,expect,type Page} from '@playwright/test';
import type {Game} from '../../src/chess/types';
async function move(page:Page,uci:string){await page.getByLabel('Legal move',{exact:true}).selectOption(uci);await page.getByRole('button',{name:'Play move',exact:true}).click();}
async function games(page:Page):Promise<Game[]>{return page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('pion');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const database=request.result,query=database.transaction('games').objectStore('games').getAll();query.onsuccess=()=>{database.close();resolve(query.result);};};}));}
test('rated games suppress all live assistance, keep bot replies, and unlock review after finishing',async({page})=>{
  await page.goto('/#settings');await page.getByLabel('Provisional move feedback in practice',{exact:true}).check();await page.getByLabel('Bot response pace',{exact:true}).selectOption('quick');
  await page.locator('.nav-play').click();await page.getByRole('button',{name:'3 minutes · Blitz',exact:true}).click();
  await expect(page.locator('.eval-bar')).toHaveCount(0);await expect(page.getByLabel('Local chess coach')).toHaveCount(0);await expect(page.getByRole('button',{name:'Hint',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();
  const game=(await games(page)).find(g=>g.status==='active')!;
  if(game.playerColor==='b')await expect(page.getByLabel('Move history').locator('span')).toHaveCount(1,{timeout:30000});
  await move(page,game.playerColor==='w'?'e2e4':'e7e5');await expect(page.getByLabel('Move history').locator('span')).toHaveCount(game.playerColor==='w'?2:3,{timeout:30000});await expect(page.locator('.move-marker')).toHaveCount(0);await expect(page.getByLabel('Provisional move feedback')).toHaveCount(0);
  await page.goto(`/#review/${game.id}`);await expect(page.getByRole('heading',{name:'Finish your game to review it.'})).toBeVisible();await expect(page.getByRole('button',{name:'Run review',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Return to game',exact:true}).click();await page.getByRole('button',{name:'Resign',exact:true}).click();await page.getByRole('button',{name:'Review this game',exact:false}).click();await expect(page.getByRole('button',{name:'Run review',exact:true})).toBeVisible();
});
test('optional practice feedback uses real full-strength review evidence and is marked provisional',async({page})=>{
  await page.goto('/#settings');await page.getByLabel('Provisional move feedback in practice',{exact:true}).check();await page.getByLabel('Allow hints in practice games',{exact:true}).uncheck();await page.getByLabel('Allow undo in practice games',{exact:true}).uncheck();await page.getByLabel('Bot response pace',{exact:true}).selectOption('quick');
  await page.goto('/#play');await page.getByRole('button',{name:'Start game',exact:true}).click();await move(page,'e2e4');
  const feedback=page.getByLabel('Provisional move feedback',{exact:true});await expect(feedback).toContainText('PROVISIONAL',{timeout:30000});await expect(feedback).toContainText('Local Stockfish · root depth');await expect(feedback).toContainText('e4 · book');await expect(page.getByRole('button',{name:'Hint',exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Undo',exact:true})).toBeDisabled();await page.getByText('Ask about this position',{exact:true}).click();await page.getByRole('button',{name:'Why is this useful?',exact:true}).click();await expect(page.getByLabel('Coach candidate move',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Resign',exact:true}).click();
});
test('real Stockfish review verifies a missed mate and preserves legal root evidence',async({page})=>{
  await page.goto('/#settings');await page.getByLabel('Analysis profile',{exact:true}).selectOption('balanced');await page.goto('/#review');await page.getByLabel('PGN import').fill('1. f3 e5 2. g4 Qh4#');await page.getByRole('button',{name:'Import PGN',exact:true}).click();await page.getByRole('button',{name:'Run review',exact:true}).click();await expect(page.getByText('Review complete.',{exact:false})).toBeVisible({timeout:60000});
  const reviewed=(await games(page))[0]!.review!;const g4=reviewed.moves[2]!,mate=reviewed.moves[3]!;
  expect(g4.scores.pion.classification).toBe('blunder');expect(g4.evidence.some(e=>e.kind==='allowsMate')).toBe(true);expect(g4.after.candidates[0]!.score).toMatchObject({kind:'mate',winner:'b'});expect(g4.before.fen).toBe(g4.after.fen);expect(g4.after.candidates[0]!.move).toBe('g2g4');expect(mate.evidence.some(e=>e.kind==='mate')).toBe(true);expect(mate.sacrificeVerified).toBe(false);expect(mate.scores.pion.loss).toBe(0);
});
