import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Italian discovery teaches annotated alternatives and short repertoire recall',async({page})=>{
  page.setDefaultTimeout(15000);
  await page.goto('/#openings');await page.getByLabel('Search openings',{exact:true}).fill('Italian');const card=page.locator('.library-card').filter({has:page.getByRole('heading',{name:'Italian Game',exact:true})});await expect(card).toContainText('Develop toward the center');await card.getByRole('button',{name:'Learn the ideas',exact:true}).click();await expect(page.locator('.study-panel')).toContainText('f7');await page.getByLabel('Variation',{exact:true}).selectOption('1');await page.getByRole('button',{name:'Next move',exact:true}).click();await expect(page.locator('.study-panel')).toContainText('attacks e4');await page.getByRole('button',{name:'Add to repertoire',exact:true}).click();await page.getByRole('button',{name:'Practice line',exact:true}).click();for(const move of ['e2e4','g1f3','f1c4']){await page.getByLabel('Legal move').selectOption(move);await page.getByRole('button',{name:'Play move',exact:true}).click();}await expect(page.locator('.study-panel [role=status]')).toContainText('Opening recall recorded');await page.getByRole('button',{name:'Return to opening',exact:true}).click();await page.getByRole('button',{name:'Try a mistake-recovery exercise',exact:true}).click();await expect(page.locator('.study-panel')).toContainText('bounded legal exchange');
  for(const mode of ['dark','light']){await page.getByRole('button',{name:`Switch to ${mode} mode`}).click();expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);}
});


