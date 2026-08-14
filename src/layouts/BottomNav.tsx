import { useStore } from "../contexts";
import { useAlertCount } from "../hooks";
import type { PageId } from "../types";

interface NavTab { id: PageId; icon: string; label: string; }

const EXTRA_PAGES: PageId[] = [
  "calculadora", "pontos", "alertas", "exportar", "dicas", "extras",
  "configuracoes", "sobre", "planejamento", "manual-bike",
];

const TABS: NavTab[] = [
  { id: "missao", icon: "✅", label: "Verificar" },
  { id: "lista", icon: "📋", label: "Lista" },
  { id: "diario", icon: "📓", label: "Diário" },
  { id: "extras", icon: "⚙️", label: "Mais" },
];

export default function BottomNav() {
  const { state, setPage } = useStore();
  const nAlertas = useAlertCount();

  return (
    <nav className="nr-bottom-nav" aria-label="Navegação principal">
      {TABS.map((tab) => {
        const active = state.page === tab.id || (tab.id === "extras" && EXTRA_PAGES.includes(state.page));
        return (
          <button key={tab.id} onClick={() => setPage(tab.id)} className="nr-bottom-nav__tab"
            aria-current={active ? "page" : undefined}>
            <span className="nr-bottom-nav__icon" aria-hidden="true">{tab.icon}</span>
            <span className="nr-bottom-nav__label">{tab.label}</span>
            {tab.id === "extras" && nAlertas > 0 && <span className="nr-bottom-nav__badge">{nAlertas}</span>}
          </button>
        );
      })}
    </nav>
  );
}
