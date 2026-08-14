import { useStore } from "../contexts";
import { useAlertCount, useTheme } from "../hooks";
import type { PageId } from "../types";

interface NavTab {
  id: PageId;
  icon: string;
  label: string;
}

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
  const { theme: T } = useTheme();
  const nAlertas = useAlertCount();

  return (
    <nav style={{ borderTop: `1px solid ${T.border}`, background: T.white, display: "flex", padding: "6px 4px 10px", gap: 2, flexShrink: 0 }}>
      {TABS.map((tab) => {
        const active = state.page === tab.id || (tab.id === "extras" && EXTRA_PAGES.includes(state.page));
        return (
          <button key={tab.id} onClick={() => setPage(tab.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            padding: "5px 2px", borderRadius: 10, border: "none", cursor: "pointer",
            background: active ? T.blueLight : "transparent", color: active ? T.blue : T.textMuted,
            transition: "all .15s", position: "relative",
          }}>
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, marginTop: 2, lineHeight: 1 }}>{tab.label}</span>
            {tab.id === "extras" && nAlertas > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 8, background: T.urgColor, color: "#fff",
                borderRadius: 99, fontSize: 8, fontWeight: 800, padding: "1px 4px", minWidth: 14, textAlign: "center",
              }}>{nAlertas}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
