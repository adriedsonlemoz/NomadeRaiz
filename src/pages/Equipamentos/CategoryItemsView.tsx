import type { CSSProperties } from 'react';
import { useStore } from '../../contexts';
import { useTheme } from '../../hooks';
import { CATEGORIES } from '../../constants';
import { catStats, filterItems, sortItems } from '../../services/equipment.service';
import { fmt } from '../../utils/format';
import type { EquipmentCategory, ItemFilter, ItemSort } from '../../types';
import { Bar } from '../../components/common';
import { EquipmentCard } from '../../components/equipment';

const categories = CATEGORIES as readonly EquipmentCategory[];

export interface CategoryItemsViewProps {
  catId: string;
  onBack: () => void;
  onAdd: () => void;
}

export function CategoryItemsView({ catId, onBack, onAdd }: CategoryItemsViewProps) {
  const { state, setFilter, setSort } = useStore();
  const { theme: T } = useTheme();

  const cat = categories.find(c => c.id === catId);
  const cs = catStats(state.items, catId);
  const pct = cs.total > 0 ? Math.round((cs.comprados / cs.total) * 100) : 0;
  const displayed = sortItems(filterItems(state.items, state.filter, catId), state.sort);

  const FILTERS: readonly { v: ItemFilter; l: string }[] = [
    { v:'todos', l:'Todos' },
    { v:'pendentes', l:'Pendentes' },
    { v:'comprados', l:'Adquiridos' },
  ];
  const SORTS: readonly { v: ItemSort; l: string }[] = [
    { v:'prioridade', l:'Prior.' },
    { v:'preco-asc', l:'↑ R$' },
    { v:'preco-desc', l:'↓ R$' },
  ];
  const chip = (active: boolean): CSSProperties => ({
    flexShrink:0, padding:'5px 10px', borderRadius:99, fontSize:11,
    fontWeight:700, border:'none', cursor:'pointer', transition:'all .15s',
    background:active?T.blue:T.blueChip, color:active?'#fff':T.textSub,
  });

  const totalCat = cs.valor;
  const totalAdquirido = cs.valorComprado;
  const totalPendente = cs.valorPendente;
  const pctVis = cs.total > 0 ? Math.round((cs.comprados / cs.total) * 100) : 0;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:T.pageBg }}>
      <div style={{ background:T.navy, padding:'13px 13px 17px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:5,
            padding:'3px 8px 3px 4px', borderRadius:8, border:'none', background:T.navyLight,
            color:'rgba(255,255,255,.6)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
            <span style={{ fontSize:13 }}>←</span>
            <span>Equipamentos</span>
          </button>
          <span style={{ color:'rgba(255,255,255,.25)', fontSize:11 }}>/</span>
          <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>{cat?.icon} {cat?.label}</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:17 }}>{cat?.label}</span>
            <p style={{ color:'#7ea3d4', fontSize:10, margin:'2px 0 0' }}>
              {cs.comprados}/{cs.total} adquiridos · {fmt(totalCat)}</p>
          </div>
          <button onClick={onAdd} style={{ width:34, height:34, borderRadius:9, border:'none',
            flexShrink:0, background:T.blue, color:'#fff', fontSize:20, fontWeight:700,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px rgba(37,99,235,.4)' }}>+</button>
        </div>
        <Bar pct={pct} h={3}/>
      </div>

      <div style={{ background:T.white, padding:'7px 11px', borderBottom:`1px solid ${T.border}`,
        display:'flex', gap:5, overflowX:'auto', flexShrink:0 }}>
        {FILTERS.map(f => (
          <button key={f.v} style={chip(state.filter === f.v)} onClick={() => setFilter(f.v)}>{f.l}</button>
        ))}
        <div style={{ width:1, background:T.border, margin:'0 3px', alignSelf:'stretch' }}/>
        {SORTS.map(s => (
          <button key={s.v} style={chip(state.sort === s.v)} onClick={() => setSort(s.v)}>{s.l}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'10px 11px',
        display:'flex', flexDirection:'column', gap:6 }}>
        {displayed.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', padding:'60px 20px', textAlign:'center' }}>
            <span style={{ fontSize:48, marginBottom:12 }}>{cat?.icon}</span>
            <p style={{ color:T.textSub, fontWeight:600, margin:0 }}>Nenhum item</p>
            <p style={{ color:T.textMuted, fontSize:12, margin:'4px 0 0' }}>
              {state.filter === 'todos' ? 'Toque + para adicionar' : 'Mude o filtro'}</p>
          </div>
        ) : (
          displayed.map(item => <EquipmentCard key={item.id} item={item}/>)
        )}
        <div style={{ height:80 }}/>
      </div>

      <div style={{ flexShrink:0, background:T.navy, borderTop:`2px solid ${T.border}`,
        padding:'10px 14px 12px' }}>
        <div style={{ height:3, background:'rgba(255,255,255,.15)', borderRadius:99,
          overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${pctVis}%`, borderRadius:99,
            background:`linear-gradient(90deg,${T.blue},#60a5fa)`, transition:'width .4s' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ flex:1 }}>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:9, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1px' }}>Total categoria</p>
            <p style={{ color:'#fff', fontWeight:900, fontSize:17, margin:0, lineHeight:1 }}>
              {fmt(totalCat)}</p>
          </div>
          <div style={{ width:1, background:'rgba(255,255,255,.12)', margin:'0 14px', alignSelf:'stretch' }}/>
          <div style={{ flex:1, textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:9, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1px' }}>Adquirido</p>
            <p style={{ color:'#4ade80', fontWeight:800, fontSize:15, margin:0, lineHeight:1 }}>
              {fmt(totalAdquirido)}</p>
          </div>
          <div style={{ width:1, background:'rgba(255,255,255,.12)', margin:'0 14px', alignSelf:'stretch' }}/>
          <div style={{ flex:1, textAlign:'right' }}>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:9, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1px' }}>Falta</p>
            <p style={{ color:'#fbbf24', fontWeight:800, fontSize:15, margin:0, lineHeight:1 }}>
              {fmt(totalPendente)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
