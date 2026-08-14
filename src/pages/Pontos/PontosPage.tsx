import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { TIPOS_PONTO } from "../../constants";
import type { Ponto, PontoDraft, PontoTipo } from "../../types";
import { PontoForm } from "./PontoForm";

interface TipoPontoConfig {
  id: PontoTipo;
  icon: string;
  label: string;
}

const tiposPonto: readonly TipoPontoConfig[] = TIPOS_PONTO;

export default function PontosPage() {
  const { state, setPage, addPonto, delPonto, updPonto } = useStore();
  const { theme: T } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Ponto | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<PontoTipo | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const pontos = filtroTipo ? state.pontos.filter(p=>p.tipo===filtroTipo) : state.pontos;

  const salvarPonto = (ponto: PontoDraft) => {
    if (editando) updPonto({ ...editando, ...ponto });
    else addPonto(ponto);
    setShowForm(false);
    setEditando(null);
  };

  const fecharForm = () => {
    setShowForm(false);
    setEditando(null);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      {(showForm || editando !== null) && <PontoForm ponto={editando} onSave={salvarPonto} onClose={fecharForm}/>} 
      <div style={{ background:T.navy, padding:"14px 14px 18px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1 }}>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Offline</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Pontos de Apoio</h1>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.blue, color:"#fff", fontSize:20, fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 8px rgba(37,99,235,.4)" }}>+</button>
        </div>
        <div style={{ display:"flex", gap:5, overflowX:"auto" }}>
          <button onClick={()=>setFiltroTipo(null)} style={{ flexShrink:0, padding:"4px 10px",
            borderRadius:99, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
            background:!filtroTipo?T.blue:T.navyLight, color:!filtroTipo?"#fff":"rgba(255,255,255,.6)" }}>
            Todos</button>
          {tiposPonto.map(t=>(
            <button key={t.id} onClick={()=>setFiltroTipo(filtroTipo===t.id?null:t.id)}
              style={{ flexShrink:0, padding:"4px 10px", borderRadius:99, border:"none", cursor:"pointer",
                fontSize:11, fontWeight:700,
                background:filtroTipo===t.id?T.blue:T.navyLight,
                color:filtroTipo===t.id?"#fff":"rgba(255,255,255,.6)" }}>
              {t.icon} {t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"11px 13px",
        display:"flex", flexDirection:"column", gap:7 }}>
        {pontos.length===0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"60px 20px", textAlign:"center" }}>
            <span style={{ fontSize:48, marginBottom:12 }}>📍</span>
            <p style={{ color:T.textSub, fontWeight:600, margin:0 }}>Nenhum ponto cadastrado</p>
            <p style={{ color:T.textMuted, fontSize:12, margin:"4px 0 0" }}>
              Adicione fontes de água, mercadinhos, campings...</p>
          </div>
        ) : pontos.map(ponto => {
          const tipo = tiposPonto.find(t=>t.id===ponto.tipo) ?? tiposPonto[0];
          return (
            <div key={ponto.id} style={{ background:T.white, border:`1.5px solid ${T.border}`,
              borderRadius:12, padding:"11px 13px", boxShadow:"0 1px 3px rgba(15,39,68,.06)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:T.blueLight,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{tipo?.icon ?? "📍"}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                    <p style={{ color:T.textMain, fontWeight:700, fontSize:13, margin:0 }}>{ponto.nome}</p>
                    <span style={{ color:"#f59e0b", fontSize:11 }}>{"⭐".repeat(ponto.avaliacao)}</span>
                    {ponto.fechado && <span style={{ color:T.urgColor, fontSize:10, fontWeight:700,
                      background:T.urgBg, padding:"1px 6px", borderRadius:6 }}>Fechado</span>}
                  </div>
                  {ponto.referencia && <p style={{ color:T.textMuted, fontSize:11, margin:0, fontStyle:"italic" }}>📌 {ponto.referencia}</p>}
                  {ponto.obs && <p style={{ color:T.textSub, fontSize:11, margin:"4px 0 0" }}>{ponto.obs}</p>}
                </div>
                <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                  <button onClick={()=>setEditando(ponto)} style={{ padding:"5px 8px", borderRadius:7,
                    border:`1px solid ${T.border}`, background:T.blueLight, color:T.textSub, fontSize:11, cursor:"pointer" }}>✏️</button>
                  {confirmDel===ponto.id ? (
                    <>
                      <button onClick={()=>{ delPonto(ponto.id); setConfirmDel(null); }}
                        style={{ padding:"5px 8px", borderRadius:7, border:"none",
                          background:T.urgColor, color:"#fff", fontSize:11, cursor:"pointer" }}>✓</button>
                      <button onClick={()=>setConfirmDel(null)}
                        style={{ padding:"5px 8px", borderRadius:7, border:`1px solid ${T.border}`,
                          background:T.blueLight, color:T.textSub, fontSize:11, cursor:"pointer" }}>✕</button>
                    </>
                  ) : (
                    <button onClick={()=>setConfirmDel(ponto.id)} style={{ padding:"5px 8px",
                      borderRadius:7, border:`1px solid ${T.urgBorder}`, background:T.urgBg,
                      color:T.urgColor, fontSize:11, cursor:"pointer" }}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}
