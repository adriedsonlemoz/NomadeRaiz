import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme, useHaptics } from "../../hooks";
import { VERIFICACOES, MODOS_PERSISTENTES } from "../../constants/checks";
import { Bar } from "../../components/common";
import { DicaModal } from "../Dicas/DicaModal";
import type { DicaModalItem } from "../Dicas/DicaModal";
interface VerificationItem extends DicaModalItem {
  id: string;
  texto: string;
}

interface VerificationConfig {
  icon: string;
  titulo: string;
  cor: string;
  itens: VerificationItem[];
}

type VerificationModeId = keyof typeof VERIFICACOES;

interface ChecklistVerificacaoProps {
  modoId: VerificationModeId;
  onVoltar: () => void;
}

export function ChecklistVerificacao({ modoId, onVoltar }: ChecklistVerificacaoProps) {
  const { state, toggleCheck, resetChecks } = useStore();
  const { theme: T } = useTheme();
  const { light } = useHaptics();
  const [dicaModal, setDicaModal] = useState<DicaModalItem | null>(null);
  const v = VERIFICACOES[modoId] as VerificationConfig;
  if (!v) return null;

  const marcados = state.checks[modoId] ?? {};
  const total = v.itens.length;
  const checked = Object.values(marcados).filter(Boolean).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  const isPersistente = MODOS_PERSISTENTES.has(modoId);

  const handleToggle = (id: string) => {
    light();
    toggleCheck(modoId, id);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      {dicaModal && <DicaModal item={dicaModal} cor={v.cor} onClose={() => setDicaModal(null)}/>} 
      <div style={{ background:v.cor, padding:"14px 14px 18px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <button onClick={onVoltar} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:"rgba(255,255,255,.2)", color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:18 }}>{v.icon}</span>
              <span style={{ color:"#fff", fontWeight:900, fontSize:16 }}>{v.titulo}</span>
            </div>
            <p style={{ color:"rgba(255,255,255,.7)", fontSize:10, margin:"1px 0 0" }}>
              {checked}/{total} verificados
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            {isPersistente && (
              <span style={{ fontSize:9, color:"rgba(255,255,255,.6)", fontWeight:600,
                background:"rgba(255,255,255,.12)", padding:"1px 6px", borderRadius:99 }}>💾 salvo</span>
            )}
            <button onClick={() => resetChecks(modoId)} style={{ padding:"5px 11px", borderRadius:9,
              border:"none", background:"rgba(255,255,255,.2)", color:"#fff",
              fontSize:11, fontWeight:700, cursor:"pointer" }}>Resetar</button>
          </div>
        </div>
        <Bar pct={pct} h={4} cor="rgba(255,255,255,.8)"/>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 13px",
        display:"flex", flexDirection:"column", gap:7 }}>
        {checked === total && total > 0 && (
          <div style={{ background:T.doneBg, border:`1.5px solid ${T.doneBorder}`,
            borderRadius:12, padding:"12px 14px", textAlign:"center", marginBottom:4 }}>
            <p style={{ color:T.doneCheck, fontWeight:800, fontSize:14, margin:0 }}>
              ✅ Tudo verificado — pode ir!</p>
          </div>
        )}
        {v.itens.map(item => {
          const ok = Boolean(marcados[item.id]);
          return (
            <div key={item.id} style={{ background:ok ? T.doneBg : T.white,
              border:`1.5px solid ${ok ? T.doneBorder : T.border}`, borderRadius:12,
              boxShadow:"0 1px 3px rgba(15,39,68,.06)",
              display:"flex", alignItems:"center", gap:10, padding:"12px 13px" }}>
              <button onClick={() => handleToggle(item.id)} style={{ width:26, height:26,
                borderRadius:6, flexShrink:0, border:"none", cursor:"pointer",
                background:ok ? v.cor : "transparent", outline:`2px solid ${ok ? v.cor : T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                {ok && <span style={{ color:"#fff", fontSize:12, fontWeight:900 }}>✓</span>}
              </button>
              <p style={{ flex:1, color:ok ? T.textMuted : T.textMain, fontWeight:500, fontSize:13,
                margin:0, lineHeight:1.4, textDecoration:ok ? "line-through" : "none" }}>{item.texto}</p>
              {item.dica && (
                <button onClick={() => setDicaModal(item)} style={{ width:26, height:26,
                  borderRadius:"50%", border:`1.5px solid ${T.border}`, flexShrink:0,
                  background:T.white, color:T.blue, fontSize:12, fontWeight:800,
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 1px 3px rgba(15,39,68,.1)" }}>?</button>
              )}
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}
