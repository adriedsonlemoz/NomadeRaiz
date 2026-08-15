import type { ChangeEvent, MouseEvent } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";

interface NotaRapidaModalProps {
  onClose: () => void;
}

export function NotaRapidaModal({ onClose }: NotaRapidaModalProps) {
  const { state, setNota } = useStore();
  const { theme: T } = useTheme();

  return (
    <div onClick={onClose} className="nr14-140a07f4">
      <div onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()} className="nr14-51aea9db">
        <div className="nr14-e44ae5c5">
          <div className="nr14-b87ca324">
            <div className="nr14-a28a87fd">📝</div>
            <p className="nr14-09c9d8e2">Nota rápida do dia</p>
          </div>
          <button onClick={onClose} className="nr14-12e813fe">×</button>
        </div>
        <div className="nr14-bb1d98a1">
          <textarea autoFocus
            value={state.notaRapida}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNota(event.target.value)}
            placeholder="Registre algo rápido aqui... (salvo automaticamente)"
            className="nr14-64296daf"/>
        </div>
        <div className="nr14-a66d88e8">
          <button onClick={onClose} className="nr14-ed90327e">Concluído</button>
        </div>
      </div>
    </div>
  );
}
