import {db} from './db';
interface Asset {url:string;sha256:string;bytes:number}
interface Manifest {version:string;packs:{lite:{files:Asset[]};deep?:{files:Asset[]}}}
async function manifest():Promise<Manifest>{const response=await fetch(`${import.meta.env.BASE_URL}engines/manifest.json`);if(!response.ok)throw new Error('Missing engine manifest. Run pnpm assets.');return response.json();}
export async function installDeepPack(onProgress:(done:number,total:number)=>void,signal:AbortSignal) {
  const metadata=await manifest();if(!metadata.packs.deep)throw new Error('This deployment does not offer the full engine. Build with pnpm assets:deep to make it available. The lite engine remains usable.');
  const cache=await caches.open('pion-deep-v1');const assets=metadata.packs.deep.files;let done=0;
  const total=assets.reduce((a,b)=>a+b.bytes,0);
  const quota=await navigator.storage?.estimate();
  if(quota?.quota!==undefined&&quota.usage!==undefined&&quota.quota-quota.usage<total*1.1)throw new Error('Insufficient browser storage for the full pack. Export backups before managing storage.');
  // Validate every asset before promoting the pack. A partial cache is never installed.
  const responses:{url:string;response:Response}[]=[];
  for(const asset of assets){
    const url=new URL(`${import.meta.env.BASE_URL}${asset.url}`,location.href).href;
    // The download query bypasses the cache-only worker route. Unverified bytes
    // never enter the runtime cache or become eligible for engine execution.
    const downloadUrl=new URL(url);downloadUrl.searchParams.set('pion-download',metadata.version);
    const response=await fetch(downloadUrl,{signal,cache:'no-store'});if(!response.ok)throw new Error(`Full engine asset failed: HTTP ${response.status}`);
    if(!response.body)throw new Error('Engine download has no response body.');
    const bytes=new Uint8Array(asset.bytes);const reader=response.body.getReader();let read=0,lastProgress=0;
    for(;;){const chunk=await reader.read();if(chunk.done)break;if(read+chunk.value.byteLength>bytes.byteLength){await reader.cancel();throw new Error('Engine size exceeds the pinned manifest.');}bytes.set(chunk.value,read);read+=chunk.value.byteLength;if(Date.now()-lastProgress>=100||read===bytes.byteLength){onProgress(done+read,total);lastProgress=Date.now();}}
    if(read!==asset.bytes)throw new Error('Engine download was incomplete.');
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
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
