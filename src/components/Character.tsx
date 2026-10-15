export const MONKEY_NAMES=['Ponke','Lonke','Gonke','Konke','Bonke','Zonke','Donke'] as const;
/** Original vector characters with clean silhouettes and seven familiar personalities. */
export function Character({seed=0,color='#e4a52c',mood='idle',size=88}:{seed?:number;color?:string;mood?:'idle'|'thinking'|'happy'|'surprised'|'sad'|'celebrate'|'speaking';size?:number}){
  const v=((seed%7)+7)%7,ink='#39271f';
  const fur=['#855338','#633e2c','#c98245','#e88b3c','#c6602e','#855338','#ab886b'][v];
  const face=v===3?'#ead5b5':v===6?'#f3e7d2':'#f9ddba';
  const happy=mood==='happy'||mood==='celebrate';
  return <svg className={`character monkey mood-${mood}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" data-character={MONKEY_NAMES[v]}>
    <ellipse cx="60" cy="112" rx="40" ry="4" fill="#000" opacity=".1"/>
    <g stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 99V83c0-19 13-29 32-29s32 10 32 29v16Z" fill={fur}/>
      <path d="M30 73C16 74 12 86 16 98l14-2m60-23c14 1 18 13 14 25l-14-2" fill={fur}/>
      {v===2?<>
        <path d="M38 73h44v31H38Z" fill="#286fba"/>
        <path d="M39 68v14m42-14v14" stroke="#286fba" strokeWidth="8"/>
        <path d="M49 87h22v11H49Z" fill="#1f5999" stroke="none"/>
        <circle cx="40" cy="79" r="3" fill="#f5cc58" stroke="none"/><circle cx="80" cy="79" r="3" fill="#f5cc58" stroke="none"/>
      </>:<ellipse cx="60" cy="86" rx="20" ry="21" fill={face} stroke="none"/>}
      <circle cx="22" cy="48" r={v===6?10:12} fill={fur}/><circle cx="98" cy="48" r={v===6?10:12} fill={fur}/>
      <circle cx="22" cy="48" r="7" fill={face} stroke="none"/><circle cx="98" cy="48" r="7" fill={face} stroke="none"/>
      <path d={v===4?'M25 43C25 28 30 20 40 17l7-9 9 7 9-9 8 11c15 4 22 14 22 29v16c0 20-16 30-35 30S25 81 25 62Z':v===6?'M25 48c0-19 10-31 25-32l6-7 7 6 9-5 4 8c13 5 19 15 19 30v13c0 20-16 30-35 30S25 81 25 61Z':'M25 45c0-23 16-33 35-33s35 10 35 33v16c0 20-16 30-35 30S25 81 25 61Z'} fill={fur}/>
      <path d={v===6?'M34 47c0-20 52-20 52 0v17c0 18-52 18-52 0Z':'M34 44c0-13 17-17 26-7 9-10 26-6 26 7v12c10 16-4 26-26 26S24 72 34 56Z'} fill={face} stroke="none"/>
      {v===0?<>
        <ellipse cx="46" cy="31" rx="13" ry="18" fill="#fffdf8"/><ellipse cx="74" cy="31" rx="13" ry="18" fill="#fffdf8"/>
        <circle cx="45" cy={mood==='thinking'?24:28} r="5" fill={ink} stroke="none"/><circle cx="73" cy={mood==='thinking'?24:28} r="5" fill={ink} stroke="none"/>
      </>:v===1||v===4?<>
        {[44,76].map(x=><g key={x}><circle cx={x} cy="46" r="12" fill={v===1?'#d9a532':'#fff6e7'}/><circle cx={x} cy="46" r="8" fill={ink} stroke="none"/><circle cx={x-3} cy="43" r="2.7" fill="#fff" stroke="none"/></g>)}
      </>:v===2?<>
        <path d="M39 47q6-6 12 0" fill="none" strokeWidth="3"/><ellipse cx="76" cy="45" rx="6" ry="8" fill={ink} stroke="none"/><circle cx="74" cy="42" r="2" fill="#fff" stroke="none"/>
      </>:happy?<path d="M39 47q6-7 12 0m18 0q6-7 12 0" fill="none" strokeWidth="3"/>:<>
        {[45,75].map(x=><g key={x}><ellipse cx={x} cy="46" rx="4.5" ry={mood==='surprised'?7:5.5} fill={ink} stroke="none"/><circle cx={x-1} cy="44" r="1.5" fill="#fff" stroke="none"/></g>)}
      </>}
      {v===6?<ellipse cx="60" cy="62" rx="9" ry="7" fill="#684c3d"/>:<>
        <ellipse cx="60" cy="62" rx={v===0?26:19} ry="13" fill={face} stroke="none"/>
        {v!==0&&<path d="M54 58h1m10 0h1" fill="none" strokeWidth="3"/>}
      </>}
      <path className="mouth" d={mood==='sad'?'M46 74q14-10 28 0':mood==='surprised'?'M55 72a5 6 0 1 0 10 0a5 6 0 1 0-10 0':v===0?'M39 73 81 68':v===6?'M54 73q6 5 12 0':'M44 69q16 15 32 0'} fill={mood==='surprised'?ink:'none'} strokeWidth="2.4"/>
      {v===2&&<path d="M31 29q7-17 25-17c12 0 21 4 29 13l-17-6-8 9-8-7-12 12 1-10Z" fill={fur} stroke="none"/>}
      {v===3&&<path d="m42 19 8-8 8 6 9-8 9 11" fill={fur} stroke="none"/>}
      {v===5&&<>
        <path d="M26 28C28 10 41 5 60 5s32 5 34 23Z" fill="#f5cf44"/>
        <path d="M25 27q35-13 70 0v10q-35-14-70 0Z" fill="#f5cf44"/>
        <path d="m37 25 1 7m14-10v7m15-7v7m15-4-1 7" stroke={ink} strokeWidth="6"/>
        <path d="m54 13 1-2m12 2-1-2" fill="none" strokeWidth="4"/>
        <path d="M52 87q12 9 20-3-2 14-14 11-5-1-6-8Z" fill="#f5cf44" strokeWidth="1.5"/>
      </>}
      <ellipse cx="36" cy="103" rx="18" ry="11" fill={face}/><ellipse cx="84" cy="103" rx="18" ry="11" fill={face}/>
      <ellipse cx="22" cy="87" rx="9" ry="10" fill={face}/><ellipse cx="98" cy="87" rx="9" ry="10" fill={face}/>
    </g>
    <circle cx="60" cy="108" r="2.5" fill={color}/>
    {mood==='celebrate'&&<path d="m10 12 2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm100 0 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#f5bf45"/>}
  </svg>;
}
