import { fmt } from '../../utils/format';
import {
  montarLinhasAlimentacaoInteligente,
  calcAlimentacaoInteligente,
  type FoodInput,
  type FoodLine,
} from '../../services/calculator.service';
import { ALIMENTOS_CONFIG } from '../../constants/travel';
import type { FoodConfigWithUnits, FoodFormState, StateSetter } from './types';

const alimentosConfig: readonly FoodConfigWithUnits[] = ALIMENTOS_CONFIG;

interface FoodRowProps {
  alimento: FoodConfigWithUnits;
  entrada?: FoodInput;
  linha: FoodLine;
  onChange: (patch: FoodInput) => void;
}

function FoodRow({ alimento, entrada, linha, onChange }: FoodRowProps) {
  const unidadeId = entrada?.unidade ?? alimento.unidades[0].id;
  const unidadeCfg = alimento.unidades.find(u => u.id === unidadeId) ?? alimento.unidades[0];
  const qtd = entrada?.quantidade ?? '';
  const preco = entrada?.preco ?? String(unidadeCfg.precoPadrao);
  const consumo = entrada?.consumo ?? String(unidadeCfg.consumoDiarioPadrao);
  const consumoNum = Number(consumo) || 0;
  const consumoLegivel = unidadeCfg.id === 'kg' ? `${consumoNum} kg (${Math.round(consumoNum * 1000)} g)` : `${consumoNum} ${unidadeCfg.label}`;

  const trocarUnidade = (novaUnidade: string) => {
    const cfg = alimento.unidades.find(u => u.id === novaUnidade);
    if (!cfg) return;
    onChange({ unidade:novaUnidade, preco:String(cfg.precoPadrao), consumo:String(cfg.consumoDiarioPadrao) });
  };

  return (
    <div className="nr14-10e04b3e">
      <div className="nr14-a0972c52">
        <div className="nr14-f2d95454">
          <span className="nr14-ab31c751">{alimento.icone}</span>
          <span className="nr14-3c310ef4">{alimento.nome}</span>
          {alimento.unidades.length > 1 && (
            <select value={unidadeId} onChange={e=>trocarUnidade(e.target.value)}
              className="nr14-edee9217">
              {alimento.unidades.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          )}
        </div>
        <span className="nr14-3faa39f4">{fmt(linha.valor)}</span>
      </div>
      <div className="nr14-3ef6527d">
        <div>
          <p className="nr14-786efa70">Qtd. ({unidadeCfg.label})</p>
          <input type="number" min="0" step="0.01" placeholder="0" value={qtd}
            onChange={e=>onChange({ quantidade:e.target.value })}
            className="nr14-cc2ab854"/>
        </div>
        <div>
          <p className="nr14-786efa70">Preço/{unidadeCfg.id}</p>
          <div className="nr14-d461c96d">
            <span className="nr14-e9c83d60">R$</span>
            <input type="number" min="0" step="0.01" value={preco}
              onChange={e=>onChange({ preco:e.target.value })}
              className="nr14-e7584155"/>
          </div>
        </div>
        <div>
          <p className="nr14-786efa70">Consumo por pessoa/dia</p>
          <input type="number" min="0" step="0.01" value={consumo}
            onChange={e=>onChange({ consumo:e.target.value })}
            className="nr14-cc2ab854"/>
          <small className="nr-food-consumption-help">≈ {consumoLegivel} por dia</small>
        </div>
      </div>
      {linha.dias !== null && (
        <p className="nr14-b76606a2">
          Dura aproximadamente <b className="nr14-88978781">{linha.dias} dias</b> nesse ritmo de consumo.</p>
      )}
    </div>
  );
}

interface ComidaCardProps {
  alimentos: FoodFormState;
  setAlimentos: StateSetter<FoodFormState>;
  pessoas?: string | number;
}

export function ComidaCard({ alimentos, setAlimentos, pessoas = 1 }: ComidaCardProps) {
  const linhas = montarLinhasAlimentacaoInteligente(alimentosConfig, alimentos, pessoas);
  const r = calcAlimentacaoInteligente(linhas);
  const linhasPorId = new Map(linhas.map(linha => [linha.id, linha]));
  const update = (id: string, patch: FoodInput) => setAlimentos(al => ({
    ...al,
    [id]: { ...al[id], ...patch },
  }));

  return (
    <div className="nr14-be265379">
      {alimentosConfig.map(a => {
        const linha = linhasPorId.get(a.id);
        if (!linha) return null;
        return (
          <FoodRow key={a.id} alimento={a} entrada={alimentos[a.id]} linha={linha}
            onChange={patch=>update(a.id, patch)}/>
        );
      })}
      <div className="nr-explain-box">
        <p><strong>Como ler os números:</strong> valores em kg são convertidos para gramas para facilitar. Ex.: <b>0,2 kg = 200 g por pessoa por dia</b>.</p>
        <p>A autonomia mostra por quantos dias o alimento informado dura no ritmo de consumo definido. Você pode alterar esse consumo conforme sua realidade.</p>
      </div>
      <div className="nr14-875daa5f">
        <div className="nr14-dd15bb92">
          <span className="nr14-4f579149">Valor total da alimentação</span>
          <span className="nr14-cdaea852">{fmt(r.valorTotal)}</span>
        </div>
        <div className="nr14-a3d12b9b">
          <span className="nr14-4f579149">Itens com quantidade informada</span>
          <span className="nr14-cdaea852">{linhas.filter(l=>l.quantidade>0).length}</span>
        </div>
        {r.valido && r.dias !== null && (
          <div className="nr14-91fbe470">
            <p className="nr14-44ac9f51">{r.dias} dias</p>
            <p className="nr14-4b5f37c9">
              de autonomia alimentar estimada{Number(pessoas) > 1 ? ` para ${Math.max(1, Math.floor(Number(pessoas) || 1))} pessoas` : ''}{r.gargalo ? ` — limitado por ${r.gargalo.nome.toLowerCase()}` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
