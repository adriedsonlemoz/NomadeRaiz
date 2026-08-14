import type { ChangeEvent, MouseEvent } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";

interface NotaRapidaModalProps {
  onClose: () => void;
}

export function NotaRapidaModal({ onClose }: NotaRapidaModalProps) {
  const { state, setNota } = useStore();
  const { theme: T } = useTheme();

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60,
      background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"24px 20px" }}>
      <div onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()} style={{ width:"100%", maxWidth:400,
        background:T.white, borderRadius:20, overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ background:T.navy, padding:"16px 18px 14px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
              background:"rgba(255,255,255,.15)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:18 }}>📝</div>
            <p style={{ color:"#fff", fontWeight:800, fontSize:14, margin:0 }}>Nota rápida do dia</p>
          </div>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:8,
            border:"none", background:"rgba(255,255,255,.15)", color:"#fff",
            fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"16px 18px" }}>
          <textarea autoFocus
            value={state.notaRapida}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNota(event.target.value)}
            placeholder="Registre algo rápido aqui... (salvo automaticamente)"
            style={{ width:"100%", border:`1.5px solid ${T.border}`, borderRadius:12, outline:"none",
              resize:"none", fontSize:14, color:T.textMain, background:"transparent",
              fontFamily:"inherit", lineHeight:1.6, height:130, padding:12, boxSizing:"border-box" }}/>
        </div>
        <div style={{ padding:"0 18px 18px" }}>
          <button onClick={onClose} style={{ width:"100%", padding:"12px 0", borderRadius:12,
            border:"none", background:T.navy, color:"#fff", fontWeight:700, fontSize:14,
            cursor:"pointer" }}>Concluído</button>
        </div>
      </div>
    </div>
  );
}
