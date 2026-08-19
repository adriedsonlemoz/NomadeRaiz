import { useState } from "react";
import { useStore } from "../../contexts";
import { ModalBase } from "../../components/common";
import type { BikeProblem } from "../../types";

interface ProblemaModalProps { problema: BikeProblem; onClose: () => void; }
const severityLabel: Record<BikeProblem['gravidade'],string>={baixa:'Baixa',media:'Atenção',alta:'Crítica'};

function BulletList({ items, tone='normal' }: { items: readonly string[]; tone?: 'normal'|'danger' }) {
  return <div className="nr-manual-bullet-list" data-tone={tone}>{items.map((item,i)=><div key={`${item}-${i}`} className="nr-manual-bullet"><span>•</span><span>{item}</span></div>)}</div>;
}

export function ProblemaModal({ problema, onClose }: ProblemaModalProps) {
  const { state, toggleHabilidade, addEntrada } = useStore();
  const [registrado, setRegistrado] = useState(false);
  const domina = state.habilidadesDominadas.includes(`problema:${problema.id}`);
  const registrarNoDiario = () => { addEntrada({ local:"Na estrada", clima:"☀️", km:0, nota:`🔧 Problema resolvido: ${problema.nome}. ${problema.solucaoDefinitiva}` }); setRegistrado(true); };

  return (
    <ModalBase onClose={onClose} header={<div className="nr14-d5bd57bf"><div className="nr14-90cf018c"><div className="nr14-23bad2d3">{problema.icone}</div><div><p className="nr14-5adb1188">{problema.nome}</p><span className="nr-manual-severity" data-level={problema.gravidade}>{severityLabel[problema.gravidade]}</span></div></div><button onClick={onClose} className="nr14-12e813fe">×</button></div>}>
      <div><p className="nr-modal-section-label">Possíveis causas</p><BulletList items={problema.causas}/></div>
      <div><p className="nr-modal-section-label">🔎 Diagnóstico rápido</p><BulletList items={problema.diagnostico}/></div>
      <div><p className="nr-modal-section-label">Ferramentas necessárias</p><div className="nr14-8baf0a16">{problema.ferramentas.map(f=><span key={f} className="nr14-afd66bb7">🔧 {f}</span>)}</div></div>
      <div><p className="nr-modal-section-label">O que fazer, em ordem</p><div className="nr14-f0a2bbc1">{problema.passos.map((passo,i)=><div key={i} className="nr14-2f1c4700"><span className="nr14-ca775171">{i+1}</span><span className="nr14-a3d6cad3">{passo}</span></div>)}</div></div>
      <div className="nr14-3a4ac8ad"><p className="nr14-a24b0185">⏱️ Solução temporária (na estrada)</p><p className="nr14-4218322a">{problema.solucaoTemporaria}</p></div>
      <div className="nr14-6f44bf7e"><p className="nr14-002dfa45">✅ Solução definitiva</p><p className="nr14-4218322a">{problema.solucaoDefinitiva}</p></div>
      <div className="nr-manual-stop"><p className="nr-manual-stop__title">🚫 Não faça isso</p><BulletList items={problema.naoFaca} tone="danger"/></div>
      <div className="nr-manual-continue" data-level={problema.gravidade}><p className="nr-manual-continue__title">🚲 Posso continuar a viagem?</p><p>{problema.podeContinuar}</p></div>
      <div className="nr14-be265379"><button onClick={()=>toggleHabilidade(`problema:${problema.id}`)} className="nr-skill-action" aria-pressed={domina}>{domina ? "✅ Você já sabe resolver isso" : "☐ Marcar como \"já sei fazer\""}</button><button onClick={registrarNoDiario} disabled={registrado} className="nr-diary-action">{registrado ? "✓ Registrado no diário" : "📓 Registrar no diário de bordo"}</button></div>
    </ModalBase>
  );
}
