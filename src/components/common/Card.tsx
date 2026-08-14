import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return <div {...props} className={`nr-card ${className}`.trim()}>{children}</div>;
}
