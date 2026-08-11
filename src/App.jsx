/**
 * App.jsx — ponto de entrada da UI.
 * Só monta os providers globais e o layout raiz — nenhuma tela, nenhum
 * componente de negócio mora aqui. Toda a lógica está organizada em:
 *   src/contexts/   — estado global (Store e Theme)
 *   src/hooks/       — hooks reutilizáveis
 *   src/services/    — regras de negócio
 *   src/database/    — persistência (Dexie/IndexedDB)
 *   src/utils/       — funções puras (formatação, cálculo)
 *   src/constants/   — dados estáticos e textos fixos
 *   src/types/        — tipos TypeScript
 *   src/components/    — componentes reutilizáveis
 *   src/pages/          — uma pasta por tela
 *   src/layouts/          — casca do app (splash, navegação, error boundary)
 */
import { StoreProvider } from "./contexts";
import { ThemeProvider } from "./contexts";
import { AppShell, ErrorBoundary } from "./layouts";

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ThemeProvider>
          <AppShell/>
        </ThemeProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
