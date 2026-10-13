import fs from 'node:fs/promises';
await fs.mkdir('public/assets/pieces',{recursive:true});
const paths={
  p:'<circle cx="50" cy="27" r="12"/><path d="M43 41h14c-1 18 3 29 13 38H30c10-9 14-20 13-38Z"/>',
  n:'<path d="M27 79c4-16 18-28 28-35l-18 5-10-11 12-17 5-10 10 9c14-1 28 13 26 30l-3 29Z"/><path d="m37 33 10-4M62 24l1 7" fill="none"/>',
  b:'<path d="M50 10c-12 12-21 21-21 31 0 8 10 13 15 13l-8 25h28l-8-25c9-1 16-6 16-14 0-10-11-21-22-30Z"/><path d="m50 22-8 14" fill="none"/>',
  r:'<path d="M27 17h10v12h8V17h10v12h8V17h10v25H27Z"/><path d="m34 43 4 25-9 11h42l-9-11 4-25Z"/>',
  q:'<path d="m23 30 12 11 15-17 15 17 12-11-12 35H35Z"/><path d="m36 65-5 14h38l-5-14Z"/><circle cx="22" cy="25" r="6"/><circle cx="50" cy="18" r="6"/><circle cx="78" cy="25" r="6"/>',
  k:'<path d="M50 10v18M42 18h16" fill="none" stroke-width="6"/><path d="M32 31c-10-7-16 11-7 19l15 14-8 15h36l-8-15 15-14c9-8 3-26-7-19l-18 8Z"/>',
};
const neo={p:'<circle cx="50" cy="25" r="12"/><path d="m43 42-11 34h36L57 42Z"/>',n:'<path d="m30 76 5-21 25-14-27 3-8-11 21-20 7 10 20 2 6 51Z"/><circle cx="57" cy="31" r="2.5" fill="none"/>',b:'<path d="m50 10-21 31 13 12-12 23h40L58 53l13-12Z"/><path d="m50 26-10 15" fill="none"/>',r:'<path d="M28 14h11v13h8V14h9v13h8V14h9v26H28Zm8 29h28l5 33H31Z"/>',q:'<path d="m24 25 13 17 13-25 13 25 13-17-11 42H35Zm13 46h26l8 7H29Z"/>',k:'<path d="M50 9v19M40 18h20" fill="none" stroke-width="6"/><path d="m31 33 19 10 19-10 8 15-18 14 10 14H31l10-14-18-14Z"/>'};
let css='/* Original Pion vector pieces, GPL-3.0-or-later. */\n';
for(const set of ['classic','outline','neo','wood'])for(const color of ['w','b'])for(const [piece,shapes]of Object.entries(set==='neo'?neo:paths)){
  const fill=set==='wood'?'url(#wood)':color==='w'?'#fffdf5':'#17252e';const stroke=set==='wood'?'#4e3019':color==='w'?'#21323e':'#f5f1e5';
  const gradient=set==='wood'?`<defs><linearGradient id="wood" x2="1" y2=".3"><stop stop-color="${color==='w'?'#fff1d0':'#74431e'}"/><stop offset=".5" stop-color="${color==='w'?'#d8af75':'#281b13'}"/><stop offset="1" stop-color="${color==='w'?'#ffe8b1':'#83502b'}"/></linearGradient></defs>`:'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${gradient}<g fill="${fill}" stroke="${stroke}" stroke-width="${set==='outline'?4.8:set==='neo'?3:2.4}" stroke-linejoin="${set==='neo'?'miter':'round'}" stroke-linecap="round">${shapes}<rect x="24" y="79" width="52" height="9" rx="${set==='neo'?0:4}"/></g></svg>`;
  await fs.writeFile(`public/assets/pieces/${set}-${color}${piece}.svg`,svg);
  if(set==='classic')await fs.writeFile(`public/assets/pieces/${color}${piece}.svg`,svg);
  const names={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
  css+=`${set==='classic'?'':`[data-pieces="${set}"] `}.chessboard piece.${color==='w'?'white':'black'}.${names[piece]}{background-image:url("data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}")}\n`;
}
css+='[data-pieces="outline"] .chessboard piece{filter:drop-shadow(0 1px 1px #172e2840)}\n';
await fs.writeFile('src/pieces.css',css);
