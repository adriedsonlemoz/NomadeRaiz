import type { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function SectionLabel({ children }: { children:ReactNode }) {
  const { theme:T } = useTheme();
  return <p style={{ color:T.textMuted, fontSize:10, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', margin:'18px 0 4px' }}>{children}</p>;
}
