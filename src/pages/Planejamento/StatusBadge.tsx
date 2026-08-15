import type { PlanningStatus } from "../../services/planning.service";

interface StatusBadgeProps {
  status: PlanningStatus;
}

const LABELS: Record<PlanningStatus, { label:string; icon:string }> = {
  verde: { label:"Pronto", icon:"🟢" },
  amarelo: { label:"Atenção", icon:"🟡" },
  vermelho: { label:"Insuficiente", icon:"🔴" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = LABELS[status];
  return <span className="nr-state-badge" data-status={status}>{item.icon} {item.label}</span>;
}
