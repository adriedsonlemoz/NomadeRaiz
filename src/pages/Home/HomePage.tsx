import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme, useDiasNaEstrada } from "../../hooks";
import { globalStats } from "../../services/equipment.service";
import { fmt } from "../../utils/format";
import { Ring, Bar } from "../../components/common";
import { MODOS, VERIFICACOES } from "../../constants/checks";
import { ChecklistVerificacao } from "./ChecklistVerificacao";
import { NotaRapidaModal } from "./NotaRapidaModal";
import { APP_NAME } from "../../config/app";

type VerificationModeId = keyof typeof VERIFICACOES;

export default function HomePage() {
  const { state, setPage, setModo } = useStore();
  const { theme: T } = useTheme();
  const [verificando, setVerificando] = useState<VerificationModeId | null>(null);
  const [notaAberta, setNotaAberta] = useState(false);
  const dias = useDiasNaEstrada();

  if (verificando) {
    return <ChecklistVerificacao modoId={verificando} onVoltar={() => setVerificando(null)} />;
  }

  const stats = globalStats(state.items);
  const pct = stats.total > 0 ? Math.round((stats.comprados / stats.total) * 100) : 0;
  const temNota = Boolean(state.notaRapida?.trim());

  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column",
      overflow:"hidden", background:T.pageBg }}>
      {notaAberta && <NotaRapidaModal onClose={() => setNotaAberta(false)} />}

      <div style={{ flexShrink:0, background:T.navy, padding:"16px 16px 13px", position:"relative" }}>
        <div style={{ position:"absolute", top:-10, right:-10, fontSize:56,
          opacity:.05, transform:"rotate(-10deg)", pointerEvents:"none" }}>🚲</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800,
              letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 2px" }}>{APP_NAME}</p>
            <h1 style={{ color:"#fff", fontSize:19, fontWeight:900, margin:0, lineHeight:1.2 }}>
              Qual é a missão?</h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            {dias > 0 && (
              <div style={{ background:"rgba(255,255,255,.1)", borderRadius:10, padding:"5px 9px",
                textAlign:"center" }}>
                <p style={{ color:"#fff", fontWeight:900, fontSize:15, margin:0, lineHeight:1 }}>{dias}</p>
                <p style={{ color:"#7ea3d4", fontSize:7.5, margin:0 }}>dias</p>
              </div>
            )}
            <button onClick={() => setNotaAberta(true)} style={{ position:"relative", width:34, height:34,
              borderRadius:10, border:"none", background:"rgba(255,255,255,.1)", color:"#fff",
              fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              📝
              {temNota && <span style={{ position:"absolute", top:-2, right:-2, width:8, height:8,
                borderRadius:99, background:T.urgColor, border:`1.5px solid ${T.navy}` }}/>} 
            </button>
            <button onClick={() => setPage("dicas")} style={{ width:34, height:34,
              borderRadius:10, border:"none", background:"rgba(255,255,255,.1)", color:"#fff",
              fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>🧠</button>
          </div>
        </div>
      </div>

      <div style={{ flexShrink:0, padding:"10px 14px 0" }}>
        <div style={{ background:T.white, borderRadius:13, padding:"10px 13px",
          boxShadow:"0 4px 16px rgba(15,39,68,.12)", border:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", gap:11 }}>
          <Ring pct={pct}/>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:4, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:T.textSub, fontSize:11 }}>Inventário</span>
              <span style={{ color:T.textMain, fontWeight:800, fontSize:11 }}>{stats.comprados}/{stats.total}</span>
            </div>
            <Bar pct={pct}/>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:T.textMuted, fontSize:10 }}>Investimento total</span>
              <span style={{ color:T.blue, fontWeight:700, fontSize:10 }}>{fmt(stats.valorTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <p style={{ flexShrink:0, color:T.textMuted, fontSize:9.5, fontWeight:800, letterSpacing:"0.15em",
        textTransform:"uppercase", margin:"10px 14px 6px" }}>Verificações Rápidas</p>

      <div style={{ flex:1, minHeight:0, padding:"0 14px 10px", display:"grid",
        gridTemplateColumns:"1fr 1fr", gridTemplateRows:"repeat(3, 1fr)", gap:8 }}>
        {MODOS.map(modo => {
          const modoId = modo.id as VerificationModeId;
          const v = VERIFICACOES[modoId];
          const isAtivo = state.modoAtivo === modo.id;
          return (
            <button key={modo.id}
              onClick={() => { setModo(modoId); setVerificando(modoId); }}
              style={{ background:T.white, border:`1.5px solid ${isAtivo ? modo.cor : T.border}`,
                borderRadius:14, padding:"10px 11px", minHeight:0, overflow:"hidden", position:"relative",
                display:"flex", flexDirection:"column", justifyContent:"space-between",
                cursor:"pointer", textAlign:"left", boxSizing:"border-box",
                boxShadow:isAtivo ? `0 2px 14px ${modo.cor}33` : "0 1px 4px rgba(15,39,68,.07)",
                transition:"all .2s" }}>
              <span aria-hidden="true" style={{ position:"absolute", right:-5, bottom:-12, fontSize:52,
                opacity:.055, filter:"grayscale(1)", transform:"rotate(-10deg)", pointerEvents:"none", userSelect:"none" }}>{modo.icon}</span>
              <div style={{ display:"flex", position:"relative", zIndex:1, justifyContent:"space-between",
                alignItems:"flex-start", width:"100%" }}>
                <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                  background:`${modo.cor}18`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                  {modo.icon}
                </div>
                <span style={{ fontSize:8, fontWeight:700, color:modo.cor,
                  background:`${modo.cor}12`, border:`1px solid ${modo.cor}30`,
                  padding:"2px 5px", borderRadius:99 }}>{v?.itens.length ?? 0}</span>
              </div>
              <div style={{ minWidth:0, position:"relative", zIndex:1 }}>
                <p style={{ color:T.textMain, fontWeight:800, fontSize:12, margin:"0 0 1px", lineHeight:1.2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {modo.label}</p>
                <p style={{ color:T.textMuted, fontSize:9.5, margin:0, lineHeight:1.25,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {modo.desc}</p>
              </div>
            </button>
          );
        })}

        <button onClick={() => setPage("lista")} style={{ background:T.navy, border:"none",
          borderRadius:14, padding:"10px 11px", minHeight:0, overflow:"hidden", position:"relative",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          cursor:"pointer", textAlign:"left", boxSizing:"border-box" }}>
          <span aria-hidden="true" style={{ position:"absolute", right:-6, bottom:-13, fontSize:54, opacity:.09,
            filter:"grayscale(1)", transform:"rotate(-10deg)", pointerEvents:"none", userSelect:"none" }}>📋</span>
          <div style={{ display:"flex", position:"relative", zIndex:1, justifyContent:"space-between", alignItems:"flex-start", width:"100%" }}>
            <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
              background:"rgba(255,255,255,.12)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>📋</div>
            {stats.pendentes > 0 && (
              <span style={{ fontSize:8, fontWeight:700, color:"#fff",
                background:"rgba(255,255,255,.15)", padding:"2px 5px", borderRadius:99 }}>{stats.pendentes}</span>
            )}
          </div>
          <div style={{ minWidth:0, position:"relative", zIndex:1 }}>
            <p style={{ color:"#fff", fontWeight:800, fontSize:12, margin:"0 0 1px", lineHeight:1.2 }}>
              Equipamentos</p>
            <p style={{ color:"#7ea3d4", fontSize:9.5, margin:0, lineHeight:1.25 }}>Ver lista completa</p>
          </div>
        </button>
      </div>
    </div>
  );
}
