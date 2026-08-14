import { useCallback, useState, type CSSProperties, type ReactElement } from "react";
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

export default function AppShell() {
  const { state } = useStore();
  const { fontScale } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const onDone = useCallback(() => setSplashDone(true), []);

  const renderPage = (): ReactElement => {
    switch (state.page) {
      case "missao": return <HomePage />;
      case "lista": return <EquipamentosPage />;
      case "dicas": return <DicasPage />;
      case "diario": return <DiarioPage />;
      case "calculadora": return <CalculadoraPage />;
      case "pontos": return <PontosPage />;
      case "alertas": return <AlertasPage />;
      case "exportar": return <ExportarPage />;
      case "extras": return <ExtrasPage />;
      case "configuracoes": return <ConfiguracoesPage />;
      case "sobre": return <SobrePage />;
      case "planejamento": return <PlanejamentoPage />;
      case "manual-bike": return <ManualBikePage />;
      default: return <HomePage />;
    }
  };

  const scale = UI_SCALE[fontScale] ?? 1;
  const compensacao = scale !== 1 ? `${100 / scale}%` : "100%";
  const scaledStyle: CSSProperties = {
    width: compensacao,
    height: compensacao,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
  };

  return (
    <div className="nr-app-shell">
      {!splashDone && <SplashScreen onDone={onDone} />}
      <div className="nr-app-shell__scaled" style={scaledStyle}>
        <div className="nr-app-shell__page">{renderPage()}</div>
        <BottomNav />
      </div>
    </div>
  );
}
