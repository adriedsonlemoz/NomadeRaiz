import { useState, type CSSProperties } from 'react';
import { useStore } from '../../contexts';
import { useTheme } from '../../hooks';
import { QtyControl } from '../common';
import { CATEGORIES } from '../../constants';
import type { EquipmentCategory, Item, ItemStatus, Priority } from '../../types';

const categories: readonly EquipmentCategory[] = CATEGORIES;

type ItemPayload = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

interface EquipmentFormState {
  name: string;
  price: string | number;
  quantity: number;
  status: ItemStatus;
  priority: Priority;
  notes: string;
  categoryId: string;
}

export interface ItemFormModalProps {
  item?: Item;
  defaultCat?: string;
  onClose: () => void;
}

export function ItemFormModal({ item, defaultCat, onClose }: ItemFormModalProps) {
  const { addItem, updateItem } = useStore();
  const { theme: T } = useTheme();
  const isEdit = Boolean(item);
  const [form, setForm] = useState<EquipmentFormState>({
    name: item?.name ?? '',
    price: item?.price ?? '',
    quantity: item?.quantity ?? 1,
    status: item?.status ?? 'pendente',
    priority: item?.priority ?? 'medio',
    notes: item?.notes ?? '',
    categoryId: item?.categoryId ?? defaultCat ?? 'mobilidade',
  });
  const [error, setError] = useState('');

  const set = <K extends keyof EquipmentFormState>(key: K, value: EquipmentFormState[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const submit = () => {
    if (!form.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    const price = parseFloat(String(form.price).replace(',', '.')) || 0;
    const payload: ItemPayload = {
      ...form,
      price,
      quantity: Number(form.quantity) || 1,
    };

    if (item) updateItem({ ...item, ...payload });
    else addItem(payload);
    onClose();
  };

  const inp: CSSProperties = {
    width:'100%', padding:'11px 13px', border:`1.5px solid ${T.border}`,
    borderRadius:11, fontSize:14, color:T.textMain, background:T.blueLight,
    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50,
      background:'rgba(0,0,0,.5)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:480,
        background:T.white, borderRadius:'22px 22px 0 0', padding:'8px 18px 34px',
        boxShadow:'0 -8px 40px rgba(15,39,68,.2)' }}>
        <div style={{ width:36, height:4, background:T.border, borderRadius:99, margin:'10px auto 14px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 style={{ color:T.textMain, fontWeight:800, fontSize:17, margin:0 }}>
            {isEdit?'✏️ Editar':'➕ Novo item'}</h2>
          <button onClick={onClose} style={{ background:T.blueChip, border:'none', width:30, height:30,
            borderRadius:7, fontSize:17, cursor:'pointer', color:T.textSub }}>×</button>
        </div>
        {error && <div style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`, borderRadius:9,
          padding:'7px 11px', color:T.urgColor, fontSize:12, marginBottom:10 }}>{error}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          <input style={inp} placeholder="Nome do item *" value={form.name}
            onChange={e=>{ set('name',e.target.value); setError(''); }}/>
          <div style={{ display:'flex', gap:9, alignItems:'center' }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)',
                color:T.textMuted, fontSize:12, fontWeight:600 }}>R$</span>
              <input style={{ ...inp, paddingLeft:33 }} placeholder="0,00" type="number"
                min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)}/>
            </div>
            <QtyControl value={form.quantity}
              onDec={()=>set('quantity',Math.max(0,form.quantity-1))}
              onInc={()=>set('quantity',form.quantity+1)}/>
          </div>
          <div style={{ display:'flex', gap:9 }}>
            <select style={{ ...inp, flex:1, appearance:'none', cursor:'pointer' }}
              value={form.categoryId} onChange={e=>set('categoryId',e.target.value)}>
              {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <select style={{ ...inp, flex:1, appearance:'none', cursor:'pointer' }}
              value={form.priority} onChange={e=>set('priority',e.target.value as Priority)}>
              <option value="urgente">🟠 Urgente</option>
              <option value="medio">🟡 Médio</option>
              <option value="baixo">🔵 Baixo</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {(['pendente','comprado'] as const).map(status=>(
              <button key={status} onClick={()=>set('status',status)} style={{ flex:1, padding:'10px 0',
                borderRadius:11, fontWeight:700, fontSize:13, cursor:'pointer',
                background:form.status===status?(status==='comprado'?T.doneCheck:T.blue):T.blueChip,
                color:form.status===status?'#fff':T.textSub,
                border:`1.5px solid ${form.status===status?(status==='comprado'?T.doneCheck:T.blue):T.border}` }}>
                {status==='comprado'?'✓ Adquirido':'⏳ Pendente'}
              </button>
            ))}
          </div>
          <textarea style={{ ...inp, resize:'none', height:64, lineHeight:1.5 }}
            placeholder="Observações" value={form.notes} onChange={e=>set('notes',e.target.value)}/>
          <button onClick={submit} style={{ width:'100%', padding:'14px 0', borderRadius:13,
            border:'none', background:T.blue, color:'#fff', fontWeight:800, fontSize:15,
            cursor:'pointer', boxShadow:'0 4px 14px rgba(37,99,235,.35)' }}>
            {isEdit?'Salvar':'Adicionar item'}</button>
        </div>
      </div>
    </div>
  );
}
