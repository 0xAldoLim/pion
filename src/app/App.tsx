import {useCallback,useEffect,useState,type ReactNode} from 'react';
import {ArrowUpRight,BookOpen,ChartNoAxesCombined,ChevronRight,Download,House,Menu,ScanSearch,Settings,ShieldCheck,Sparkles,Swords,Target,X,Sun,Moon} from 'lucide-react';
import {useRegisterSW} from 'virtual:pwa-register/react';
import {AppContext,usePreferences,type Page} from './context';
import {Character} from '../components/Character';
import Home from '../features/progress/Home';
import PlayScreen from '../features/play/Play';
import Review from '../features/review/Review';
import Analysis from '../features/analysis/Analysis';
import Puzzles from '../features/puzzles/Puzzles';
import Openings from '../features/openings/Openings';
import Learn from '../features/learn/Learn';
import Progress from '../features/progress/Progress';
import SettingsScreen from '../features/settings/Settings';

const pages:{id:Page;label:string;icon:typeof House}[]=[{id:'home',label:'Home',icon:House},{id:'play',label:'Play',icon:Swords},{id:'review',label:'Game review',icon:ScanSearch},{id:'analysis',label:'Analysis',icon:ChartNoAxesCombined},{id:'puzzles',label:'Puzzles',icon:Target},{id:'openings',label:'Openings',icon:BookOpen},{id:'learn',label:'Learn',icon:Sparkles},{id:'progress',label:'Progress',icon:ChartNoAxesCombined},{id:'settings',label:'Settings',icon:Settings}];
export default function App(){
  const readRoute=()=>{const [candidate,id]=location.hash.slice(1).split('/');return {page:pages.some(p=>p.id===candidate)?candidate as Page:'home' as Page,id:id?decodeURIComponent(id):undefined};};
  const [route,setRoute]=useState(readRoute);const [mobile,setMobile]=useState(false);const [message,setMessage]=useState('');const [install,setInstall]=useState<InstallEvent|null>(null);
  const {preferences,setPreferences}=usePreferences();
  const {offlineReady:[offlineReady],needRefresh:[needRefresh],updateServiceWorker}=useRegisterSW();
  useEffect(()=>{const handler=()=>{setRoute(readRoute());setMobile(false);window.scrollTo(0,0);};window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler);},[]);
  useEffect(()=>{const handler=(event:Event)=>{event.preventDefault();setInstall(event as InstallEvent);};window.addEventListener('beforeinstallprompt',handler);return()=>window.removeEventListener('beforeinstallprompt',handler);},[]);
  useEffect(()=>{document.documentElement.dataset.theme=preferences.theme;document.documentElement.dataset.mode=preferences.colorMode;document.documentElement.dataset.pieces=preferences.pieces;document.documentElement.classList.toggle('reduced-motion',preferences.reducedMotion||!preferences.animation);document.documentElement.classList.toggle('large-text',preferences.largeText);document.documentElement.classList.toggle('high-contrast',preferences.contrast);},[preferences]);
  const notify=useCallback((text:string)=>setMessage(text),[]);
  useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),7000);return()=>clearTimeout(timer);},[message]);
  const navigate=useCallback((page:Page,id?:string)=>{location.hash=page+(id?`/${encodeURIComponent(id)}`:'');},[]);
  let content:ReactNode;
  switch(route.page){case 'play':content=<PlayScreen/>;break;case 'review':content=<Review/>;break;case 'analysis':content=<Analysis/>;break;case 'puzzles':content=<Puzzles/>;break;case 'openings':content=<Openings/>;break;case 'learn':content=<Learn/>;break;case 'progress':content=<Progress/>;break;case 'settings':content=<SettingsScreen/>;break;default:content=<Home/>;}
  return <AppContext.Provider value={{preferences,setPreferences,navigate,notify,selectedId:route.id,page:route.page}}><a href="#main-content" className="skip-link">Skip to content</a><div className="app-shell"><aside className={`sidebar ${mobile?'open':''}`}><a className="brand" href="#home"><img src={`${import.meta.env.BASE_URL}assets/icon.svg`} alt=""/><span>pion<span className="brand-dot">.</span></span></a><span className="sidebar-caption">YOUR CHESS JOURNEY</span><nav aria-label="Main navigation">{pages.map(({id,label,icon:Icon})=><a key={id} href={`#${id}`} className={route.page===id?'active':''} aria-current={route.page===id?'page':undefined}><Icon size={20}/><span>{label}</span>{route.page===id&&<span className="nav-dot"/>}</a>)}</nav><div className="sidebar-bottom"><div className="offline-badge"><ShieldCheck size={18}/><div><strong>Yours. Always.</strong><small>{offlineReady?'Ready for offline play':'Private & local by design'}</small></div></div><a href="https://github.com/0xAldoLim/pion" target="_blank" rel="noreferrer">Open source, open possibilities <ArrowUpRight size={14}/></a></div></aside><div className="main-shell"><header className="topbar"><button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMobile(v=>!v)}>{mobile?<X size={21}/>:<Menu size={21}/>}</button><span className="breadcrumbs">Your space <ChevronRight size={13}/> <strong>{pages.find(p=>p.id===route.page)?.label}</strong></span><div className="topbar-right"><button className="theme-toggle" aria-label={preferences.colorMode==="dark"?"Switch to light mode":"Switch to dark mode"} onClick={()=>void setPreferences({colorMode:preferences.colorMode==="dark"?"light":"dark"})}>{preferences.colorMode==="dark"?<Sun size={19}/>:<Moon size={19}/>}<span>{preferences.colorMode==="dark"?"Light":"Dark"}</span></button><button className="primary nav-play" onClick={()=>navigate("play","match")}>Play now</button>{install&&<button className="text-button" onClick={()=>void install.prompt().then(()=>setInstall(null))}><Download size={16}/> Install Pion</button>}<span className="privacy"><span className="dot"/>{offlineReady?'Offline ready':'On-device training'}</span><span className="user-avatar"><Character seed={0} size={38}/></span></div></header>{needRefresh&&<div className="update-banner">An update is ready. Save your current activity before reloading.<button onClick={()=>void updateServiceWorker(true)}>Apply update</button></div>}<main id="main-content" className="page-content" key={route.page+'-'+(route.id??'')}>{content}</main></div></div>{message&&<div className="toast" role="status">{message}<button aria-label="Dismiss notification" onClick={()=>setMessage('')}><X size={15}/></button></div>}</AppContext.Provider>;
}
interface InstallEvent extends Event {prompt:()=>Promise<void>}
