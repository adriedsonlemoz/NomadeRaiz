import { useCallback, useState, type ReactElement } from "react";
import { useStore } from "../contexts";
import { useTheme } from "../hooks";
import { UI_SCALE } from "../styles/theme";
import SplashScreen from "./SplashScreen";
import BottomNav from "./BottomNav";

import HomePage from "../pages/Home";
import EquipamentosPage from "../pages/Equipamentos";
import DicasPage from "../pages/Dicas";
import DiarioPage from "../pages/Diario";
import CalculadoraPage from "../pages/Calculadora";
import PontosPage from "../pages/Pontos";
import AlertasPage from "../pages/Alertas";
import ExportarPage from "../pages/Exportar";
import ExtrasPage from "../pages/Extras";
import ConfiguracoesPage from "../pages/Configuracoes";
import SobrePage from "../pages/Sobre";
import PlanejamentoPage from "../pages/Planejamento";
import ManualBikePage from "../pages/ManualBike";

// Layout raiz do app: splash screen, escala de fonte e roteamento simples por state.page.
export default function AppShell() {
  const { state } = useStore();
  const { theme: T, fontScale } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const onDone = useCallback(() => setSplashDone(true), []);

  const renderPage = (): ReactElement => {
    switch (state.page) {
      case "missao":        return <HomePage />;
      case "lista":         return <EquipamentosPage />;
      case "dicas":         return <DicasPage />;
      case "diario":        return <DiarioPage />;
      case "calculadora":   return <CalculadoraPage />;
      case "pontos":        return <PontosPage />;
      case "alertas":       return <AlertasPage />;
      case "exportar":      return <ExportarPage />;
      case "extras":        return <ExtrasPage />;
      case "configuracoes": return <ConfiguracoesPage />;
      case "sobre":         return <SobrePage />;
      case "planejamento":  return <PlanejamentoPage />;
      case "manual-bike":   return <ManualBikePage />;
      default:               return <HomePage />;
    }
  };

  const scale = UI_SCALE[fontScale] ?? 1;
  const compensacao = scale !== 1 ? `${100 / scale}%` : "100%";

  return (
    <div style={{
      height: "100vh", maxWidth: 480, margin: "0 auto", background: T.pageBg,
      overflow: "hidden", position: "relative", fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      {!splashDone && <SplashScreen onDone={onDone} />}
      <div style={{
        width: compensacao, height: compensacao,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {renderPage()}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
