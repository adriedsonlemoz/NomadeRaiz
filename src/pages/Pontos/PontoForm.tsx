import { useState, type CSSProperties, type MouseEvent } from "react";
import { useTheme } from "../../hooks";
import { TIPOS_PONTO } from "../../constants";
import type { Ponto, PontoAvaliacao, PontoDraft, PontoTipo } from "../../types";

interface TipoPontoConfig {
  id: PontoTipo;
  icon: string;
  label: string;
}

const tiposPonto: readonly TipoPontoConfig[] = TIPOS_PONTO;
const avaliacoes: readonly PontoAvaliacao[] = [1,2,3];

interface PontoFormProps {
  ponto?: Ponto | null;
  onSave: (ponto: PontoDraft) => void;
  onClose: () => void;
}

export function PontoForm({ ponto, onSave, onClose }: PontoFormProps) {
  const { theme: T } = useTheme();
  const [tipo, setTipo] = useState<PontoTipo>(ponto?.tipo ?? "agua");
  const [nome, setNome] = useState(ponto?.nome ?? "");
  const [referencia, setRef] = useState(ponto?.referencia ?? "");
  const [obs, setObs] = useState(ponto?.obs ?? "");
  const [avaliacao, setAvaliacao] = useState<PontoAvaliacao>(ponto?.avaliacao ?? 2);
  const [fechado, setFechado] = useState(ponto?.fechado ?? false);
  const inp: CSSProperties = { width:"100%", padding:"10px 12px", border:`1.5px solid ${T.border}`, borderRadius:10,
    fontSize:13, color:T.textMain, background:T.blueLight, outline:"none",
    boxSizing:"border-box", fontFamily:"inherit" };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => event.stopPropagation();
  const salvar = () => {
    if (!nome.trim()) return;
    onSave({ tipo, nome:nome.trim(), referencia, obs, avaliacao, fechado });
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:50,
      background:"rgba(0,0,0,.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={stopPropagation} style={{ width:"100%", maxWidth:480,
        background:T.white, borderRadius:"22px 22px 0 0", padding:"8px 16px 34px",
        boxShadow:"0 -8px 40px rgba(15,39,68,.2)" }}>
        <div style={{ width:36, height:4, background:T.border, borderRadius:99, margin:"10px auto 12px" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <h2 style={{ color:T.textMain, fontWeight:800, fontSize:16, margin:0 }}>
            {ponto?"✏️ Editar ponto":"📍 Novo ponto"}</h2>
          <button onClick={onClose} style={{ background:T.blueChip, border:"none", width:28,
            height:28, borderRadius:7, fontSize:16, cursor:"pointer", color:T.textSub }}>×</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {tiposPonto.map(t=>(
              <button key={t.id} onClick={()=>setTipo(t.id)} style={{ padding:"5px 10px", borderRadius:99,
                border:`1.5px solid ${tipo===t.id?T.blue:T.border}`,
                background:tipo===t.id?T.blueLight:T.white,
                fontSize:11, fontWeight:700, color:tipo===t.id?T.blue:T.textSub, cursor:"pointer" }}>
                {t.icon} {t.label}</button>
            ))}
          </div>
          <input style={inp} placeholder="Nome / descrição *" value={nome} onChange={e=>setNome(e.target.value)}/>
          <input style={inp} placeholder="Referência de localização (km, cidade, bairro...)"
            value={referencia} onChange={e=>setRef(e.target.value)}/>
          <textarea style={{ ...inp, resize:"none", height:60, lineHeight:1.5 }}
            placeholder="Observações" value={obs} onChange={e=>setObs(e.target.value)}/>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <p style={{ color:T.textMuted, fontSize:11, margin:"0 0 5px" }}>Avaliação:</p>
              <div style={{ display:"flex", gap:4 }}>
                {avaliacoes.map(n=>(
                  <button key={n} onClick={()=>setAvaliacao(n)} style={{ width:34, height:34,
                    borderRadius:8, border:`1.5px solid ${avaliacao>=n?T.blue:T.border}`,
                    background:avaliacao>=n?T.blueLight:T.white, fontSize:14, cursor:"pointer" }}>⭐</button>
                ))}
              </div>
            </div>
            <button onClick={()=>setFechado(f=>!f)} style={{ padding:"8px 12px", borderRadius:9,
              cursor:"pointer", border:`1.5px solid ${fechado?T.urgBorder:T.border}`,
              background:fechado?T.urgBg:T.blueLight,
              color:fechado?T.urgColor:T.textSub, fontSize:12, fontWeight:700 }}>
              {fechado?"🔴 Fechado":"🟢 Aberto"}</button>
          </div>
          <button onClick={salvar}
            style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none",
              background:T.blue, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer",
              boxShadow:`0 4px 14px rgba(37,99,235,.3)` }}>
            {ponto?"Salvar alterações":"Adicionar ponto"}</button>
        </div>
      </div>
    </div>
  );
}
