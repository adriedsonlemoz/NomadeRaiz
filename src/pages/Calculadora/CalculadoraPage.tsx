import { useState } from 'react';
import { useStore } from '../../contexts';
import {
  calcBicicleta,
  calcAlimentacaoInteligente,
  montarLinhasAlimentacaoInteligente,
  calcAguaInteligente,
  calcEnergia,
  EQUIPAMENTOS_ENERGIA_PADRAO,
  calcDinheiro,
  calcIndiceGeral,
} from '../../services/calculator.service';
import { ALIMENTOS_CONFIG, AUTONOMIA_TABS } from '../../constants/travel';
import { estadoAutonomia } from './CalcAtoms';
import { ResumoCard } from './ResumoCard';
import { BikeCard } from './BikeCard';
import { ComidaCard } from './ComidaCard';
import { AguaCard } from './AguaCard';
import { EnergiaCard } from './EnergiaCard';
import { DinheiroCard } from './DinheiroCard';
import { PesoCard } from './PesoCard';
import { CustoCard } from './CustoCard';
import type {
  AutonomyResource,
  AutonomyTabId,
  BikeFormState,
  CostFormState,
  EnergyFormState,
  FoodConfigWithUnits,
  FoodFormState,
  MoneyFormState,
  WeightFormState,
} from './types';

interface AutonomyTabConfig {
  id: AutonomyTabId;
  icon: string;
  label: string;
}

const autonomyTabs: readonly AutonomyTabConfig[] = AUTONOMIA_TABS;
const alimentosConfig: readonly FoodConfigWithUnits[] = ALIMENTOS_CONFIG;

export default function CalculadoraPage() {
  const { state, setPage } = useStore();
  const [tab, setTab] = useState<AutonomyTabId>('resumo');

  const [bike, setBike] = useState<BikeFormState>({ velocidade:'', horas:'', dias:'' });
  const [alimentos, setAlimentos] = useState<FoodFormState>({});
  const [litros, setLitros] = useState('');
  const [reabastece, setReabastece] = useState(false);
  const [frequenciaDias, setFrequenciaDias] = useState('');
  const [locaisAgua, setLocaisAgua] = useState('');
  const [energia, setEnergia] = useState<EnergyFormState>({
    painel:'',
    horasSol:'',
    bateria:'',
    powerbank:'',
    equip:EQUIPAMENTOS_ENERGIA_PADRAO.map(item => ({ ...item })),
  });
  const [dinheiro, setDinheiro] = useState<MoneyFormState>({ disponivel:'', gastoDia:'' });
  const [pesoData, setPesoData] = useState<WeightFormState>({});
  const [custo, setCusto] = useState<CostFormState>({
    dias:'',
    alimentacao:'',
    transporte:'',
    manutencao:'',
    outros:'',
  });

  const rBike = calcBicicleta(bike.velocidade, bike.horas, bike.dias);
  const rComida = calcAlimentacaoInteligente(
    montarLinhasAlimentacaoInteligente(alimentosConfig, alimentos),
  );
  const rAgua = calcAguaInteligente(litros, reabastece, frequenciaDias);
  const rEnergia = calcEnergia(
    energia.painel,
    energia.horasSol,
    energia.bateria,
    energia.powerbank,
    energia.equip,
  );
  const rDinheiro = calcDinheiro(dinheiro.disponivel, dinheiro.gastoDia);

  const recursos: AutonomyResource[] = [
    {
      id:'bike', icon:'🚲', label:'Bicicleta', estado:'neutro',
      nota: rBike.valido ? `${Math.round(rBike.dias)} dias planejados` : 'Sem dados ainda',
    },
    {
      id:'comida', icon:'🍱', label:'Alimentação',
      estado: (rComida.valido && rComida.dias!==null) ? estadoAutonomia(rComida.dias) : 'indefinido',
      dias: (rComida.valido && rComida.dias!==null) ? rComida.dias : null,
      nota: (rComida.valido && rComida.dias!==null) ? `${rComida.dias} dias de autonomia` : 'Sem dados ainda',
    },
    {
      id:'agua', icon:'💧', label:'Água',
      estado: rAgua.reabastece ? (rAgua.suficientePorIntervalo?'boa':'media')
        : (rAgua.valido ? estadoAutonomia(rAgua.dias) : 'indefinido'),
      dias: rAgua.reabastece ? null : (rAgua.valido ? rAgua.dias : null),
      nota: rAgua.reabastece ? 'Reabastece pelo caminho' : (rAgua.valido ? `${rAgua.dias} dias de autonomia` : 'Sem dados ainda'),
    },
    {
      id:'energia', icon:'⚡', label:'Energia',
      estado: !rEnergia.valido ? 'indefinido' : rEnergia.autossustentavel ? 'boa' : estadoAutonomia(rEnergia.dias),
      dias: (rEnergia.valido && !rEnergia.autossustentavel) ? rEnergia.dias : null,
      nota: !rEnergia.valido ? 'Sem dados ainda' : rEnergia.autossustentavel ? 'Autossustentável' : `${rEnergia.dias} dias de autonomia`,
    },
    {
      id:'dinheiro', icon:'💰', label:'Dinheiro',
      estado: rDinheiro.valido ? estadoAutonomia(rDinheiro.dias) : 'indefinido',
      dias: rDinheiro.valido?rDinheiro.dias:null,
      nota: rDinheiro.valido ? `${rDinheiro.dias} dias de autonomia` : 'Sem dados ainda',
    },
  ];

  const resultadoGeral = calcIndiceGeral(recursos.map(recurso => ({
    ...recurso,
    neutro: recurso.id==='bike' || (recurso.id==='agua' && rAgua.reabastece),
  })));

  return (
    <div className="nr14-bfbf751f">
      <div className="nr14-1125a2ad">
        <div className="nr14-a522af54">
          <button onClick={()=>setPage('extras')} className="nr14-81c5d7e9">←</button>
          <div>
            <p className="nr14-bcecb245">Planejamento</p>
            <h1 className="nr14-3d1bf271">Autonomia da Viagem</h1>
          </div>
        </div>
        <div className="nr14-ac048e4b">
          {autonomyTabs.map(tabConfig => (
            <button key={tabConfig.id} onClick={()=>setTab(tabConfig.id)} className="nr-calc-tab" aria-pressed={tab===tabConfig.id}>
              <span className="nr14-4ff818ff">{tabConfig.icon}</span>
              <span className="nr14-c380c3c2">{tabConfig.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="nr14-3022deb2">
        <div className="nr-explain-box nr-explain-box--spaced">
          <p><strong>O que é autonomia?</strong> É uma estimativa de quanto tempo você consegue seguir com os recursos atuais antes de precisar reabastecer, recarregar, comprar algo ou ajustar o plano.</p>
          <p>Use cada aba para entender um recurso separadamente e o <b>Resumo</b> para encontrar o principal limitador da viagem.</p>
        </div>
        {tab==='resumo' && <ResumoCard recursos={recursos} resultadoGeral={resultadoGeral} onSelect={setTab}/>} 
        {tab==='bike' && <BikeCard bike={bike} setBike={setBike}/>} 
        {tab==='comida' && <ComidaCard alimentos={alimentos} setAlimentos={setAlimentos}/>} 
        {tab==='agua' && <AguaCard litros={litros} setLitros={setLitros} reabastece={reabastece}
          setReabastece={setReabastece} frequenciaDias={frequenciaDias}
          setFrequenciaDias={setFrequenciaDias} locais={locaisAgua} setLocais={setLocaisAgua}/>} 
        {tab==='energia' && <EnergiaCard energia={energia} setEnergia={setEnergia}/>} 
        {tab==='dinheiro' && <DinheiroCard dinheiro={dinheiro} setDinheiro={setDinheiro}/>} 
        {tab==='peso' && <PesoCard pesoData={pesoData} setPesoData={setPesoData} items={state.items}/>} 
        {tab==='custo' && <CustoCard custo={custo} setCusto={setCusto}/>} 
        <div className="nr14-29a11d37"/>
      </div>
    </div>
  );
}
