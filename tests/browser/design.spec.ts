import {test,expect,type Page} from '@playwright/test';

async function route(page:Page,name:string){await page.goto(`/#${name}`);await expect(page.locator('main h1')).toBeVisible();}
async function measureFits(page:Page){
  await expect.poll(()=>page.locator('.chessboard').evaluateAll(nodes=>nodes.every(el=>!!el.querySelector('cg-board')))).toBe(true);
  const result=await page.evaluate(()=>{
    const containers=[...document.querySelectorAll('main,header,.card,.coach-card,.filters,.library-card,.board-controls,.move-list,.app-dialog,.page-intro')];
    const overflow=containers.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&el.scrollWidth>el.clientWidth+2;}).map(el=>({className:el.className,width:el.clientWidth,scroll:el.scrollWidth}));
    const boards=[...document.querySelectorAll('.chessboard')].map(el=>{const frame=el.getBoundingClientRect(),stage=el.closest('.board-stage')!.getBoundingClientRect();const board=el.querySelector('cg-board')!.getBoundingClientRect(),bar=el.closest('.board-container')?.querySelector('.eval-bar')?.getBoundingClientRect();return {frame:{width:frame.width,height:frame.height},contained:board.left>=frame.left&&board.right<=frame.right+1&&board.top>=frame.top&&board.bottom<=frame.bottom+1,borderDifference:Math.max(Math.abs((board.left-stage.left)-(stage.right-board.right)),Math.abs((board.top-stage.top)-(stage.bottom-board.bottom))),barAligned:!bar||(Math.abs(bar.top-board.top)<1.5&&Math.abs(bar.bottom-board.bottom)<1.5)};});
    const coordinates=[...document.querySelectorAll('.chessboard')].flatMap(el=>{
      const ranks=el.querySelector('coords.ranks'),files=el.querySelector('coords.files'),board=el.querySelector('cg-board')!.getBoundingClientRect();
      if(!ranks||!files||!ranks.getBoundingClientRect().width)return [];
      const rankLabels=[...ranks.children].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top),fileLabels=[...files.children].sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
      const top=rankLabels[0],left=fileLabels[0];
      const labels=[...rankLabels,...fileLabels].map(label=>{const r=label.getBoundingClientRect();return r.left>=board.left&&r.right<=board.right+1&&r.top>=board.top&&r.bottom<=board.bottom+1;});
      return [{contained:labels.every(Boolean),oppositeCornerColors:!!top&&!!left&&getComputedStyle(top).color!==getComputedStyle(left).color,equalSpacing:rankLabels.length===8&&fileLabels.length===8&&rankLabels.every(label=>Math.abs(label.getBoundingClientRect().height-board.height/8)<1)&&fileLabels.every(label=>Math.abs(label.getBoundingClientRect().width-board.width/8)<1)}];
    });
    return {width:document.documentElement.scrollWidth,viewport:innerWidth,overflow,boards,coordinates};
  });
  expect(result.width).toBeLessThanOrEqual(result.viewport+2);expect(result.overflow).toEqual([]);
  for(const board of result.boards){expect(board.contained).toBe(true);expect(board.borderDifference).toBeLessThanOrEqual(1);expect(board.barAligned).toBe(true);expect(Math.abs(board.frame.width-board.frame.height)).toBeLessThanOrEqual(1);expect(board.frame.width).toBeGreaterThan(70);}
  for(const coordinates of result.coordinates){expect(coordinates.contained).toBe(true);expect(coordinates.oppositeCornerColors).toBe(true);expect(coordinates.equalSpacing).toBe(true);}
}

async function fits(page:Page){await expect(async()=>{await measureFits(page);}).toPass({timeout:5000});}

test('all main screens and lesson exercises stay within six viewport widths',async({page})=>{
  test.setTimeout(180_000);
  for(const width of [320,390,641,768,1024,1440]){
    await page.setViewportSize({width,height:844});
    for(const name of ['home','play/match','review','analysis','puzzles','openings','learn','progress','settings']){await route(page,name);await fits(page);}
    await route(page,'learn');await page.getByRole('button',{name:'Lesson library',exact:true}).click();await page.locator('.library-card').last().click();await fits(page);
    await route(page,'openings');await page.locator('.opening-library button').first().click();await fits(page);
  }
});

test('tablet navigation and compact dialogs contain focus and close with Escape',async({page})=>{
  await page.setViewportSize({width:768,height:600});await route(page,'home');
  await page.getByRole('button',{name:'Toggle navigation'}).click();await expect(page.getByRole('dialog',{name:'Navigation',exact:true})).toBeVisible();
  await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('#main-navigation'))).toBe(true);
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Navigation',exact:true})).toBeHidden();await expect(page.getByRole('button',{name:'Toggle navigation'})).toBeFocused();
  await page.setViewportSize({width:320,height:480});await route(page,'settings');await page.getByLabel('Restore backup file').setInputFiles({name:'sample.json',mimeType:'application/json',buffer:Buffer.from('{}')});
  const restore=page.getByRole('dialog',{name:'Restore backup confirmation'});await expect(restore).toBeVisible();await fits(page);await restore.getByRole('button',{name:'Cancel',exact:true}).focus();await page.keyboard.press('Tab');await expect(restore.getByRole('button',{name:'Export current backup'})).toBeFocused();await page.keyboard.press('Escape');await expect(restore).toBeHidden();
  await route(page,'analysis');await page.getByLabel('FEN input').fill('8/P6k/8/8/8/8/8/4K3 w - - 0 1');await page.getByRole('button',{name:'Load FEN',exact:true}).click();const surface=page.getByTestId('chessboard').locator('cg-board');await surface.evaluate(el=>el.scrollIntoView({block:'center'}));const board=await surface.boundingBox();if(!board)throw new Error('Board missing');await surface.click({position:{x:board.width/16,y:board.height*3/16}});await surface.click({position:{x:board.width/16,y:board.height/16}});await expect(page.getByRole('dialog',{name:'Choose promotion'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Choose promotion'})).toBeHidden();await expect(page.getByLabel('FEN input')).toHaveValue(/^8\/P6k/);
});

test('active game frame stays aligned through premoves and board flipping',async({page})=>{
  await page.clock.install();await page.clock.pauseAt(new Date());await route(page,'play');await page.getByRole('button',{name:'Start game',exact:true}).click();
  for(const width of [320,390,641,768,1024,1440]){await page.setViewportSize({width,height:900});await expect(async()=>{await page.clock.runFor(32);await fits(page);}).toPass({timeout:5000});}
  const surface=page.getByTestId('chessboard').locator('cg-board'),before=await surface.boundingBox();
  await page.getByLabel('Legal move').selectOption('e2e4');await page.getByRole('button',{name:'Play move',exact:true}).click();await page.clock.runFor(32);await expect(page.getByLabel('Premove from')).toBeVisible();
  const after=await surface.boundingBox();expect(after!.width).toBeCloseTo(before!.width,0);expect(after!.height).toBeCloseTo(before!.height,0);
  for(const width of [1440,1024,768,641,390,320]){await page.setViewportSize({width,height:900});await expect(async()=>{await page.clock.runFor(32);await fits(page);}).toPass({timeout:5000});}
  await expect(page.locator('.board-footer .player-strip strong')).toHaveText('You');await page.getByRole('button',{name:'Flip',exact:true}).click();await page.clock.runFor(32);await expect(page.locator('.board-column>.player-strip strong')).toHaveText('You');await expect(page.locator('.eval-bar')).toHaveClass(/reversed/);await fits(page);
  await page.setViewportSize({width:1440,height:720});await expect(async()=>{await page.clock.runFor(32);await fits(page);}).toPass({timeout:5000});expect(await page.locator('.board-footer').evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(722);
});



