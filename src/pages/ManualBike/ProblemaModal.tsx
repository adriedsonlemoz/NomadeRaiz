import { useState } from "react";
import { useStore } from "../../contexts";
import { ModalBase } from "../../components/common";
import type { BikeProblem } from "../../types";

interface ProblemaModalProps {
  problema: BikeProblem;
  onClose: () => void;
}

export function ProblemaModal({ problema, onClose }: ProblemaModalProps) {
  const { state, toggleHabilidade, addEntrada } = useStore();
  const [registrado, setRegistrado] = useState(false);
  const domina = state.habilidadesDominadas.includes(`problema:${problema.id}`);

  const registrarNoDiario = () => {
    addEntrada({ local:"Na estrada", clima:"☀️", km:0,
      nota:`🔧 Problema resolvido: ${problema.nome}. ${problema.solucaoDefinitiva}` });
    setRegistrado(true);
  };

  return (
    <ModalBase onClose={onClose} header={
      <div className="nr14-d5bd57bf">
        <div className="nr14-90cf018c">
          <div className="nr14-23bad2d3">{problema.icone}</div>
          <p className="nr14-5adb1188">{problema.nome}</p>
        </div>
        <button onClick={onClose} className="nr14-12e813fe">×</button>
      </div>
    }>
      <div>
        <p className="nr-modal-section-label">Possíveis causas</p>
        <div className="nr14-3b58b3a6">
          {problema.causas.map((c,i) => (
            <div key={i} className="nr14-8fc7e806">
              <span className="nr14-577516c7">•</span>
              <span className="nr14-40c8a219">{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="nr-modal-section-label">Ferramentas necessárias</p>
        <div className="nr14-8baf0a16">
          {problema.ferramentas.map(f => (
            <span key={f} className="nr14-afd66bb7">🔧 {f}</span>
          ))}
        </div>
      </div>
      <div className="nr14-3a4ac8ad">
        <p className="nr14-a24b0185">⏱️ Solução temporária (na estrada)</p>
        <p className="nr14-4218322a">{problema.solucaoTemporaria}</p>
      </div>
      <div className="nr14-6f44bf7e">
        <p className="nr14-002dfa45">✅ Solução definitiva</p>
        <p className="nr14-4218322a">{problema.solucaoDefinitiva}</p>
      </div>

      <div className="nr14-be265379">
        <button onClick={()=>toggleHabilidade(`problema:${problema.id}`)} className="nr-skill-action" aria-pressed={domina}>
          {domina ? "✅ Você já sabe resolver isso" : "☐ Marcar como \"já sei fazer\""}</button>
        <button onClick={registrarNoDiario} disabled={registrado} className="nr-diary-action">
          {registrado ? "✓ Registrado no diário" : "📓 Registrar no diário de bordo"}</button>
      </div>
    </ModalBase>
  );
}
