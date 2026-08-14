import type { ThemeTokens } from "../../styles/theme";
import type { PlanningStatus } from "../../services/planning.service";

interface StatusBadgeProps {
  status: PlanningStatus;
  T: ThemeTokens;
}

export function StatusBadge({ status, T }: StatusBadgeProps) {
  const mapa: Record<PlanningStatus, { bg:string; border:string; color:string; label:string; icon:string }> = {
    verde:    { bg:T.doneBg, border:T.doneBorder, color:T.doneCheck, label:"Pronto",       icon:"🟢" },
    amarelo:  { bg:T.medBg,  border:T.medBorder,  color:T.medColor,  label:"Atenção",      icon:"🟡" },
    vermelho: { bg:T.urgBg,  border:T.urgBorder,  color:T.urgColor,  label:"Insuficiente", icon:"🔴" },
  };
  const c = mapa[status];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:c.bg,
      border:`1px solid ${c.border}`, color:c.color, fontSize:10.5, fontWeight:700,
      padding:"3px 8px", borderRadius:99, alignSelf:"flex-start" }}>{c.icon} {c.label}</span>
  );
}
