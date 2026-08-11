import { useStore } from "../../contexts";
import { useTheme, useDiasNaEstrada } from "../../hooks";
import { StorageService } from "../../services/storage.service";

export default function ConfiguracoesPage() {
  const { state, setPage, setSettings } = useStore();
  const { theme: T, isDark, fontScale } = useTheme();
  const dias = useDiasNaEstrada();

  const toggleTheme = () =>
    setSettings({ themeMode: isDark ? "light" : "dark" });

  const setFont = (f) => setSettings({ fontScale: f });

  const iniciarViagem = () => {
    if (state.settings.startDate) {
      if (!confirm("Isso vai resetar o contador de dias. Confirmar?")) return;
    }
    setSettings({ startDate: Date.now() });
  };

  const resetarViagem = () => {
    if (confirm("Zerar o contador de dias na estrada?"))
      setSettings({ startDate: null });
  };

  const Row = ({ label, children }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"14px 0", borderBottom:`1px solid ${T.border}` }}>
      <span style={{ color:T.textMain, fontSize:14, fontWeight:500 }}>{label}</span>
      {children}
    </div>
  );

  const FontBtn = ({ scale, label }) => (
    <button onClick={()=>setFont(scale)} style={{ padding:"7px 14px", borderRadius:9,
      border:`1.5px solid ${fontScale===scale?T.blue:T.border}`,
      background:fontScale===scale?T.blueLight:T.white,
      color:fontScale===scale?T.blue:T.textSub,
      fontSize:scale==="sm"?11:scale==="md"?13:15,
      fontWeight:700, cursor:"pointer" }}>{label}</button>
  );

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      {/* Header */}
      <div style={{ background:T.navy, padding:"14px 14px 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9,
            border:"none", background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>App</p>
            <h1 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>Configurações</h1>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 32px" }}>

        {/* Aparência */}
        <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.15em",
          textTransform:"uppercase", margin:"18px 0 4px" }}>Aparência</p>
        <div style={{ background:T.white, borderRadius:14, padding:"0 14px",
          border:`1px solid ${T.border}` }}>
          <Row label="Modo escuro">
            <button onClick={toggleTheme} style={{ position:"relative", width:48, height:26,
              borderRadius:99, border:"none", cursor:"pointer",
              background:isDark?T.blue:T.blueChip, transition:"background .3s" }}>
              <div style={{ position:"absolute", top:3,
                left:isDark?24:3, width:20, height:20, borderRadius:"50%",
                background:"#fff", transition:"left .3s",
                boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
            </button>
          </Row>
          <Row label="Tamanho da fonte">
            <div style={{ display:"flex", gap:6 }}>
              <FontBtn scale="sm" label="A"/>
              <FontBtn scale="md" label="A"/>
              <FontBtn scale="lg" label="A"/>
            </div>
          </Row>
        </div>

        {/* Viagem */}
        <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.15em",
          textTransform:"uppercase", margin:"18px 0 4px" }}>Viagem</p>
        <div style={{ background:T.white, borderRadius:14, padding:"0 14px",
          border:`1px solid ${T.border}` }}>
          <Row label="Dias na estrada">
            <div style={{ textAlign:"right" }}>
              <span style={{ color:T.blue, fontWeight:900, fontSize:20 }}>{dias}</span>
              <span style={{ color:T.textMuted, fontSize:11, marginLeft:4 }}>dias</span>
            </div>
          </Row>
          <div style={{ padding:"12px 0", borderBottom:`1px solid ${T.border}`,
            display:"flex", gap:8 }}>
            <button onClick={iniciarViagem} style={{ flex:1, padding:"10px 0", borderRadius:10,
              border:"none", background:T.blue, color:"#fff", fontWeight:700,
              fontSize:13, cursor:"pointer" }}>
              {state.settings.startDate?"🔄 Reiniciar viagem":"🚀 Iniciar viagem"}</button>
            {state.settings.startDate && (
              <button onClick={resetarViagem} style={{ padding:"10px 14px", borderRadius:10,
                border:`1.5px solid ${T.urgBorder}`, background:T.urgBg,
                color:T.urgColor, fontWeight:600, fontSize:12, cursor:"pointer" }}>Zerar</button>
            )}
          </div>
          {state.settings.startDate && (
            <div style={{ padding:"10px 0" }}>
              <p style={{ color:T.textMuted, fontSize:11, margin:0 }}>
                Iniciado em: {new Date(state.settings.startDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>

        {/* Dados */}
        <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.15em",
          textTransform:"uppercase", margin:"18px 0 4px" }}>Dados</p>
        <div style={{ background:T.white, borderRadius:14, padding:"0 14px",
          border:`1px solid ${T.border}` }}>
          <Row label="Itens no inventário">
            <span style={{ color:T.blue, fontWeight:700 }}>{state.items.length}</span>
          </Row>
          <Row label="Entradas no diário">
            <span style={{ color:T.blue, fontWeight:700 }}>{state.diario.length}</span>
          </Row>
          <Row label="Pontos de apoio">
            <span style={{ color:T.blue, fontWeight:700 }}>{state.pontos.length}</span>
          </Row>
          <div style={{ padding:"14px 0" }}>
            <button onClick={()=>{ if(confirm("⚠️ Isso apagará TODOS os dados. Continuar?")) {
                StorageService.clearAll().finally(() => { localStorage.clear(); window.location.reload(); });
              } }}
              style={{ width:"100%", padding:"12px 0", borderRadius:10,
                border:`1.5px solid ${T.urgBorder}`, background:T.urgBg,
                color:T.urgColor, fontWeight:700, fontSize:13, cursor:"pointer" }}>
              🗑️ Apagar todos os dados</button>
          </div>
        </div>

        {/* Sobre */}
        <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.15em",
          textTransform:"uppercase", margin:"18px 0 4px" }}>Sobre</p>
        <div style={{ background:T.white, borderRadius:14, padding:"14px",
          border:`1px solid ${T.border}`, textAlign:"center" }}>
          <BicycleIcon size={40} color={T.blue}/>
          <p style={{ color:T.textMain, fontWeight:900, fontSize:18, margin:"8px 0 2px" }}>Nômade</p>
          <p style={{ color:T.textMuted, fontSize:12, margin:0 }}>Autonomia & Sobrevivência</p>
          <p style={{ color:T.textMuted, fontSize:10, margin:"8px 0 0" }}>
            v1.0.0 · Offline-first · React + Capacitor
          </p>
        </div>
      </div>
    </div>
  );
}
