import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { APP_VERSION } from "../../config/app";
import { AppButton, Card, PageHeader } from "../../components/common";
import { exportText, exportBackupJSON, importBackupJSON, toPersistedState } from "../../services/export.service";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta=document.createElement("textarea");
    ta.value=text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

export default function ExportarPage() {
  const { state, setPage, restorePersistedState } = useStore();
  const { theme: T } = useTheme();
  const [formato, setFormato] = useState("compras");
  const [copiado, setCopiado] = useState(false);
  const [backupInfo, setBackupInfo] = useState(false);
  const [importando, setImportando] = useState(false);
  const [importTxt, setImportTxt] = useState("");
  const [importErr, setImportErr] = useState("");

  const texto = exportText(state.items, formato);
  const backupJSON = () => exportBackupJSON(state);

  const copiar = async () => {
    await copyText(texto);
    setCopiado(true);
    setTimeout(()=>setCopiado(false),2500);
  };

  const copiarBackup = async () => {
    await copyText(backupJSON());
    setBackupInfo(true);
  };

  const baixarBackup = () => {
    const blob = new Blob([backupJSON()], { type:"application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nomade-raiz-backup-${new Date().toISOString().slice(0,10)}-v${APP_VERSION}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    try {
      const result = importBackupJSON(importTxt.trim());
      if (result.kind === "full") {
        if (!confirm("Restaurar este backup substituirá os dados atuais do app. Continuar?")) return;
        await restorePersistedState(result.data);
        setImportando(false); setImportTxt(""); setImportErr("");
        alert(`✅ Backup restaurado${result.sourceVersion ? ` (origem v${result.sourceVersion})` : ""}.`);
        return;
      }

      if (!result.items.length) { setImportErr("Backup antigo sem itens para importar."); return; }
      if (!confirm("Este é um backup antigo (somente inventário). Substituir o inventário atual?")) return;
      await restorePersistedState({ ...toPersistedState(state), items:result.items });
      setImportando(false); setImportTxt(""); setImportErr("");
      alert(`✅ Inventário antigo restaurado: ${result.items.length} itens.`);
    } catch (error) {
      setImportErr(error instanceof Error ? error.message : "JSON inválido — cole um backup exportado pelo app.");
    }
  };

  const tabS = id => ({ flex:1, padding:"9px 6px", borderRadius:9, border:"none", cursor:"pointer",
    fontSize:11, fontWeight:700, display:"flex", flexDirection:"column", alignItems:"center", gap:2,
    background:formato===id?T.blue:T.blueChip, color:formato===id?"#fff":T.textSub });

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      <PageHeader eyebrow="Compartilhar" title="Exportar / Importar" onBack={()=>setPage("extras")}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", padding:"12px 13px", gap:10 }}>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button style={tabS("resumo")} onClick={()=>setFormato("resumo")}><span>📊</span><span>Resumo</span></button>
          <button style={tabS("compras")} onClick={()=>setFormato("compras")}><span>🛒</span><span>Compras</span></button>
          <button style={tabS("completo")} onClick={()=>setFormato("completo")}><span>📦</span><span>Completo</span></button>
        </div>

        <Card style={{ flex:1, overflow:"hidden" }}>
          <pre style={{ margin:0, height:"100%", overflowY:"auto", padding:"12px 13px",
            fontSize:11, lineHeight:1.65, color:T.textMain, fontFamily:"'Courier New',monospace",
            whiteSpace:"pre-wrap", wordBreak:"break-word", boxSizing:"border-box" }}>{texto}</pre>
        </Card>

        <AppButton fullWidth onClick={copiar} style={{ background:copiado?T.doneCheck:T.blue }}>
          {copiado?"✅ Copiado! Cole no WhatsApp ou SMS":"📋 Copiar para área de transferência"}
        </AppButton>

        <div style={{ flexShrink:0, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <AppButton variant="secondary" onClick={copiarBackup}>💾 Copiar backup completo</AppButton>
          <AppButton variant="secondary" onClick={baixarBackup}>⬇️ Baixar backup</AppButton>
          <AppButton variant="secondary" onClick={()=>setImportando(true)} style={{ gridColumn:"1 / -1" }}>📥 Restaurar backup JSON</AppButton>
        </div>

        {importando && <div onClick={()=>setImportando(false)} style={{ position:"fixed", inset:0, zIndex:50,
          background:"rgba(0,0,0,.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <Card style={{ width:"100%", maxWidth:480, borderRadius:"22px 22px 0 0", padding:"16px 16px 34px", boxSizing:"border-box" }}>
            <div onClick={e=>e.stopPropagation()}>
              <h3 style={{ color:T.textMain, fontWeight:800, fontSize:16, margin:"0 0 12px" }}>📥 Restaurar backup</h3>
              <textarea value={importTxt} onChange={e=>{ setImportTxt(e.target.value); setImportErr(""); }}
                placeholder="Cole aqui o JSON do backup completo..."
                style={{ width:"100%", height:120, padding:"10px 12px", border:`1.5px solid ${T.border}`,
                  borderRadius:10, fontSize:12, fontFamily:"monospace", resize:"none", outline:"none",
                  color:T.textMain, background:T.blueLight, boxSizing:"border-box", lineHeight:1.4 }}/>
              {importErr && <p style={{ color:T.urgColor, fontSize:12, margin:"6px 0 0" }}>{importErr}</p>}
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <AppButton onClick={handleImport} style={{ flex:1 }}>Restaurar</AppButton>
                <AppButton variant="secondary" onClick={()=>{ setImportando(false); setImportTxt(""); setImportErr(""); }}>Cancelar</AppButton>
              </div>
            </div>
          </Card>
        </div>}

        {backupInfo && <div onClick={()=>setBackupInfo(false)} style={{ position:"fixed", inset:0, zIndex:50,
          background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <Card style={{ padding:20, maxWidth:360, width:"100%" }}>
            <div onClick={e=>e.stopPropagation()}>
              <h3 style={{ color:T.textMain, fontWeight:800, fontSize:16, margin:"0 0 10px" }}>💾 Backup completo copiado</h3>
              <p style={{ color:T.textSub, fontSize:13, lineHeight:1.6, margin:"0 0 16px" }}>
                O backup v{APP_VERSION} inclui inventário, checklist, diário, pontos de apoio, configurações, nota rápida, favoritos e habilidades do manual da bike.
              </p>
              <AppButton fullWidth onClick={()=>setBackupInfo(false)}>Entendido</AppButton>
            </div>
          </Card>
        </div>}
      </div>
    </div>
  );
}
