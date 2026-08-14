import { ModalBase } from "../../components/common";
import { GLOSSARIO_BIKE } from "../../constants/manualBike";
import type { ThemeTokens } from "../../styles/theme";

interface GlossarioModalProps {
  onClose: () => void;
  T: ThemeTokens;
}

export function GlossarioModal({ onClose, T }: GlossarioModalProps) {
  return (
    <ModalBase onClose={onClose} header={
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:0 }}>📖 Glossário de Termos</p>
        <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:8, border:"none",
          background:"rgba(255,255,255,.15)", color:"#fff", fontSize:16, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>
    }>
      {GLOSSARIO_BIKE.map(t => (
        <div key={t.id}>
          <p style={{ color:T.blue, fontWeight:700, fontSize:12.5, margin:"0 0 3px" }}>{t.termo}</p>
          <p style={{ color:T.textMain, fontSize:12, lineHeight:1.5, margin:0 }}>{t.definicao}</p>
        </div>
      ))}
    </ModalBase>
  );
}
