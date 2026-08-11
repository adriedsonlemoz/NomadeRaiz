import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS } from '../../styles/theme';

type Variant = 'primary'|'secondary'|'danger'|'ghost';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

export function AppButton({ variant='primary', fullWidth=false, style, children, disabled, ...props }: AppButtonProps) {
  const { theme:T } = useTheme();
  const variants:Record<Variant,CSSProperties> = {
    primary: { background:T.blue, color:'#fff', border:'none' },
    secondary: { background:T.white, color:T.textSub, border:`1.5px solid ${T.border}` },
    danger: { background:T.urgBg, color:T.urgColor, border:`1.5px solid ${T.urgBorder}` },
    ghost: { background:'transparent', color:T.textSub, border:'none' },
  };

  return <button
    {...props}
    disabled={disabled}
    style={{
      minHeight:40,
      padding:'10px 14px',
      borderRadius:RADIUS.md,
      fontWeight:700,
      fontSize:13,
      cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?.6:1,
      width:fullWidth?'100%':undefined,
      ...variants[variant],
      ...style,
    }}
  >{children}</button>;
}
