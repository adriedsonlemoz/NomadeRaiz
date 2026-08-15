import { ModalBase } from "../../components/common";
import { GLOSSARIO_BIKE } from "../../constants/manualBike";

interface GlossarioModalProps {
  onClose: () => void;
}

export function GlossarioModal({ onClose }: GlossarioModalProps) {
  return (
    <ModalBase onClose={onClose} header={
      <div className="nr14-d5bd57bf">
        <p className="nr14-5adb1188">📖 Glossário de Termos</p>
        <button onClick={onClose} className="nr14-12e813fe">×</button>
      </div>
    }>
      {GLOSSARIO_BIKE.map(t => (
        <div key={t.id}>
          <p className="nr14-68d65c6d">{t.termo}</p>
          <p className="nr14-2bfcc216">{t.definicao}</p>
        </div>
      ))}
    </ModalBase>
  );
}
