import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function move(page:Page,uci:string){await page.getByLabel('Legal move').selectOption(uci);await page.getByRole('button',{name:'Play move',exact:true}).click();}

test('capture racks show the capturer, correct color and material, and follow undo, flip and preferences',async({page})=>{
  await page.goto('/#play');await page.getByLabel('Mode',{exact:true}).selectOption('hotseat');await page.getByRole('button',{name:'Start game',exact:true}).click();
  const white=page.locator('.captured-pieces[data-capturer="w"]'),black=page.locator('.captured-pieces[data-capturer="b"]');
  await expect(white.locator('img')).toHaveCount(0);await expect(black.locator('.material-advantage')).toHaveCount(0);
  for(const rack of [white,black]){
    const emptyStyle=await rack.evaluate(el=>{const style=getComputedStyle(el);return {height:el.getBoundingClientRect().height,padding:parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),border:parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth)};});
    expect(emptyStyle.height).toBeLessThanOrEqual(30);expect(emptyStyle.padding).toBe(0);expect(emptyStyle.border).toBe(0);
  }
  for(const uci of ['e2e4','e7e5','g1f3','b8c6','d2d4','e5d4','f3d4','c6d4'])await move(page,uci);
  await expect(white).toHaveAttribute('aria-label',/Captured by White: 1 black pawn/);await expect(black).toHaveAttribute('aria-label',/1 white pawn, 1 white knight.*ahead by 3 material points/);
  await expect(white.locator('img')).toHaveAttribute('src',/classic-bp\.svg$/);await expect(black.locator('.material-advantage')).toHaveText('+3');await expect(white.locator('.material-advantage')).toHaveCount(0);
  expect(await black.locator('[data-piece]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-piece')))).toEqual(['p','n']);
  await expect(page.locator('.game-side .captured')).toHaveCount(0);await page.getByRole('button',{name:'Flip',exact:true}).click();
  await expect(page.locator('.board-footer .captured-pieces')).toHaveAttribute('data-capturer','b');await expect(page.locator('.board-column>.player-strip .captured-pieces')).toHaveAttribute('data-capturer','w');
  for(const appearance of ['dark','light']){
    await page.getByRole('button',{name:`Switch to ${appearance} mode`}).click();await expect(page.locator('html')).toHaveAttribute('data-mode',appearance);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  }
  for(const uci of ['d1d4','d7d6','d4a7'])await move(page,uci);
  await expect(white.locator('[data-piece="p"]')).toHaveAttribute('data-count','2');await expect(white.locator('[data-piece="p"] img')).toHaveCount(2);await expect(white.locator('.material-advantage')).toHaveText('+1');await expect(black.locator('.material-advantage')).toHaveCount(0);
  expect(await white.locator('.captured-group').evaluateAll(groups=>groups.every(group=>{const frame=group.getBoundingClientRect();return [...group.querySelectorAll('img')].every(image=>{const box=image.getBoundingClientRect();return box.left>=frame.left-1&&box.right<=frame.right+1;});}))).toBe(true);
  for(let undo=0;undo<3;undo++)await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(black.locator('.material-advantage')).toHaveText('+3');
  await page.goto('/#settings');await page.getByLabel('Piece set').selectOption('wood');await page.goto('/#play');await expect(white.locator('img')).toHaveAttribute('src',/wood-bp\.svg$/);
  await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(black.locator('[data-piece="n"]')).toHaveCount(0);await expect(black.locator('.material-advantage')).toHaveCount(0);
  await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(white.locator('img')).toHaveCount(0);await expect(black.locator('.material-advantage')).toHaveText('+1');
  await expect.poll(()=>page.evaluate(()=>new Promise<number>(resolve=>{const request=indexedDB.open('pion');request.onsuccess=()=>{const db=request.result,query=db.transaction('games').objectStore('games').getAll();query.onsuccess=()=>{db.close();resolve(query.result[0].moves.length);};};}))).toBe(6);
  await page.reload();await expect(black.locator('.material-advantage')).toHaveText('+1');await expect(white.locator('img')).toHaveCount(0);
});
