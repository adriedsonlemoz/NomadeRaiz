import { useState, type KeyboardEvent } from 'react';
import { useStore } from '../../contexts';
import { useTheme, useHaptics } from '../../hooks';
import { CATEGORIES } from '../../constants';
import { fmt } from '../../utils/format';
import type { EquipmentCategory, Item, Priority } from '../../types';
import { QtyControl } from '../common';

const categories = CATEGORIES as readonly EquipmentCategory[];

export interface ItemDetailModalProps {
  item: Item;
  onClose: () => void;
  onEdit: () => void;
}

export function ItemDetailModal({ item, onClose, onEdit }: ItemDetailModalProps) {
  const { toggle, adjustQty, updatePrice, deleteItem } = useStore();
  const { theme: T } = useTheme();
  const { success } = useHaptics();
  const [confirmDel, setConfirmDel] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(item.price));

  const done = item.status === 'comprado';
  const isFree = item.price === 0;
  const cat = categories.find(c => c.id === item.categoryId);

  const handleToggle = () => {
    if (item.status === 'pendente') success();
    toggle(item.id);
    onClose();
  };

  const commitPrice = () => {
    const value = parseFloat(priceInput.replace(',', '.'));
    if (!Number.isNaN(value) && value >= 0) updatePrice(item.id, value);
    setEditingPrice(false);
  };

  const handlePriceKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commitPrice();
    if (event.key === 'Escape') setEditingPrice(false);
  };

  const handleDelete = () => {
    deleteItem(item.id);
    onClose();
  };

  const prioColors: Record<Priority, { bg: string; border: string; color: string }> = {
    urgente: { bg:T.urgBg, border:T.urgBorder, color:T.urgColor },
    medio: { bg:T.medBg, border:T.medBorder, color:T.medColor },
    baixo: { bg:T.lowBg, border:T.lowBorder, color:T.lowColor },
  };
  const pc = prioColors[item.priority];
  const priorityLabel: Record<Priority, string> = {
    urgente:'Urgente', medio:'Médio', baixo:'Baixo',
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:55,
      background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center',
      justifyContent:'center', padding:'20px 16px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:420,
        background:T.white, borderRadius:20, overflow:'hidden',
        boxShadow:'0 20px 60px rgba(0,0,0,.25)' }}>

        <div style={{ background:T.navy, padding:'16px 18px 14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>{cat?.icon}</span>
                <span style={{ color:'rgba(255,255,255,.5)', fontSize:10, fontWeight:700,
                  textTransform:'uppercase', letterSpacing:'0.1em' }}>{cat?.label}</span>
              </div>
              <h3 style={{ color:'#fff', fontWeight:800, fontSize:16, margin:0, lineHeight:1.3 }}>
                {item.name}</h3>
            </div>
            <button onClick={onClose} style={{ flexShrink:0, width:30, height:30,
              borderRadius:8, border:'none', background:'rgba(255,255,255,.15)',
              color:'#fff', fontSize:18, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        </div>

        <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:8 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px',
              borderRadius:99, fontSize:12, fontWeight:700, flexShrink:0,
              background:done?T.doneBg:T.blueChip,
              border:`1.5px solid ${done?T.doneBorder:T.border}`,
              color:done?T.doneCheck:T.textSub }}>
              {done?'✓ Adquirido':'⏳ Pendente'}
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px',
              borderRadius:99, fontSize:12, fontWeight:700,
              background:pc.bg, border:`1.5px solid ${pc.border}`, color:pc.color }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:pc.color }}/>
              {priorityLabel[item.priority]}
            </span>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div style={{ background:T.blueLight, borderRadius:10, padding:'10px 12px' }}>
              <p style={{ color:T.textMuted, fontSize:10, fontWeight:700, margin:'0 0 2px',
                textTransform:'uppercase', letterSpacing:'0.08em' }}>Preço unit.</p>
              {editingPrice ? (
                <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                  <div style={{ position:'relative', flex:1 }}>
                    <span style={{ position:'absolute', left:6, top:'50%',
                      transform:'translateY(-50%)', color:T.textMuted, fontSize:10 }}>R$</span>
                    <input autoFocus value={priceInput}
                      onChange={e=>setPriceInput(e.target.value)}
                      onKeyDown={handlePriceKeyDown}
                      style={{ width:'100%', padding:'4px 4px 4px 20px', borderRadius:6,
                        border:`1.5px solid ${T.blue}`, fontSize:12, outline:'none',
                        color:T.textMain, background:'#fff', fontFamily:'inherit', boxSizing:'border-box' }}/>
                  </div>
                  <button onClick={commitPrice} style={{ padding:'4px 7px', borderRadius:6,
                    border:'none', background:T.blue, color:'#fff', fontSize:10, fontWeight:700, cursor:'pointer' }}>OK</button>
                </div>
              ) : (
                <button onClick={()=>{ setPriceInput(String(item.price)); setEditingPrice(true); }}
                  style={{ display:'flex', alignItems:'center', gap:4, background:'none',
                    border:'none', padding:0, cursor:isFree?'default':'pointer' }}>
                  <span style={{ color:isFree?T.doneCheck:T.blue, fontWeight:900, fontSize:15 }}>
                    {isFree?'Grátis':fmt(item.price)}</span>
                  {!isFree && <span style={{ fontSize:11 }}>✏️</span>}
                </button>
              )}
            </div>
            <div style={{ background:T.blueLight, borderRadius:10, padding:'10px 12px' }}>
              <p style={{ color:T.textMuted, fontSize:10, fontWeight:700, margin:'0 0 2px',
                textTransform:'uppercase', letterSpacing:'0.08em' }}>Total</p>
              <p style={{ color:T.blue, fontWeight:900, fontSize:15, margin:0 }}>
                {isFree?'Grátis':fmt(item.price*item.quantity)}</p>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            background:T.blueLight, borderRadius:10, padding:'10px 12px' }}>
            <span style={{ color:T.textMuted, fontSize:11, fontWeight:600 }}>Quantidade</span>
            <QtyControl value={item.quantity}
              onDec={()=>adjustQty(item.id,-1)}
              onInc={()=>adjustQty(item.id,+1)}/>
          </div>

          {item.notes && (
            <div style={{ background:T.blueLight, borderRadius:10, padding:'10px 12px' }}>
              <p style={{ color:T.textMuted, fontSize:10, fontWeight:700, margin:'0 0 4px',
                textTransform:'uppercase', letterSpacing:'0.08em' }}>Observações</p>
              <p style={{ color:T.textMain, fontSize:13, margin:0, lineHeight:1.5,
                fontStyle:'italic' }}>"{item.notes}"</p>
            </div>
          )}

          <div style={{ display:'flex', gap:8, paddingTop:4 }}>
            <button onClick={handleToggle} style={{ flex:1, padding:'11px 0', borderRadius:11,
              border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
              background:done?T.blueChip:T.doneCheck,
              color:done?T.textSub:'#fff' }}>
              {done?'↩ Desmarcar':'✓ Marcar adquirido'}</button>
            <button onClick={onEdit} style={{ flex:1, padding:'11px 0', borderRadius:11,
              border:`1.5px solid ${T.border}`, background:T.blueLight,
              color:T.textSub, fontWeight:700, fontSize:13, cursor:'pointer' }}>
              ✏️ Editar</button>
          </div>

          {confirmDel ? (
            <div style={{ display:'flex', gap:7 }}>
              <button onClick={handleDelete} style={{ flex:1, padding:'10px 0', borderRadius:10,
                border:'none', background:T.urgColor, color:'#fff',
                fontWeight:700, fontSize:13, cursor:'pointer' }}>Confirmar exclusão</button>
              <button onClick={()=>setConfirmDel(false)} style={{ padding:'10px 14px',
                borderRadius:10, border:`1.5px solid ${T.border}`, background:T.blueLight,
                color:T.textSub, fontSize:13, cursor:'pointer' }}>Não</button>
            </div>
          ) : (
            <button onClick={()=>setConfirmDel(true)} style={{ width:'100%', padding:'10px 0',
              borderRadius:10, border:`1.5px solid ${T.urgBorder}`, background:T.urgBg,
              color:T.urgColor, fontWeight:600, fontSize:13, cursor:'pointer' }}>
              🗑️ Excluir item</button>
          )}
        </div>
      </div>
    </div>
  );
}
