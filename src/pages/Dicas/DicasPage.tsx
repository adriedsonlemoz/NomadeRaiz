import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { DICAS } from "../../constants/tips";

interface Dica {
  id: string;
  icon: string;
  categoria?: string;
  titulo: string;
  texto: string;
}

const dicas: Dica[] = DICAS;

export default function DicasPage() {
  const { state, setPage, toggleFavoritoDica } = useStore();
  const { theme: T } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const [somenteFavoritas, setSomenteFavoritas] = useState(false);
  const favoritas = state.favoritosDicas;
  const lista = somenteFavoritas ? dicas.filter(d => favoritas.includes(d.id)) : dicas;
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      <div style={{ background:T.navy, padding:"14px 14px 16px", flexShrink:0, position:"relative" }}>
        <div style={{ position:"absolute", top:-10, right:-10, fontSize:60, opacity:.05, pointerEvents:"none" }}>🧠</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <button onClick={()=>setPage("missao")} style={{ width:34, height:34, borderRadius:9,
            border:"none", background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
              textTransform:"uppercase", margin:0 }}>Conhecimento</p>
            <h1 style={{ color:"#fff", fontSize:19, fontWeight:900, margin:0 }}>Dicas de Sobrevivência</h1>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>setSomenteFavoritas(false)} style={{ padding:"6px 12px", borderRadius:99,
            border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
            background:!somenteFavoritas?T.blue:T.navyLight, color:!somenteFavoritas?"#fff":"#7ea3d4" }}>
            Todas</button>
          <button onClick={()=>setSomenteFavoritas(true)} style={{ padding:"6px 12px", borderRadius:99,
            border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
            background:somenteFavoritas?T.blue:T.navyLight, color:somenteFavoritas?"#fff":"#7ea3d4" }}>
            ⭐ Favoritas{favoritas.length>0?` (${favoritas.length})`:""}</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"11px 13px",
        display:"flex", flexDirection:"column", gap:7 }}>
        <div className="nr-explain-box" style={{marginBottom:3}}>
          <p><strong>Guia rápido de estrada:</strong> abra cada dica para entender não apenas o conselho, mas como aplicá-lo durante uma cicloviagem. Favorite o que quiser revisar antes de sair.</p>
        </div>
        {lista.length===0 && (
          <p style={{ color:T.textMuted, fontSize:12.5, textAlign:"center", padding:"24px 10px" }}>
            Você ainda não marcou nenhuma dica como favorita.</p>
        )}
        {lista.map(d => {
          const isOpen = open===d.id;
          const isFav  = favoritas.includes(d.id);
          return (
            <div key={d.id} style={{ background:T.white,
              border:`1.5px solid ${isOpen?T.blue:T.border}`,
              borderRadius:13, transition:"border-color .2s",
              boxShadow:isOpen?"0 4px 16px rgba(37,99,235,.12)":"0 1px 4px rgba(15,39,68,.05)" }}>
              <button onClick={()=>setOpen(isOpen?null:d.id)} style={{ width:"100%",
                padding:"13px 13px", display:"flex", alignItems:"center", gap:10,
                cursor:"pointer", border:"none", background:"transparent",
                textAlign:"left", borderRadius:13 }}>
                <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
                  background:isOpen?T.blueLight:T.blueChip,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:19, transition:"background .2s" }}>{d.icon}</div>
                <span style={{ flex:1, color:isOpen?T.blue:T.textMain,
                  fontWeight:700, fontSize:13, lineHeight:1.3, transition:"color .2s" }}>
                  {d.titulo}</span>
                <span onClick={e=>{ e.stopPropagation(); toggleFavoritoDica(d.id); }}
                  role="button" aria-label="Favoritar" style={{ color:isFav?"#f59e0b":T.textMuted,
                  fontSize:17, flexShrink:0, cursor:"pointer", padding:4 }}>
                  {isFav ? "⭐" : "☆"}</span>
                <span style={{ color:T.textMuted, fontSize:13, flexShrink:0,
                  display:"inline-block", transition:"transform .25s",
                  transform:isOpen?"rotate(180deg)":"rotate(0deg)" }}>▾</span>
              </button>
              {isOpen && (
                <div style={{ padding:"0 13px 16px", borderTop:`1px solid ${T.border}`, paddingTop:12 }}>
                  {d.categoria && <span className="nr-tip-meta">{d.categoria}</span>}
                  <p style={{ color:T.textMain, fontSize:13, lineHeight:1.75, margin:0,
                    whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{d.texto}</p>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}
