import Dexie, {type Table} from 'dexie';
import type {Attempt, Game, Mistake, Preferences, Puzzle, Repertoire, TrainingEvent,Rating} from '../chess/types';
import {freshRating,ratingChange} from '../chess/ratings';
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
  ratings!:Table<Rating,string>;
  constructor(name='pion') {
    super(name);
    this.version(1).stores({games:'id,updatedAt,status,botId',preferences:'id',attempts:'id,puzzleId,at,solved',mistakes:'id,gameId,due,*tags',repertoire:'id,openingId,due',training:'id,at,kind',puzzles:'id,rating,*themes',packs:'id'});
    // Explicit forward migration: older records recover original clock defaults.
    this.version(2).stores({games:'id,updatedAt,status,botId,createdAt'}).upgrade(async tx=>{
      await tx.table('games').toCollection().modify((g:Game)=>{g.clocks??={w:g.initialSeconds??0,b:g.initialSeconds??0};g.increment??=0;});
    });
    this.version(3).stores({preferences:'id'}).upgrade(async tx=>{await tx.table('preferences').toCollection().modify((p:Preferences)=>{p.botPace??='standard';});});
    this.version(4).stores({ratings:'id'}).upgrade(async tx=>{await tx.table('preferences').toCollection().modify((p:Preferences)=>{p.colorMode??='light';p.showEval=true;});});
    this.version(5).stores({preferences:'id'}).upgrade(async tx=>{await tx.table('preferences').toCollection().modify((p:Preferences)=>{p.premoves??=true;});});
  }
}
export const db=new PionDatabase();
/** Game outcome and its rating are committed together, once, even across reloads/tabs. */
export async function saveGame(game:Game,database:PionDatabase=db):Promise<Game>{
  return database.transaction('rw',database.games,database.ratings,async()=>{
    const old=await database.games.get(game.id);
    // A settled rated result cannot be overwritten by a late autosave of the active game.
    if(old?.mode==='rated'&&old.rated?.delta!==undefined)return old;
    let next={...game,updatedAt:Date.now()};
    if(next.mode==='rated'&&next.rated&&next.status==='finished'&&next.result!=='*'){
      const rating=await database.ratings.get(next.rated.category)??freshRating(next.rated.category);
      const delta=ratingChange(rating.value,next.rated.opponent,next.result,next.playerColor);
      const value=Math.max(100,rating.value+delta);
      const won=next.result===(next.playerColor==='w'?'1-0':'0-1');const draw=next.result==='1/2-1/2';
      await database.ratings.put({...rating,value,games:rating.games+1,wins:rating.wins+Number(won),losses:rating.losses+Number(!won&&!draw),draws:rating.draws+Number(draw),updatedAt:Date.now()});
      next={...next,rated:{...next.rated,before:rating.value,delta:value-rating.value,after:value}};
    }
    await database.games.put(next);return next;
  });
}
