import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {Chess} from 'chess.js';
const refs=process.argv[2];
if(!refs)throw new Error('Supply an absolute reference checkout directory.');
await fs.mkdir('src/data',{recursive:true});
const source=JSON.parse(await fs.readFile(path.join(refs,'patzer/server/src/chess/tacticsSet.json'),'utf8'));
const puzzles=source.puzzles.map(row=>{const [id,fen,moves,rating,themes]=row.split('|');const c=new Chess(fen);const solution=moves.split(' ');for(const uci of solution)c.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});return {id,fen,moves:solution,rating:Number(rating),themes:themes.split(' ').filter(Boolean),source:`https://lichess.org/training/${id}`,license:'CC0-1.0',attribution:'Lichess puzzle database; compact selection via Patzer',setup:true};});
await fs.writeFile('src/data/puzzles.json',JSON.stringify({source:source.source,snapshot:source.snapshot,puzzles}));
const entries=[];
for(const volume of ['a','b','c','d','e']){
  const text=await fs.readFile(path.join(refs,`chess-openings/${volume}.tsv`),'utf8');
  for(const [i,row]of text.trim().split('\n').slice(1).entries()){
    const [eco,name,pgn]=row.trim().split('\t');const c=new Chess();c.loadPgn(pgn);const moves=c.history({verbose:true}).map(m=>m.from+m.to+(m.promotion??''));entries.push({id:`${volume}-${i}`,eco,name,moves,fen:c.fen()});
  }
}
const sha=execFileSync('git',['-C',path.join(refs,'chess-openings'),'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const book={};
for(const opening of entries){const c=new Chess();for(const move of opening.moves){const key=c.fen().split(' ').slice(0,4).join(' ');const set=new Set(book[key]??[]);set.add(move);book[key]=[...set];c.move({from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]});}}
await fs.writeFile('src/data/openings.json',JSON.stringify({source:'https://github.com/lichess-org/chess-openings',revision:sha,license:'CC0-1.0',entries,book}));
console.log(`Validated ${puzzles.length} puzzles and ${entries.length} opening lines, revision ${sha}.`);
