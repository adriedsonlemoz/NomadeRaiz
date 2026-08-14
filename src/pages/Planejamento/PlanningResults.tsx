import type { CSSProperties } from 'react';
import { EQUIPAMENTO_PARA_MANUAL } from '../../constants/manualBike';
import type { ThemeTokens } from '../../styles/theme';
import type { ManualBikeTarget } from '../../types';
import { fmt } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import type { PlanningAnalysis } from './usePlanningAnalysis';

interface Props {
  T: ThemeTokens;
  analysis: PlanningAnalysis;
  onOpenManual: (target: ManualBikeTarget) => void;
}

export function PlanningResults({ T, analysis:a, onOpenManual }: Props) {
  const cardStyle: CSSProperties = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16,
    padding:'16px', boxShadow:'0 1px 5px rgba(15,39,68,.06)', boxSizing:'border-box' };
  const kicker: CSSProperties = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:'0.12em',
    textTransform:'uppercase', margin:'0 0 10px' };

  return <>
    <div style={cardStyle}>
      <p style={kicker}>⚡ Energia (automática)</p>
      {a.rEnergia.autossustentavel ? <div style={{ background:T.doneBg, border:`1.5px solid ${T.doneBorder}`, borderRadius:12, padding:'12px', textAlign:'center', marginBottom:10 }}>
        <p style={{ color:T.doneCheck, fontWeight:800, fontSize:15, margin:0 }}>♾️ Autossustentável</p>
      </div> : <div style={{ background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px', textAlign:'center', marginBottom:10 }}>
        <p style={{ color:T.blue, fontWeight:900, fontSize:24, margin:0 }}>{a.rEnergia.dias===null?'—':a.rEnergia.dias} dias</p>
        <p style={{ color:T.textMuted, fontSize:11, margin:'2px 0 0' }}>de autonomia estimada</p>
      </div>}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.textSub, fontSize:12 }}>Geração diária estimada</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{Math.round(a.rEnergia.geracaoDiariaWh)} Wh/dia</span></div>
        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.textSub, fontSize:12 }}>Tempo de recarga total</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{a.rEnergia.horasRecarga===null?'—':`${a.rEnergia.horasRecarga}h de sol`}</span></div>
      </div>
      {!a.rEnergia.temPainel && !a.rEnergia.temBateria && <p style={{ color:T.textMuted, fontSize:10.5, margin:'10px 0 0' }}>Nenhum painel solar ou bateria marcados como "adquiridos" — considerando só o celular.</p>}
    </div>

    <div style={cardStyle}>
      <p style={kicker}>🎒 Equipamentos essenciais</p>
      <p style={{ color:T.textMuted, fontSize:10.5, margin:'-6px 0 10px' }}>Só os itens de segurança da bicicleta — o restante do checklist fica na tela de Equipamentos.</p>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}><span style={{ color:T.textSub, fontSize:12.5 }}>✅ Já adquiridos</span><span style={{ color:T.doneCheck, fontWeight:800, fontSize:13 }}>{a.segurancaComprados}/{a.itensSeguranca.length}</span></div>
      {a.segurancaFaltando.length===0 ? <p style={{ color:T.doneCheck, fontSize:12.5, margin:0 }}>✅ Todos os itens essenciais de segurança já foram adquiridos.</p> : <>
        <p style={{ color:T.urgColor, fontSize:12, fontWeight:700, margin:'0 0 6px' }}>⚠️ Você ainda não possui:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {a.segurancaFaltando.map(item => {
            const target = EQUIPAMENTO_PARA_MANUAL[item.id];
            return <div key={item.id} style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`, borderRadius:8, padding:'7px 10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.textMain, fontSize:12 }}>{item.name}</span><span style={{ color:T.urgColor, fontWeight:700, fontSize:12 }}>{fmt(item.price*item.quantity)}</span></div>
              {target && <button onClick={()=>onOpenManual(target)} style={{ marginTop:6, background:'none', border:'none', padding:0, cursor:'pointer', color:T.urgColor, fontSize:11, fontWeight:700, textDecoration:'underline' }}>📘 Ver como resolver no Manual da Bike</button>}
            </div>;
          })}
        </div>
      </>}
    </div>

    <div style={cardStyle}>
      <p style={kicker}>💵 Custos</p>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.textSub, fontSize:12.5 }}>Alimentação</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12.5 }}>{fmt(a.rComida.valorTotal)}</span></div>
        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:T.textSub, fontSize:12.5 }}>Equipamentos pendentes</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12.5 }}>{fmt(a.custoEquipPendentes)}</span></div>
        <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:7, display:'flex', justifyContent:'space-between' }}><span style={{ color:T.textMain, fontWeight:800, fontSize:13 }}>Total da viagem</span><span style={{ color:T.blue, fontWeight:900, fontSize:14 }}>{fmt(a.custoTotal)}</span></div>
        {a.dinheiroNum < a.custoTotal ? <div style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`, borderRadius:10, padding:'9px 11px', marginTop:4 }}><p style={{ color:T.urgColor, fontSize:12, fontWeight:700, margin:0 }}>Falta investir {fmt(a.custoTotal-a.dinheiroNum)}</p></div> : <div style={{ background:T.doneBg, border:`1px solid ${T.doneBorder}`, borderRadius:10, padding:'9px 11px', marginTop:4 }}><p style={{ color:T.doneCheck, fontSize:12, fontWeight:700, margin:0 }}>Seu dinheiro cobre os custos previstos ✅</p></div>}
      </div>
    </div>

    <div style={cardStyle}>
      <p style={kicker}>📊 Resumo Geral</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>{a.resumo.map(item => <div key={item.id} style={{ display:'flex', flexDirection:'column', gap:6, background:T.blueLight, borderRadius:12, padding:'10px 11px' }}><div style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ fontSize:16 }}>{item.icon}</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{item.label}</span></div><StatusBadge status={item.status} T={T}/></div>)}</div>
    </div>

    <div style={cardStyle}>
      <p style={kicker}>💡 Recomendações</p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{a.recomendacoes.map((rec,index) => <div key={`${rec.tipo}-${index}`} style={{ display:'flex', gap:8, alignItems:'flex-start' }}><span style={{ fontSize:13, flexShrink:0 }}>{rec.tipo==='ok'?'✅':rec.tipo==='atencao'?'💡':'⚠️'}</span><span style={{ color:T.textMain, fontSize:12.5, lineHeight:1.5 }}>{rec.texto}</span></div>)}</div>
    </div>
  </>;
}
