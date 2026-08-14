import { useStore } from "../../contexts";
import { useTheme, useAlertCount } from "../../hooks";
import { APP_NAME } from "../../config/app";

export default function ExtrasPage() {
  const { state, setPage } = useStore();
  const { theme: T } = useTheme();
  const nAlertas = useAlertCount();
  const opcoes = [
    { id:"planejamento",  icon:"🧭", label:"Planejamento da Viagem",   desc:"Veja se você já está pronto para partir",   cor:"#0f766e" },
    { id:"manual-bike",   icon:"🚲", label:"Manual da Bike",           desc:"Peças, manutenção e problemas na estrada", cor:"#b45309" },
    { id:"calculadora",   icon:"🧮", label:"Calculadora de Autonomia", desc:"Planeje orçamento e dias na estrada",    cor:"#7c3aed" },
    { id:"pontos",        icon:"📍", label:"Pontos de Apoio",          desc:"Água, mercados, campings offline",         cor:"#059669" },
    { id:"alertas",       icon:"🔔", label:"Alertas de Reposição",     desc:nAlertas>0?`⚠️ ${nAlertas} abaixo do mínimo`:"Defina mínimos de estoque", cor:nAlertas>0?T.urgColor:"#d97706" },
    { id:"exportar",      icon:"📤", label:"Exportar / Importar",      desc:"Copiar lista ou fazer backup JSON",         cor:"#2563eb" },
    { id:"dicas",         icon:"🧠", label:"Dicas de Sobrevivência",   desc:"Autonomia, invisibilidade e recursos",    cor:"#0f2744" },
    { id:"configuracoes", icon:"⚙️", label:"Configurações",            desc:"Tema, fonte, viagem e dados",              cor:"#64748b" },
    { id:"sobre",         icon:"ℹ️", label:"Sobre o App",               desc:"Propósito, novidades e como apoiar",       cor:"#dc2626" },
  ];
  return (
    <div style={{ flex:1, overflowY:"auto", background:T.pageBg }}>
      <div style={{ background:T.navy, padding:"20px 16px 24px" }}>
        <p style={{ color:"#7ea3d4", fontSize:10, fontWeight:800, letterSpacing:"0.2em",
          textTransform:"uppercase", margin:"0 0 3px" }}>{APP_NAME}</p>
        <h1 style={{ color:"#fff", fontSize:20, fontWeight:900, margin:0 }}>Ferramentas</h1>
      </div>
      <div style={{ padding:"14px 14px 32px", display:"flex", flexDirection:"column", gap:8 }}>
        {opcoes.map(op => (
          <button key={op.id} onClick={()=>setPage(op.id)} style={{
            background:T.white, border:`1.5px solid ${T.border}`, borderRadius:14,
            padding:"13px 14px", display:"flex", alignItems:"center", gap:12,
            cursor:"pointer", textAlign:"left", boxSizing:"border-box", width:"100%",
            boxShadow:"0 1px 5px rgba(15,39,68,.07)", transition:"all .15s" }}>
            <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
              background:`${op.cor}15`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:22 }}>{op.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:T.textMain, fontWeight:700, fontSize:14, margin:"0 0 2px" }}>{op.label}</p>
              <p style={{ color:T.textMuted, fontSize:11, margin:0 }}>{op.desc}</p>
            </div>
            <span style={{ color:T.textMuted, fontSize:13, flexShrink:0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
