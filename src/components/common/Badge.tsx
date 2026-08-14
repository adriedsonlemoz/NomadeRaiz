import { useTheme } from "../../hooks";
import type { Priority } from "../../types";

export interface BadgeProps {
  type: Priority;
}

export function Badge({ type }: BadgeProps) {
  const { theme: T } = useTheme();
  const styles: Record<Priority, { bg: string; bd: string; c: string; lbl: string }> = {
    urgente: { bg: T.urgBg, bd: T.urgBorder, c: T.urgColor, lbl: "Urgente" },
    medio: { bg: T.medBg, bd: T.medBorder, c: T.medColor, lbl: "Médio" },
    baixo: { bg: T.lowBg, bd: T.lowBorder, c: T.lowColor, lbl: "Baixo" },
  };
  const current = styles[type];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, background: current.bg, border: `1.5px solid ${current.bd}`,
      color: current.c, flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: current.c }} />
      {current.lbl}
    </span>
  );
}
