import { useEffect, useState, type ChangeEvent } from 'react';
import { PECAS_BIKE, PROBLEMAS_ESTRADA } from '../../constants/manualBike';
import { useStore } from '../../contexts';
import type { BikePiece, BikeProblem } from '../../types';
import { GlossarioModal } from './GlossarioModal';
import { ManualOverview } from './ManualOverview';
import { ManualSearchResults } from './ManualSearchResults';
import { PecaModal } from './PecaModal';
import { ProblemaModal } from './ProblemaModal';
import { useManualBikeData } from './useManualBikeData';

export default function ManualBikePage() {
  const { state, setPage, setManualBikeAlvo } = useStore();
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

  return <div className="nr14-214c7d1e">
    {pecaAberta && <PecaModal peca={pecaAberta} onClose={()=>setPecaAberta(null)}/>} 
    {problemaAberto && <ProblemaModal problema={problemaAberto} onClose={()=>setProblemaAberto(null)}/>} 
    {glossarioAberto && <GlossarioModal onClose={()=>setGlossarioAberto(false)}/>} 

    <div className="nr14-5aef730c">
      <div className="nr14-8d446200">
        <button onClick={()=>setPage('extras')} className="nr14-81c5d7e9">←</button>
        <div><p className="nr14-bcecb245">Educativo</p><h1 className="nr14-3d1bf271">🚲 Manual da Bike</h1></div>
      </div>
      <p className="nr14-a99c3720">Diagnóstico, manutenção e soluções de emergência para entender a bike e decidir com segurança o que dá para resolver na estrada.</p>
      <input value={busca} onChange={(event:ChangeEvent<HTMLInputElement>)=>setBusca(event.target.value)} placeholder="🔎 Buscar peça, problema ou termo..." className="nr14-3e7612f1"/>
    </div>

    <div className="nr14-2678a9ce">
      {data.buscando
        ? <ManualSearchResults busca={busca} pecas={data.pecasFiltradas} problemas={data.problemasFiltrados} termos={data.termosFiltrados} onPiece={setPecaAberta} onProblem={setProblemaAberto}/>
        : <ManualOverview habilidades={state.habilidadesDominadas} kitComStatus={data.kitComStatus} kitPossui={data.kitPossui} kitRastreado={data.kitRastreado} onPiece={setPecaAberta} onProblem={setProblemaAberto} onGlossary={()=>setGlossarioAberto(true)}/>
      }
    </div>
  </div>;
}
