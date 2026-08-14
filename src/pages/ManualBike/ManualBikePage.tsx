import { useState, useEffect, type ChangeEvent, type CSSProperties } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import {
  AREAS_BIKE, PECAS_BIKE, PROBLEMAS_ESTRADA, KIT_MINIMO_FERRAMENTAS,
  GLOSSARIO_BIKE, KIT_FERRAMENTA_PARA_ITEM,
} from "../../constants";
import { PecaModal } from "./PecaModal";
import { ProblemaModal } from "./ProblemaModal";
import { GlossarioModal } from "./GlossarioModal";
import type { BikePiece, BikeProblem } from "../../types";

export default function ManualBikePage() {
  const { state, setPage, setManualBikeAlvo } = useStore();
  const { theme: T } = useTheme();
  const [pecaAberta, setPecaAberta]         = useState<BikePiece | null>(null);
  const [problemaAberto, setProblemaAberto] = useState<BikeProblem | null>(null);
  const [glossarioAberto, setGlossarioAberto] = useState(false);
  const [busca, setBusca] = useState("");

  // Chegando de outra tela (ex.: "ver como resolver" no Planejamento) — abre
  // a ficha certa direto, sem o usuário precisar procurar.
  useEffect(() => {
    if (!state.manualBikeAlvo) return;
    const { tipo, id } = state.manualBikeAlvo;
    if (tipo === "peca") {
      const p = PECAS_BIKE.find(x => x.id === id);
      if (p) setPecaAberta(p);
    } else {
      const p = PROBLEMAS_ESTRADA.find(x => x.id === id);
      if (p) setProblemaAberto(p);
    }
    setManualBikeAlvo(null);
  }, [state.manualBikeAlvo, setManualBikeAlvo]);

  const cardStyle: CSSProperties = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16,
    padding:"16px", boxShadow:"0 1px 5px rgba(15,39,68,.06)", boxSizing:"border-box" };
  const kicker: CSSProperties = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:"0.12em",
    textTransform:"uppercase", margin:"0 0 10px", display:"flex", alignItems:"center", gap:6 };

  const termoBusca = busca.trim().toLowerCase();
  const buscando = termoBusca.length > 0;
  const pecasFiltradas     = PECAS_BIKE.filter(p => p.nome.toLowerCase().includes(termoBusca));
  const problemasFiltrados = PROBLEMAS_ESTRADA.filter(p => p.nome.toLowerCase().includes(termoBusca));
  const termosFiltrados    = GLOSSARIO_BIKE.filter(t => t.termo.toLowerCase().includes(termoBusca));

  // "Antes de Sair" — cruza o kit mínimo com o que já está no inventário
  const kitComStatus = KIT_MINIMO_FERRAMENTAS.map(k => {
    const itemId = KIT_FERRAMENTA_PARA_ITEM[k.id];
    const item = itemId ? state.items.find(i => i.id === itemId) : null;
    return { ...k, status: item ? item.status : null };
  });
  const kitPossui = kitComStatus.filter(k => k.status === "comprado").length;
  const kitRastreado = kitComStatus.filter(k => k.status !== null).length;

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.pageBg }}>
      {pecaAberta      && <PecaModal peca={pecaAberta} onClose={()=>setPecaAberta(null)} T={T}/>}
      {problemaAberto  && <ProblemaModal problema={problemaAberto} onClose={()=>setProblemaAberto(null)} T={T}/>}
      {glossarioAberto && <GlossarioModal onClose={()=>setGlossarioAberto(false)} T={T}/>}

      <div style={{ background:T.navy, padding:"16px 16px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Educativo</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>🚲 Manual da Bike</h1>
          </div>
        </div>
        <p style={{ color:"#7ea3d4", fontSize:12, margin:"0 0 12px", lineHeight:1.5 }}>
          Conheça sua bicicleta e aprenda a resolver os problemas mais comuns na estrada.</p>
        <input value={busca} onChange={(e: ChangeEvent<HTMLInputElement>)=>setBusca(e.target.value)}
          placeholder="🔎 Buscar peça, problema ou termo..."
          style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:"none",
            background:"rgba(255,255,255,.12)", color:"#fff", fontSize:13, outline:"none",
            fontFamily:"inherit", boxSizing:"border-box" }}/>
      </div>

      <div style={{ padding:"14px 14px 32px", display:"flex", flexDirection:"column", gap:14 }}>

        {buscando ? (
          <>
            {/* Resultados da busca — lista simples, sem agrupamento por área */}
            {pecasFiltradas.length > 0 && (
              <div style={cardStyle}>
                <p style={kicker}><span>🔧</span>Peças</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {pecasFiltradas.map(p => (
                    <button key={p.id} onClick={()=>setPecaAberta(p)} style={{ display:"flex", alignItems:"center",
                      gap:9, background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:11,
                      padding:"9px 11px", cursor:"pointer", textAlign:"left" }}>
                      <span style={{ fontSize:16 }}>{p.icone}</span>
                      <span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{p.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {problemasFiltrados.length > 0 && (
              <div style={cardStyle}>
                <p style={kicker}><span>🛠️</span>Problemas na Estrada</p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {problemasFiltrados.map(p => (
                    <button key={p.id} onClick={()=>setProblemaAberto(p)} style={{ display:"flex", alignItems:"center",
                      gap:9, background:T.white, border:`1px solid ${T.border}`, borderRadius:11,
                      padding:"9px 11px", cursor:"pointer", textAlign:"left" }}>
                      <span style={{ fontSize:16 }}>{p.icone}</span>
                      <span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{p.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {termosFiltrados.length > 0 && (
              <div style={cardStyle}>
                <p style={kicker}><span>📖</span>Glossário</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {termosFiltrados.map(t => (
                    <div key={t.id}>
                      <p style={{ color:T.blue, fontWeight:700, fontSize:12, margin:"0 0 2px" }}>{t.termo}</p>
                      <p style={{ color:T.textMain, fontSize:11.5, lineHeight:1.5, margin:0 }}>{t.definicao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!pecasFiltradas.length && !problemasFiltrados.length && !termosFiltrados.length && (
              <p style={{ color:T.textMuted, fontSize:12.5, textAlign:"center", padding:"24px 10px" }}>
                Nada encontrado para "{busca}".</p>
            )}
          </>
        ) : (
          <>
            {/* Peças por área */}
            {AREAS_BIKE.map(area => (
              <div key={area.id} style={cardStyle}>
                <p style={kicker}><span>{area.icone}</span>{area.label}</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(90px, 1fr))", gap:8 }}>
                  {PECAS_BIKE.filter(p => p.area === area.id).map(p => {
                    const domina = state.habilidadesDominadas.includes(`peca:${p.id}`);
                    return (
                      <button key={p.id} onClick={()=>setPecaAberta(p)} style={{
                        position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                        background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:12,
                        padding:"11px 8px", cursor:"pointer" }}>
                        {domina && <span style={{ position:"absolute", top:5, right:5, fontSize:10 }}>✅</span>}
                        <span style={{ fontSize:20 }}>{p.icone}</span>
                        <span style={{ color:T.textMain, fontWeight:700, fontSize:10.5, textAlign:"center", lineHeight:1.25 }}>
                          {p.nome}</span>
                        <span style={{ fontSize:9 }}>
                          {p.nivel==="basico"?"🟢":p.nivel==="intermediario"?"🟡":"🔴"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Problemas na estrada */}
            <div style={cardStyle}>
              <p style={kicker}><span>🛠️</span>Problemas na Estrada</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {PROBLEMAS_ESTRADA.map(p => {
                  const domina = state.habilidadesDominadas.includes(`problema:${p.id}`);
                  return (
                    <button key={p.id} onClick={()=>setProblemaAberto(p)} style={{
                      position:"relative", display:"flex", alignItems:"center", gap:8, background:T.white,
                      border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 11px",
                      cursor:"pointer", textAlign:"left", boxShadow:"0 1px 4px rgba(15,39,68,.05)" }}>
                      <span style={{ fontSize:17, flexShrink:0 }}>{p.icone}</span>
                      <span style={{ color:T.textMain, fontWeight:700, fontSize:11.5, lineHeight:1.25 }}>{p.nome}</span>
                      {domina && <span style={{ position:"absolute", top:5, right:6, fontSize:10 }}>✅</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Glossário — atalho */}
            <button onClick={()=>setGlossarioAberto(true)} style={{ ...cardStyle,
              display:"flex", alignItems:"center", gap:10, cursor:"pointer", width:"100%", textAlign:"left" }}>
              <span style={{ fontSize:20 }}>📖</span>
              <div style={{ minWidth:0 }}>
                <p style={{ color:T.textMain, fontWeight:700, fontSize:13, margin:0 }}>Glossário de Termos</p>
                <p style={{ color:T.textMuted, fontSize:10.5, margin:"1px 0 0" }}>
                  {GLOSSARIO_BIKE.length} termos técnicos explicados de forma simples</p>
              </div>
            </button>

            {/* Kit mínimo de ferramentas */}
            <div style={cardStyle}>
              <p style={kicker}><span>🧰</span>Kit Mínimo de Ferramentas</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {KIT_MINIMO_FERRAMENTAS.map(k => (
                  <div key={k.id} style={{ display:"flex", alignItems:"center", gap:10,
                    background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:11, padding:"9px 11px" }}>
                    <span style={{ fontSize:17, flexShrink:0 }}>{k.icone}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ color:T.textMain, fontWeight:700, fontSize:12, margin:0 }}>{k.nome}</p>
                      <p style={{ color:T.textMuted, fontSize:10.5, margin:"1px 0 0", lineHeight:1.35 }}>{k.motivo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Antes de sair — cruza o kit com o inventário já cadastrado */}
            <div style={cardStyle}>
              <p style={kicker}><span>🎒</span>Antes de Sair</p>
              <p style={{ color:T.textMuted, fontSize:10.5, margin:"-6px 0 10px" }}>
                Cruza o kit mínimo com o que já está marcado no seu checklist.</p>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ color:T.textSub, fontSize:12.5 }}>Já confirmados</span>
                <span style={{ color:T.doneCheck, fontWeight:800, fontSize:13 }}>
                  {kitPossui}/{kitRastreado} rastreados</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {kitComStatus.map(k => (
                  <div key={k.id} style={{ display:"flex", alignItems:"center", gap:9,
                    background: k.status==="comprado" ? T.doneBg : k.status==="pendente" ? T.urgBg : T.blueLight,
                    border:`1px solid ${k.status==="comprado"?T.doneBorder:k.status==="pendente"?T.urgBorder:T.border}`,
                    borderRadius:10, padding:"8px 10px" }}>
                    <span style={{ fontSize:15, flexShrink:0 }}>{k.icone}</span>
                    <span style={{ flex:1, color:T.textMain, fontSize:12 }}>{k.nome}</span>
                    <span style={{ fontSize:11, fontWeight:700,
                      color: k.status==="comprado" ? T.doneCheck : k.status==="pendente" ? T.urgColor : T.textMuted }}>
                      {k.status==="comprado" ? "✅ Tenho" : k.status==="pendente" ? "⚠️ Falta" : "— Não rastreado"}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
