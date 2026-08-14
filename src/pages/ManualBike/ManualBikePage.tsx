import { useEffect, useState, type ChangeEvent } from 'react';
import { PECAS_BIKE, PROBLEMAS_ESTRADA } from '../../constants/manualBike';
import { useStore } from '../../contexts';
import { useTheme } from '../../hooks';
import type { BikePiece, BikeProblem } from '../../types';
import { GlossarioModal } from './GlossarioModal';
import { ManualOverview } from './ManualOverview';
import { ManualSearchResults } from './ManualSearchResults';
import { PecaModal } from './PecaModal';
import { ProblemaModal } from './ProblemaModal';
import { useManualBikeData } from './useManualBikeData';

export default function ManualBikePage() {
  const { state, setPage, setManualBikeAlvo } = useStore();
  const { theme:T } = useTheme();
  const [pecaAberta, setPecaAberta] = useState<BikePiece | null>(null);
  const [problemaAberto, setProblemaAberto] = useState<BikeProblem | null>(null);
  const [glossarioAberto, setGlossarioAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const data = useManualBikeData(state.items, busca);

  useEffect(() => {
    if (!state.manualBikeAlvo) return;
    const { tipo, id } = state.manualBikeAlvo;
    if (tipo === 'peca') {
      const piece = PECAS_BIKE.find(candidate => candidate.id === id);
      if (piece) setPecaAberta(piece);
    } else {
      const problem = PROBLEMAS_ESTRADA.find(candidate => candidate.id === id);
      if (problem) setProblemaAberto(problem);
    }
    setManualBikeAlvo(null);
  }, [state.manualBikeAlvo, setManualBikeAlvo]);

  return <div style={{ flex:1, overflowY:'auto', background:T.pageBg }}>
    {pecaAberta && <PecaModal peca={pecaAberta} onClose={()=>setPecaAberta(null)} T={T}/>} 
    {problemaAberto && <ProblemaModal problema={problemaAberto} onClose={()=>setProblemaAberto(null)} T={T}/>} 
    {glossarioAberto && <GlossarioModal onClose={()=>setGlossarioAberto(false)} T={T}/>} 

    <div style={{ background:T.navy, padding:'16px 16px 18px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <button onClick={()=>setPage('extras')} style={{ width:34, height:34, borderRadius:9, border:'none', background:T.navyLight, color:'#fff', fontSize:17, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div><p style={{ color:'#7ea3d4', fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', margin:0 }}>Educativo</p><h1 style={{ color:'#fff', fontSize:18, fontWeight:900, margin:0 }}>🚲 Manual da Bike</h1></div>
      </div>
      <p style={{ color:'#7ea3d4', fontSize:12, margin:'0 0 12px', lineHeight:1.5 }}>Conheça sua bicicleta e aprenda a resolver os problemas mais comuns na estrada.</p>
      <input value={busca} onChange={(event:ChangeEvent<HTMLInputElement>)=>setBusca(event.target.value)} placeholder="🔎 Buscar peça, problema ou termo..." style={{ width:'100%', padding:'10px 13px', borderRadius:11, border:'none', background:'rgba(255,255,255,.12)', color:'#fff', fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
    </div>

    <div style={{ padding:'14px 14px 32px', display:'flex', flexDirection:'column', gap:14 }}>
      {data.buscando
        ? <ManualSearchResults T={T} busca={busca} pecas={data.pecasFiltradas} problemas={data.problemasFiltrados} termos={data.termosFiltrados} onPiece={setPecaAberta} onProblem={setProblemaAberto}/>
        : <ManualOverview T={T} habilidades={state.habilidadesDominadas} kitComStatus={data.kitComStatus} kitPossui={data.kitPossui} kitRastreado={data.kitRastreado} onPiece={setPecaAberta} onProblem={setProblemaAberto} onGlossary={()=>setGlossarioAberto(true)}/>
      }
    </div>
  </div>;
}
