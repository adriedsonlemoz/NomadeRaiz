import { useStore } from "../../contexts";
import { useTheme, useDiasNaEstrada } from "../../hooks";
import { StorageService } from "../../services/storage.service";
import { APP_NAME, APP_TAGLINE, APP_VERSION } from "../../config/app";
import { AppButton, BicycleIcon, Card, PageHeader, SectionLabel } from "../../components/common";

export default function ConfiguracoesPage() {
  const { state, setPage, setSettings } = useStore();
  const { theme: T, isDark, fontScale } = useTheme();
  const dias = useDiasNaEstrada();

  const toggleTheme = () => setSettings({ themeMode: isDark ? "light" : "dark" });
  const setFont = (fontScale) => setSettings({ fontScale });

  const iniciarViagem = () => {
    if (state.settings.startDate && !confirm("Isso vai resetar o contador de dias. Confirmar?")) return;
    setSettings({ startDate: Date.now() });
  };

  const resetarViagem = () => {
    if (confirm("Zerar o contador de dias na estrada?")) setSettings({ startDate: null });
  };

  const apagarDados = async () => {
    if (!confirm("⚠️ Isso apagará TODOS os dados salvos neste dispositivo. Continuar?")) return;
    await StorageService.clearAll();
    window.location.reload();
  };

  const Row = ({ label, children }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${T.border}` }}>
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
      <PageHeader eyebrow="App" title="Configurações" onBack={()=>setPage("extras")}/>

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 32px" }}>
        <SectionLabel>Aparência</SectionLabel>
        <Card style={{ padding:"0 14px" }}>
          <Row label="Modo escuro">
            <button aria-label="Alternar modo escuro" onClick={toggleTheme} style={{ position:"relative", width:48, height:26,
              borderRadius:99, border:"none", cursor:"pointer", background:isDark?T.blue:T.blueChip, transition:"background .3s" }}>
              <div style={{ position:"absolute", top:3, left:isDark?24:3, width:20, height:20, borderRadius:"50%",
                background:"#fff", transition:"left .3s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
            </button>
          </Row>
          <Row label="Tamanho da fonte">
            <div style={{ display:"flex", gap:6 }}>
              <FontBtn scale="sm" label="A"/>
              <FontBtn scale="md" label="A"/>
              <FontBtn scale="lg" label="A"/>
            </div>
          </Row>
        </Card>

        <SectionLabel>Viagem</SectionLabel>
        <Card style={{ padding:"0 14px" }}>
          <Row label="Dias na estrada">
            <div style={{ textAlign:"right" }}>
              <span style={{ color:T.blue, fontWeight:900, fontSize:20 }}>{dias}</span>
              <span style={{ color:T.textMuted, fontSize:11, marginLeft:4 }}>dias</span>
            </div>
          </Row>
          <div style={{ padding:"12px 0", borderBottom:`1px solid ${T.border}`, display:"flex", gap:8 }}>
            <AppButton onClick={iniciarViagem} style={{ flex:1 }}>
              {state.settings.startDate?"🔄 Reiniciar viagem":"🚀 Iniciar viagem"}
            </AppButton>
            {state.settings.startDate && <AppButton variant="danger" onClick={resetarViagem}>Zerar</AppButton>}
          </div>
          {state.settings.startDate && <div style={{ padding:"10px 0" }}>
            <p style={{ color:T.textMuted, fontSize:11, margin:0 }}>
              Iniciado em: {new Date(state.settings.startDate).toLocaleDateString("pt-BR")}
            </p>
          </div>}
        </Card>

        <SectionLabel>Dados</SectionLabel>
        <Card style={{ padding:"0 14px" }}>
          <Row label="Itens no inventário"><span style={{ color:T.blue, fontWeight:700 }}>{state.items.length}</span></Row>
          <Row label="Entradas no diário"><span style={{ color:T.blue, fontWeight:700 }}>{state.diario.length}</span></Row>
          <Row label="Pontos de apoio"><span style={{ color:T.blue, fontWeight:700 }}>{state.pontos.length}</span></Row>
          <div style={{ padding:"14px 0" }}>
            <AppButton variant="danger" fullWidth onClick={apagarDados}>🗑️ Apagar todos os dados</AppButton>
          </div>
        </Card>

        <SectionLabel>Sobre</SectionLabel>
        <Card style={{ padding:14, textAlign:"center" }}>
          <BicycleIcon size={40} color={T.blue}/>
          <p style={{ color:T.textMain, fontWeight:900, fontSize:18, margin:"8px 0 2px" }}>{APP_NAME}</p>
          <p style={{ color:T.textMuted, fontSize:12, margin:0 }}>{APP_TAGLINE}</p>
          <p style={{ color:T.textMuted, fontSize:10, margin:"8px 0 0" }}>
            v{APP_VERSION} · Offline-first · React + Capacitor
          </p>
        </Card>
      </div>
    </div>
  );
}
