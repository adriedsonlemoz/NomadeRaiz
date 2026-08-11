import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { exportText, exportQRData, importQRData } from "../../services/export.service";

export default function ExportarPage() {
  const { state, setPage } = useStore();
  const { theme: T } = useTheme();
  const [formato,  setFormato]  = useState("compras");
  const [copiado,  setCopiado]  = useState(false);
  const [showQR,   setShowQR]   = useState(false);
  const [importando, setImportando] = useState(false);
  const [importTxt,  setImportTxt]  = useState("");
  const [importErr,  setImportErr]  = useState("");
  const { addItem } = useStore();

  const texto = exportText(state.items, formato);

  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); }
    catch { const ta=document.createElement("textarea"); ta.value=texto;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
    setCopiado(true); setTimeout(()=>setCopiado(false),2500);
  };

  const handleImport = () => {
    const items = importQRData(importTxt.trim());
    if (!items) { setImportErr("JSON inválido — cole o conteúdo exportado pelo app"); return; }
    items.forEach(i => addItem(i));
    setImportando(false); setImportTxt(""); setImportErr("");
    alert(`✅ ${items.length} itens importados com sucesso!`);
  };

  const tabS = id => ({ flex:1, padding:"9px 6px", borderRadius:9, border:"none", cursor:"pointer",
    fontSize:11, fontWeight:700, display:"flex", flexDirection:"column", alignItems:"center", gap:2,
    background:formato===id?T.blue:T.blueChip, color:formato===id?"#fff":T.textSub });

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      <div style={{ background:T.navy, padding:"14px 14px 18px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1 }}>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Compartilhar</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Exportar / Importar</h1>
          </div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", padding:"12px 13px", gap:10 }}>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button style={tabS("resumo")}   onClick={()=>setFormato("resumo")}><span>📊</span><span>Resumo</span></button>
          <button style={tabS("compras")}  onClick={()=>setFormato("compras")}><span>🛒</span><span>Compras</span></button>
          <button style={tabS("completo")} onClick={()=>setFormato("completo")}><span>📦</span><span>Completo</span></button>
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <pre style={{ margin:0, height:"100%", overflowY:"auto", background:T.white,
            border:`1.5px solid ${T.border}`, borderRadius:12, padding:"12px 13px",
            fontSize:11, lineHeight:1.65, color:T.textMain, fontFamily:"'Courier New',monospace",
            whiteSpace:"pre-wrap", wordBreak:"break-word", boxSizing:"border-box" }}>{texto}</pre>
        </div>
        <button onClick={copiar} style={{ flexShrink:0, width:"100%", padding:"14px 0", borderRadius:13,
          border:"none", background:copiado?T.doneCheck:T.blue, color:"#fff", fontWeight:800,
          fontSize:14, cursor:"pointer", transition:"background .3s",
          boxShadow:`0 4px 14px ${copiado?"rgba(22,163,74,.35)":"rgba(37,99,235,.3)"}` }}>
          {copiado?"✅ Copiado! Cole no WhatsApp ou SMS":"📋 Copiar para área de transferência"}</button>

        {/* Backup/Restore JSON */}
        <div style={{ flexShrink:0, display:"flex", gap:8 }}>
          <button onClick={()=>{ const d=exportQRData(state.items); navigator.clipboard?.writeText(d).catch(()=>{}); setShowQR(true); }}
            style={{ flex:1, padding:"11px 0", borderRadius:11, border:`1.5px solid ${T.border}`,
              background:T.white, color:T.textSub, fontWeight:600, fontSize:12, cursor:"pointer" }}>
            💾 Backup JSON</button>
          <button onClick={()=>setImportando(true)}
            style={{ flex:1, padding:"11px 0", borderRadius:11, border:`1.5px solid ${T.border}`,
              background:T.white, color:T.textSub, fontWeight:600, fontSize:12, cursor:"pointer" }}>
            📥 Importar JSON</button>
        </div>

        {/* Modal importação */}
        {importando && (
          <div onClick={()=>setImportando(false)} style={{ position:"fixed", inset:0, zIndex:50,
            background:"rgba(0,0,0,.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
            <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:480, background:T.white,
              borderRadius:"22px 22px 0 0", padding:"16px 16px 34px", boxShadow:"0 -8px 40px rgba(15,39,68,.2)" }}>
              <h3 style={{ color:T.textMain, fontWeight:800, fontSize:16, margin:"0 0 12px" }}>📥 Importar JSON</h3>
              <textarea value={importTxt} onChange={e=>{ setImportTxt(e.target.value); setImportErr(""); }}
                placeholder='Cole aqui o JSON exportado pelo app (backup completo)...'
                style={{ width:"100%", height:120, padding:"10px 12px", border:`1.5px solid ${T.border}`,
                  borderRadius:10, fontSize:12, fontFamily:"monospace", resize:"none", outline:"none",
                  color:T.textMain, background:T.blueLight, boxSizing:"border-box", lineHeight:1.4 }}/>
              {importErr && <p style={{ color:T.urgColor, fontSize:12, margin:"6px 0 0" }}>{importErr}</p>}
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <button onClick={handleImport} style={{ flex:1, padding:"12px 0", borderRadius:11, border:"none",
                  background:T.blue, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>Importar</button>
                <button onClick={()=>{ setImportando(false); setImportTxt(""); setImportErr(""); }}
                  style={{ padding:"12px 16px", borderRadius:11, border:`1.5px solid ${T.border}`,
                    background:T.white, color:T.textSub, fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {showQR && (
          <div onClick={()=>setShowQR(false)} style={{ position:"fixed", inset:0, zIndex:50,
            background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:T.white, borderRadius:18,
              padding:20, maxWidth:360, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
              <h3 style={{ color:T.textMain, fontWeight:800, fontSize:16, margin:"0 0 10px" }}>💾 Backup JSON copiado!</h3>
              <p style={{ color:T.textSub, fontSize:13, lineHeight:1.6, margin:"0 0 16px" }}>
                O JSON do seu inventário foi copiado para a área de transferência.<br/>
                Cole em um bloco de notas ou e-mail para guardar o backup.<br/>
                Para restaurar: use o botão "Importar JSON".
              </p>
              <button onClick={()=>setShowQR(false)} style={{ width:"100%", padding:"12px 0", borderRadius:11,
                border:"none", background:T.blue, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Entendido</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
