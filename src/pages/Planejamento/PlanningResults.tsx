import { EQUIPAMENTO_PARA_MANUAL } from '../../constants/manualBike';
import type { ManualBikeTarget } from '../../types';
import { fmt } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import type { PlanningAnalysis } from './usePlanningAnalysis';

interface Props {
  analysis: PlanningAnalysis;
  onOpenManual: (target: ManualBikeTarget) => void;
}

export function PlanningResults({ analysis:a, onOpenManual }: Props) {
  return <>
    <div className="nr-content-card">
      <p className="nr-kicker">⚡ Energia (automática)</p>
      {a.rEnergia.autossustentavel ? <div className="nr14-f717e501">
        <p className="nr14-c5ef84c4">♾️ Autossustentável</p>
      </div> : <div className="nr14-3006d1af">
        <p className="nr14-63f7f0a0">{a.rEnergia.dias===null?'—':a.rEnergia.dias} dias</p>
        <p className="nr14-0a845eca">de autonomia estimada</p>
      </div>}
      <div className="nr14-14b4b58a">
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Geração diária estimada</span><span className="nr14-27cafde6">{Math.round(a.rEnergia.geracaoDiariaWh)} Wh/dia</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-ad7dcd81">Tempo de recarga total</span><span className="nr14-27cafde6">{a.rEnergia.horasRecarga===null?'—':`${a.rEnergia.horasRecarga}h de sol`}</span></div>
      </div>
      {!a.rEnergia.temPainel && !a.rEnergia.temBateria && <p className="nr14-dcc832ce">Nenhum painel solar ou bateria marcados como "adquiridos" — considerando só o celular.</p>}
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">🎒 Equipamentos essenciais</p>
      <p className="nr14-2bc02a92">Só os itens de segurança da bicicleta — o restante do checklist fica na tela de Equipamentos.</p>
      <div className="nr14-073471ee"><span className="nr14-1d84ead7">✅ Já adquiridos</span><span className="nr14-3316d511">{a.segurancaComprados}/{a.itensSeguranca.length}</span></div>
      {a.segurancaFaltando.length===0 ? <p className="nr14-d158b441">✅ Todos os itens essenciais de segurança já foram adquiridos.</p> : <>
        <p className="nr14-a6e97c25">⚠️ Você ainda não possui:</p>
        <div className="nr14-3b58b3a6">
          {a.segurancaFaltando.map(item => {
            const target = EQUIPAMENTO_PARA_MANUAL[item.id];
            return <div key={item.id} className="nr14-b22323d2">
              <div className="nr14-a3d12b9b"><span className="nr14-3a777320">{item.name}</span><span className="nr14-7d1f70be">{fmt(item.price*item.quantity)}</span></div>
              {target && <button onClick={()=>onOpenManual(target)} className="nr14-c4d5703e">📘 Ver como resolver no Manual da Bike</button>}
            </div>;
          })}
        </div>
      </>}
    </div>

    <div className="nr-content-card">
      <p className="nr-kicker">💵 Custos</p>
      <div className="nr14-f0a2bbc1">
        <div className="nr14-a3d12b9b"><span className="nr14-1d84ead7">Alimentação</span><span className="nr14-2525ff9b">{fmt(a.rComida.valorTotal)}</span></div>
        <div className="nr14-a3d12b9b"><span className="nr14-1d84ead7">Equipamentos pendentes</span><span className="nr14-2525ff9b">{fmt(a.custoEquipPendentes)}</span></div>
        <div className="nr14-b72bdccd"><span className="nr14-a1f8ccea">Total da viagem</span><span className="nr14-ccdd3ae4">{fmt(a.custoTotal)}</span></div>
        {a.dinheiroNum < a.custoTotal ? <div className="nr14-257ac132"><p className="nr14-b288d6b9">Falta investir {fmt(a.custoTotal-a.dinheiroNum)}</p></div> : <div className="nr14-032f16b0"><p className="nr14-f0f2ef2c">Seu dinheiro cobre os custos previstos ✅</p></div>}
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
