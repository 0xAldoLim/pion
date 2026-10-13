export function Character({seed=0,color='#c7daa4',mood='idle',size=88}: {seed?:number;color?:string;mood?:'idle'|'thinking'|'happy'|'surprised'|'sad'|'celebrate'|'speaking';size?:number}) {
  const face=seed%4;const eyes=mood==='happy'||mood==='celebrate';
  return <svg className={`character mood-${mood}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="109" rx="39" ry="7" fill="#132b29" opacity=".1"/>
    <path d="M24 104c0-29 17-38 36-38s36 9 36 38" fill={color} stroke="#29423d" strokeWidth="2"/>
    {face===0?<><path d="M28 42 23 12 45 31M91 42 97 12 75 31" fill={color} stroke="#29423d" strokeWidth="2"/></>:face===1?<><ellipse cx="34" cy="28" rx="11" ry="23" fill={color} stroke="#29423d" strokeWidth="2"/><ellipse cx="87" cy="28" rx="11" ry="23" fill={color} stroke="#29423d" strokeWidth="2"/></>:face===2?<><circle cx="30" cy="30" r="14" fill={color} stroke="#29423d" strokeWidth="2"/><circle cx="89" cy="30" r="14" fill={color} stroke="#29423d" strokeWidth="2"/></>:<path d="m38 25 4-18 16 12 15-12 8 22" fill="#d7ba73" stroke="#29423d" strokeWidth="2"/>}
    <rect x="23" y="26" width="74" height="63" rx={face===3?24:32} fill={color} stroke="#29423d" strokeWidth="2"/>
    <ellipse cx="60" cy="68" rx="25" ry="18" fill="#fff9e9" opacity=".65"/>
    {eyes?<><path d="M38 53q7-9 14 0M68 53q7-9 14 0" fill="none" stroke="#29423d" strokeWidth="3" strokeLinecap="round"/></>:<><ellipse cx="45" cy="51" rx="3" ry={mood==='surprised'?6:4} fill="#29423d"/><ellipse cx="76" cy="51" rx="3" ry={mood==='surprised'?6:4} fill="#29423d"/></>}
    <path d="m56 62 4 5 4-5Z" fill="#29423d"/>
    <path className="mouth" d={mood==='sad'?'M49 78q11-12 22 0':mood==='surprised'?'M56 74a5 7 0 1 0 10 0a5 7 0 1 0-10 0':'M49 71q11 12 22 0'} fill={mood==='surprised'?'#29423d':'none'} stroke="#29423d" strokeWidth="2" strokeLinecap="round"/>
    {seed===8||seed===7?<g fill="none" stroke="#29423d" strokeWidth="2"><circle cx="44" cy="51" r="11"/><circle cx="76" cy="51" r="11"/><path d="M55 51h10"/></g>:null}
    {mood==='celebrate'?<path d="m8 31 4 9 9 2-8 4-2 10-4-9-10-2 9-4ZM108 11l3 7 8 2-7 3-2 8-3-7-8-2 7-3Z" fill="#d5b873"/>:null}
    <path d="M53 98h14" stroke="#29423d" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
