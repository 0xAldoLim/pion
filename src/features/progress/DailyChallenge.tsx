import {Target,ArrowRight} from 'lucide-react';
import {useApp} from '../../app/context';
import {Board} from '../../components/Board';
import {dailyPuzzle,puzzleStart} from '../../data/puzzles';
export default function DailyChallenge(){const {navigate}=useApp(),daily=dailyPuzzle();return <section className="daily card"><div className="card-heading"><span className="eyebrow">A SMALL DAILY CHALLENGE</span><Target size={19}/></div><h2>The daily puzzle</h2><p>One position. A fresh perspective.</p><div className="daily-board"><Board fen={puzzleStart(daily).fen} animation={false}/></div><button className="text-button" onClick={()=>navigate('puzzles',daily.id)}>Find the best move <ArrowRight size={17}/></button></section>;}
