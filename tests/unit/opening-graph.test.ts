import 'fake-indexeddb/auto';
import {describe,it,expect} from 'vitest';
import {Chess} from 'chess.js';
import {graphPosition,repertoireIndex,appendVariation,variationPath,type VariationNode} from '../../src/openings/graph';
import {positionKey} from '../../src/openings/teaching';
import {freshRepetition} from '../../src/learning/repetition';
import {START_FEN} from '../../src/chess/rules';
import {PionDatabase} from '../../src/storage/db';
import {createBackup,restoreBackup} from '../../src/storage/backup';
const fen=(line:string)=>{const c=new Chess();for(const san of line.split(' '))c.move(san);return c.fen();};
describe('position graph',()=>{
  it('answers equivalent move orders by exact position, including named identity',()=>{const a=fen('e4 e5 Nf3 Nc6 Nc3 Nf6'),b=fen('e4 e5 Nc3 Nf6 Nf3 Nc6');expect(positionKey(a)).toBe(positionKey(b));expect(graphPosition(a).moves).toEqual(graphPosition(b).moves);expect(graphPosition(a).opening).toBeDefined();expect(graphPosition(a).opening?.id).toBe(graphPosition(b).opening?.id);});
  it('keeps turn, castling and usable en passant in the key',()=>{expect(positionKey(START_FEN)).not.toBe(positionKey(START_FEN.replace(' KQkq ',' - ')));expect(positionKey(START_FEN)).not.toBe(positionKey(START_FEN.replace(' w ',' b ')));const ep='7k/8/8/3pP3/8/8/8/7K w - d6 0 1';expect(positionKey(ep)).not.toBe(positionKey(ep.replace(' d6 ',' - ')));expect(positionKey(ep)).toBe(positionKey(ep.replace(' 0 1',' 48 90')));});
  it('retains sibling branches when navigating backward and forward',()=>{let tree:VariationNode[]=[{id:0,fen:START_FEN,children:[]}];const first=appendVariation(tree,0,'e2e4');tree=first.nodes;const second=appendVariation(tree,0,'d2d4');expect(second.nodes[0]!.children).toHaveLength(2);expect(variationPath(second.nodes,second.selected).map(n=>n.move)).toEqual(['d2d4']);expect(appendVariation(second.nodes,0,'e2e4').selected).toBe(first.selected);});
  it('marks a saved custom-FEN move without falsely labeling it book',()=>{const start='7k/8/5KQ1/8/8/8/8/8 w - - 0 1',index=repertoireIndex([{id:'custom',openingId:'custom',name:'mate',startFen:start,moves:['g6g7'],color:'w',...freshRepetition()}]);const node=graphPosition(start,index);expect(node.moves).toHaveLength(1);expect(node.moves[0]).toMatchObject({book:false,repertoire:['custom']});});
  it('round trips custom position branches and rejects corrupt FEN before changing storage',async()=>{const a=new PionDatabase(crypto.randomUUID()),b=new PionDatabase(crypto.randomUUID());try{await a.repertoire.put({id:'custom',openingId:'custom',name:'mate',startFen:'7k/8/5KQ1/8/8/8/8/8 w - - 0 1',moves:['g6g7'],color:'w',...freshRepetition(2)});const backup=await createBackup(a);await restoreBackup(backup,b);expect(await b.repertoire.get('custom')).toEqual(await a.repertoire.get('custom'));const bad=JSON.parse(backup);bad.repertoire[0].startFen='invalid';await expect(restoreBackup(JSON.stringify(bad),b)).rejects.toThrow();expect(await b.repertoire.count()).toBe(1);}finally{await a.delete();await b.delete();}});
});

