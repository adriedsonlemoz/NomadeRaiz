import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { gerarPayloadPix } from "../../services/pix.service";
import { PIX_CHAVE } from "../../constants/app";
import type { ThemeCtx } from "../../contexts/ThemeContext";

interface ApoioModalProps {
  onClose: () => void;
  T: ThemeCtx["theme"];
}

export function ApoioModal({ onClose, T }: ApoioModalProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let ativo = true;
    const payload = gerarPayloadPix(PIX_CHAVE, "ADRIEDSON", "BRASIL");
    QRCode.toDataURL(payload, { width:220, margin:1, color:{ dark:T.navy, light:"#ffffff" } })
      .then(url => { if (ativo) setQrUrl(url); })
      .catch(() => {});
    return () => { ativo = false; };
  }, [T.navy]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CHAVE);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch { /* clipboard indisponível — ignora silenciosamente */ }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70,
      background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"24px 20px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:380,
        background:T.white, borderRadius:20, overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ background:T.navy, padding:"18px 20px 16px", textAlign:"center", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, width:26, height:26,
            borderRadius:8, border:"none", background:"rgba(255,255,255,.15)", color:"#fff",
            fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          <p style={{ fontSize:26, margin:"0 0 4px" }}>❤️</p>
          <p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:0 }}>Apoie o desenvolvimento</p>
        </div>
        <div style={{ padding:"18px 20px" }}>
          <p style={{ color:T.textSub, fontSize:12.5, lineHeight:1.6, margin:"0 0 16px", textAlign:"center" }}>
            Se este aplicativo ajudou você de alguma forma, considere fazer uma doação. Sua
            contribuição ajuda no desenvolvimento de novas funcionalidades e na manutenção do projeto.</p>

          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            {qrUrl
              ? <img src={qrUrl} alt="QR Code PIX" width={180} height={180}
                  style={{ borderRadius:12, border:`1px solid ${T.border}` }}/>
              : <div style={{ width:180, height:180, borderRadius:12, background:T.blueLight,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:T.textMuted, fontSize:11, textAlign:"center", padding:10 }}>
                  Gerando QR Code…</div>}
          </div>

          <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, textAlign:"center",
            textTransform:"uppercase", letterSpacing:"0.12em", margin:"0 0 4px" }}>PIX</p>
          <p style={{ color:T.textMain, fontWeight:700, fontSize:14, textAlign:"center", margin:"0 0 16px" }}>
            {PIX_CHAVE}</p>

          <button onClick={copiar} style={{ width:"100%", padding:"11px 0", borderRadius:11,
            border:`1.5px solid ${copiado?T.doneBorder:T.border}`, background:copiado?T.doneBg:T.blueLight,
            color:copiado?T.doneCheck:T.blue, fontWeight:700, fontSize:13, cursor:"pointer", marginBottom:9,
            transition:"all .15s" }}>
            {copiado ? "✓ Chave copiada!" : "Copiar chave PIX"}</button>
          <button onClick={onClose} style={{ width:"100%", padding:"11px 0", borderRadius:11,
            border:"none", background:T.navy, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
            Fechar</button>
        </div>
      </div>
    </div>
  );
}
