import { useStore } from '../../contexts';
import { CATEGORIES } from '../../constants/equipment';
import { catStats, filterItems, sortItems } from '../../services/equipment.service';
import { fmt } from '../../utils/format';
import type { EquipmentCategory, ItemFilter, ItemSort } from '../../types';
import { Bar } from '../../components/common';
import { EquipmentCard } from '../../components/equipment';

const categories: readonly EquipmentCategory[] = CATEGORIES;

export interface CategoryItemsViewProps {
  catId: string;
  onBack: () => void;
  onAdd: () => void;
}

export function CategoryItemsView({ catId, onBack, onAdd }: CategoryItemsViewProps) {
  const { state, setFilter, setSort } = useStore();

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
  const totalCat = cs.valor;
  const totalAdquirido = cs.valorComprado;
  const totalPendente = cs.valorPendente;
  const pctVis = cs.total > 0 ? Math.round((cs.comprados / cs.total) * 100) : 0;

  return (
    <div className="nr14-bfbf751f">
      <div className="nr14-63e44bde">
        <div className="nr14-8fa3e44d">
          <button onClick={onBack} className="nr14-5091c510">
            <span className="nr14-5e0faad2">←</span>
            <span>Equipamentos</span>
          </button>
          <span className="nr14-dc58eb08">/</span>
          <span className="nr14-f8a9ffc0">{cat?.icon} {cat?.label}</span>
        </div>

        <div className="nr14-90638c89">
          <div className="nr14-22ee3aed">
            <span className="nr14-9f931ec8">{cat?.label}</span>
            <p className="nr14-ace50bde">
              {cs.comprados}/{cs.total} adquiridos · {fmt(totalCat)}</p>
          </div>
          <button onClick={onAdd} className="nr14-d9ebbfcb">+</button>
        </div>
        <Bar pct={pct} h={3}/>
      </div>

      <div className="nr14-5291714b">
        {FILTERS.map(f => (
          <button key={f.v} className="nr-filter-chip" aria-pressed={state.filter === f.v} onClick={() => setFilter(f.v)}>{f.l}</button>
        ))}
        <div className="nr14-26f125cf"/>
        {SORTS.map(s => (
          <button key={s.v} className="nr-filter-chip" aria-pressed={state.sort === s.v} onClick={() => setSort(s.v)}>{s.l}</button>
        ))}
      </div>

      <div className="nr14-d6497028">
        {displayed.length === 0 ? (
          <div className="nr14-5ce911ac">
            <span className="nr14-5c383099">{cat?.icon}</span>
            <p className="nr14-c70c9d2e">Nenhum item</p>
            <p className="nr14-83a63cf7">
              {state.filter === 'todos' ? 'Toque + para adicionar' : 'Mude o filtro'}</p>
          </div>
        ) : (
          displayed.map(item => <EquipmentCard key={item.id} item={item}/>)
        )}
        <div className="nr14-66beb193"/>
      </div>

      <div className="nr14-bb783af5">
        <Bar pct={pctVis} h={3}/>
        <div className="nr14-0e1a6d01">
          <div className="nr14-97445a8d">
            <p className="nr14-bbdcb76d">Total categoria</p>
            <p className="nr14-ef516120">
              {fmt(totalCat)}</p>
          </div>
          <div className="nr14-7e92f567"/>
          <div className="nr14-3cce2efa">
            <p className="nr14-bbdcb76d">Adquirido</p>
            <p className="nr14-cb40f21d">
              {fmt(totalAdquirido)}</p>
          </div>
          <div className="nr14-7e92f567"/>
          <div className="nr14-82f0b215">
            <p className="nr14-bbdcb76d">Falta</p>
            <p className="nr14-b1d826a8">
              {fmt(totalPendente)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
