import type { ThemeTokens } from "../../styles/theme";
import type { BikeSkillLevel } from "../../types";

interface NivelBadgeProps {
  nivel: BikeSkillLevel;
  T: ThemeTokens;
}

export function NivelBadge({ nivel, T }: NivelBadgeProps) {
  const mapa: Record<BikeSkillLevel, { color:string; bg:string; border:string; label:string; icon:string }> = {
    basico:        { color:T.doneCheck, bg:T.doneBg, border:T.doneBorder, label:"Básico",        icon:"🟢" },
    intermediario: { color:T.medColor,  bg:T.medBg,  border:T.medBorder,  label:"Intermediário", icon:"🟡" },
    avancado:      { color:T.urgColor,  bg:T.urgBg,  border:T.urgBorder,  label:"Avançado",       icon:"🔴" },
  };
  const c = mapa[nivel] ?? mapa.basico;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:c.bg,
      border:`1px solid ${c.border}`, color:c.color, fontSize:10, fontWeight:700,
      padding:"3px 8px", borderRadius:99 }}>{c.icon} {c.label}</span>
  );
}
