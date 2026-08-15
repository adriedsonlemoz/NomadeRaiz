import type { AutonomyIndexResult, AutonomyResource, AutonomyTabId } from './types';

interface ResumoCardProps {
  recursos: AutonomyResource[];
  resultadoGeral: AutonomyIndexResult;
  onSelect: (tab: AutonomyTabId) => void;
}

export function ResumoCard({ recursos, resultadoGeral, onSelect }: ResumoCardProps) {
  return (
    <div className="nr14-be265379">
      {recursos.map(r => {
        return (
          <button key={r.id} onClick={()=>onSelect(r.id)} className="nr-autonomy-resource" data-state={r.estado}>
            <div className="nr-autonomy-resource__icon">{r.icon}</div>
            <div className="nr14-22ee3aed">
              <p className="nr14-61833899">{r.label}</p>
              <p className="nr14-898c52fb">{r.nota}</p>
            </div>
            <div className="nr-autonomy-resource__dot"/>
          </button>
        );
      })}
      <div className="nr14-bb8a5066">
        {resultadoGeral.dias !== null ? (
          <>
            <p className="nr14-6579d20d">Autonomia estimada</p>
            <p className="nr14-16ad5fee">
              {resultadoGeral.dias} <span className="nr14-ee5749fc">dias</span></p>
            <p className="nr14-8adae2a1">
              Com os recursos atuais, sua autonomia estimada é de aproximadamente{' '}
              <b className="nr14-729d2fa4">{resultadoGeral.dias} dias</b>
              {resultadoGeral.gargalo && <> — limitada por <b className="nr14-729d2fa4">
                {resultadoGeral.gargalo.label.toLowerCase()}</b></>}.
            </p>
          </>
        ) : (
          <p className="nr14-41f2d4e9">
            Preencha alimentação, água, energia e dinheiro para ver sua autonomia estimada.</p>
        )}
      </div>
    </div>
  );
}
