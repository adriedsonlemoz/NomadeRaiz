import React, { type ErrorInfo, type ReactNode } from "react";
import { StorageService } from "../services/storage.service";

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; info: ErrorInfo | null; }

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> { return { hasError: true, error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info });
    console.error("[EB]", error, info.componentStack);
  }

  private handleReset = (): void => this.setState({ hasError: false, error: null, info: null });

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    const msg = this.state.error?.message ?? "Erro desconhecido";
    const short = (this.state.info?.componentStack ?? "").split("\n").slice(0, 6).join("\n");

    return (
      <div className="nr-error-boundary">
        <div className="nr-error-boundary__icon">⚠️</div>
        <h2 className="nr-error-boundary__title">Algo deu errado</h2>
        <p className="nr-error-boundary__copy">Erro capturado pelo ErrorBoundary.<br />Seus dados permanecem no armazenamento offline do app.</p>
        <div className="nr-error-boundary__message">
          <p className="nr-error-boundary__label">Mensagem</p>
          <p className="nr-error-boundary__error">{msg}</p>
        </div>
        {short && (
          <details className="nr-error-boundary__details">
            <summary className="nr-error-boundary__summary">Ver stack trace</summary>
            <pre className="nr-error-boundary__stack">{short}</pre>
          </details>
        )}
        <div className="nr-error-boundary__actions">
          <button onClick={this.handleReset} className="nr-btn nr-btn--primary">🔄 Tentar novamente</button>
          <button onClick={() => { void StorageService.clearAll().finally(() => window.location.reload()); }}
            className="nr-btn nr-btn--secondary">🗑️ Limpar dados</button>
        </div>
      </div>
    );
  }
}
