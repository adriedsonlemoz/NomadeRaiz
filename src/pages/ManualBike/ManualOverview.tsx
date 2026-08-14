import type { CSSProperties } from 'react';
import {
  AREAS_BIKE,
  GLOSSARIO_BIKE,
  KIT_MINIMO_FERRAMENTAS,
  PECAS_BIKE,
  PROBLEMAS_ESTRADA,
} from '../../constants/manualBike';
import type { ThemeTokens } from '../../styles/theme';
import type { BikePiece, BikeProblem } from '../../types';
import type { TrackedTool } from './useManualBikeData';

interface Props {
  T: ThemeTokens;
  habilidades: string[];
  kitComStatus: TrackedTool[];
  kitPossui: number;
  kitRastreado: number;
  onPiece: (piece: BikePiece) => void;
  onProblem: (problem: BikeProblem) => void;
  onGlossary: () => void;
}

const levelIcon = (level: BikePiece['nivel']) => level === 'basico' ? '🟢' : level === 'intermediario' ? '🟡' : '🔴';

export function ManualOverview({ T, habilidades, kitComStatus, kitPossui, kitRastreado, onPiece, onProblem, onGlossary }: Props) {
  const card: CSSProperties = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16, padding:'16px', boxShadow:'0 1px 5px rgba(15,39,68,.06)', boxSizing:'border-box' };
  const kicker: CSSProperties = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 10px', display:'flex', alignItems:'center', gap:6 };

  return <>
    {AREAS_BIKE.map(area => <div key={area.id} style={card}>
      <p style={kicker}><span>{area.icone}</span>{area.label}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(90px, 1fr))', gap:8 }}>
        {PECAS_BIKE.filter(piece => piece.area === area.id).map(piece => {
          const domina = habilidades.includes(`peca:${piece.id}`);
          return <button key={piece.id} onClick={()=>onPiece(piece)} style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:5, background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:12, padding:'11px 8px', cursor:'pointer' }}>
            {domina && <span style={{ position:'absolute', top:5, right:5, fontSize:10 }}>✅</span>}
            <span style={{ fontSize:20 }}>{piece.icone}</span><span style={{ color:T.textMain, fontWeight:700, fontSize:10.5, textAlign:'center', lineHeight:1.25 }}>{piece.nome}</span><span style={{ fontSize:9 }}>{levelIcon(piece.nivel)}</span>
          </button>;
        })}
      </div>
    </div>)}

    <div style={card}><p style={kicker}><span>🛠️</span>Problemas na Estrada</p><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>{PROBLEMAS_ESTRADA.map(problem => {
      const domina = habilidades.includes(`problema:${problem.id}`);
      return <button key={problem.id} onClick={()=>onProblem(problem)} style={{ position:'relative', display:'flex', alignItems:'center', gap:8, background:T.white, border:`1px solid ${T.border}`, borderRadius:12, padding:'10px 11px', cursor:'pointer', textAlign:'left', boxShadow:'0 1px 4px rgba(15,39,68,.05)' }}><span style={{ fontSize:17, flexShrink:0 }}>{problem.icone}</span><span style={{ color:T.textMain, fontWeight:700, fontSize:11.5, lineHeight:1.25 }}>{problem.nome}</span>{domina && <span style={{ position:'absolute', top:5, right:6, fontSize:10 }}>✅</span>}</button>;
    })}</div></div>

    <button onClick={onGlossary} style={{ ...card, display:'flex', alignItems:'center', gap:10, cursor:'pointer', width:'100%', textAlign:'left' }}><span style={{ fontSize:20 }}>📖</span><div style={{ minWidth:0 }}><p style={{ color:T.textMain, fontWeight:700, fontSize:13, margin:0 }}>Glossário de Termos</p><p style={{ color:T.textMuted, fontSize:10.5, margin:'1px 0 0' }}>{GLOSSARIO_BIKE.length} termos técnicos explicados de forma simples</p></div></button>

    <div style={card}><p style={kicker}><span>🧰</span>Kit Mínimo de Ferramentas</p><div style={{ display:'flex', flexDirection:'column', gap:7 }}>{KIT_MINIMO_FERRAMENTAS.map(tool => <div key={tool.id} style={{ display:'flex', alignItems:'center', gap:10, background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:11, padding:'9px 11px' }}><span style={{ fontSize:17, flexShrink:0 }}>{tool.icone}</span><div style={{ minWidth:0 }}><p style={{ color:T.textMain, fontWeight:700, fontSize:12, margin:0 }}>{tool.nome}</p><p style={{ color:T.textMuted, fontSize:10.5, margin:'1px 0 0', lineHeight:1.35 }}>{tool.motivo}</p></div></div>)}</div></div>

    <div style={card}><p style={kicker}><span>🎒</span>Antes de Sair</p><p style={{ color:T.textMuted, fontSize:10.5, margin:'-6px 0 10px' }}>Cruza o kit mínimo com o que já está marcado no seu checklist.</p><div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}><span style={{ color:T.textSub, fontSize:12.5 }}>Já confirmados</span><span style={{ color:T.doneCheck, fontWeight:800, fontSize:13 }}>{kitPossui}/{kitRastreado} rastreados</span></div><div style={{ display:'flex', flexDirection:'column', gap:6 }}>{kitComStatus.map(tool => <div key={tool.id} style={{ display:'flex', alignItems:'center', gap:9, background:tool.status==='comprado'?T.doneBg:tool.status==='pendente'?T.urgBg:T.blueLight, border:`1px solid ${tool.status==='comprado'?T.doneBorder:tool.status==='pendente'?T.urgBorder:T.border}`, borderRadius:10, padding:'8px 10px' }}><span style={{ fontSize:15, flexShrink:0 }}>{tool.icone}</span><span style={{ flex:1, color:T.textMain, fontSize:12 }}>{tool.nome}</span><span style={{ fontSize:11, fontWeight:700, color:tool.status==='comprado'?T.doneCheck:tool.status==='pendente'?T.urgColor:T.textMuted }}>{tool.status==='comprado'?'✅ Tenho':tool.status==='pendente'?'⚠️ Falta':'— Não rastreado'}</span></div>)}</div></div>
  </>;
}
