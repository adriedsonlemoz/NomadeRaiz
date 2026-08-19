import { useStore } from "../../contexts";
import { ModalBase } from "../../components/common";
import { NivelBadge } from "./NivelBadge";
import type { BikePiece } from "../../types";

interface PecaModalProps { peca: BikePiece; onClose: () => void; }

function BulletList({ items, tone='normal' }: { items: readonly string[]; tone?: 'normal'|'warning' }) {
  return <div className="nr-manual-bullet-list" data-tone={tone}>{items.map((item,i)=><div key={`${item}-${i}`} className="nr-manual-bullet"><span>•</span><span>{item}</span></div>)}</div>;
}

export function PecaModal({ peca, onClose }: PecaModalProps) {
  const { state, toggleHabilidade } = useStore();
  const domina = state.habilidadesDominadas.includes(`peca:${peca.id}`);
  return (
    <ModalBase onClose={onClose} header={
      <>
        <div className="nr14-205a42ea"><div className="nr14-90cf018c"><div className="nr14-23bad2d3">{peca.icone}</div><p className="nr14-5adb1188">{peca.nome}</p></div><button onClick={onClose} className="nr14-12e813fe">×</button></div>
        <NivelBadge nivel={peca.nivel}/>
      </>
    }>
      <div><p className="nr-modal-section-label">O que faz</p><p className="nr-modal-section-text">{peca.funcao}</p></div>
      <div><p className="nr-modal-section-label">Problemas comuns</p><div className="nr14-8baf0a16">{peca.problemasComuns.map(p=><span key={p} className="nr14-d9f4b4b4">{p}</span>)}</div></div>
      <div><p className="nr-modal-section-label">👀 Sinais de atenção</p><BulletList items={peca.sinaisAtencao}/></div>
      <div><p className="nr-modal-section-label">🧰 Ferramentas úteis</p><div className="nr14-8baf0a16">{peca.ferramentas.map(f=><span key={f} className="nr14-afd66bb7">🔧 {f}</span>)}</div></div>
      <div className="nr-manual-callout"><p className="nr-manual-callout__title">Antes de mexer</p><BulletList items={peca.antesDeMexer}/></div>
      <div><p className="nr-modal-section-label">Manutenção preventiva</p><p className="nr-modal-section-text">{peca.manutencao}</p></div>
      <div><p className="nr-modal-section-label">Passo a passo</p><div className="nr14-f0a2bbc1">{peca.comoResolver.map((passo,i)=><div key={i} className="nr14-2f1c4700"><span className="nr14-ca775171">{i+1}</span><span className="nr14-a3d6cad3">{passo}</span></div>)}</div></div>
      <div className="nr-manual-stop"><p className="nr-manual-stop__title">🛑 Quando parar e não continuar</p><p>{peca.quandoParar}</p></div>
      <button onClick={()=>toggleHabilidade(`peca:${peca.id}`)} className="nr-skill-action" aria-pressed={domina}>{domina ? "✅ Você já sabe fazer isso" : "☐ Marcar como \"já sei fazer\""}</button>
    </ModalBase>
  );
}
