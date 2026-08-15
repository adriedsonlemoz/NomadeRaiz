import type { BikeSkillLevel } from "../../types";

interface NivelBadgeProps { nivel: BikeSkillLevel; }

const LABELS: Record<BikeSkillLevel, { label:string; icon:string }> = {
  basico: { label:"Básico", icon:"🟢" },
  intermediario: { label:"Intermediário", icon:"🟡" },
  avancado: { label:"Avançado", icon:"🔴" },
};

export function NivelBadge({ nivel }: NivelBadgeProps) {
  const item = LABELS[nivel] ?? LABELS.basico;
  return <span className="nr-level-badge" data-level={nivel}>{item.icon} {item.label}</span>;
}
