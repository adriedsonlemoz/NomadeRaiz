import { useState, type CSSProperties } from 'react';
import { useStore } from '../../contexts';
import { useTheme } from '../../hooks';
import type { TravelTypeId } from '../../types';
import { ComidaCard } from '../Calculadora/ComidaCard';
import { AguaCard } from '../Calculadora/AguaCard';
import type { FoodFormState } from '../Calculadora/types';
import { PlanningResults } from './PlanningResults';
import { PlanningTripForm } from './PlanningTripForm';
import { usePlanningAnalysis } from './usePlanningAnalysis';

export default function PlanejamentoPage() {
  const { state, setPage, setManualBikeAlvo } = useStore();
  const { theme:T } = useTheme();
  const [destino, setDestino] = useState('');
  const [dias, setDias] = useState('');
  const [kmPrevistos, setKmPrevistos] = useState('');
  const [mediaKmDia, setMediaKmDia] = useState('');
  const [dinheiro, setDinheiro] = useState('');
  const [pessoas, setPessoas] = useState('1');
  const [tipoViagem, setTipoViagem] = useState<TravelTypeId>('cicloviagem');
  const [alimentos, setAlimentos] = useState<FoodFormState>({});
  const [litrosAgua, setLitrosAgua] = useState('');
  const [reabastece, setReabastece] = useState(false);
  const [frequenciaDias, setFrequenciaDias] = useState('');
  const [locaisAgua, setLocaisAgua] = useState('');
  const [gerado, setGerado] = useState(false);

  const analysis = usePlanningAnalysis({
    items:state.items, dias, kmPrevistos, mediaKmDia, dinheiro, alimentos,
    litrosAgua, reabastece, frequenciaDias,
  });
  const podeGerar = analysis.diasNum > 0;
  const cardStyle: CSSProperties = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16, padding:'16px', boxShadow:'0 1px 5px rgba(15,39,68,.06)', boxSizing:'border-box' };
  const kicker: CSSProperties = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 10px' };

  return <div style={{ flex:1, overflowY:'auto', background:T.pageBg }}>
    <div style={{ background:T.navy, padding:'16px 16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <button onClick={()=>setPage('extras')} style={{ width:34, height:34, borderRadius:9, border:'none', background:T.navyLight, color:'#fff', fontSize:17, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div><p style={{ color:'#7ea3d4', fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', margin:0 }}>Planejamento</p><h1 style={{ color:'#fff', fontSize:18, fontWeight:900, margin:0 }}>Planejamento da Viagem</h1></div>
      </div>
      <p style={{ color:'#7ea3d4', fontSize:12, margin:0, lineHeight:1.5 }}>Preencha os dados abaixo para saber se você já está pronto para partir.</p>
    </div>

    <div style={{ padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14 }}>
      <div style={cardStyle}><p style={kicker}>Dados da viagem</p><PlanningTripForm T={T} destino={destino} setDestino={setDestino} dias={dias} setDias={setDias} pessoas={pessoas} setPessoas={setPessoas} kmPrevistos={kmPrevistos} setKmPrevistos={setKmPrevistos} mediaKmDia={mediaKmDia} setMediaKmDia={setMediaKmDia} dinheiro={dinheiro} setDinheiro={setDinheiro} tipoViagem={tipoViagem} setTipoViagem={setTipoViagem}/></div>
      <div style={cardStyle}><p style={kicker}>🍱 Alimentação</p><ComidaCard alimentos={alimentos} setAlimentos={setAlimentos} T={T}/></div>
      <div style={cardStyle}><p style={kicker}>💧 Água</p><AguaCard litros={litrosAgua} setLitros={setLitrosAgua} reabastece={reabastece} setReabastece={setReabastece} frequenciaDias={frequenciaDias} setFrequenciaDias={setFrequenciaDias} locais={locaisAgua} setLocais={setLocaisAgua} T={T}/></div>
      <button onClick={()=>setGerado(true)} disabled={!podeGerar} style={{ padding:'14px 0', borderRadius:14, border:'none', background:podeGerar?T.navy:T.border, color:'#fff', fontWeight:800, fontSize:14.5, cursor:podeGerar?'pointer':'not-allowed' }}>🧭 Gerar Planejamento</button>
      {!podeGerar && <p style={{ color:T.textMuted, fontSize:11, textAlign:'center', margin:'-6px 0 0' }}>Informe a quantidade de dias da viagem para gerar a análise.</p>}
      {gerado && podeGerar && <PlanningResults T={T} analysis={analysis} onOpenManual={target=>{ setManualBikeAlvo(target); setPage('manual-bike'); }}/>} 
    </div>
  </div>;
}
