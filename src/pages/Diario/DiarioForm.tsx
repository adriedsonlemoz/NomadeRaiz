import { useState, type CSSProperties, type MouseEvent } from "react";
import { useTheme } from "../../hooks";
import { CLIMAS } from "../../constants/travel";
import type { ClimaIcon, DiarioEntryDraft } from "../../types";

const climas: readonly ClimaIcon[] = CLIMAS;

interface DiarioFormProps {
  onSave: (entrada: DiarioEntryDraft) => void;
  onClose: () => void;
}

export function DiarioForm({ onSave, onClose }: DiarioFormProps) {
  const { theme: T } = useTheme();
  const [local, setLocal] = useState("");
  const [clima, setClima] = useState<ClimaIcon>("☀️");
  const [km,    setKm]    = useState("");
  const [nota,  setNota]  = useState("");
  const inp: CSSProperties = { width:"100%", padding:"11px 13px", border:`1.5px solid ${T.border}`,
    borderRadius:11, fontSize:14, color:T.textMain, background:T.blueLight,
    outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();
  const salvar = () => onSave({ local, clima, km:Number(km)||0, nota });

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:50,
      background:"rgba(0,0,0,.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={stopPropagation} style={{ width:"100%", maxWidth:480,
        background:T.white, borderRadius:"22px 22px 0 0", padding:"8px 18px 34px",
        boxShadow:"0 -8px 40px rgba(15,39,68,.2)" }}>
        <div style={{ width:36, height:4, background:T.border, borderRadius:99, margin:"10px auto 14px" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h2 style={{ color:T.textMain, fontWeight:800, fontSize:17, margin:0 }}>📓 Nova entrada</h2>
          <button onClick={onClose} style={{ background:T.blueChip, border:"none", width:30, height:30,
            borderRadius:7, fontSize:17, cursor:"pointer", color:T.textSub }}>×</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input style={inp} placeholder="Local (cidade, estrada, km...)"
            value={local} onChange={e=>setLocal(e.target.value)}/>
          <div>
            <p style={{ color:T.textMuted, fontSize:11, margin:"0 0 6px" }}>Clima:</p>
            <div style={{ display:"flex", gap:6 }}>
              {climas.map(c=>(
                <button key={c} onClick={()=>setClima(c)} style={{ width:38, height:38, borderRadius:9,
                  border:`1.5px solid ${clima===c?T.blue:T.border}`,
                  background:clima===c?T.blueLight:T.white, fontSize:18, cursor:"pointer" }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ position:"relative" }}>
            <input style={{ ...inp, paddingRight:36 }} placeholder="Km pedalados hoje"
              type="number" min="0" value={km} onChange={e=>setKm(e.target.value)}/>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              color:T.textMuted, fontSize:12 }}>km</span>
          </div>
          <textarea style={{ ...inp, resize:"none", height:80, lineHeight:1.5 }}
            placeholder="Nota do dia (opcional)"
            value={nota} onChange={e=>setNota(e.target.value)}/>
          <button onClick={salvar}
            style={{ width:"100%", padding:"14px 0", borderRadius:13, border:"none",
              background:T.blue, color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer",
              boxShadow:`0 4px 14px rgba(37,99,235,.3)` }}>Salvar entrada</button>
        </div>
      </div>
    </div>
  );
}
