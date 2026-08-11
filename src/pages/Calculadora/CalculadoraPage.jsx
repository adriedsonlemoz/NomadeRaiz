import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import {
  calcBicicleta, calcAlimentacaoInteligente, montarLinhasAlimentacaoInteligente,
  calcAguaInteligente, calcEnergia, EQUIPAMENTOS_ENERGIA_PADRAO, calcDinheiro, calcIndiceGeral,
} from "../../services/calculator.service";
import { ALIMENTOS_CONFIG, AUTONOMIA_TABS } from "../../constants";
import { estadoAutonomia } from "./CalcAtoms";
import { ResumoCard } from "./ResumoCard";
import { BikeCard } from "./BikeCard";
import { ComidaCard } from "./ComidaCard";
import { AguaCard } from "./AguaCard";
import { EnergiaCard } from "./EnergiaCard";
import { DinheiroCard } from "./DinheiroCard";
import { PesoCard } from "./PesoCard";
import { CustoCard } from "./CustoCard";

export default function CalculadoraPage() {
  const { state, setPage } = useStore();
  const { theme: T } = useTheme();
  const [tab, setTab] = useState("resumo");

  const [bike,      setBike]      = useState({ velocidade:"", horas:"", dias:"" });
  const [alimentos, setAlimentos] = useState({});
  const [litros,    setLitros]    = useState("");
  const [reabastece, setReabastece]     = useState(false);
  const [frequenciaDias, setFrequenciaDias] = useState("");
  const [locaisAgua, setLocaisAgua]     = useState("");
  const [energia,   setEnergia]   = useState({ painel:"", horasSol:"", bateria:"", powerbank:"", equip:EQUIPAMENTOS_ENERGIA_PADRAO });
  const [dinheiro,  setDinheiro]  = useState({ disponivel:"", gastoDia:"" });
  const [pesoData,  setPesoData]  = useState({});
  const [custo,     setCusto]     = useState({ dias:"", alimentacao:"", transporte:"", manutencao:"", outros:"" });

  const rBike     = calcBicicleta(bike.velocidade, bike.horas, bike.dias);
  const rComida   = calcAlimentacaoInteligente(montarLinhasAlimentacaoInteligente(ALIMENTOS_CONFIG, alimentos));
  const rAgua     = calcAguaInteligente(litros, reabastece, frequenciaDias);
  const rEnergia  = calcEnergia(energia.painel, energia.horasSol, energia.bateria, energia.powerbank, energia.equip);
  const rDinheiro = calcDinheiro(dinheiro.disponivel, dinheiro.gastoDia);

  const recursos = [
    { id:"bike", icon:"🚲", label:"Bicicleta", estado:"neutro",
      nota: rBike.valido ? `${Math.round(rBike.dias)} dias planejados` : "Sem dados ainda" },
    { id:"comida", icon:"🍱", label:"Alimentação",
      estado: (rComida.valido && rComida.dias!==null) ? estadoAutonomia(rComida.dias) : "indefinido",
      dias: (rComida.valido && rComida.dias!==null) ? rComida.dias : null,
      nota: (rComida.valido && rComida.dias!==null) ? `${rComida.dias} dias de autonomia` : "Sem dados ainda" },
    { id:"agua", icon:"💧", label:"Água",
      estado: rAgua.reabastece ? (rAgua.suficientePorIntervalo?"boa":"media")
              : (rAgua.valido ? estadoAutonomia(rAgua.dias) : "indefinido"),
      dias: rAgua.reabastece ? null : (rAgua.valido ? rAgua.dias : null),
      nota: rAgua.reabastece ? "Reabastece pelo caminho" : (rAgua.valido ? `${rAgua.dias} dias de autonomia` : "Sem dados ainda") },
    { id:"energia", icon:"⚡", label:"Energia",
      estado: !rEnergia.valido ? "indefinido" : rEnergia.autossustentavel ? "boa" : estadoAutonomia(rEnergia.dias),
      dias: (rEnergia.valido && !rEnergia.autossustentavel) ? rEnergia.dias : null,
      nota: !rEnergia.valido ? "Sem dados ainda" : rEnergia.autossustentavel ? "Autossustentável" : `${rEnergia.dias} dias de autonomia` },
    { id:"dinheiro", icon:"💰", label:"Dinheiro",
      estado: rDinheiro.valido ? estadoAutonomia(rDinheiro.dias) : "indefinido", dias: rDinheiro.valido?rDinheiro.dias:null,
      nota: rDinheiro.valido ? `${rDinheiro.dias} dias de autonomia` : "Sem dados ainda" },
  ];
  const resultadoGeral = calcIndiceGeral(recursos.map(r => ({ ...r, neutro: r.id==="bike" || (r.id==="agua" && rAgua.reabastece) })));

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      <div style={{ background:T.navy, padding:"14px 14px 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Planejamento</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Autonomia da Viagem</h1>
          </div>
        </div>
        {/* Abas — ícones grandes, rolagem horizontal quando necessário */}
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
          {AUTONOMIA_TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flexShrink:0,
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              padding:"7px 12px", borderRadius:11, border:"none", cursor:"pointer",
              background:tab===t.id?T.blue:T.navyLight,
              color:tab===t.id?"#fff":"#7ea3d4", minWidth:56 }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontWeight:700 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>
        {tab==="resumo"   && <ResumoCard recursos={recursos} resultadoGeral={resultadoGeral} T={T} onSelect={setTab}/>}
        {tab==="bike"     && <BikeCard bike={bike} setBike={setBike} T={T}/>}
        {tab==="comida"   && <ComidaCard alimentos={alimentos} setAlimentos={setAlimentos} T={T}/>}
        {tab==="agua"     && <AguaCard litros={litros} setLitros={setLitros} reabastece={reabastece}
                                setReabastece={setReabastece} frequenciaDias={frequenciaDias}
                                setFrequenciaDias={setFrequenciaDias} locais={locaisAgua} setLocais={setLocaisAgua} T={T}/>}
        {tab==="energia"  && <EnergiaCard energia={energia} setEnergia={setEnergia} T={T}/>}
        {tab==="dinheiro" && <DinheiroCard dinheiro={dinheiro} setDinheiro={setDinheiro} T={T}/>}
        {tab==="peso"     && <PesoCard pesoData={pesoData} setPesoData={setPesoData} items={state.items} T={T}/>}
        {tab==="custo"    && <CustoCard custo={custo} setCusto={setCusto} T={T}/>}
        <div style={{ height:24 }}/>
      </div>
    </div>
  );
}
