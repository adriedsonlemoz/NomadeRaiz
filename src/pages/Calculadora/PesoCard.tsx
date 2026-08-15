import { parseNum } from '../../utils/format';
import { montarLinhasPeso, calcPeso, type WeightInput } from '../../services/calculator.service';
import { CATEGORIES } from '../../constants/equipment';
import type { Item, EquipmentCategory } from '../../types';
import type { StateSetter, WeightFormState } from './types';

const categories: readonly EquipmentCategory[] = CATEGORIES;

interface PesoRowProps {
  item: Item;
  linha?: WeightInput;
  onChange: (patch: WeightInput) => void;
}

function PesoRow({ item, linha, onChange }: PesoRowProps) {
  const qtd = linha?.qtd ?? String(item.quantity);
  const kg = linha?.kg ?? '';
  const total = parseNum(qtd) * parseNum(kg);
  return (
    <div className="nr14-a8491fbc">
      <span className="nr14-93a93725">{item.name}</span>
      <input type="number" min="0" value={qtd} onChange={e=>onChange({ qtd:e.target.value })}
        className="nr14-bf056674"/>
      <span className="nr14-ce10f0d3">×</span>
      <input type="number" min="0" step="0.1" placeholder="0" value={kg} onChange={e=>onChange({ kg:e.target.value })}
        className="nr14-8d8568d0"/>
      <span className="nr14-b9d13395">kg</span>
      <span className="nr14-weight-total" data-active={total>0}>{total>0 ? `${total.toFixed(1)}kg` : '—'}</span>
    </div>
  );
}

interface PesoCardProps {
  pesoData: WeightFormState;
  setPesoData: StateSetter<WeightFormState>;
  items: Item[];
}

export function PesoCard({ pesoData, setPesoData, items }: PesoCardProps) {
  const linhasPorId = montarLinhasPeso(items, pesoData);
  const r = calcPeso(linhasPorId);
  const update = (id: string, patch: WeightInput) => setPesoData(p => ({
    ...p,
    [id]: { ...p[id], ...patch },
  }));

  const grupos = categories
    .map(cat => ({ cat, itens: items.filter(i => i.categoryId === cat.id) }))
    .filter(g => g.itens.length > 0);

  return (
    <div className="nr14-e12feb99">
      <div className="nr-result-panel" data-state={r.acimaDoLimite?'danger':'ok'}>
        <p className="nr-result-panel__value">{r.total.toFixed(1)} kg</p>
        <p className="nr-result-panel__label">peso total da bagagem</p>
        {r.acimaDoLimite && (
          <p className="nr14-73df1ab9">
            ⚠️ Acima do limite recomendado ({r.limite} kg)</p>
        )}
      </div>
      <p className="nr14-1073805a">
        Quantidade e peso vêm pré-preenchidos com os dados do seu inventário — ajuste como quiser.</p>
      {grupos.map(g => (
        <div key={g.cat.id}>
          <p className="nr14-d91b4052">
            <span>{g.cat.icon}</span>{g.cat.label}
          </p>
          <div className="nr14-14b4b58a">
            {g.itens.map(it => (
              <PesoRow key={it.id} item={it} linha={pesoData[it.id]}
                onChange={patch=>update(it.id, patch)}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
