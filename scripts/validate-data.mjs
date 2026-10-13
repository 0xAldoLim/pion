import fs from 'node:fs/promises';
import {Chess} from 'chess.js';
let count=0;
for(const name of ['puzzles','openings']){const data=JSON.parse(await fs.readFile(`src/data/${name}.json`,'utf8'));for(const record of data.puzzles??data.entries){const c=new Chess(record.fen && name==='puzzles'?record.fen:undefined);for(const move of record.moves)c.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});if(name==='openings'&&c.fen()!==record.fen)throw new Error(`Bad opening ${record.id}`);count++;}}
console.log(`Validated ${count} puzzle/opening records.`);
