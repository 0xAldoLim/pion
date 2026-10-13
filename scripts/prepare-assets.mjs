import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import lock from './engine-lock.json' with {type:'json'};
const deep=process.argv.includes('--deep');
const manifest={version:'19.0.1',source:'https://github.com/nmrugg/stockfish.js/tree/v19.0.1',packs:{}};
for(const pack of ['lite',...(deep?['deep']:[])]){
  const dir=`public/engines/${pack==='deep'?'deep/':''}`;await fs.mkdir(dir,{recursive:true});const files=[];
  for(const asset of lock.filter(a=>a.pack===pack)){
    const file=dir+asset.name;
    let bytes;try{bytes=await fs.readFile(file);}catch{}
    if(!bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==asset.sha256){
      console.log(`Downloading pinned ${asset.name} (${(asset.size/1024/1024).toFixed(1)} MB)`);
      const response=await fetch(asset.url,{signal:AbortSignal.timeout(600_000)});if(!response.ok)throw new Error(`Download failed ${response.status}: ${asset.url}`);
      bytes=Buffer.from(await response.arrayBuffer());if(crypto.createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error(`Integrity mismatch: ${asset.name}`);
      await fs.writeFile(file,bytes);
    }
    files.push({url:`engines/${pack==='deep'?'deep/':''}${asset.name}`,sha256:asset.sha256,bytes:bytes.length});
  }
  manifest.packs[pack]={files};
}
await fs.writeFile('public/engines/manifest.json',JSON.stringify(manifest,null,2));
console.log('Engine integrity verified. All runtime assets are same-origin.');
