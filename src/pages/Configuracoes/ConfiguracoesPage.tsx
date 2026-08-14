import type { ReactNode } from "react";
import { useStore } from "../../contexts";
import { useTheme, useDiasNaEstrada } from "../../hooks";
import { StorageService } from "../../services/storage.service";
import { APP_NAME, APP_TAGLINE, APP_VERSION } from "../../config/app";
import { AppButton, BicycleIcon, Card, PageHeader, SectionLabel } from "../../components/common";
import type { FontScale } from "../../types";

interface RowProps { label: string; children: ReactNode; }
function SettingsRow({ label, children }: RowProps) {
  return <div className="nr-settings-row"><span className="nr-settings-row__label">{label}</span>{children}</div>;
}

interface FontBtnProps { scale: FontScale; label: string; active: boolean; onSelect: (scale: FontScale) => void; }
function FontButton({ scale, label, active, onSelect }: FontBtnProps) {
  return <button onClick={() => onSelect(scale)} className="nr-settings-font" data-size={scale} aria-pressed={active}>{label}</button>;
}

export default function ConfiguracoesPage() {
  const { state, setPage, setSettings } = useStore();
  const { theme: T, isDark, fontScale } = useTheme();
  const dias = useDiasNaEstrada();

  const toggleTheme = () => setSettings({ themeMode: isDark ? "light" : "dark" });
  const setFont = (scale: FontScale) => setSettings({ fontScale: scale });

  const iniciarViagem = () => {
    if (state.settings.startDate && !window.confirm("Isso vai resetar o contador de dias. Confirmar?")) return;
    setSettings({ startDate: Date.now() });
  };
  const resetarViagem = () => { if (window.confirm("Zerar o contador de dias na estrada?")) setSettings({ startDate: null }); };
  const apagarDados = async () => {
    if (!window.confirm("⚠️ Isso apagará TODOS os dados salvos neste dispositivo. Continuar?")) return;
    await StorageService.clearAll();
    window.location.reload();
  };

  return (
    <div className="nr-page">
      <PageHeader eyebrow="App" title="Configurações" onBack={() => setPage("extras")} />
      <div className="nr-page-scroll">
        <SectionLabel>Aparência</SectionLabel>
        <Card className="nr-settings-card-pad">
          <SettingsRow label="Modo escuro">
            <button type="button" role="switch" aria-label="Alternar modo escuro" aria-checked={isDark}
              onClick={toggleTheme} className="nr-settings-toggle" />
          </SettingsRow>
          <SettingsRow label="Tamanho da fonte">
            <div className="nr-settings-fonts">
              <FontButton scale="sm" label="A" active={fontScale === "sm"} onSelect={setFont} />
              <FontButton scale="md" label="A" active={fontScale === "md"} onSelect={setFont} />
              <FontButton scale="lg" label="A" active={fontScale === "lg"} onSelect={setFont} />
            </div>
          </SettingsRow>
        </Card>

        <SectionLabel>Viagem</SectionLabel>
        <Card className="nr-settings-card-pad">
          <SettingsRow label="Dias na estrada">
            <div className="nr-settings-trip-count"><span className="nr-settings-trip-value">{dias}</span><span className="nr-settings-trip-unit">dias</span></div>
          </SettingsRow>
          <div className="nr-settings-actions">
            <AppButton onClick={iniciarViagem}>{state.settings.startDate ? "🔄 Reiniciar viagem" : "🚀 Iniciar viagem"}</AppButton>
            {state.settings.startDate && <AppButton variant="danger" onClick={resetarViagem}>Zerar</AppButton>}
          </div>
          {state.settings.startDate && <p className="nr-settings-note">Iniciado em: {new Date(state.settings.startDate).toLocaleDateString("pt-BR")}</p>}
        </Card>

        <SectionLabel>Dados</SectionLabel>
        <Card className="nr-settings-card-pad">
          <SettingsRow label="Itens no inventário"><span className="nr-settings-count">{state.items.length}</span></SettingsRow>
          <SettingsRow label="Entradas no diário"><span className="nr-settings-count">{state.diario.length}</span></SettingsRow>
          <SettingsRow label="Pontos de apoio"><span className="nr-settings-count">{state.pontos.length}</span></SettingsRow>
          <div className="nr-settings-danger"><AppButton variant="danger" fullWidth onClick={apagarDados}>🗑️ Apagar todos os dados</AppButton></div>
        </Card>

        <SectionLabel>Sobre</SectionLabel>
        <Card className="nr-settings-about">
          <BicycleIcon size={40} color={T.blue} />
          <p className="nr-settings-about__name">{APP_NAME}</p>
          <p className="nr-settings-about__tagline">{APP_TAGLINE}</p>
          <p className="nr-settings-about__version">v{APP_VERSION} · Offline-first · React + Capacitor</p>
        </Card>
      </div>
    </div>
  );
}
