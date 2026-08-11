import { useStore } from "../../contexts";
import { ModalBase } from "../../components/common";
import { NivelBadge } from "./NivelBadge";

export function PecaModal({ peca, onClose, T }) {
  const { state, toggleHabilidade } = useStore();
  const domina = state.habilidadesDominadas.includes(`peca:${peca.id}`);
  const sectionLabel = { color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:"0.1em",
    textTransform:"uppercase", margin:"0 0 6px" };
  const sectionText  = { color:T.textMain, fontSize:13, lineHeight:1.6, margin:0 };
  return (
    <ModalBase T={T} onClose={onClose} header={
      <>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:"rgba(255,255,255,.12)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{peca.icone}</div>
            <p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:0 }}>{peca.nome}</p>
          </div>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:8, border:"none",
            background:"rgba(255,255,255,.15)", color:"#fff", fontSize:16, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <NivelBadge nivel={peca.nivel} T={T}/>
      </>
    }>
      <div>
        <p style={sectionLabel}>Função</p>
        <p style={sectionText}>{peca.funcao}</p>
      </div>
      <div>
        <p style={sectionLabel}>Problemas comuns</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {peca.problemasComuns.map(p => (
            <span key={p} style={{ background:T.urgBg, border:`1px solid ${T.urgBorder}`, color:T.urgColor,
              fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:99 }}>{p}</span>
          ))}
        </div>
      </div>
      <div>
        <p style={sectionLabel}>Manutenção</p>
        <p style={sectionText}>{peca.manutencao}</p>
      </div>
      <div>
        <p style={sectionLabel}>Como resolver</p>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {peca.comoResolver.map((passo,i) => (
            <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
              <span style={{ flexShrink:0, width:18, height:18, borderRadius:99, background:T.blueLight,
                color:T.blue, fontSize:10, fontWeight:800, display:"flex", alignItems:"center",
                justifyContent:"center", marginTop:1 }}>{i+1}</span>
              <span style={{ color:T.textMain, fontSize:12.5, lineHeight:1.55 }}>{passo}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>toggleHabilidade(`peca:${peca.id}`)} style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        background:domina?T.doneBg:T.blueLight, border:`1.5px solid ${domina?T.doneBorder:T.border}`,
        borderRadius:12, padding:"11px 0", cursor:"pointer",
        color:domina?T.doneCheck:T.textSub, fontWeight:700, fontSize:12.5 }}>
        {domina ? "✅ Você já sabe fazer isso" : "☐ Marcar como \"já sei fazer\""}</button>
    </ModalBase>
  );
}
