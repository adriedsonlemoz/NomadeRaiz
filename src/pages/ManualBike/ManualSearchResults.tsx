import type { CSSProperties } from 'react';
import type { ThemeTokens } from '../../styles/theme';
import type { BikeGlossaryTerm, BikePiece, BikeProblem } from '../../types';

interface Props {
  T: ThemeTokens;
  busca: string;
  pecas: readonly BikePiece[];
  problemas: readonly BikeProblem[];
  termos: readonly BikeGlossaryTerm[];
  onPiece: (piece: BikePiece) => void;
  onProblem: (problem: BikeProblem) => void;
}

export function ManualSearchResults({ T, busca, pecas, problemas, termos, onPiece, onProblem }: Props) {
  const card: CSSProperties = { background:T.white, border:`1px solid ${T.border}`, borderRadius:16, padding:'16px', boxShadow:'0 1px 5px rgba(15,39,68,.06)', boxSizing:'border-box' };
  const kicker: CSSProperties = { color:T.textMuted, fontSize:10.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 10px', display:'flex', alignItems:'center', gap:6 };

  return <>
    {pecas.length > 0 && <div style={card}><p style={kicker}><span>🔧</span>Peças</p><div style={{ display:'flex', flexDirection:'column', gap:6 }}>{pecas.map(piece => <button key={piece.id} onClick={()=>onPiece(piece)} style={{ display:'flex', alignItems:'center', gap:9, background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:11, padding:'9px 11px', cursor:'pointer', textAlign:'left' }}><span style={{ fontSize:16 }}>{piece.icone}</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{piece.nome}</span></button>)}</div></div>}
    {problemas.length > 0 && <div style={card}><p style={kicker}><span>🛠️</span>Problemas na Estrada</p><div style={{ display:'flex', flexDirection:'column', gap:6 }}>{problemas.map(problem => <button key={problem.id} onClick={()=>onProblem(problem)} style={{ display:'flex', alignItems:'center', gap:9, background:T.white, border:`1px solid ${T.border}`, borderRadius:11, padding:'9px 11px', cursor:'pointer', textAlign:'left' }}><span style={{ fontSize:16 }}>{problem.icone}</span><span style={{ color:T.textMain, fontWeight:700, fontSize:12 }}>{problem.nome}</span></button>)}</div></div>}
    {termos.length > 0 && <div style={card}><p style={kicker}><span>📖</span>Glossário</p><div style={{ display:'flex', flexDirection:'column', gap:10 }}>{termos.map(term => <div key={term.id}><p style={{ color:T.blue, fontWeight:700, fontSize:12, margin:'0 0 2px' }}>{term.termo}</p><p style={{ color:T.textMain, fontSize:11.5, lineHeight:1.5, margin:0 }}>{term.definicao}</p></div>)}</div></div>}
    {!pecas.length && !problemas.length && !termos.length && <p style={{ color:T.textMuted, fontSize:12.5, textAlign:'center', padding:'24px 10px' }}>Nada encontrado para "{busca}".</p>}
  </>;
}
