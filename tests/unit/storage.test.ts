import 'fake-indexeddb/auto';
import {afterEach,describe,it,expect} from 'vitest';
import {PionDatabase} from '../../src/storage/db';
import {createBackup,restoreBackup} from '../../src/storage/backup';
import {DEFAULT_PREFS} from '../../src/chess/types';
import {importPgn} from '../../src/chess/rules';
import {adaptiveRating,freshRepetition,schedule} from '../../src/learning/repetition';
const databases:PionDatabase[]=[];function createDb(){const db=new PionDatabase(`test-${crypto.randomUUID()}`);databases.push(db);return db;}
afterEach(async()=>{for(const db of databases)await db.delete();databases.length=0;});
describe('persistence and backups',()=>{
  it('round trips preferences, games and progress transactionally',async()=>{const source=createDb();const game=importPgn('1. e4 e5 2. Nf3 Nc6');await source.games.add(game);await source.preferences.add(DEFAULT_PREFS);await source.training.add({id:'lesson1',at:10,kind:'lesson',target:'board-vision',success:true,hints:0});const target=createDb();await restoreBackup(await createBackup(source),target);expect((await target.games.get(game.id))?.moves).toEqual(game.moves);expect(await target.preferences.get('main')).toEqual(DEFAULT_PREFS);expect(await target.training.count()).toBe(1);});
  it('rejects malformed or inconsistent backups before mutation',async()=>{const db=createDb();const game=importPgn('1. e4 e5');await db.games.add(game);const original=await createBackup(db);const bad=JSON.parse(original) as {games:{moves:string[]}[]};bad.games[0]!.moves=['e2e5'];await expect(restoreBackup(JSON.stringify(bad),db)).rejects.toThrow();expect(await createBackup(db)).toContain(game.id);await expect(restoreBackup('{broken',db)).rejects.toThrow();expect(await db.games.count()).toBe(1);});
  it('keeps repetition separate from unseen puzzle estimates',()=>{expect(adaptiveRating(600,600,true,0,false)).toBe(600);expect(adaptiveRating(600,600,true,0,true)).toBeGreaterThan(600);expect(adaptiveRating(600,600,true,1,true)).toBeLessThan(600);const fresh=freshRepetition(0);const first=schedule(fresh,true,0,0);expect(first.interval).toBe(1);expect(schedule(first,true,0,0).interval).toBe(3);expect(schedule(first,false,0,0).successes).toBe(1);expect(schedule(first,false,0,0).failures).toBe(1);});
});
