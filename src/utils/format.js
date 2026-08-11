export const parseNum=v=>{const n=typeof v==='string'?Number(v.replace(',','.')):Number(v);return Number.isFinite(n)?n:0};
export const fmt=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(parseNum(v));
