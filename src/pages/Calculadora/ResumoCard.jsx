import { corEstado } from "./CalcAtoms";

export function ResumoCard({ recursos, resultadoGeral, T, onSelect }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {recursos.map(r => {
        const c = corEstado(r.estado, T);
        return (
          <button key={r.id} onClick={()=>onSelect(r.id)} style={{ display:"flex", alignItems:"center", gap:12,
            background:T.white, border:`1.5px solid ${c.border}`, borderRadius:13, padding:"11px 13px",
            cursor:"pointer", textAlign:"left", width:"100%", boxSizing:"border-box" }}>
            <div style={{ width:38, height:38, borderRadius:10, background:c.bg, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{r.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:T.textMain, fontWeight:700, fontSize:13, margin:0 }}>{r.label}</p>
              <p style={{ color:T.textMuted, fontSize:10.5, margin:"1px 0 0" }}>{r.nota}</p>
            </div>
            <div style={{ width:10, height:10, borderRadius:99, background:c.color, flexShrink:0 }}/>
          </button>
        );
      })}
      <div style={{ background:T.navy, borderRadius:16, padding:"20px 16px", textAlign:"center", marginTop:6 }}>
        {resultadoGeral.dias !== null ? (
          <>
            <p style={{ color:"#7ea3d4", fontSize:10, fontWeight:800, letterSpacing:"0.15em",
              textTransform:"uppercase", margin:"0 0 4px" }}>Autonomia estimada</p>
            <p style={{ color:"#fff", fontSize:38, fontWeight:900, margin:0, lineHeight:1 }}>
              {resultadoGeral.dias} <span style={{ fontSize:16, fontWeight:700 }}>dias</span></p>
            <p style={{ color:"#7ea3d4", fontSize:12, margin:"8px 0 0", lineHeight:1.5 }}>
              Com os recursos atuais, sua autonomia estimada é de aproximadamente{" "}
              <b style={{ color:"#fff" }}>{resultadoGeral.dias} dias</b>
              {resultadoGeral.gargalo && <> — limitada por <b style={{ color:"#fff" }}>
                {resultadoGeral.gargalo.label.toLowerCase()}</b></>}.
            </p>
          </>
        ) : (
          <p style={{ color:"#7ea3d4", fontSize:12.5, margin:0, lineHeight:1.6 }}>
            Preencha alimentação, água, energia e dinheiro para ver sua autonomia estimada.</p>
        )}
      </div>
    </div>
  );
}
