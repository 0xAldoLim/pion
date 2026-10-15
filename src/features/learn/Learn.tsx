import {lazy,Suspense,useState} from 'react';
import {ChevronRight} from 'lucide-react';
const MasterStudies=lazy(()=>import('./MasterStudies'));
import {useLiveQuery} from 'dexie-react-hooks';
import {useApp} from '../../app/context';
import {CURRICULUM,COURSES} from '../../data/curriculum';
import {db} from '../../storage/db';
import {lessonStatus} from '../../learning/progress';
import {LessonPlayer} from './LessonPlayer';
import {Glossary} from './Glossary';
import {LearningFocus} from './LearningFocus';
export default function Learn(){
  const {navigate,selectedId}=useApp(),progress=useLiveQuery(()=>db.lessonProgress.toArray(),[],[]);
  const [view,setView]=useState<'path'|'library'>('path'),[search,setSearch]=useState(''),[stage,setStage]=useState('all');
  const lesson=CURRICULUM.find(l=>l.id===selectedId);
  const recent=[...progress].sort((a,b)=>b.lastVisited-a.lastVisited).find(p=>p.currentStep!=='summary'&&!(p.currentStep==='recall'&&p.completedExercises.includes('recall')));
  if(selectedId==='masters'||selectedId?.startsWith('masters:')||selectedId?.startsWith('master:'))return <Suspense fallback={<p role="status">Loading master studies…</p>}><MasterStudies id={selectedId.startsWith('master:')?selectedId.slice(7):undefined} lessonId={selectedId.startsWith('masters:')?selectedId.slice(8):undefined}/></Suspense>;
  if(lesson)return <LessonPlayer key={lesson.id} lesson={lesson} onExit={()=>navigate('learn')}/>;
  return <><div className="page-intro"><div><span className="eyebrow">UNDERSTAND. TRY. REMEMBER.</span><h1>Learn at your own pace.</h1><p>Start with board awareness, then build up. Every stage is open to you.</p></div></div><div className="study-tabs" aria-label="Learning views"><button aria-pressed={view==='path'} onClick={()=>setView('path')}>Guided path</button><button aria-pressed={view==='library'} onClick={()=>setView('library')}>Lesson library</button><button onClick={()=>navigate('learn','masters')}>Master studies</button></div>
  {view==='path'?<>{recent&&<section className="card learning-next"><h2>Continue your saved lesson</h2><p>Return to the exact step where you stopped.</p><button className="primary" onClick={()=>navigate("learn",recent.lessonId)}>Continue lesson</button></section>}<LearningFocus startLabel={progress.length?"Study this lesson":"Start learning"}/><div className="course-grid">{COURSES.map(course=>{const items=CURRICULUM.filter(l=>l.stage===course.stage);return <section className="card course-stage" key={course.id}><span className="eyebrow">Stage {course.stage}</span><h2>{course.title}</h2><p>{course.description}</p><p className="save-note">{items.filter(l=>lessonStatus(l,progress.find(p=>p.lessonId===l.id)).practiced).length}/{items.length} practiced · {items.filter(l=>lessonStatus(l,progress.find(p=>p.lessonId===l.id)).demonstrated).length} with independent evidence</p><div className="course-lessons">{items.map((item,index)=>{const p=progress.find(p=>p.lessonId===item.id),status=lessonStatus(item,p);return <button key={item.id} onClick={()=>navigate('learn',item.id)}><span className="lesson-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><span className="lesson-row-copy"><strong>{item.title}</strong><span className="lesson-row-status">{status.demonstrated?'Independent evidence':status.practiced?'Practiced':status.viewed?'Continue':'Start lesson'}{p&&p.due<=Date.now()&&status.practiced?' · due for recall':''}</span></span><ChevronRight size={18} aria-hidden="true"/></button>;})}</div></section>;})}</div></>:<><div className="filters"><label>Search lessons<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="A concept, skill or lesson…"/></label><label>Stage<select value={stage} onChange={e=>setStage(e.target.value)}><option value="all">Every stage</option>{COURSES.map(c=><option value={c.stage} key={c.id}>{c.title}</option>)}</select></label></div><div className="library-grid">{CURRICULUM.filter(l=>(stage==='all'||l.stage===Number(stage))&&`${l.title} ${l.summary} ${l.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase())).map(item=><button key={item.id} className="library-card" onClick={()=>navigate('learn',item.id)}><span className="mini-tag">{item.category}</span><h2>{item.title}</h2><p>{item.summary}</p><small>Interactive lesson →</small></button>)}</div></>}
  <Glossary/></>;
}

