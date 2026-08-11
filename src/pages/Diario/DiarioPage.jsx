import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { DiarioForm } from "./DiarioForm";

export default function DiarioPage() {
  const { state, setPage, addEntrada, delEntrada } = useStore();
  const { theme: T } = useTheme();
  const [showForm,    setShowForm]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [expanded,    setExpanded]    = useState(null);
  const totalKm = state.diario.reduce((s,e)=>s+(Number(e.km)||0),0);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      {showForm && <DiarioForm onSave={e=>{ addEntrada(e); setShowForm(false); }} onClose={()=>setShowForm(false)}/>}
      <div style={{ background:T.navy, padding:"14px 14px 18px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setPage("missao")} style={{ width:34, height:34, borderRadius:9,
            border:"none", background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1 }}>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Histórico</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Diário de Campo</h1>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ width:34, height:34, borderRadius:9,
            border:"none", background:T.blue, color:"#fff", fontSize:20, fontWeight:700,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 8px rgba(37,99,235,.4)" }}>+</button>
        </div>
        <div style={{ marginTop:10, background:"rgba(255,255,255,.08)", borderRadius:10,
          padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"rgba(255,255,255,.6)", fontSize:11 }}>Total pedalado</span>
          <span style={{ color:"#fff", fontWeight:900, fontSize:16 }}>{totalKm.toLocaleString("pt-BR")} km</span>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"11px 13px",
        display:"flex", flexDirection:"column", gap:8 }}>
        {state.diario.length===0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"60px 20px", textAlign:"center" }}>
            <span style={{ fontSize:48, marginBottom:12 }}>📓</span>
            <p style={{ color:T.textSub, fontWeight:600, margin:0 }}>Nenhuma entrada ainda</p>
            <p style={{ color:T.textMuted, fontSize:12, margin:"4px 0 0" }}>Toque no + para registrar o dia</p>
          </div>
        ) : state.diario.map(entrada => {
          const isOpen = expanded===entrada.id;
          const data   = new Date(entrada.createdAt).toLocaleDateString("pt-BR",
            { day:"2-digit", month:"short", year:"numeric" });
          return (
            <div key={entrada.id} style={{ background:T.white,
              border:`1.5px solid ${isOpen?T.blue:T.border}`,
              borderRadius:13, overflow:"hidden", boxShadow:"0 1px 4px rgba(15,39,68,.07)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px",
                cursor:"pointer" }} onClick={()=>setExpanded(isOpen?null:entrada.id)}>
                <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
                  background:T.blueLight, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:20 }}>{entrada.clima}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:T.textMain, fontWeight:700, fontSize:13, margin:0,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {entrada.local||"Local não informado"}</p>
                  <p style={{ color:T.textMuted, fontSize:10, margin:"1px 0 0" }}>{data}</p>
                </div>
                <p style={{ color:T.blue, fontWeight:800, fontSize:13, margin:0, flexShrink:0 }}>
                  {entrada.km||0} km</p>
                <span style={{ color:T.textMuted, fontSize:11, display:"inline-block",
                  transition:"transform .2s", transform:isOpen?"rotate(180deg)":"rotate(0deg)" }}>▾</span>
              </div>
              {isOpen && (
                <div style={{ borderTop:`1px solid ${T.border}`, padding:"11px 13px",
                  display:"flex", flexDirection:"column", gap:8 }}>
                  {entrada.nota && (
                    <p style={{ color:T.textMain, fontSize:13, lineHeight:1.6, margin:0,
                      background:T.blueLight, borderRadius:8, padding:"8px 10px" }}>{entrada.nota}</p>
                  )}
                  {confirmDel===entrada.id ? (
                    <div style={{ display:"flex", gap:7 }}>
                      <button onClick={()=>{ delEntrada(entrada.id); setConfirmDel(null); }}
                        style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none",
                          background:T.urgColor, color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                        Excluir</button>
                      <button onClick={()=>setConfirmDel(null)}
                        style={{ padding:"8px 12px", borderRadius:9, border:`1px solid ${T.border}`,
                          background:T.blueLight, color:T.textSub, fontSize:12, cursor:"pointer" }}>Não</button>
                    </div>
                  ) : (
                    <button onClick={()=>setConfirmDel(entrada.id)}
                      style={{ padding:"8px 12px", borderRadius:9,
                        border:`1.5px solid ${T.urgBorder}`, background:T.urgBg,
                        color:T.urgColor, fontSize:12, cursor:"pointer", alignSelf:"flex-end" }}>
                      🗑️ Excluir entrada</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}
