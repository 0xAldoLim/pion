import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

test('a real PWA update banner stays readable and contained in both palettes',async({page})=>{
  const root=path.resolve('dist');let version=1;
  const mime:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.webmanifest':'application/manifest+json'};
  const server=createServer(async(request,response)=>{
    const pathname=new URL(request.url??'/','http://127.0.0.1').pathname;
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));
    if(!file.startsWith(root+path.sep)){response.writeHead(404).end();return;}
    try{
      let body=await readFile(file);
      if(pathname==='/sw.js')body=Buffer.concat([body,Buffer.from(`\n// Pion update test version ${version}\n`)]);
      response.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'}).end(body);
    }catch{response.writeHead(404).end();}
  });
  await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  try{
    const address=server.address();if(!address||typeof address==='string')throw new Error('Test server unavailable');
    await page.goto(`http://127.0.0.1:${address.port}/#home`);await expect(page.locator('main h1')).toBeVisible();
    await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>undefined));await page.reload();
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    version=2;await page.evaluate(()=>navigator.serviceWorker.ready.then(registration=>registration.update()).then(()=>undefined));
    const banner=page.locator('.update-banner');await expect(banner).toBeVisible();
    for(const width of [320,1440]){
      await page.setViewportSize({width,height:900});
      for(const mode of ['dark','light']){
        await page.getByRole('button',{name:`Switch to ${mode} mode`}).click();await expect(page.locator('html')).toHaveAttribute('data-mode',mode);
        expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
        expect(await banner.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&el.scrollWidth<=el.clientWidth+1;})).toBe(true);
      }
    }
    await page.getByRole('button',{name:'Apply update',exact:true}).click();await expect(banner).toBeHidden();await expect(page.locator('main h1')).toBeVisible();
  }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
