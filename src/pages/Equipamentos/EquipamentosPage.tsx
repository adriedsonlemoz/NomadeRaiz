import { useState } from 'react';
import { useStore } from '../../contexts';
import { useTheme } from '../../hooks';
import { CATEGORIES } from '../../constants/equipment';
import { globalStats, catStats } from '../../services/equipment.service';
import { fmt } from '../../utils/format';
import type { EquipmentCategory } from '../../types';
import { ItemFormModal, CategoryCard } from '../../components/equipment';
import { Bar } from '../../components/common';
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
    <div className="nr14-bfbf751f">
      {showForm && <ItemFormModal onClose={() => setShowForm(false)}/>}

      <div className="nr14-30313290">
        <div className="nr14-d96e610a">🎒</div>
        <div className="nr14-69957cb4">
          <div>
            <p className="nr14-7cb2b4ec">Inventário</p>
            <h1 className="nr14-6a800b2a">
              Equipamentos</h1>
            <p className="nr14-e43f8ce8">
              {stats.comprados}/{stats.total} adquiridos</p>
          </div>
          <button onClick={() => setShowForm(true)} className="nr14-357b615d">+</button>
        </div>
        <Bar pct={pctGeral} h={3}/>
      </div>

      <div className="nr14-e8adb7e8">
        <div className="nr14-600b09f5">
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
        <div className="nr14-66beb193"/>
      </div>

      <div className="nr14-bb783af5">
        <Bar pct={pctGeral} h={3}/>
        <div className="nr14-0e1a6d01">
          <div className="nr14-97445a8d">
            <p className="nr14-bbdcb76d">Total geral</p>
            <p className="nr14-ef516120">
              {fmt(totalGeral)}</p>
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
