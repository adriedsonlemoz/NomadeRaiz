import React, { type ErrorInfo, type ReactNode } from "react";
import { T as BASE_T } from "../styles/theme";
import { StorageService } from "../services/storage.service";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info });
    console.error("[EB]", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const T = BASE_T;
    const msg = this.state.error?.message ?? "Erro desconhecido";
    const short = (this.state.info?.componentStack ?? "").split("\n").slice(0, 6).join("\n");

    return (
      <div style={{
        height: "100vh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: T.pageBg, padding: 24,
        fontFamily: "'Inter',system-ui,sans-serif",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: T.urgBg, border: `2px solid ${T.urgBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20,
        }}>⚠️</div>
        <h2 style={{ color: T.textMain, fontSize: 18, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>Algo deu errado</h2>
        <p style={{ color: T.textSub, fontSize: 13, margin: "0 0 20px", textAlign: "center", lineHeight: 1.5 }}>
          Erro capturado pelo ErrorBoundary.<br />Seus dados permanecem no armazenamento offline do app.
        </p>
        <div style={{ width: "100%", background: T.white, border: `1.5px solid ${T.urgBorder}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
          <p style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Mensagem</p>
          <p style={{ color: T.urgColor, fontSize: 12, fontFamily: "monospace", margin: 0, wordBreak: "break-word" }}>{msg}</p>
        </div>
        {short && (
          <details style={{ width: "100%", marginBottom: 16 }}>
            <summary style={{ color: T.textMuted, fontSize: 11, cursor: "pointer", padding: "4px 0" }}>Ver stack trace</summary>
            <pre style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: 10,
              fontSize: 10, lineHeight: 1.5, overflowX: "auto", color: T.textSub, marginTop: 6,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>{short}</pre>
          </details>
        )}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button onClick={this.handleReset} style={{
            flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: T.blue,
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>🔄 Tentar novamente</button>
          <button
            onClick={() => { void StorageService.clearAll().finally(() => window.location.reload()); }}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12, border: `1.5px solid ${T.border}`,
              background: T.white, color: T.textSub, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >🗑️ Limpar dados</button>
        </div>
      </div>
    );
  }
}
