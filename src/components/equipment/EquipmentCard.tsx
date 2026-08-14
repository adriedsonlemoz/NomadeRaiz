import { useState, type MouseEvent } from 'react';
import { useStore } from '../../contexts';
import { useTheme, useHaptics } from '../../hooks';
import { fmt } from '../../utils/format';
import type { Item } from '../../types';
import { Badge } from '../common';
import { ItemDetailModal } from './ItemDetailModal';
import { ItemFormModal } from './ItemFormModal';

export interface EquipmentCardProps {
  item: Item;
}

export function EquipmentCard({ item }: EquipmentCardProps) {
  const { toggle } = useStore();
  const { theme: T } = useTheme();
  const { success } = useHaptics();
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState(false);
  const [flash, setFlash] = useState(false);

  const done = item.status === 'comprado';
  const isFree = item.price === 0;

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const tornando = item.status === 'pendente';
    toggle(item.id);
    if (tornando) {
      success();
      setFlash(true);
      window.setTimeout(() => setFlash(false), 500);
    }
  };

  return (
    <>
      {showDetail && (
        <ItemDetailModal
          item={item}
          onClose={() => setShowDetail(false)}
          onEdit={() => { setShowDetail(false); setEditing(true); }}
        />
      )}
      {editing && <ItemFormModal item={item} onClose={() => setEditing(false)}/>}

      <div
        onClick={() => setShowDetail(true)}
        style={{
          background: flash ? '#dcfce7' : done ? T.doneBg : T.white,
          border: `1.5px solid ${flash?'#4ade80':done?T.doneBorder:T.border}`,
          borderRadius:11,
          boxShadow:'0 1px 3px rgba(15,39,68,.06)',
          transition:'background .3s, border-color .3s',
          cursor:'pointer',
          display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
        }}>

        <button
          onClick={handleToggle}
          style={{ width:24, height:24, borderRadius:'50%', flexShrink:0,
            border:'none', cursor:'pointer',
            background:done?T.doneCheck:'transparent',
            outline:`2px solid ${done?T.doneCheck:T.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .2s, transform .1s',
            transform:flash?'scale(1.25)':'scale(1)' }}>
          {done && <span style={{ color:'#fff', fontSize:11, fontWeight:900 }}>✓</span>}
        </button>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:done?T.textMuted:T.textMain, fontWeight:600, fontSize:13,
            margin:0, textDecoration:done?'line-through':'none',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {item.name}</p>
          {item.notes && (
            <p style={{ color:T.textMuted, fontSize:10, margin:'1px 0 0',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              fontStyle:'italic', lineHeight:1.3 }}>{item.notes}</p>
          )}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <Badge type={item.priority}/>
          <div style={{ textAlign:'right', minWidth:52 }}>
            <p style={{ color:isFree?T.doneCheck:T.blue, fontWeight:800,
              fontSize:13, margin:0, lineHeight:1 }}>
              {isFree?'Grátis':fmt(item.price*item.quantity)}</p>
            {item.quantity > 1 && !isFree && (
              <p style={{ color:T.textMuted, fontSize:9, margin:0, lineHeight:1.3 }}>
                {item.quantity}× {fmt(item.price)}</p>
            )}
          </div>
          <span style={{ color:T.textMuted, fontSize:11 }}>›</span>
        </div>
      </div>
    </>
  );
}
