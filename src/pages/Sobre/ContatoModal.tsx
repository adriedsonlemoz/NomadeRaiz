import { useState } from "react";
import type { CSSProperties } from "react";
import { PIX_CHAVE } from "../../constants/app";
import { APP_NAME } from "../../config/app";
import type { ThemeCtx } from "../../contexts/ThemeContext";

interface ContatoModalProps {
  onClose: () => void;
  T: ThemeCtx["theme"];
}

export function ContatoModal({ onClose, T }: ContatoModalProps) {
  const [nome, setNome]         = useState("");
  const [email, setEmail]       = useState("");
  const [assunto, setAssunto]   = useState("");
  const [mensagem, setMensagem] = useState("");

  const campo: CSSProperties = { padding:"10px 12px", border:`1.5px solid ${T.border}`, borderRadius:10,
    fontSize:13.5, color:T.textMain, background:T.blueLight, outline:"none",
    fontFamily:"inherit", width:"100%", boxSizing:"border-box" };

  const podeEnviar = mensagem.trim().length > 0;

  const enviar = () => {
    if (!podeEnviar) return;
    const assuntoFinal = assunto.trim() || `Contato — ${APP_NAME}`;
    const corpo = `Nome: ${nome || "—"}\nE-mail: ${email || "—"}\n\n${mensagem}`;
    window.location.href =
      `mailto:${PIX_CHAVE}?subject=${encodeURIComponent(assuntoFinal)}&body=${encodeURIComponent(corpo)}`;
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70,
      background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"24px 20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:400, maxHeight:"85vh",
        background:T.white, borderRadius:20, overflow:"hidden",
        display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ background:T.navy, padding:"16px 18px 14px", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <p style={{ color:"#fff", fontWeight:800, fontSize:14, margin:0 }}>📩 Entrar em Contato</p>
          <button onClick={onClose} style={{ flexShrink:0, width:28, height:28, borderRadius:8,
            border:"none", background:"rgba(255,255,255,.15)", color:"#fff",
            fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"16px 18px", overflowY:"auto", display:"flex", flexDirection:"column", gap:11 }}>
          <div>
            <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:"0 0 4px" }}>Nome</p>
            <input style={campo} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome"/>
          </div>
          <div>
            <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:"0 0 4px" }}>E-mail</p>
            <input style={campo} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
          </div>
          <div>
            <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:"0 0 4px" }}>Assunto</p>
            <input style={campo} value={assunto} onChange={e=>setAssunto(e.target.value)} placeholder="Sobre o que você quer falar?"/>
          </div>
          <div>
            <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:"0 0 4px" }}>Mensagem</p>
            <textarea style={{ ...campo, resize:"none", height:90, lineHeight:1.5 }}
              value={mensagem} onChange={e=>setMensagem(e.target.value)} placeholder="Escreva sua mensagem..."/>
          </div>
        </div>
        <div style={{ padding:"4px 18px 18px", flexShrink:0 }}>
          <button onClick={enviar} disabled={!podeEnviar} style={{ width:"100%", padding:"12px 0",
            borderRadius:12, border:"none", background:podeEnviar?T.navy:T.border,
            color:"#fff", fontWeight:700, fontSize:14, cursor:podeEnviar?"pointer":"not-allowed" }}>
            Enviar</button>
        </div>
      </div>
    </div>
  );
}
