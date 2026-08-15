import { useState } from 'react';
import { useStore } from '../../contexts';
import type { TravelTypeId } from '../../types';
import { ComidaCard } from '../Calculadora/ComidaCard';
import { AguaCard } from '../Calculadora/AguaCard';
import type { FoodFormState } from '../Calculadora/types';
import { PlanningResults } from './PlanningResults';
import { PlanningTripForm } from './PlanningTripForm';
import { usePlanningAnalysis } from './usePlanningAnalysis';

export default function PlanejamentoPage() {
  const { state, setPage, setManualBikeAlvo } = useStore();
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

  return <div className="nr14-214c7d1e">
    <div className="nr14-5aef730c">
      <div className="nr14-8d446200">
        <button onClick={()=>setPage('extras')} className="nr14-81c5d7e9">←</button>
        <div><p className="nr14-bcecb245">Planejamento</p><h1 className="nr14-3d1bf271">Planejamento da Viagem</h1></div>
      </div>
      <p className="nr14-17ff908a">Preencha os dados abaixo para saber se você já está pronto para partir.</p>
    </div>

    <div className="nr14-2678a9ce">
      <div className="nr-content-card"><p className="nr-kicker">Dados da viagem</p><PlanningTripForm destino={destino} setDestino={setDestino} dias={dias} setDias={setDias} pessoas={pessoas} setPessoas={setPessoas} kmPrevistos={kmPrevistos} setKmPrevistos={setKmPrevistos} mediaKmDia={mediaKmDia} setMediaKmDia={setMediaKmDia} dinheiro={dinheiro} setDinheiro={setDinheiro} tipoViagem={tipoViagem} setTipoViagem={setTipoViagem}/></div>
      <div className="nr-content-card"><p className="nr-kicker">🍱 Alimentação</p><ComidaCard alimentos={alimentos} setAlimentos={setAlimentos}/></div>
      <div className="nr-content-card"><p className="nr-kicker">💧 Água</p><AguaCard litros={litrosAgua} setLitros={setLitrosAgua} reabastece={reabastece} setReabastece={setReabastece} frequenciaDias={frequenciaDias} setFrequenciaDias={setFrequenciaDias} locais={locaisAgua} setLocais={setLocaisAgua}/></div>
      <button onClick={()=>setGerado(true)} disabled={!podeGerar} className="nr-btn nr-btn--primary nr-btn--full nr-planning-generate">🧭 Gerar Planejamento</button>
      {!podeGerar && <p className="nr14-4bea95be">Informe a quantidade de dias da viagem para gerar a análise.</p>}
      {gerado && podeGerar && <PlanningResults analysis={analysis} onOpenManual={target=>{ setManualBikeAlvo(target); setPage('manual-bike'); }}/>} 
    </div>
  </div>;
}
