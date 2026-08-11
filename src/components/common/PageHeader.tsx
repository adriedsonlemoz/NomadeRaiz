import type { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS } from '../../styles/theme';

export function PageHeader({ title, eyebrow, onBack, right }: { title:string; eyebrow?:string; onBack?:()=>void; right?:ReactNode }) {
  const { theme:T } = useTheme();
  return <div style={{ background:T.navy, padding:'14px 14px 18px', flexShrink:0 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      {onBack && <button aria-label="Voltar" onClick={onBack} style={{ width:34, height:34, borderRadius:RADIUS.sm, border:'none', background:T.navyLight, color:'#fff', fontSize:17, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>}
      <div style={{ flex:1 }}>
        {eyebrow && <p style={{ color:'#7ea3d4', fontSize:9, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', margin:0 }}>{eyebrow}</p>}
        <h1 style={{ color:'#fff', fontSize:18, fontWeight:900, margin:0 }}>{title}</h1>
      </div>
      {right}
    </div>
  </div>;
}
