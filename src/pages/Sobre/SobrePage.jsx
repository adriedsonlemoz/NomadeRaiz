import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { CHANGELOG, APP_VERSAO, APP_ANO } from "../../constants";
import { ApoioModal } from "./ApoioModal";
import { ContatoModal } from "./ContatoModal";

export default function SobrePage() {
  const { setPage } = useStore();
  const { theme: T } = useTheme();
  const [apoioAberto, setApoioAberto]     = useState(false);
  const [contatoAberto, setContatoAberto] = useState(false);

  const funcionalidades = [
    "Checklist de equipamentos", "Controle de orçamento", "Calculadora de autonomia",
    "Dicas de sobrevivência", "Tutoriais", "Biblioteca de consulta",
    "Organização da viagem", "Conteúdo totalmente offline",
  ];

  const cardStyle = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16,
    padding:"16px", boxShadow:"0 1px 5px rgba(15,39,68,.06)", boxSizing:"border-box" };
  const kickerStyle = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:"0.12em",
    textTransform:"uppercase", margin:"0 0 10px" };

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.pageBg }}>
      {apoioAberto   && <ApoioModal T={T} onClose={()=>setApoioAberto(false)}/>}
      {contatoAberto && <ContatoModal T={T} onClose={()=>setContatoAberto(false)}/>}

      {/* Cabeçalho */}
      <div style={{ background:T.navy, padding:"18px 16px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <button onClick={()=>setPage("extras")} style={{ width:34, height:34, borderRadius:9, border:"none",
            background:T.navyLight, color:"#fff", fontSize:17, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <p style={{ color:"#7ea3d4", fontSize:9, fontWeight:800, letterSpacing:"0.2em",
            textTransform:"uppercase", margin:0 }}>Sobre</p>
        </div>
        <h1 style={{ color:"#fff", fontSize:21, fontWeight:900, margin:"0 0 6px", lineHeight:1.25 }}>
          CicloViagem Nômade Raiz</h1>
        <p style={{ color:"#7ea3d4", fontSize:13, margin:0, lineHeight:1.5, fontWeight:300 }}>
          Planeje sua cicloviagem, monte seu equipamento e viaje gastando o mínimo possível.</p>
      </div>

      <div style={{ padding:"16px 14px 32px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* Sobre o aplicativo */}
        <div style={cardStyle}>
          <p style={kickerStyle}>Sobre o aplicativo</p>
          <p style={{ color:T.textSub, fontSize:12.5, lineHeight:1.65, margin:"0 0 10px" }}>
            O CicloViagem Nômade Raiz foi criado para ajudar cicloviajantes, campistas e aventureiros
            que desejam viajar de forma simples, econômica e autônoma.</p>
          <p style={{ color:T.textSub, fontSize:12.5, lineHeight:1.65, margin:"0 0 10px" }}>
            O aplicativo reúne checklist de equipamentos, planejamento de orçamento, calculadoras,
            dicas de sobrevivência, tutoriais e conteúdos úteis para quem quer explorar novos lugares
            sem depender de muito dinheiro.</p>
          <p style={{ color:T.textSub, fontSize:12.5, lineHeight:1.65, margin:0 }}>
            O objetivo é incentivar a autonomia, a organização e o contato com a natureza,
            tornando a cicloviagem mais acessível para todos.</p>
        </div>

        {/* Funcionalidades */}
        <div style={cardStyle}>
          <p style={kickerStyle}>Funcionalidades</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {funcionalidades.map(f => (
              <div key={f} style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ color:T.doneCheck, fontSize:13, flexShrink:0 }}>✅</span>
                <span style={{ color:T.textMain, fontSize:12.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Novidades / Changelog */}
        <div style={cardStyle}>
          <p style={kickerStyle}>Novidades</p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {CHANGELOG.map(v => (
              <div key={v.versao}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ background:T.blueLight, color:T.blue, fontWeight:800, fontSize:10.5,
                    padding:"3px 9px", borderRadius:99, flexShrink:0 }}>Versão {v.versao}</span>
                  {v.data && <span style={{ color:T.textMuted, fontSize:10.5 }}>{v.data}</span>}
                </div>
                <ul style={{ margin:0, paddingLeft:18 }}>
                  {v.mudancas.map((m,i) => (
                    <li key={i} style={{ color:T.textSub, fontSize:12, lineHeight:1.6 }}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Apoiar o projeto */}
        <button onClick={()=>setApoioAberto(true)} style={{ background:"#fef2f2",
          border:"1.5px solid #fecaca", borderRadius:16, padding:"14px 16px",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          cursor:"pointer", fontWeight:800, fontSize:14, color:"#dc2626", boxSizing:"border-box" }}>
          ❤️ Apoiar o Projeto</button>

        {/* Contato */}
        <button onClick={()=>setContatoAberto(true)} style={{ ...cardStyle,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          cursor:"pointer", fontWeight:700, fontSize:14, color:T.textMain, width:"100%" }}>
          📩 Entrar em Contato</button>

        {/* Informações */}
        <div style={{ textAlign:"center", padding:"6px 0 0" }}>
          <p style={{ color:T.textMuted, fontSize:11.5, margin:"0 0 3px" }}>
            Versão {APP_VERSAO} · {APP_ANO}</p>
          <p style={{ color:T.textMuted, fontSize:11.5, margin:0, fontWeight:600 }}>
            Desenvolvido no Brasil 🇧🇷</p>
        </div>
      </div>
    </div>
  );
}
