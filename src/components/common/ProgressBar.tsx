import { useTheme } from "../../hooks";

export interface BarProps {
  pct: number;
  h?: number;
  cor?: string;
}

export function Bar({ pct, h = 4, cor }: BarProps) {
  const { theme: T } = useTheme();
  const normalizedPct = Math.min(100, Math.max(0, pct));
  return (
    <div style={{ height: h, background: T.blueChip, borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${normalizedPct}%`, borderRadius: 99,
        background: cor ?? `linear-gradient(90deg,${T.blue},${T.blueSoft})`, transition: "width .5s",
      }} />
    </div>
  );
}

export interface RingProps {
  pct: number;
}

export function Ring({ pct }: RingProps) {
  const { theme: T } = useTheme();
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
      <svg width="84" height="84" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx="42" cy="42" r={radius} fill="none" stroke={T.blueChip} strokeWidth="7" />
        <circle cx="42" cy="42" r={radius} fill="none" stroke="url(#rg)" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset .7s" }} />
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={T.blue} /><stop offset="100%" stopColor={T.blueSoft} />
        </linearGradient></defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: T.textMain, fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{pct}%</span>
        <span style={{ color: T.textMuted, fontSize: 9 }}>pronto</span>
      </div>
    </div>
  );
}
