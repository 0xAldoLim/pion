import {createContext,useContext,useEffect,useState,useRef,useCallback} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../storage/db';
import {DEFAULT_PREFS,type Preferences} from '../chess/types';
export type Page='home'|'play'|'review'|'analysis'|'puzzles'|'openings'|'learn'|'progress'|'settings';
export interface AppContextValue {preferences:Preferences;setPreferences:(patch:Partial<Preferences>)=>Promise<void>;navigate:(page:Page,id?:string)=>void;notify:(text:string)=>void;selectedId:string|undefined;page:Page}
export const AppContext=createContext<AppContextValue|null>(null);
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error('Missing app provider');return value;}
export function usePreferences(){
  const stored=useLiveQuery(()=>db.preferences.get('main'));
  const [preferences,setLocal]=useState(DEFAULT_PREFS);
  const pending=useRef(0);
  useEffect(()=>{void db.preferences.get('main').then(p=>{if(!p)return db.preferences.put(DEFAULT_PREFS);});},[]);
  useEffect(()=>{if(stored&&pending.current===0)setLocal(stored);},[stored]);
  const setPreferences=useCallback(async(patch:Partial<Preferences>)=>{
    pending.current++;
    setLocal(current=>({...current,...patch,id:'main'}));
    try {
      await db.transaction('rw',db.preferences,async()=>{
        const current=await db.preferences.get('main')??DEFAULT_PREFS;
        await db.preferences.put({...current,...patch,id:'main'});
      });
    } finally {
      pending.current--;
      if(pending.current===0)setLocal(await db.preferences.get('main')??DEFAULT_PREFS);
    }
  },[]);
  return {preferences,setPreferences};
}
