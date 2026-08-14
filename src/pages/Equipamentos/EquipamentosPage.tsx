import { useState } from 'react';
import { useStore } from '../../contexts';
import { useTheme } from '../../hooks';
import { CATEGORIES } from '../../constants';
import { globalStats, catStats } from '../../services/equipment.service';
import { fmt } from '../../utils/format';
import type { EquipmentCategory } from '../../types';
import { ItemFormModal, CategoryCard } from '../../components/equipment';
import { CategoryItemsView } from './CategoryItemsView';

const categories: readonly EquipmentCategory[] = CATEGORIES;

export default function EquipamentosPage() {
  const { state } = useStore();
  const { theme: T } = useTheme();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const stats = globalStats(state.items);
  const totalGeral = stats.valorTotal;
  const totalAdquirido = stats.valorComprado;
  const totalPendente = totalGeral - totalAdquirido;
  const pctGeral = stats.total > 0 ? Math.round((stats.comprados / stats.total) * 100) : 0;

  if (activeCat) {
    return (
      <>
        {showForm && (
          <ItemFormModal
            defaultCat={activeCat}
            onClose={() => setShowForm(false)}
          />
        )}
        <CategoryItemsView
          catId={activeCat}
          onBack={() => setActiveCat(null)}
          onAdd={() => setShowForm(true)}
        />
      </>
    );
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:T.pageBg }}>
      {showForm && <ItemFormModal onClose={() => setShowForm(false)}/>}

      <div style={{ background:T.navy, padding:'18px 16px 22px', flexShrink:0, position:'relative' }}>
        <div style={{ position:'absolute', top:-10, right:-10, fontSize:60,
          opacity:.05, pointerEvents:'none' }}>🎒</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ color:'#7ea3d4', fontSize:10, fontWeight:800, letterSpacing:'0.2em',
              textTransform:'uppercase', margin:'0 0 3px' }}>Inventário</p>
            <h1 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:0, lineHeight:1.2 }}>
              Equipamentos</h1>
            <p style={{ color:'#7ea3d4', fontSize:13, margin:'3px 0 0', fontWeight:300 }}>
              {stats.comprados}/{stats.total} adquiridos</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ width:46, height:46, borderRadius:13,
            border:'none', background:T.blue, color:'#fff', fontSize:24, fontWeight:700,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(37,99,235,.5)', flexShrink:0 }}>+</button>
        </div>
        <div style={{ marginTop:12, height:4, background:'rgba(255,255,255,.15)',
          borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pctGeral}%`, borderRadius:99,
            background:'linear-gradient(90deg,#3b82f6,#60a5fa)', transition:'width .5s' }}/>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))',
          gap:8, paddingBottom:16 }}>
          {categories.map(cat => {
            const cs = catStats(state.items, cat.id);
            const hasUrgent = state.items.some(
              item => item.categoryId === cat.id && item.priority === 'urgente' && item.status === 'pendente',
            );
            return (
              <CategoryCard key={cat.id} cat={cat} cs={cs} hasUrgent={hasUrgent} T={T}
                onClick={() => setActiveCat(cat.id)}/>
            );
          })}
        </div>
        <div style={{ height:80 }}/>
      </div>

      <div style={{ flexShrink:0, background:T.navy, borderTop:`2px solid ${T.border}`,
        padding:'10px 14px 12px' }}>
        <div style={{ height:3, background:'rgba(255,255,255,.15)', borderRadius:99,
          overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${pctGeral}%`, borderRadius:99,
            background:'linear-gradient(90deg,#3b82f6,#60a5fa)', transition:'width .4s' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ flex:1 }}>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:9, fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1px' }}>Total geral</p>
            <p style={{ color:'#fff', fontWeight:900, fontSize:17, margin:0, lineHeight:1 }}>
              {fmt(totalGeral)}</p>
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
