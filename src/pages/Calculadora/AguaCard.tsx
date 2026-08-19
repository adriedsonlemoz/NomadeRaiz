import { calcAguaInteligente, CONSUMO_AGUA_RECOMENDADO_L } from '../../services/calculator.service';
import { EmptyState } from '../../components/common';
import { CalcField, ResultBadge } from './CalcAtoms';
import type { StateSetter } from './types';

interface AguaCardProps {
  litros: string;
  setLitros: StateSetter<string>;
  reabastece: boolean;
  setReabastece: StateSetter<boolean>;
  frequenciaDias: string;
  setFrequenciaDias: StateSetter<string>;
  locais: string;
  setLocais: StateSetter<string>;
  pessoas?: string | number;
}

export function AguaCard({ litros, setLitros, reabastece, setReabastece, frequenciaDias, setFrequenciaDias,
  locais, setLocais, pessoas = 1 }: AguaCardProps) {
  const r = calcAguaInteligente(litros, reabastece, frequenciaDias, pessoas);
  return (
    <div className="nr14-42841f2c">
      <CalcField label="Água disponível (carregada)" suffix="litros" placeholder="Ex: 6"
        value={litros} onChange={setLitros}/>

      <button onClick={()=>setReabastece(!reabastece)} className="nr-toggle-row" aria-pressed={reabastece}>
        <span className="nr-toggle-row__box">
          {reabastece?'✓':''}</span>
        <span className="nr14-81b5c7cc">
          Pretendo reabastecer água durante a viagem</span>
      </button>

      {reabastece && (
        <div className="nr14-b3971bc2">
          <CalcField label="Frequência estimada de reabastecimento" suffix="dias" placeholder="Ex: 2"
            value={frequenciaDias} onChange={setFrequenciaDias}/>
          <div>
            <p className="nr14-fc5e2cb4">
              Locais de abastecimento (opcional)</p>
            <input value={locais} onChange={e=>setLocais(e.target.value)}
              placeholder="Ex: postos, mercados, praças, torneiras públicas..."
              className="nr14-95ac2bc3"/>
          </div>
        </div>
      )}

      {r.valido ? (
        <>
          {reabastece ? (
            <div className="nr-result-panel" data-state={r.suficientePorIntervalo?'ok':'warning'}>
              <p className="nr-result-panel__label">
                {r.suficientePorIntervalo ? '✅ Cobre o intervalo entre pontos de água' : '⚠️ Pode não cobrir o intervalo'}</p>
              <p className="nr14-4f39b4fe">
                {r.litros}L carregados ≈ {r.autonomiaCarregada} dias de água sem reabastecer</p>
            </div>
          ) : (
            <ResultBadge dias={r.dias} label="dias de autonomia"/>
          )}
          <div className="nr14-545bf27b">
            <span className="nr14-ad7dcd81">Consumo recomendado</span>
            <span className="nr14-81a1cd3e">{r.pessoas > 1 ? `${CONSUMO_AGUA_RECOMENDADO_L} L/pessoa · ${r.consumoDia} L/dia grupo` : `${CONSUMO_AGUA_RECOMENDADO_L} L/dia`}</span>
          </div>
          {r.baixo && (
            <div className="nr14-230af478">
              <p className="nr14-c2ae1d11">
                ⚠️ Quantidade muito baixa — abasteça assim que possível.</p>
            </div>
          )}
        </>
      ) : <EmptyState text="Informe quantos litros de água você está carregando."/>}
    </div>
  );
}
