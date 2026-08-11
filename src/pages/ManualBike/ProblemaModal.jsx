import { useState } from "react";
import { useStore } from "../../contexts";
import { ModalBase } from "../../components/common";

export function ProblemaModal({ problema, onClose, T }) {
  const { state, toggleHabilidade, addEntrada } = useStore();
  const [registrado, setRegistrado] = useState(false);
  const domina = state.habilidadesDominadas.includes(`problema:${problema.id}`);
  const sectionLabel = { color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.1em",
    textTransform:"uppercase", margin:"0 0 6px" };

  const registrarNoDiario = () => {
    addEntrada({ local:"Na estrada", clima:"", km:0,
      nota:`🔧 Problema resolvido: ${problema.nome}. ${problema.solucaoDefinitiva}` });
    setRegistrado(true);
  };

  return (
    <ModalBase T={T} onClose={onClose} header={
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
          <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:"rgba(255,255,255,.12)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{problema.icone}</div>
          <p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:0 }}>{problema.nome}</p>
        </div>
        <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:8, border:"none",
          background:"rgba(255,255,255,.15)", color:"#fff", fontSize:16, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>
    }>
      <div>
        <p style={sectionLabel}>Possíveis causas</p>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {problema.causas.map((c,i) => (
            <div key={i} style={{ display:"flex", gap:7, alignItems:"flex-start" }}>
              <span style={{ color:T.textMuted, fontSize:12, marginTop:1 }}>•</span>
              <span style={{ color:T.textMain, fontSize:12.5, lineHeight:1.5 }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p style={sectionLabel}>Ferramentas necessárias</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {problema.ferramentas.map(f => (
            <span key={f} style={{ background:T.blueLight, border:`1px solid ${T.border}`, color:T.blue,
              fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:99 }}>🔧 {f}</span>
          ))}
        </div>
      </div>
      <div style={{ background:T.medBg, border:`1px solid ${T.medBorder}`, borderRadius:12, padding:"11px 13px" }}>
        <p style={{ color:T.medColor, fontSize:10, fontWeight:800, letterSpacing:"0.08em",
          textTransform:"uppercase", margin:"0 0 4px" }}>⏱️ Solução temporária (na estrada)</p>
        <p style={{ color:T.textMain, fontSize:12.5, lineHeight:1.55, margin:0 }}>{problema.solucaoTemporaria}</p>
      </div>
      <div style={{ background:T.doneBg, border:`1px solid ${T.doneBorder}`, borderRadius:12, padding:"11px 13px" }}>
        <p style={{ color:T.doneCheck, fontSize:10, fontWeight:800, letterSpacing:"0.08em",
          textTransform:"uppercase", margin:"0 0 4px" }}>✅ Solução definitiva</p>
        <p style={{ color:T.textMain, fontSize:12.5, lineHeight:1.55, margin:0 }}>{problema.solucaoDefinitiva}</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <button onClick={()=>toggleHabilidade(`problema:${problema.id}`)} style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          background:domina?T.doneBg:T.blueLight, border:`1.5px solid ${domina?T.doneBorder:T.border}`,
          borderRadius:12, padding:"11px 0", cursor:"pointer",
          color:domina?T.doneCheck:T.textSub, fontWeight:700, fontSize:12.5 }}>
          {domina ? "✅ Você já sabe resolver isso" : "☐ Marcar como \"já sei fazer\""}</button>
        <button onClick={registrarNoDiario} disabled={registrado} style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          background:registrado?T.doneBg:T.navy, border:"none", borderRadius:12, padding:"11px 0",
          cursor:registrado?"default":"pointer",
          color:registrado?T.doneCheck:"#fff", fontWeight:700, fontSize:12.5 }}>
          {registrado ? "✓ Registrado no diário" : "📓 Registrar no diário de bordo"}</button>
      </div>
    </ModalBase>
  );
}
