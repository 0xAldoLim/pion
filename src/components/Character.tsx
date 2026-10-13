export const MONKEY_NAMES=['Ponke','Lonke','Gonke','Konke','Bonke','Zonke','Donke'] as const;
/** Original small vector adaptations of the user's seven character references. */
export function Character({seed=0,color='#e4a52c',mood='idle',size=88}: {seed?:number;color?:string;mood?:'idle'|'thinking'|'happy'|'surprised'|'sad'|'celebrate'|'speaking';size?:number}) {
  const v=seed%7;const ink='#2a1a12';const fur=['#754329','#62321f','#c97529','#ec8128','#bf4b17','#754329','#b38a65'][v];
  const pale=v===6?'#f3e4cc':'#ffdbb3';const happy=mood==='happy'||mood==='celebrate';
  const tufts=Array.from({length:v===6?17:23},(_,i)=>{const angle=Math.PI+i*Math.PI/(v===6?16:22);const x=60+39*Math.cos(angle);const y=49+32*Math.sin(angle);return <path key={i} d={`M${x-6} ${y+9}q-7-16 2-17q10 0 10 14`} fill={fur} stroke={ink} strokeWidth="1.4"/>;});
  const fuzzy=v===1||v===3||v===4||v===6;
  return <svg className={`character monkey mood-${mood}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" data-character={MONKEY_NAMES[v]}>
    <ellipse cx="60" cy="112" rx="45" ry="5" fill="#000" opacity=".12"/>
    <path d="M24 104c-5-21 8-46 36-46s41 25 36 46Z" fill={fur} stroke={ink} strokeWidth="2.5"/>
    <ellipse cx="25" cy="88" rx="16" ry="23" transform="rotate(19 25 88)" fill={fur} stroke={ink} strokeWidth="2.5"/><ellipse cx="95" cy="88" rx="16" ry="23" transform="rotate(-19 95 88)" fill={fur} stroke={ink} strokeWidth="2.5"/>
    {v===2?<><path d="M39 73h42v30H39Z" fill="#155fbc" stroke={ink} strokeWidth="2"/><path d="M39 70v17m42-17v17" stroke="#155fbc" strokeWidth="10"/><circle cx="39" cy="78" r="3" fill="#ffce2e"/><circle cx="81" cy="78" r="3" fill="#ffce2e"/><path d="M47 88h26v9H47Z" fill="#104789"/></>:<ellipse cx="60" cy="87" rx="22" ry="22" fill={v===6?'#f3e4cc':pale}/>}
    <ellipse cx="20" cy="52" rx="13" ry="15" fill={fur} stroke={ink} strokeWidth="2.5"/><ellipse cx="100" cy="52" rx="13" ry="15" fill={fur} stroke={ink} strokeWidth="2.5"/>
    <ellipse cx="20" cy="53" rx="8" ry="10" fill={pale}/><ellipse cx="100" cy="53" rx="8" ry="10" fill={pale}/>
    {fuzzy&&<g>{tufts}</g>}
    <path d="M24 47c0-25 16-37 36-35 20-2 36 10 36 35v16c0 19-16 31-36 31S24 82 24 63Z" fill={fur} stroke={ink} strokeWidth="2.5"/>
    {v===6?<path d="M31 51c0-21 58-21 58 0v15c-1 17-57 17-58 0Z" fill={pale}/>:<path d="M33 48c0-16 17-21 27-9 10-12 27-7 27 9v14c9 17-7 24-27 24S24 79 33 62Z" fill={pale}/>}
    {v===0?<g stroke={ink} strokeWidth="2"><ellipse cx="45" cy="31" rx="16" ry="21" fill="#fff"/><ellipse cx="76" cy="31" rx="16" ry="21" fill="#fff"/><circle cx="43" cy="22" r="6" fill="#090b0b"/><circle cx="75" cy="22" r="6" fill="#090b0b"/></g>:v===1||v===4?<g stroke={ink} strokeWidth="1.7">{[44,76].map(x=><g key={x}><circle cx={x} cy="46" r="16" fill="#fff4dc"/><circle cx={x} cy="46" r="12" fill={v===1?'#deab20':'#a77744'}/><circle cx={x} cy="46" r={happy?8:10} fill="#0e1011"/><circle cx={x-4} cy="41" r="3.5" fill="#fff"/></g>)}</g>:v===2?<><path d="M39 48q6-8 13 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round"/><ellipse cx="75" cy="45" rx="8" ry="11" fill="#fff" stroke={ink} strokeWidth="2"/><ellipse cx="76" cy="47" rx="4.5" ry="7" fill="#101319"/><circle cx="73" cy="43" r="2" fill="#fff"/></>:happy?<path d="M38 50q7-8 14 0m16 0q7-8 14 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round"/>:<g>{[45,75].map(x=><g key={x}><ellipse cx={x} cy="48" rx="5" ry={mood==='surprised'?8:6} fill="#101319"/><circle cx={x-1.5} cy="45.5" r="1.8" fill="#fff"/></g>)}</g>}
    {v===6?<ellipse cx="60" cy="63" rx="10" ry="9" fill="#634638" stroke={ink} strokeWidth="2"/>:<><ellipse cx="60" cy="62" rx={v===0?27:20} ry={v===0?19:14} fill={pale}/>{v!==0&&<path d="M55 58q-4-3-5 1m15-1q4-3 5 1" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round"/>}</>}
    <path className="mouth" d={mood==='sad'?'M44 77q16-12 32 0':mood==='surprised'?'M55 75a6 8 0 1 0 12 0a6 8 0 1 0-12 0':v===0?'M34 77 84 68':v===6?'M54 74q6 6 12 0':'M41 70q19 19 38 0'} fill={mood==='surprised'?ink:'none'} stroke={ink} strokeWidth="2.4" strokeLinecap="round"/>
    {v===2&&<path d="M32 27q22-29 50-4l-18-5-7 12-10-5-7 11Z" fill="#c97529" stroke={ink} strokeWidth="1.6"/>}
    {v===3||v===4?<g fill={fur} stroke={ink} strokeWidth="1.3"><path d="m26 32 3-13 9 7 5-16 8 9 8-17 8 15 10-12 3 15 13-7 1 15Z"/>{[26,34,85,94].map((x,i)=><path key={x} d={`m${x} ${48+i*7} -7 10 10-3-4 12 10-6`} />)}</g>:null}
    {v===5&&<><path d="M21 33q2-32 39-30t39 30l-7 7q-29-19-64 0Z" fill="#ffe52c" stroke={ink} strokeWidth="2.5"/><path d="M22 33q38-20 76 0" fill="none" stroke="#ffe52c" strokeWidth="13"/><path d="M28 29l3 10m17-15 2 10m18-10-1 10m18-6-2 11" stroke="#171710" strokeWidth="9"/><ellipse cx="56" cy="10" rx="3" ry="5" transform="rotate(30 56 10)" fill={ink}/><ellipse cx="73" cy="11" rx="3" ry="5" fill={ink}/><path d="M48 89q16 15 26-8-3 20-18 16-9-2-8-8Z" fill="#ffe329" stroke={ink} strokeWidth="1.5"/><path d="M51 90q13 10 21-6" fill="none" stroke="#b38215" strokeWidth="1.5"/><path d="M38 70q8-10 8 5Z" fill="#d92546" stroke={ink} strokeWidth="1"/></>}
    <ellipse cx="34" cy="102" rx="19" ry="13" fill={pale} stroke={ink} strokeWidth="2.5"/><ellipse cx="86" cy="102" rx="19" ry="13" fill={pale} stroke={ink} strokeWidth="2.5"/>
    <circle cx="21" cy="89" r="11" fill={pale} stroke={ink} strokeWidth="2"/><circle cx="99" cy="89" r="11" fill={pale} stroke={ink} strokeWidth="2"/>
    <circle cx="60" cy="105" r="2" fill={color}/>
    {mood==='celebrate'&&<path d="m9 10 3 7 8 2-7 3-2 8-3-7-8-2 7-3Zm96 0 3 7 8 2-7 3-2 8-3-7-8-2 7-3Z" fill="#ffc329"/>}
  </svg>;
}
