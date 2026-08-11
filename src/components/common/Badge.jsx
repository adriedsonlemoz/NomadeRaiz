import { useTheme } from "../../hooks";

export function Badge({ type }) {
  const { theme: T } = useTheme();
  const m = {
    urgente:{ bg:T.urgBg, bd:T.urgBorder, c:T.urgColor, lbl:"Urgente" },
    medio:  { bg:T.medBg, bd:T.medBorder, c:T.medColor, lbl:"Médio"   },
    baixo:  { bg:T.lowBg, bd:T.lowBorder, c:T.lowColor, lbl:"Baixo"   },
  }[type];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px",
      borderRadius:99, fontSize:11, fontWeight:700,
      background:m.bg, border:`1.5px solid ${m.bd}`, color:m.c, flexShrink:0 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:m.c }}/>
      {m.lbl}
    </span>
  );
}
