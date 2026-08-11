import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { MINIMOS_SUGERIDOS } from "../../constants";

export default function AlertasPage() {
  const { state, setPage, setMinimos } = useStore();
  const { theme: T } = useTheme();
  const [editandoId, setEditandoId] = useState(null);
  const [editVal,    setEditVal]    = useState("");
  const minimos  = state.minimos ?? {};
  const alertas  = state.items.filter(i => { const m=minimos[i.id]; return m!=null && i.quantity<m; });
  const salvar   = id => { const v=parseInt(editVal); if(!isNaN(v)&&v>=0) setMinimos({...minimos,[id]:v}); setEditandoId(null); };
  const sugerir  = () => { const n={...minimos}; Object.entries(MINIMOS_SUGERIDOS).forEach(([id,v])=>{ if(!n[id]) n[id]=v; }); setMinimos(n); };
  const inp = { padding:"5px 8px", border:`1.5px solid ${T.blue}`, borderRadius:7, fontSize:12,
    width:52, outline:"none", fontFamily:"inherit", color:T.textMain, background:T.blueLight };
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      <div style={{ background:T.navy, padding:"14px 14px 18px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1 }}>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Estoque</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Alertas de Reposição</h1>
          </div>
          {alertas.length>0 && (
            <div style={{ background:T.urgColor, borderRadius:99, minWidth:26, height:26,
              display:"flex", alignItems:"center", justifyContent:"center",
              padding:"0 8px", color:"#fff", fontSize:12, fontWeight:800 }}>{alertas.length}</div>
          )}
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"11px 13px", display:"flex", flexDirection:"column", gap:9 }}>
        {alertas.length>0 ? (
          <div style={{ background:T.urgBg, border:`1.5px solid ${T.urgBorder}`, borderRadius:13, padding:"12px 14px" }}>
            <p style={{ color:T.urgColor, fontWeight:800, fontSize:13, margin:"0 0 8px" }}>
              ⚠️ {alertas.length} {alertas.length===1?"item precisa":"itens precisam"} de reposição</p>
            {alertas.map(i=>(
              <div key={i.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"rgba(255,255,255,.6)", borderRadius:8, padding:"6px 10px", marginBottom:4 }}>
                <span style={{ color:T.textMain, fontSize:12, fontWeight:600 }}>{i.name}</span>
                <span style={{ color:T.urgColor, fontSize:11, fontWeight:700 }}>{i.quantity} / mín {minimos[i.id]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:T.doneBg, border:`1.5px solid ${T.doneBorder}`, borderRadius:13,
            padding:"14px", textAlign:"center" }}>
            <p style={{ color:T.doneCheck, fontWeight:800, fontSize:14, margin:0 }}>✅ Tudo dentro do mínimo</p>
          </div>
        )}
        <button onClick={sugerir} style={{ width:"100%", padding:"11px 0", borderRadius:11,
          border:`1.5px dashed ${T.border}`, background:T.blueLight,
          color:T.textSub, fontWeight:600, fontSize:13, cursor:"pointer" }}>
          💡 Aplicar mínimos sugeridos para itens críticos</button>
        <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.15em",
          textTransform:"uppercase", margin:"4px 0 0" }}>Definir mínimos por item</p>
        {state.items.map(item => {
          const min    = minimos[item.id];
          const abaixo = min!=null && item.quantity<min;
          const isEd   = editandoId===item.id;
          return (
            <div key={item.id} style={{ background:abaixo?T.urgBg:T.white,
              border:`1.5px solid ${abaixo?T.urgBorder:T.border}`, borderRadius:11,
              padding:"10px 12px", display:"flex", alignItems:"center", gap:10,
              boxShadow:"0 1px 3px rgba(15,39,68,.05)" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:T.textMain, fontWeight:600, fontSize:12, margin:0,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</p>
                <p style={{ color:T.textMuted, fontSize:10, margin:"1px 0 0" }}>
                  Qtd atual: <b style={{ color:abaixo?T.urgColor:T.doneCheck }}>{item.quantity}</b></p>
              </div>
              {isEd ? (
                <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
                  <input autoFocus style={inp} type="number" min="0" value={editVal}
                    onChange={e=>setEditVal(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter")salvar(item.id); if(e.key==="Escape")setEditandoId(null); }}/>
                  <button onClick={()=>salvar(item.id)} style={{ padding:"5px 9px", borderRadius:7,
                    border:"none", background:T.blue, color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>OK</button>
                  <button onClick={()=>setEditandoId(null)} style={{ padding:"5px 7px", borderRadius:7,
                    border:`1px solid ${T.border}`, background:T.blueLight, color:T.textSub, fontSize:11, cursor:"pointer" }}>✕</button>
                </div>
              ) : (
                <button onClick={()=>{ setEditandoId(item.id); setEditVal(String(min??0)); }}
                  style={{ flexShrink:0, padding:"5px 10px", borderRadius:8, cursor:"pointer",
                    border:`1.5px solid ${min!=null?T.border:T.blueChip}`,
                    background:min!=null?(abaixo?T.urgBg:T.doneBg):T.blueLight,
                    color:min!=null?(abaixo?T.urgColor:T.doneCheck):T.textMuted,
                    fontSize:11, fontWeight:700 }}>
                  {min!=null?`mín ${min}`:"+ definir"}</button>
              )}
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}
