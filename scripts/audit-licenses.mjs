import fs from 'node:fs/promises';
const modules='node_modules/.pnpm';const directories=await fs.readdir(modules);const packages=new Map();
for(const dir of directories){if(dir==='node_modules')continue;const root=`${modules}/${dir}/node_modules`;let children;try{children=await fs.readdir(root);}catch{continue;}
  for(const child of children){const names=child.startsWith('@')?(await fs.readdir(`${root}/${child}`)).map(name=>`${child}/${name}`):[child];for(const name of names){try{const p=JSON.parse(await fs.readFile(`${root}/${name}/package.json`,'utf8'));packages.set(`${p.name}@${p.version}`,{name:p.name,version:p.version,license:p.license??'UNKNOWN'});}catch{}}}
}
const rows=[...packages.values()].sort((a,b)=>a.name.localeCompare(b.name));await fs.writeFile('docs/DEPENDENCY_LICENSES.json',JSON.stringify({generatedAt:new Date().toISOString(),packages:rows},null,2));const unknown=rows.filter(p=>p.license==='UNKNOWN');console.log(`Inventoried ${rows.length} dependencies; ${unknown.length} unknown license declarations.`);if(unknown.length){console.log(unknown.map(p=>p.name).join('\n'));process.exitCode=1;}
