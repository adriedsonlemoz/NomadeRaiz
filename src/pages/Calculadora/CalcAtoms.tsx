import type { AutonomyState } from './types';

export function estadoAutonomia(dias: number | null | undefined): AutonomyState {
  if (dias === null || dias === undefined) return 'indefinido';
  if (dias >= 7) return 'boa';
  if (dias >= 3) return 'media';
  return 'critica';
}


export interface CalcFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
}

export function CalcField({ label, value, onChange, placeholder, suffix }: CalcFieldProps) {
  return (
    <div>
      <p className="nr14-fc5e2cb4">{label}</p>
      <div className="nr14-d461c96d">
        <input type="number" min="0" inputMode="decimal" value={value} placeholder={placeholder}
          onChange={e=>onChange(e.target.value)}
          className="nr14-7341edd8"/>
        {suffix && <span className="nr14-19b92e1c">{suffix}</span>}
      </div>
    </div>
  );
}

export interface ResultBadgeProps {
  dias: number | null;
  label: string;
  sub?: string;
}

export function ResultBadge({ dias, label, sub }: ResultBadgeProps) {
  const estado = estadoAutonomia(dias);
  return (
    <div className="nr-result-panel nr-result-panel--autonomy" data-state={estado==='boa'?'ok':estado==='media'?'warning':estado==='critica'?'danger':'neutral'}>
      <p className="nr-result-panel__value">{dias === null ? '—' : dias}</p>
      <p className="nr-result-panel__label">{label}</p>
      {sub && <p className="nr14-ff5d7b89">{sub}</p>}
    </div>
  );
}
