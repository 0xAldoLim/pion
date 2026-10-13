import Dexie, {type Table} from 'dexie';
import type {Attempt, Game, Mistake, Preferences, Puzzle, Repertoire, TrainingEvent} from '../chess/types';
export interface PackRecord {id:string; installedAt:number; version:string; bytes:number}
export class PionDatabase extends Dexie {
  games!:Table<Game,string>;
  preferences!:Table<Preferences,string>;
  attempts!:Table<Attempt,string>;
  mistakes!:Table<Mistake,string>;
  repertoire!:Table<Repertoire,string>;
  training!:Table<TrainingEvent,string>;
  puzzles!:Table<Puzzle,string>;
  packs!:Table<PackRecord,string>;
  constructor(name='pion') {
    super(name);
    this.version(1).stores({games:'id,updatedAt,status,botId',preferences:'id',attempts:'id,puzzleId,at,solved',mistakes:'id,gameId,due,*tags',repertoire:'id,openingId,due',training:'id,at,kind',puzzles:'id,rating,*themes',packs:'id'});
    // Explicit forward migration: older records recover original clock defaults.
    this.version(2).stores({games:'id,updatedAt,status,botId,createdAt'}).upgrade(async tx=>{
      await tx.table('games').toCollection().modify((g:Game)=>{g.clocks??={w:g.initialSeconds??0,b:g.initialSeconds??0};g.increment??=0;});
    });
    this.version(3).stores({preferences:'id'}).upgrade(async tx=>{await tx.table('preferences').toCollection().modify((p:Preferences)=>{p.botPace??='standard';});});
  }
}
export const db=new PionDatabase();
export async function saveGame(game:Game){await db.games.put({...game,updatedAt:Date.now()});}
