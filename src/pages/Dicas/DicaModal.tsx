import { useTheme } from "../../hooks";

export interface DicaModalItem {
  texto: string;
  dica?: string;
}

interface DicaModalProps {
  item: DicaModalItem;
  cor: string;
  onClose: () => void;
}

export function DicaModal({ item, cor, onClose }: DicaModalProps) {
  const { theme: T } = useTheme();
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60,
      background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"24px 20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:400,
        background:T.white, borderRadius:20, overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ background:cor, padding:"16px 18px 14px",
          display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
              background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:18 }}>💡</div>
            <div>
              <p style={{ color:"rgba(255,255,255,.7)", fontSize:10, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>Dica técnica</p>
              <p style={{ color:"#fff", fontWeight:800, fontSize:13, margin:"2px 0 0",
                lineHeight:1.3 }}>{item.texto}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:8,
            border:"none", background:"rgba(255,255,255,.2)", color:"#fff",
            fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"16px 18px 20px" }}>
          <p style={{ color:T.textMain, fontSize:14, lineHeight:1.7, margin:0 }}>{item.dica}</p>
        </div>
        <div style={{ padding:"0 18px 18px" }}>
          <button onClick={onClose} style={{ width:"100%", padding:"12px 0", borderRadius:12,
            border:"none", background:cor, color:"#fff", fontWeight:700, fontSize:14,
            cursor:"pointer" }}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
