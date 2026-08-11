import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS } from '../../styles/theme';

export function Card({ children, style }: { children:ReactNode; style?:CSSProperties }) {
  const { theme:T } = useTheme();
  return <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:RADIUS.lg, ...style }}>{children}</div>;
}
