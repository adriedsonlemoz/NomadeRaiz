import { Bar } from "../common";
import { fmt } from "../../utils/format";

// CategoryCard — card de categoria usado na grade principal de Equipamentos.
// Extraído da grade que antes ficava inline em ListaPage, sem mudar nada do
// visual ou do comportamento.
export function CategoryCard({ cat, cs, hasUrgent, onClick, T }) {
  const cpct = cs.total > 0 ? Math.round((cs.comprados / cs.total) * 100) : 0;
  const done = cs.total > 0 && cs.comprados === cs.total;

  return (
    <button onClick={onClick} style={{
      background: done ? T.doneBg : T.white,
      border:`1.5px solid ${hasUrgent ? T.urgBorder : done ? T.doneBorder : T.border}`,
      borderRadius:13, padding:"9px 10px",
      display:"flex", flexDirection:"column", justifyContent:"space-between", gap:6,
      cursor:"pointer", textAlign:"left", boxSizing:"border-box",
      boxShadow: hasUrgent
        ? `0 2px 12px ${T.urgColor}22`
        : done
          ? "0 2px 8px rgba(22,163,74,.1)"
          : "0 2px 8px rgba(15,39,68,.07)",
      transition:"all .2s", minHeight:90,
    }}>
      {/* Ícone + nome */}
      <div style={{ display:"flex", alignItems:"center", gap:7, width:"100%" }}>
        <div style={{ width:30, height:30, borderRadius:9, flexShrink:0,
          background: done ? "rgba(22,163,74,.1)" : hasUrgent ? T.urgBg : T.blueLight,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
          {cat.icon}
        </div>
        <p style={{ color: done ? T.doneCheck : T.textMain,
          fontWeight:800, fontSize:12, margin:0, lineHeight:1.2, minWidth:0,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {cat.label}</p>
      </div>

      {/* Progresso + valor */}
      <div style={{ width:"100%" }}>
        <Bar pct={cpct} h={3}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ color:T.textMuted, fontSize:9.5 }}>{cs.comprados}/{cs.total}</span>
          <span style={{ color: done ? T.doneCheck : T.blue,
            fontWeight:700, fontSize:9.5 }}>{fmt(cs.valor)}</span>
        </div>
      </div>
    </button>
  );
}
