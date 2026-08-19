import { EQUIPAMENTO_PARA_MANUAL } from '../../constants/manualBike';
import type { ManualBikeTarget } from '../../types';
import { fmt } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import type { PlanningAnalysis } from './usePlanningAnalysis';

interface Props {
  analysis: PlanningAnalysis;
  onOpenManual: (target: ManualBikeTarget) => void;
}

const pct = (value: number): string => `${Math.round(value * 100)}%`;

export function PlanningResults({ analysis:a, onOpenManual }: Props) {
  return <>
    <div className="nr-content-card">
      <p className="nr-kicker">🧭 Plano analisado</p>
      <div className="nr14-f0a2bbc1">
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Tipo</span><span className="nr14-27cafde6">{a.tipoViagemLabel}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Grupo</span><span className="nr14-27cafde6">{a.pessoasNum} {a.pessoasNum===1?'pessoa':'pessoas'}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Duração</span><span className="nr14-27cafde6">{a.diasNum} {a.diasNum===1?'dia':'dias'}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Destino</span><span className="nr14-27cafde6">{a.destino || 'Não informado'}</span></div>
      </div>
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">🍱 Alimentação do grupo</p>
      {a.rComida.valido ? <>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Autonomia das quantidades informadas</span><span className="nr14-27cafde6">{a.rComida.dias ?? '—'} dias</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Valor das quantidades informadas</span><span className="nr14-27cafde6">{fmt(a.custoAlimentacaoInformada)}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Estimativa para cobrir todo o grupo</span><span className="nr14-27cafde6">{fmt(a.custoAlimentacaoNecessaria)}</span></div>
        {a.custoAlimentacaoFaltante > 0
          ? <div className="nr14-257ac132"><p className="nr14-b288d6b9">Faltam aproximadamente {fmt(a.custoAlimentacaoFaltante)} em alimentação para cobrir os {a.diasNum} dias.</p></div>
          : <div className="nr14-032f16b0"><p className="nr14-f0f2ef2c">As quantidades informadas cobrem a duração calculada ✅</p></div>}
      </> : <p className="nr14-dcc832ce">Informe ao menos um alimento e a quantidade que pretende levar para calcular a necessidade do grupo.</p>}
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">💧 Água do grupo</p>
      <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Consumo de referência do grupo</span><span className="nr14-27cafde6">{a.rAgua.consumoDia} L/dia</span></div>
      <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Autonomia carregada</span><span className="nr14-27cafde6">{a.rAgua.valido ? `${a.rAgua.autonomiaCarregada} dias` : '—'}</span></div>
      {a.rAgua.reabastece && <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Pontos previstos</span><span className="nr14-27cafde6">{a.locaisAguaInformados ? 'Informados' : 'Não informados'}</span></div>}
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">⚡ Energia (automática)</p>
      {a.rEnergia.autossustentavel ? <div className="nr14-f717e501">
        <p className="nr14-c5ef84c4">♾️ Autossustentável</p>
      </div> : <div className="nr14-3006d1af">
        <p className="nr14-63f7f0a0">{a.rEnergia.dias===null?'—':a.rEnergia.dias} dias</p>
        <p className="nr14-0a845eca">de autonomia estimada para o grupo</p>
      </div>}
      <div className="nr14-14b4b58a">
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Consumo diário estimado</span><span className="nr14-27cafde6">{Math.round(a.rEnergia.consumoDiarioWh)} Wh/dia</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Geração diária estimada</span><span className="nr14-27cafde6">{Math.round(a.rEnergia.geracaoDiariaWh)} Wh/dia</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Reserva estimada</span><span className="nr14-27cafde6">{Math.round(a.rEnergia.reservaWh)} Wh</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Tempo de recarga total</span><span className="nr14-27cafde6">{a.rEnergia.horasRecarga===null?'—':`${a.rEnergia.horasRecarga}h de sol`}</span></div>
      </div>
      {!a.rEnergia.temPainel && !a.rEnergia.temBateria && <p className="nr14-dcc832ce">Nenhum painel solar ou bateria marcados como adquiridos — a análise considera apenas o consumo-base do grupo.</p>}
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">🎒 Equipamentos essenciais</p>
      <p className="nr14-2bc02a92">A análise reconhece os itens essenciais pelo tipo/nome, mesmo que você tenha apagado o item original e cadastrado outro parecido.</p>
      <div className="nr14-073471ee"><span className="nr14-1d84ead7">✅ Já adquiridos</span><span className="nr14-3316d511">{a.segurancaComprados}/{a.itensSeguranca.length}</span></div>
      {a.segurancaFaltando.length===0 ? <p className="nr14-d158b441">✅ Todos os itens essenciais de segurança já foram adquiridos.</p> : <>
        <p className="nr14-a6e97c25">⚠️ Você ainda não possui:</p>
        <div className="nr14-3b58b3a6">
          {a.segurancaFaltando.map(essential => {
            const target = EQUIPAMENTO_PARA_MANUAL[essential.key];
            const item = essential.item;
            return <div key={essential.key} className="nr14-b22323d2">
              <div className="nr14-a3d12b9b">
                <span className="nr14-3a777320">{essential.label}</span>
                <span className="nr14-7d1f70be">{item ? fmt(item.price*item.quantity) : 'Não cadastrado'}</span>
              </div>
              {target && <button onClick={()=>onOpenManual(target)} className="nr14-c4d5703e">📘 Ver como resolver no Manual da Bike</button>}
            </div>;
          })}
        </div>
      </>}
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">💵 Custos</p>
      <div className="nr14-f0a2bbc1">
        <div className="nr14-a3d12b9b"><span className="nr14-1d84ead7">Alimentação estimada para o grupo</span><span className="nr14-2525ff9b">{fmt(a.custoAlimentacaoNecessaria)}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-1d84ead7">Equipamentos pendentes</span><span className="nr14-2525ff9b">{fmt(a.custoEquipPendentes)}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-1d84ead7">Subtotal</span><span className="nr14-2525ff9b">{fmt(a.custoBase)}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-1d84ead7">Reserva recomendada ({pct(a.reservaFinanceiraPercent)})</span><span className="nr14-2525ff9b">{fmt(a.reservaFinanceira)}</span></div>
        <div className="nr14-b72bdccd"><span className="nr14-a1f8ccea">Total recomendado</span><span className="nr14-ccdd3ae4">{fmt(a.custoTotal)}</span></div>
        {a.dinheiroNum < a.custoTotal ? <div className="nr14-257ac132"><p className="nr14-b288d6b9">Falta reservar {fmt(a.custoTotal-a.dinheiroNum)}</p></div> : <div className="nr14-032f16b0"><p className="nr14-f0f2ef2c">Seu dinheiro cobre os custos previstos e a reserva recomendada ✅</p></div>}
      </div>
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">📊 Resumo Geral</p>
      <div className="nr14-52b85aca">{a.resumo.map(item => <div key={item.id} className="nr14-26cb55e2"><div className="nr14-b88d1817"><span className="nr14-1444c6ea">{item.icon}</span><span className="nr14-27cafde6">{item.label}</span></div><StatusBadge status={item.status}/></div>)}</div>
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">💡 Recomendações</p>
      <div className="nr14-be265379">{a.recomendacoes.map((rec,index) => <div key={`${rec.tipo}-${index}`} className="nr14-0a9765da"><span className="nr14-edc7496f">{rec.tipo==='ok'?'✅':rec.tipo==='atencao'?'💡':'⚠️'}</span><span className="nr14-40c8a219">{rec.texto}</span></div>)}</div>
    </div>
  </>;
}
