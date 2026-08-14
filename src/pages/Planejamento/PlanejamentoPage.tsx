import { useState, type CSSProperties } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { parseNum, fmt } from "../../utils/format";
import { calcTotal } from "../../services/equipment.service";
import {
  montarLinhasAlimentacaoInteligente, calcAlimentacaoInteligente, calcAguaInteligente,
} from "../../services/calculator.service";
import {
  calcEnergiaAutomatica, statusBicicleta, statusPercentual, statusPorDias, statusAgua,
  statusDinheiro, piorStatus, gerarRecomendacoes,
  type PlanningStatus,
} from "../../services/planning.service";
import { ALIMENTOS_CONFIG, EQUIPAMENTOS_SEGURANCA_IDS, TIPOS_VIAGEM, EQUIPAMENTO_PARA_MANUAL } from "../../constants";
import { ComidaCard } from "../Calculadora/ComidaCard";
import { AguaCard } from "../Calculadora/AguaCard";
import { StatusBadge } from "./StatusBadge";
import type { FoodFormState } from "../Calculadora/types";
import type { TravelTypeId } from "../../types";

interface TravelTypeOption {
  id: TravelTypeId;
  icon: string;
  label: string;
}

interface ManualBikeLink {
  tipo: "peca" | "problema";
  id: string;
}

interface PlanningSummaryItem {
  id: string;
  icon: string;
  label: string;
  status: PlanningStatus;
}

const tiposViagem: readonly TravelTypeOption[] = TIPOS_VIAGEM;
const equipamentoParaManual: Readonly<Record<string, ManualBikeLink | undefined>> = EQUIPAMENTO_PARA_MANUAL;

export default function PlanejamentoPage() {
  const { state, setPage, setManualBikeAlvo } = useStore();
  const { theme: T } = useTheme();

  const [destino, setDestino]         = useState("");
  const [dias, setDias]               = useState("");
  const [kmPrevistos, setKmPrevistos] = useState("");
  const [mediaKmDia, setMediaKmDia]   = useState("");
  const [dinheiro, setDinheiro]       = useState("");
  const [pessoas, setPessoas]         = useState("1");
  const [tipoViagem, setTipoViagem]   = useState<TravelTypeId>("cicloviagem");
  const [alimentos, setAlimentos]     = useState<FoodFormState>({});
  const [litrosAgua, setLitrosAgua]   = useState("");
  const [reabastece, setReabastece]         = useState(false);
  const [frequenciaDias, setFrequenciaDias] = useState("");
  const [locaisAgua, setLocaisAgua]         = useState("");
  const [gerado, setGerado]           = useState(false);

  const diasNum = parseNum(dias);
  const linhasComida = montarLinhasAlimentacaoInteligente(ALIMENTOS_CONFIG, alimentos);
  const rComida  = calcAlimentacaoInteligente(linhasComida);
  const rAgua    = calcAguaInteligente(litrosAgua, reabastece, frequenciaDias);
  const rEnergia = calcEnergiaAutomatica(state.items);

  const custoEquipPendentes = calcTotal(state.items.filter(i => i.status === "pendente"));
  const custoTotal   = rComida.valorTotal + custoEquipPendentes;
  const dinheiroNum  = parseNum(dinheiro);
  // Só os itens realmente essenciais para a segurança da pedalada — o resto
  // do checklist (saúde, vestuário etc.) continua na tela de Equipamentos,
  // sem duplicar aqui, e nada disso entra no cálculo de autonomia.
  const itensSeguranca = state.items.filter(i => EQUIPAMENTOS_SEGURANCA_IDS.includes(i.id));
  const segurancaFaltando  = itensSeguranca.filter(i => i.status === "pendente");
  const segurancaComprados = itensSeguranca.filter(i => i.status === "comprado").length;
  const abrigoItens      = state.items.filter(i => i.categoryId === "abrigo");
  const abrigoComprados  = abrigoItens.filter(i => i.status === "comprado").length;

  const statusBike = piorStatus(
    statusBicicleta(parseNum(kmPrevistos), parseNum(mediaKmDia), diasNum),
    statusPercentual(segurancaComprados, itensSeguranca.length),
  );

  const resumo: PlanningSummaryItem[] = [
    { id:"bike",     icon:"🚲",  label:"Bicicleta",   status:statusBike },
    { id:"comida",   icon:"🍱",  label:"Alimentação", status:statusPorDias(rComida.valido ? rComida.dias : null, diasNum) },
    { id:"agua",     icon:"💧",  label:"Água",         status:statusAgua(rAgua, diasNum) },
    { id:"energia",  icon:"⚡",  label:"Energia",      status:rEnergia.autossustentavel ? "verde" : statusPorDias(rEnergia.dias, diasNum) },
    { id:"abrigo",   icon:"🏕️", label:"Abrigo",       status:statusPercentual(abrigoComprados, abrigoItens.length) },
    { id:"dinheiro", icon:"💰",  label:"Dinheiro",     status:statusDinheiro(dinheiroNum, custoTotal) },
  ];

  const recomendacoes = gerarRecomendacoes({
    diasViagem: diasNum,
    linhasComida,
    diasComida: rComida.valido ? rComida.dias : null,
    agua: rAgua,
    dinheiroDisponivel: dinheiroNum,
    custoTotal,
    energiaAutossustentavel: rEnergia.autossustentavel,
    diasEnergia: rEnergia.dias,
    temPainel:  rEnergia.temPainel,
    temBateria: rEnergia.temBateria,
    itensSegurancaFaltando: segurancaFaltando,
  });

  const cardStyle: CSSProperties = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16,
    padding:"16px", boxShadow:"0 1px 5px rgba(15,39,68,.06)", boxSizing:"border-box" };
  const kicker: CSSProperties = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:"0.12em",
    textTransform:"uppercase", margin:"0 0 10px" };
  const campo: CSSProperties = { padding:"10px 12px", border:`1.5px solid ${T.border}`, borderRadius:10,
    fontSize:13.5, color:T.textMain, background:T.blueLight, outline:"none",
    fontFamily:"inherit", width:"100%", boxSizing:"border-box" };
  const labelStyle: CSSProperties = { color:T.textSub, fontSize:11.5, fontWeight:600, margin:"0 0 4px" };

  const podeGerar = diasNum > 0;

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.pageBg }}>
      <div style={{ background:T.navy, padding:"16px 16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Planejamento</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Planejamento da Viagem</h1>
          </div>
        </div>
        <p style={{ color:"#7ea3d4", fontSize:12, margin:0, lineHeight:1.5 }}>
          Preencha os dados abaixo para saber se você já está pronto para partir.</p>
      </div>

      <div style={{ padding:"14px 14px 32px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Dados da viagem */}
        <div style={cardStyle}>
          <p style={kicker}>Dados da viagem</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div>
              <p style={labelStyle}>📍 Destino (opcional)</p>
              <input style={campo} value={destino} onChange={e=>setDestino(e.target.value)} placeholder="Ex: Serra da Canastra"/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <p style={labelStyle}>📅 Dias de viagem</p>
                <input style={campo} type="number" min="0" value={dias} onChange={e=>setDias(e.target.value)} placeholder="Ex: 7"/>
              </div>
              <div>
                <p style={labelStyle}>👥 Pessoas</p>
                <input style={campo} type="number" min="1" value={pessoas} onChange={e=>setPessoas(e.target.value)} placeholder="1"/>
              </div>
              <div>
                <p style={labelStyle}>🚲 Km previstos</p>
                <input style={campo} type="number" min="0" value={kmPrevistos} onChange={e=>setKmPrevistos(e.target.value)} placeholder="Ex: 280"/>
              </div>
              <div>
                <p style={labelStyle}>🚴 Média km/dia</p>
                <input style={campo} type="number" min="0" value={mediaKmDia} onChange={e=>setMediaKmDia(e.target.value)} placeholder="Ex: 40"/>
              </div>
            </div>
            <div>
              <p style={labelStyle}>💰 Dinheiro disponível</p>
              <input style={campo} type="number" min="0" value={dinheiro} onChange={e=>setDinheiro(e.target.value)} placeholder="Ex: 300"/>
            </div>
            <div>
              <p style={labelStyle}>🏕️ Tipo de viagem</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {tiposViagem.map(t => (
                  <button key={t.id} onClick={()=>setTipoViagem(t.id)} style={{
                    display:"flex", alignItems:"center", gap:6, padding:"9px 10px", borderRadius:10,
                    border:`1.5px solid ${tipoViagem===t.id?T.blue:T.border}`,
                    background:tipoViagem===t.id?T.blueLight:T.white,
                    color:tipoViagem===t.id?T.blue:T.textSub, fontSize:11.5, fontWeight:700, cursor:"pointer" }}>
                    <span>{t.icon}</span>{t.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alimentação */}
        <div style={cardStyle}>
          <p style={kicker}>🍱 Alimentação</p>
          <ComidaCard alimentos={alimentos} setAlimentos={setAlimentos} T={T}/>
        </div>

        {/* Água */}
        <div style={cardStyle}>
          <p style={kicker}>💧 Água</p>
          <AguaCard litros={litrosAgua} setLitros={setLitrosAgua} reabastece={reabastece}
            setReabastece={setReabastece} frequenciaDias={frequenciaDias} setFrequenciaDias={setFrequenciaDias}
            locais={locaisAgua} setLocais={setLocaisAgua} T={T}/>
        </div>

        {/* Botão gerar */}
        <button onClick={()=>setGerado(true)} disabled={!podeGerar} style={{
          padding:"14px 0", borderRadius:14, border:"none",
          background: podeGerar ? T.navy : T.border, color:"#fff", fontWeight:800, fontSize:14.5,
          cursor: podeGerar ? "pointer" : "not-allowed" }}>
          🧭 Gerar Planejamento</button>
        {!podeGerar && (
          <p style={{ color:T.textMuted, fontSize:11, textAlign:"center", margin:"-6px 0 0" }}>
            Informe a quantidade de dias da viagem para gerar a análise.</p>
        )}

        {gerado && podeGerar && (
          <>
            {/* Energia — automática */}
            <div style={cardStyle}>
              <p style={kicker}>⚡ Energia (automática)</p>
              {rEnergia.autossustentavel ? (
                <div style={{ background:T.doneBg, border:`1.5px solid ${T.doneBorder}`, borderRadius:12,
                  padding:"12px", textAlign:"center", marginBottom:10 }}>
                  <p style={{ color:T.doneCheck, fontWeight:800, fontSize:15, margin:0 }}>♾️ Autossustentável</p>
                </div>
              ) : (
                <div style={{ background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:12,
                  padding:"12px", textAlign:"center", marginBottom:10 }}>
                  <p style={{ color:T.blue, fontWeight:900, fontSize:24, margin:0 }}>
                    {rEnergia.dias===null?"—":rEnergia.dias} dias</p>
                  <p style={{ color:T.textMuted, fontSize:11, margin:"2px 0 0" }}>de autonomia estimada</p>
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.textSub, fontSize:12 }}>Geração diária estimada</span>
                  <span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{Math.round(rEnergia.geracaoDiariaWh)} Wh/dia</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.textSub, fontSize:12 }}>Tempo de recarga total</span>
                  <span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>
                    {rEnergia.horasRecarga===null?"—":`${rEnergia.horasRecarga}h de sol`}</span>
                </div>
              </div>
              {!rEnergia.temPainel && !rEnergia.temBateria && (
                <p style={{ color:T.textMuted, fontSize:10.5, margin:"10px 0 0" }}>
                  Nenhum painel solar ou bateria marcados como "adquiridos" — considerando só o celular.</p>
              )}
            </div>

            {/* Equipamentos essenciais de segurança */}
            <div style={cardStyle}>
              <p style={kicker}>🎒 Equipamentos essenciais</p>
              <p style={{ color:T.textMuted, fontSize:10.5, margin:"-6px 0 10px" }}>
                Só os itens de segurança da bicicleta — o restante do checklist fica na tela de Equipamentos.</p>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ color:T.textSub, fontSize:12.5 }}>✅ Já adquiridos</span>
                <span style={{ color:T.doneCheck, fontWeight:800, fontSize:13 }}>
                  {segurancaComprados}/{itensSeguranca.length}</span>
              </div>
              {segurancaFaltando.length===0 ? (
                <p style={{ color:T.doneCheck, fontSize:12.5, margin:0 }}>
                  ✅ Todos os itens essenciais de segurança já foram adquiridos.</p>
              ) : (
                <>
                  <p style={{ color:T.urgColor, fontSize:12, fontWeight:700, margin:"0 0 6px" }}>
                    ⚠️ Você ainda não possui:</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {segurancaFaltando.map(it => {
                      const vinculo = equipamentoParaManual[it.id];
                      return (
                        <div key={it.id} style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`,
                          borderRadius:8, padding:"7px 10px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ color:T.textMain, fontSize:12 }}>{it.name}</span>
                            <span style={{ color:T.urgColor, fontWeight:700, fontSize:12 }}>{fmt(it.price*it.quantity)}</span>
                          </div>
                          {vinculo && (
                            <button onClick={()=>{ setManualBikeAlvo(vinculo); setPage("manual-bike"); }} style={{
                              marginTop:6, background:"none", border:"none", padding:0, cursor:"pointer",
                              color:T.urgColor, fontSize:11, fontWeight:700, textDecoration:"underline" }}>
                              📘 Ver como resolver no Manual da Bike</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Custos */}
            <div style={cardStyle}>
              <p style={kicker}>💵 Custos</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.textSub, fontSize:12.5 }}>Alimentação</span>
                  <span style={{ color:T.textMain, fontWeight:700, fontSize:12.5 }}>{fmt(rComida.valorTotal)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.textSub, fontSize:12.5 }}>Equipamentos pendentes</span>
                  <span style={{ color:T.textMain, fontWeight:700, fontSize:12.5 }}>{fmt(custoEquipPendentes)}</span>
                </div>
                <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:7, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:T.textMain, fontWeight:800, fontSize:13 }}>Total da viagem</span>
                  <span style={{ color:T.blue, fontWeight:900, fontSize:14 }}>{fmt(custoTotal)}</span>
                </div>
                {dinheiroNum < custoTotal ? (
                  <div style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`, borderRadius:10,
                    padding:"9px 11px", marginTop:4 }}>
                    <p style={{ color:T.urgColor, fontSize:12, fontWeight:700, margin:0 }}>
                      Falta investir {fmt(custoTotal - dinheiroNum)}</p>
                  </div>
                ) : (
                  <div style={{ background:T.doneBg, border:`1px solid ${T.doneBorder}`, borderRadius:10,
                    padding:"9px 11px", marginTop:4 }}>
                    <p style={{ color:T.doneCheck, fontSize:12, fontWeight:700, margin:0 }}>
                      Seu dinheiro cobre os custos previstos ✅</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo geral */}
            <div style={cardStyle}>
              <p style={kicker}>📊 Resumo Geral</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {resumo.map(r => (
                  <div key={r.id} style={{ display:"flex", flexDirection:"column", gap:6,
                    background:T.blueLight, borderRadius:12, padding:"10px 11px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:16 }}>{r.icon}</span>
                      <span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{r.label}</span>
                    </div>
                    <StatusBadge status={r.status} T={T}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações inteligentes */}
            <div style={cardStyle}>
              <p style={kicker}>💡 Recomendações</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {recomendacoes.map((r,i) => {
                  const ic = r.tipo==="ok" ? "✅" : r.tipo==="atencao" ? "💡" : "⚠️";
                  return (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ fontSize:13, flexShrink:0 }}>{ic}</span>
                      <span style={{ color:T.textMain, fontSize:12.5, lineHeight:1.5 }}>{r.texto}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
