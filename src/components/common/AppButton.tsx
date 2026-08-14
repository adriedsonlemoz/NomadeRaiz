import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

export function AppButton({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: AppButtonProps) {
  const classes = [
    'nr-btn',
    `nr-btn--${variant}`,
    fullWidth ? 'nr-btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  return <button {...props} className={classes}>{children}</button>;
}
