import { useState } from "react";
import { useStore } from "../../contexts";
import { useTheme } from "../../hooks";
import { APP_ANO, CHANGELOG } from "../../constants";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_REPOSITORY_URL,
  APP_TAGLINE,
  APP_VERSION,
} from "../../config/app";
import { AppButton, BicycleIcon, Card, PageHeader, SectionLabel } from "../../components/common";
import { ApoioModal } from "./ApoioModal";
import { ContatoModal } from "./ContatoModal";

export default function SobrePage() {
  const { setPage } = useStore();
  const { theme: T } = useTheme();
  const [apoioAberto, setApoioAberto] = useState(false);
  const [contatoAberto, setContatoAberto] = useState(false);

  const releaseAtual = CHANGELOG.find(v => v.versao === APP_VERSION) || CHANGELOG[0];
  const historico = CHANGELOG.filter(v => v.versao !== releaseAtual?.versao);

  const funcionalidades = [
    { icon:"📋", label:"Equipamentos e checklists" },
    { icon:"🧭", label:"Planejamento de viagem" },
    { icon:"🧮", label:"Calculadoras de autonomia" },
    { icon:"📓", label:"Diário de campo" },
    { icon:"📍", label:"Pontos de apoio" },
    { icon:"🚲", label:"Manual da bicicleta" },
    { icon:"🔔", label:"Alertas de reposição" },
    { icon:"💾", label:"Backup completo" },
  ];

  const tecnologias = ["Offline-first", "IndexedDB", "Backup JSON", "React + Capacitor"];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:T.pageBg }}>
      {apoioAberto && <ApoioModal T={T} onClose={()=>setApoioAberto(false)}/>}
      {contatoAberto && <ContatoModal T={T} onClose={()=>setContatoAberto(false)}/>}

      <PageHeader
        eyebrow={APP_NAME}
        title="Sobre o App"
        onBack={()=>setPage("extras")}
        right={(
          <span style={{ color:"#fff", background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.12)",
            borderRadius:99, padding:"4px 8px", fontSize:10, fontWeight:800 }}>v{APP_VERSION}</span>
        )}
      />

      <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 32px" }}>
        <Card style={{ padding:"18px 16px", position:"relative", overflow:"hidden",
          background:`linear-gradient(145deg,${T.navy} 0%,${T.navyMid} 100%)`, border:"none" }}>
          <div aria-hidden="true" style={{ position:"absolute", right:-18, bottom:-22, opacity:.07,
            transform:"rotate(-10deg)", pointerEvents:"none" }}>
            <BicycleIcon size={132} color="#fff"/>
          </div>
          <div style={{ position:"relative", zIndex:1, display:"flex", gap:13, alignItems:"center" }}>
            <div style={{ width:58, height:58, borderRadius:17, flexShrink:0,
              background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.12)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BicycleIcon size={38} color="#fff"/>
            </div>
            <div style={{ minWidth:0 }}>
              <h1 style={{ color:"#fff", fontSize:21, fontWeight:900, margin:"0 0 3px" }}>{APP_NAME}</h1>
              <p style={{ color:"#8fb0da", fontSize:11.5, fontWeight:700, margin:"0 0 7px" }}>{APP_TAGLINE}</p>
              <p style={{ color:"rgba(255,255,255,.72)", fontSize:11.5, lineHeight:1.5, margin:0 }}>{APP_DESCRIPTION}</p>
            </div>
          </div>
        </Card>

        <SectionLabel>Feito para a estrada</SectionLabel>
        <Card style={{ padding:"15px 16px" }}>
          <p style={{ color:T.textSub, fontSize:12.5, lineHeight:1.65, margin:"0 0 10px" }}>
            O {APP_NAME} foi criado para reunir em um único lugar o que costuma ficar espalhado entre
            anotações, planilhas e vários aplicativos: o que levar, quanto custa, quanto dura e o que
            fazer quando alguma coisa dá errado durante a viagem.
          </p>
          <p style={{ color:T.textSub, fontSize:12.5, lineHeight:1.65, margin:0 }}>
            A proposta é simples: funcionar bem no celular, depender pouco de internet e ajudar na
            organização de cicloviagens, camping e deslocamentos mais autônomos.
          </p>
        </Card>

        <SectionLabel>Recursos</SectionLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {funcionalidades.map(item => (
            <Card key={item.label} style={{ padding:"11px 10px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:17, flexShrink:0 }}>{item.icon}</span>
              <span style={{ color:T.textMain, fontSize:11.5, lineHeight:1.25, fontWeight:650 }}>{item.label}</span>
            </Card>
          ))}
        </div>

        <SectionLabel>Como ele funciona</SectionLabel>
        <Card style={{ padding:"14px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {tecnologias.map(item => (
              <span key={item} style={{ color:T.blue, background:T.blueLight, border:`1px solid ${T.blueSoft}`,
                borderRadius:99, padding:"5px 9px", fontSize:10.5, fontWeight:800 }}>{item}</span>
            ))}
          </div>
          <p style={{ color:T.textMuted, fontSize:11.5, lineHeight:1.55, margin:"12px 0 0" }}>
            Os dados ficam no próprio dispositivo usando IndexedDB. O backup JSON permite levar ou
            restaurar suas informações quando necessário.
          </p>
        </Card>

        <SectionLabel>Últimas mudanças</SectionLabel>
        {releaseAtual && (
          <Card style={{ overflow:"hidden" }}>
            <div style={{ padding:"12px 14px", background:T.blueLight, borderBottom:`1px solid ${T.border}`,
              display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
              <div>
                <p style={{ color:T.blue, fontWeight:900, fontSize:13, margin:0 }}>Versão {releaseAtual.versao}</p>
                <p style={{ color:T.textMuted, fontSize:10.5, margin:"2px 0 0" }}>Versão instalada atualmente</p>
              </div>
              <span style={{ color:T.textMuted, fontSize:10.5, flexShrink:0 }}>{releaseAtual.data}</span>
            </div>
            <div style={{ padding:"13px 14px", display:"flex", flexDirection:"column", gap:9 }}>
              {releaseAtual.mudancas.map((mudanca, index) => (
                <div key={index} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ color:T.doneCheck, fontSize:12, lineHeight:1.5 }}>✓</span>
                  <span style={{ color:T.textSub, fontSize:11.8, lineHeight:1.5 }}>{mudanca}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {historico.length > 0 && (
          <>
            <SectionLabel>Histórico recente</SectionLabel>
            <Card style={{ padding:"2px 14px" }}>
              {historico.map((release, releaseIndex) => (
                <div key={release.versao} style={{ padding:"12px 0",
                  borderBottom:releaseIndex<historico.length-1?`1px solid ${T.border}`:"none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:5 }}>
                    <strong style={{ color:T.textMain, fontSize:11.5 }}>Versão {release.versao}</strong>
                    <span style={{ color:T.textMuted, fontSize:10 }}>{release.data}</span>
                  </div>
                  <p style={{ color:T.textMuted, fontSize:10.8, lineHeight:1.45, margin:0 }}>
                    {release.mudancas.slice(0,2).join(" · ")}
                  </p>
                </div>
              ))}
            </Card>
          </>
        )}

        <SectionLabel>Projeto</SectionLabel>
        <Card style={{ padding:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:T.blueLight,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>⌨️</div>
            <div style={{ minWidth:0 }}>
              <p style={{ color:T.textMain, fontSize:12.5, fontWeight:800, margin:0 }}>Código e histórico no GitHub</p>
              <p style={{ color:T.textMuted, fontSize:10.5, margin:"2px 0 0", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap" }}>adriedsonlemoz/NomadeRaiz</p>
            </div>
          </div>
          <AppButton variant="secondary" fullWidth onClick={()=>window.open(APP_REPOSITORY_URL,"_blank","noopener,noreferrer")}>
            Abrir projeto no GitHub ↗
          </AppButton>
        </Card>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14 }}>
          <AppButton variant="danger" onClick={()=>setApoioAberto(true)}>❤️ Apoiar</AppButton>
          <AppButton variant="secondary" onClick={()=>setContatoAberto(true)}>📩 Contato</AppButton>
        </div>

        <div style={{ textAlign:"center", padding:"20px 0 2px" }}>
          <p style={{ color:T.textMuted, fontSize:11, margin:"0 0 3px" }}>
            {APP_NAME} · v{APP_VERSION} · {APP_ANO}
          </p>
          <p style={{ color:T.textMuted, fontSize:10.5, margin:0, fontWeight:600 }}>
            Desenvolvido no Brasil 🇧🇷
          </p>
        </div>
      </div>
    </div>
  );
}
