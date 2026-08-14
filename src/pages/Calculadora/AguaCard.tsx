import { calcAguaInteligente, CONSUMO_AGUA_RECOMENDADO_L } from '../../services/calculator.service';
import { EmptyState } from '../../components/common';
import type { ThemeTokens } from '../../styles/theme';
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
  T: ThemeTokens;
}

export function AguaCard({ litros, setLitros, reabastece, setReabastece, frequenciaDias, setFrequenciaDias,
  locais, setLocais, T }: AguaCardProps) {
  const r = calcAguaInteligente(litros, reabastece, frequenciaDias);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
      <CalcField T={T} label="Água disponível (carregada)" suffix="litros" placeholder="Ex: 6"
        value={litros} onChange={setLitros}/>

      <button onClick={()=>setReabastece(!reabastece)} style={{ display:'flex', alignItems:'center', gap:9,
        background:reabastece?T.blueLight:T.white, border:`1.5px solid ${reabastece?T.blue:T.border}`,
        borderRadius:11, padding:'10px 12px', cursor:'pointer', textAlign:'left' }}>
        <span style={{ width:19, height:19, borderRadius:5, flexShrink:0,
          border:`1.5px solid ${reabastece?T.blue:T.border}`, background:reabastece?T.blue:'transparent',
          color:'#fff', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {reabastece?'✓':''}</span>
        <span style={{ color:T.textMain, fontSize:12.5, fontWeight:600 }}>
          Pretendo reabastecer água durante a viagem</span>
      </button>

      {reabastece && (
        <div style={{ display:'flex', flexDirection:'column', gap:10, paddingLeft:2 }}>
          <CalcField T={T} label="Frequência estimada de reabastecimento" suffix="dias" placeholder="Ex: 2"
            value={frequenciaDias} onChange={setFrequenciaDias}/>
          <div>
            <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:'0 0 4px' }}>
              Locais de abastecimento (opcional)</p>
            <input value={locais} onChange={e=>setLocais(e.target.value)}
              placeholder="Ex: postos, mercados, praças, torneiras públicas..."
              style={{ padding:'10px 12px', border:`1.5px solid ${T.border}`, borderRadius:10,
                fontSize:13, color:T.textMain, background:T.blueLight, outline:'none',
                fontFamily:'inherit', width:'100%', boxSizing:'border-box' }}/>
          </div>
        </div>
      )}

      {r.valido ? (
        <>
          {reabastece ? (
            <div style={{ background:r.suficientePorIntervalo?T.doneBg:T.medBg,
              border:`1.5px solid ${r.suficientePorIntervalo?T.doneBorder:T.medBorder}`, borderRadius:14,
              padding:'14px', textAlign:'center' }}>
              <p style={{ color:r.suficientePorIntervalo?T.doneCheck:T.medColor, fontSize:15, fontWeight:800, margin:0 }}>
                {r.suficientePorIntervalo ? '✅ Cobre o intervalo entre pontos de água' : '⚠️ Pode não cobrir o intervalo'}</p>
              <p style={{ color:T.textSub, fontSize:11.5, margin:'6px 0 0' }}>
                {r.litros}L carregados ≈ {r.autonomiaCarregada} dias de água sem reabastecer</p>
            </div>
          ) : (
            <ResultBadge T={T} dias={r.dias} label="dias de autonomia"/>
          )}
          <div style={{ background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:10,
            padding:'10px 12px', display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:T.textSub, fontSize:12 }}>Consumo recomendado</span>
            <span style={{ color:T.blue, fontWeight:800, fontSize:12 }}>{CONSUMO_AGUA_RECOMENDADO_L} L/dia</span>
          </div>
          {r.baixo && (
            <div style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`, borderRadius:10, padding:'9px 12px' }}>
              <p style={{ color:T.urgColor, fontSize:11.5, fontWeight:600, margin:0 }}>
                ⚠️ Quantidade muito baixa — abasteça assim que possível.</p>
            </div>
          )}
        </>
      ) : <EmptyState T={T} text="Informe quantos litros de água você está carregando."/>}
    </div>
  );
}
