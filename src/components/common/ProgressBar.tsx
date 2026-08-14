import type { CSSProperties } from "react";
import { useTheme } from "../../hooks";

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export interface BarProps {
  pct: number;
  h?: number;
  cor?: string;
}

export function Bar({ pct, h = 4, cor }: BarProps) {
  const normalizedPct = Math.min(100, Math.max(0, pct));
  const style: CssVars = {
    '--nr-progress-height': `${h}px`,
    '--nr-progress-value': `${normalizedPct}%`,
  };
  if (cor) style['--nr-progress-color'] = cor;

  return <div className="nr-progress" style={style}><div className="nr-progress__fill" /></div>;
}

export interface RingProps {
  pct: number;
}

export function Ring({ pct }: RingProps) {
  const { theme: T } = useTheme();
  const normalizedPct = Math.min(100, Math.max(0, pct));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="nr-ring">
      <svg width="84" height="84" className="nr-ring__svg" aria-hidden="true">
        <circle cx="42" cy="42" r={radius} fill="none" stroke={T.blueChip} strokeWidth="7" />
        <circle cx="42" cy="42" r={radius} fill="none" stroke="url(#rg)" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - normalizedPct / 100)}
          className="nr-ring__arc" />
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={T.blue} /><stop offset="100%" stopColor={T.blueSoft} />
        </linearGradient></defs>
      </svg>
      <div className="nr-ring__label">
        <span className="nr-ring__value">{normalizedPct}%</span>
        <span className="nr-ring__caption">pronto</span>
      </div>
    </div>
  );
}
