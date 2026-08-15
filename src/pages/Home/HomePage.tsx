import { useState, type CSSProperties } from "react";
import { useStore } from "../../contexts";
import { useTheme, useDiasNaEstrada } from "../../hooks";
import { globalStats } from "../../services/equipment.service";
import { fmt } from "../../utils/format";
import { Ring, Bar } from "../../components/common";
import { MODOS, VERIFICACOES } from "../../constants/checks";
import { ChecklistVerificacao } from "./ChecklistVerificacao";
import { NotaRapidaModal } from "./NotaRapidaModal";
import { APP_NAME } from "../../config/app";

type VerificationModeId = keyof typeof VERIFICACOES;

export default function HomePage() {
  const { state, setPage, setModo } = useStore();
  const { theme: T } = useTheme();
  const [verificando, setVerificando] = useState<VerificationModeId | null>(null);
  const [notaAberta, setNotaAberta] = useState(false);
  const dias = useDiasNaEstrada();

  if (verificando) {
    return <ChecklistVerificacao modoId={verificando} onVoltar={() => setVerificando(null)} />;
  }

  const stats = globalStats(state.items);
  const pct = stats.total > 0 ? Math.round((stats.comprados / stats.total) * 100) : 0;
  const temNota = Boolean(state.notaRapida?.trim());

  return (
    <div className="nr14-e075080e">
      {notaAberta && <NotaRapidaModal onClose={() => setNotaAberta(false)} />}

      <div className="nr14-3af10ef5">
        <div className="nr14-5f8e5495">🚲</div>
        <div className="nr14-768a9905">
          <div className="nr14-5cdd8f67">
            <p className="nr14-fb2bfcd3">{APP_NAME}</p>
            <h1 className="nr14-d8cc31d7">
              Qual é a missão?</h1>
          </div>
          <div className="nr14-8cd7de91">
            {dias > 0 && (
              <div className="nr14-38aa0d91">
                <p className="nr14-7703f0fd">{dias}</p>
                <p className="nr14-09a883be">dias</p>
              </div>
            )}
            <button onClick={() => setNotaAberta(true)} className="nr14-7adc70ee">
              📝
              {temNota && <span className="nr14-f977f683"/>} 
            </button>
            <button onClick={() => setPage("dicas")} className="nr14-e6665318">🧠</button>
          </div>
        </div>
      </div>

      <div className="nr14-de469bf8">
        <div className="nr14-8dc6cacf">
          <Ring pct={pct}/>
          <div className="nr14-41a423fd">
            <div className="nr14-a3d12b9b">
              <span className="nr14-44aaf5d8">Inventário</span>
              <span className="nr14-4a3190e6">{stats.comprados}/{stats.total}</span>
            </div>
            <Bar pct={pct}/>
            <div className="nr14-a3d12b9b">
              <span className="nr14-a9ae942a">Investimento total</span>
              <span className="nr14-95845075">{fmt(stats.valorTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="nr14-7070dbab">Verificações Rápidas</p>

      <div className="nr14-9e2bb541">
        {MODOS.map(modo => {
          const modoId = modo.id as VerificationModeId;
          const v = VERIFICACOES[modoId];
          const isAtivo = state.modoAtivo === modo.id;
          return (
            <button key={modo.id}
              onClick={() => { setModo(modoId); setVerificando(modoId); }}
              className="nr-home-mode" data-active={isAtivo}
              style={{
                '--nr-mode-accent': modo.cor,
                '--nr-mode-soft': `${modo.cor}18`,
                '--nr-mode-chip': `${modo.cor}12`,
                '--nr-mode-shadow': `${modo.cor}33`,
              } as CSSProperties}>
              <span aria-hidden="true" className="nr14-9c037214">{modo.icon}</span>
              <div className="nr14-dbc405f1">
                <div className="nr-home-mode__icon">
                  {modo.icon}
                </div>
                <span className="nr-home-mode__count">{v?.itens.length ?? 0}</span>
              </div>
              <div className="nr14-908961d5">
                <p className="nr14-74c1185d">
                  {modo.label}</p>
                <p className="nr14-1435232f">
                  {modo.desc}</p>
              </div>
            </button>
          );
        })}

        <button onClick={() => setPage("lista")} className="nr14-5146140f">
          <span aria-hidden="true" className="nr14-520ed2da">📋</span>
          <div className="nr14-dbc405f1">
            <div className="nr14-635ddd8a">📋</div>
            {stats.pendentes > 0 && (
              <span className="nr14-dd885a94">{stats.pendentes}</span>
            )}
          </div>
          <div className="nr14-908961d5">
            <p className="nr14-6b63eab1">
              Equipamentos</p>
            <p className="nr14-ce2d7267">Ver lista completa</p>
          </div>
        </button>
      </div>
    </div>
  );
}
