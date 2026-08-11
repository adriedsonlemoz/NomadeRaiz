import { fmt } from '../utils/format';
export function exportText(items=[],formato='completo'){return items.map(i=>`${i.status==='comprado'?'✓':'○'} ${i.name} ×${i.quantity} — ${fmt((i.price||0)*(i.quantity||1))}${formato==='completo'&&i.notes?` — ${i.notes}`:''}`).join('\n')}
export function exportQRData(items=[]){return JSON.stringify({app:'nomade-raiz',version:1,items})}
export function importQRData(txt){const d=JSON.parse(txt);const items=Array.isArray(d)?d:d?.items;if(!Array.isArray(items))throw new Error('Backup inválido.');return items}
