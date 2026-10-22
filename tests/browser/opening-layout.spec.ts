import {expect,test} from '@playwright/test';

test('opening tiers, master examples and paired moves remain readable across screen sizes',async({page})=>{
  for(const width of [320,390,641,768,1024,1440]){
    await page.setViewportSize({width,height:844});await page.goto('/#openings/ruy-lopez');
    await expect(page.locator('main h1')).toHaveText('Ruy Lopez');
    if(await page.locator('details.opening-editorial').getAttribute('open')===null)await page.getByText('Learning tier & master examples',{exact:true}).click();
    await expect(page.getByLabel('Learning tier S',{exact:true})).toBeVisible();
    await expect(page.locator('.opening-masters')).toContainText('Garry Kasparov');
    const moves=page.getByRole('list',{name:'Opening move sequence'});
    await expect(moves.locator('li')).toHaveCount(5);await expect(moves.getByRole('button')).toHaveCount(9);
    await moves.getByRole('button',{name:'After 5. O-O',exact:true}).click();
    await expect(moves.getByRole('button',{name:'After 5. O-O',exact:true})).toHaveAttribute('aria-current','step');
    await expect(page.getByTestId('chessboard').locator('piece.white.king')).toHaveCount(1);
    await page.getByRole('button',{name:'Previous move',exact:true}).click();
    await expect(moves.getByRole('button',{name:'After 4... Nf6',exact:true})).toHaveAttribute('aria-current','step');
    const geometry=await page.locator('.study-board').evaluate(el=>{
      const board=el.querySelector('.board-container')!.getBoundingClientRect(),nav=el.querySelector('.move-navigation')!.getBoundingClientRect(),list=el.querySelector('.opening-moves')!.getBoundingClientRect(),prompt=el.querySelector('.turn-prompt')!.getBoundingClientRect();
      const chips=[...el.querySelectorAll('.opening-move-pair')].map(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('button')].every(b=>{const c=b.getBoundingClientRect();return c.left>=r.left&&c.right<=r.right+1;});});
      return {boardGap:nav.top-board.bottom,movesGap:list.top-nav.bottom,contained:chips.every(Boolean),overflow:document.documentElement.scrollWidth-innerWidth,widthDifference:Math.max(Math.abs(prompt.width-board.width),Math.abs(nav.width-board.width),Math.abs(list.width-board.width))};
    });
    expect(geometry.boardGap).toBeGreaterThanOrEqual(15);expect(geometry.movesGap).toBeGreaterThanOrEqual(15);expect(geometry.contained).toBe(true);expect(geometry.overflow).toBeLessThanOrEqual(2);expect(geometry.widthDifference).toBeLessThanOrEqual(1);
  }
  await page.goto('/#openings');await expect(page.locator('.opening-library .tier-stamp')).toHaveCount(12);
  await expect(page.locator('.opening-tier-guide li')).toHaveText(['SSS','SS','S','A','B','C','D']);
  for(const width of [320,390,641,768,1024,1440]){await page.setViewportSize({width,height:844});await expect.poll(()=>page.locator('.opening-learning-profile dd').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent))).toEqual([]);}
  await page.getByRole('button',{name:'Opening explorer',exact:true}).click();await page.getByText('Find a position or named line',{exact:true}).click();await page.getByLabel('Search ECO lines',{exact:true}).fill('Sicilian');
  await expect(page.locator('.study-panel .course-lessons>button').first()).toBeVisible();
  const search=await page.locator('.study-panel .course-lessons>button').first().evaluate(el=>({display:getComputedStyle(el).display,overflow:el.scrollWidth-el.clientWidth}));
  expect(search.display).toBe('block');expect(search.overflow).toBeLessThanOrEqual(2);
});
