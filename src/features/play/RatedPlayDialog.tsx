import {useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {Timer,Zap,X} from 'lucide-react';
import {useApp} from '../../app/context';
import {Character} from '../../components/Character';
import {useFocusDialog} from '../../components/useFocusDialog';
import {freshRating,matchRating,ratingCategory} from '../../chess/ratings';
import {newGame} from '../../chess/rules';
import {db,saveGame} from '../../storage/db';
import {BOTS,botById} from '../bots/bots';

const durations=[60,180,300,600,900,1800];

export default function RatedPlayDialog({onClose}:{onClose:()=>void}){
  const {navigate}=useApp();
  const ratings=useLiveQuery(()=>db.ratings.toArray(),[],[]);
  const dialog=useRef<HTMLDivElement>(null),launching=useRef(false);
  const [starting,setStarting]=useState<number>(),[error,setError]=useState('');
  const [side,setSide]=useState<'w'|'b'|'random'>('random');
  const close=()=>{if(!launching.current)onClose();};
  useFocusDialog(dialog,true,close);

  async function start(seconds:number){
    if(launching.current)return;
    launching.current=true;setStarting(seconds);setError('');
    try{
      const category=ratingCategory(seconds,0);
      const rating=await db.ratings.get(category)??freshRating(category);
      const opponent=BOTS[Math.floor(Math.random()*BOTS.length)]!.id;
      const color=side==='random'?(Math.random()<0.5?'w':'b'):side;
      const game=newGame(opponent,color,'rated',seconds);
      game.rated={category,before:rating.value,opponent:matchRating(rating.value)};
      const name=botById(opponent).name;
      game.headers={White:color==='w'?'You':name,Black:color==='b'?'You':name};
      await saveGame(game);
      navigate('play',game.id);onClose();
    }catch(cause){setError(`Could not start your match. ${String(cause)}`);}
    finally{launching.current=false;setStarting(undefined);}
  }

  return <div className="app-dialog rated-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="rated-title" aria-describedby="rated-description" tabIndex={-1} onClick={event=>{if(event.target===event.currentTarget)close();}}>
    <section className="card">
      <div className="rated-dialog-heading"><Character seed={0} size={56}/><div><span className="eyebrow">PLAY AT YOUR LEVEL</span><h2 id="rated-title">Choose your duration.</h2></div><button className="rated-dialog-close" aria-label="Close time selection" disabled={starting!==undefined} onClick={close}><X size={21}/></button></div>
      <p id="rated-description">Choose your side, then tap a duration to start. Your opponent will be within 20 points of that rating.</p>
      <fieldset className="rated-color-choice" disabled={starting!==undefined}><legend>Your side</legend><div>{([{value:'w',label:'White'},{value:'b',label:'Black'},{value:'random',label:'Random'}] as const).map(option=><label key={option.value}><input type="radio" name="rated-side" value={option.value} checked={side===option.value} onChange={()=>setSide(option.value)}/><span>{option.label}</span></label>)}</div><p>Random gives White and Black an equal chance.</p></fieldset>
      {(['blitz','rapid'] as const).map(category=>{
        const rating=ratings.find(value=>value.id===category)??freshRating(category);
        const Icon=category==='blitz'?Zap:Timer;
        return <div key={category} className="rated-duration-group" role="group" aria-labelledby={`rated-${category}`}>
          <div className="rated-duration-heading"><h3 id={`rated-${category}`}><Icon size={19}/>{category==='blitz'?'Blitz':'Rapid'}</h3><span>Your rating <strong>{rating.value}</strong></span></div>
          <div className="rated-duration-options">{durations.filter(seconds=>ratingCategory(seconds,0)===category).map(seconds=><button key={seconds} disabled={starting!==undefined} aria-label={`${seconds/60} ${seconds===60?'minute':'minutes'} · ${category==='blitz'?'Blitz':'Rapid'}`} onClick={()=>void start(seconds)}><strong>{seconds/60}</strong><span>{starting===seconds?'Starting…':'min'}</span></button>)}</div>
        </div>;
      })}
      <p className="rated-dialog-note">Wins and losses update only the selected Blitz or Rapid rating. Practice games leave both ratings unchanged.</p>
      {error&&<div className="error" role="alert">{error}</div>}
      <div className="rated-dialog-footer"><span>Local rated play · opponent matched to your rating</span><button disabled={starting!==undefined} onClick={close}>Cancel</button></div>
    </section>
  </div>;
}
