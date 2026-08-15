import { useState, type CSSProperties } from "react";
import { useStore } from "../../contexts";
import { useHaptics } from "../../hooks";
import { VERIFICACOES, MODOS_PERSISTENTES } from "../../constants/checks";
import { Bar } from "../../components/common";
import { DicaModal } from "../Dicas/DicaModal";
import type { DicaModalItem } from "../Dicas/DicaModal";
interface VerificationItem extends DicaModalItem {
  id: string;
  texto: string;
}

interface VerificationConfig {
  icon: string;
  titulo: string;
  cor: string;
  itens: VerificationItem[];
}

type VerificationModeId = keyof typeof VERIFICACOES;

interface ChecklistVerificacaoProps {
  modoId: VerificationModeId;
  onVoltar: () => void;
}

export function ChecklistVerificacao({ modoId, onVoltar }: ChecklistVerificacaoProps) {
  const { state, toggleCheck, resetChecks } = useStore();
  const { light } = useHaptics();
  const [dicaModal, setDicaModal] = useState<DicaModalItem | null>(null);
  const v = VERIFICACOES[modoId] as VerificationConfig;
  if (!v) return null;

  const marcados = state.checks[modoId] ?? {};
  const total = v.itens.length;
  const checked = Object.values(marcados).filter(Boolean).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const isPersistente = MODOS_PERSISTENTES.has(modoId);

  const handleToggle = (id: string) => {
    light();
    toggleCheck(modoId, id);
  };

  return (
    <div className="nr14-bfbf751f nr-checklist" style={{ '--nr-check-accent': v.cor } as CSSProperties}>
      {dicaModal && <DicaModal item={dicaModal} cor={v.cor} onClose={() => setDicaModal(null)}/>} 
      <div className="nr-checklist__header">
        <div className="nr14-8d446200">
          <button onClick={onVoltar} className="nr14-8c82ce11">←</button>
          <div className="nr14-97445a8d">
            <div className="nr14-b88d1817">
              <span className="nr14-4ff818ff">{v.icon}</span>
              <span className="nr14-947ca0f0">{v.titulo}</span>
            </div>
            <p className="nr14-cd5b2958">
              {checked}/{total} verificados
            </p>
          </div>
          <div className="nr14-83c25f97">
            {isPersistente && (
              <span className="nr14-4429e2b3">💾 salvo</span>
            )}
            <button onClick={() => resetChecks(modoId)} className="nr14-2a1b4287">Resetar</button>
          </div>
        </div>
        <Bar pct={pct} h={4} cor="rgba(255,255,255,.8)"/>
      </div>
      <div className="nr14-8bde5484">
        {checked === total && total > 0 && (
          <div className="nr14-f1d5441c">
            <p className="nr14-b7ec0c0f">
              ✅ Tudo verificado — pode ir!</p>
          </div>
        )}
        {v.itens.map(item => {
          const ok = Boolean(marcados[item.id]);
          return (
            <div key={item.id} className="nr-checklist-item" data-checked={ok}>
              <button onClick={() => handleToggle(item.id)} className="nr-checklist-item__toggle">
                {ok && <span className="nr14-e3d83348">✓</span>}
              </button>
              <p className="nr-checklist-item__text">{item.texto}</p>
              {item.dica && (
                <button onClick={() => setDicaModal(item)} className="nr14-679faabd">?</button>
              )}
            </div>
          );
        })}
        <div className="nr14-30de4aee"/>
      </div>
    </div>
  );
}
