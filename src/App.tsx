/**
 * App.tsx — ponto de entrada da UI.
 * Só monta os providers globais e o layout raiz — nenhuma tela, nenhum
 * componente de negócio mora aqui.
 */
import { StoreProvider, ThemeProvider } from "./contexts";
import { AppShell, ErrorBoundary } from "./layouts";

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}
