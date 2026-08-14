import type { Priority } from "../../types";

export interface BadgeProps {
  type: Priority;
}

const LABELS: Record<Priority, string> = {
  urgente: "Urgente",
  medio: "Médio",
  baixo: "Baixo",
};

export function Badge({ type }: BadgeProps) {
  return <span className={`nr-badge nr-badge--${type}`}>{LABELS[type]}</span>;
}
