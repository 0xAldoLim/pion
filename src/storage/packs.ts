import {db} from './db';
interface Asset {url:string;sha256:string;bytes:number}
interface Manifest {version:string;packs:{lite:{files:Asset[]};deep?:{files:Asset[]}}}
async function manifest():Promise<Manifest>{const response=await fetch(`${import.meta.env.BASE_URL}engines/manifest.json`);if(!response.ok)throw new Error('Missing engine manifest. Run pnpm assets.');return response.json();}
export async function installDeepPack(onProgress:(done:number,total:number)=>void,signal:AbortSignal) {
  const metadata=await manifest();if(!metadata.packs.deep)throw new Error('This deployment does not offer the full engine. Build with pnpm assets:deep to make it available. The lite engine remains usable.');
  const cache=await caches.open('pion-deep-v1');const assets=metadata.packs.deep.files;let done=0;
  const total=assets.reduce((a,b)=>a+b.bytes,0);
  // Validate every asset before promoting the pack. A partial cache is never installed.
  const responses:{url:string;response:Response}[]=[];
  for(const asset of assets){
    const url=new URL(`${import.meta.env.BASE_URL}${asset.url}`,location.href).href;
    const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Full engine asset failed: HTTP ${response.status}`);
    const bytes=await response.arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
    if(digest!==asset.sha256)throw new Error('Engine integrity mismatch. The pack was not installed.');
    responses.push({url,response:new Response(bytes,{headers:response.headers})});done+=bytes.byteLength;onProgress(done,total);
  }
  for(const item of responses)await cache.put(item.url,item.response);
  await db.packs.put({id:'deep',installedAt:Date.now(),version:metadata.version,bytes:total});
}
export async function verifyDefaultEngine():Promise<boolean> {
  const metadata=await manifest();
  for(const asset of metadata.packs.lite.files){const response=await fetch(`${import.meta.env.BASE_URL}${asset.url}`);if(!response.ok)return false;const bytes=await response.arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');if(digest!==asset.sha256)return false;}
  return true;
}
