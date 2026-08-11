export function estadoAutonomia(dias) {
  if (dias === null || dias === undefined) return "indefinido";
  if (dias >= 7) return "boa";
  if (dias >= 3) return "media";
  return "critica";
}

export function corEstado(estado, T) {
  if (estado === "boa")     return { bg:T.doneBg, border:T.doneBorder, color:T.doneCheck };
  if (estado === "media")   return { bg:T.medBg,  border:T.medBorder,  color:T.medColor  };
  if (estado === "critica") return { bg:T.urgBg,  border:T.urgBorder,  color:T.urgColor  };
  return { bg:T.blueLight, border:T.border, color:T.blue }; // neutro / indefinido
}


export function CalcField({ label, value, onChange, placeholder, suffix, T }) {
  return (
    <div>
      <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:"0 0 4px" }}>{label}</p>
      <div style={{ position:"relative" }}>
        <input type="number" min="0" inputMode="decimal" value={value} placeholder={placeholder}
          onChange={e=>onChange(e.target.value)}
          style={{ padding:"10px 34px 10px 12px", border:`1.5px solid ${T.border}`, borderRadius:10,
            fontSize:14, color:T.textMain, background:T.blueLight, outline:"none",
            fontFamily:"inherit", width:"100%", boxSizing:"border-box" }}/>
        {suffix && <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
          fontSize:10.5, color:T.textMuted, fontWeight:700, pointerEvents:"none" }}>{suffix}</span>}
      </div>
    </div>
  );
}


export function ResultBadge({ dias, label, sub, T }) {
  const estado = estadoAutonomia(dias);
  const c = corEstado(estado, T);
  return (
    <div style={{ background:c.bg, border:`1.5px solid ${c.border}`, borderRadius:14,
      padding:"16px", textAlign:"center" }}>
      <p style={{ color:c.color, fontSize:32, fontWeight:900, margin:"0 0 2px", lineHeight:1 }}>
        {dias === null ? "—" : dias}</p>
      <p style={{ color:c.color, fontSize:13, fontWeight:700, margin:0 }}>{label}</p>
      {sub && <p style={{ color:T.textSub, fontSize:11.5, margin:"8px 0 0" }}>{sub}</p>}
    </div>
  );
}
