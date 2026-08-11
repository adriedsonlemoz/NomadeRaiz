import { parseNum } from '../utils/format';
export const calcTotal=items=>(items||[]).reduce((s,i)=>s+parseNum(i.price)*Math.max(0,parseNum(i.quantity)||1),0);
export const globalStats=items=>{const a=items||[];const comprados=a.filter(i=>i.status==='comprado').length;return{total:a.length,comprados,pendentes:a.length-comprados,valorTotal:calcTotal(a),valorComprado:calcTotal(a.filter(i=>i.status==='comprado'))}};
export const catStats=(items,catId)=>{const a=(items||[]).filter(i=>i.categoryId===catId);const comprados=a.filter(i=>i.status==='comprado').length;return{total:a.length,comprados,pendentes:a.length-comprados,valor:calcTotal(a)}};
export const filterItems=(items,filter,catId)=>(items||[]).filter(i=>(!catId||i.categoryId===catId)&&(filter==='pendentes'?i.status==='pendente':filter==='comprados'?i.status==='comprado':true));
const rank={urgente:0,medio:1,baixo:2};
export const sortItems=(items,sort)=>[...(items||[])].sort((a,b)=>sort==='preco-asc'?parseNum(a.price)-parseNum(b.price):sort==='preco-desc'?parseNum(b.price)-parseNum(a.price):(rank[a.priority]??9)-(rank[b.priority]??9)||String(a.name).localeCompare(String(b.name),'pt-BR'));
