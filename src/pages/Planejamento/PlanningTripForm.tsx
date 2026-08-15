import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { TIPOS_VIAGEM } from '../../constants/travel';
import type { TravelTypeId } from '../../types';

interface Props {
  destino: string; setDestino: Dispatch<SetStateAction<string>>;
  dias: string; setDias: Dispatch<SetStateAction<string>>;
  pessoas: string; setPessoas: Dispatch<SetStateAction<string>>;
  kmPrevistos: string; setKmPrevistos: Dispatch<SetStateAction<string>>;
  mediaKmDia: string; setMediaKmDia: Dispatch<SetStateAction<string>>;
  dinheiro: string; setDinheiro: Dispatch<SetStateAction<string>>;
  tipoViagem: TravelTypeId; setTipoViagem: Dispatch<SetStateAction<TravelTypeId>>;
}

export function PlanningTripForm(props: Props) {
  const valueOf = (event: ChangeEvent<HTMLInputElement>) => event.target.value;
  return <div className="nr14-a56c85e3">
    <div>
      <p className="nr-field-label">📍 Destino (opcional)</p>
      <input className="nr-input nr-input--soft" value={props.destino} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setDestino(valueOf(event))} placeholder="Ex: Serra da Canastra"/>
    </div>
    <div className="nr14-4e330d89">
      <div><p className="nr-field-label">📅 Dias de viagem</p><input className="nr-input nr-input--soft" type="number" min="0" value={props.dias} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setDias(valueOf(event))} placeholder="Ex: 7"/></div>
      <div><p className="nr-field-label">👥 Pessoas</p><input className="nr-input nr-input--soft" type="number" min="1" value={props.pessoas} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setPessoas(valueOf(event))} placeholder="1"/></div>
      <div><p className="nr-field-label">🚲 Km previstos</p><input className="nr-input nr-input--soft" type="number" min="0" value={props.kmPrevistos} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setKmPrevistos(valueOf(event))} placeholder="Ex: 280"/></div>
      <div><p className="nr-field-label">🚴 Média km/dia</p><input className="nr-input nr-input--soft" type="number" min="0" value={props.mediaKmDia} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setMediaKmDia(valueOf(event))} placeholder="Ex: 40"/></div>
    </div>
    <div><p className="nr-field-label">💰 Dinheiro disponível</p><input className="nr-input nr-input--soft" type="number" min="0" value={props.dinheiro} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setDinheiro(valueOf(event))} placeholder="Ex: 300"/></div>
    <div>
      <p className="nr-field-label">🏕️ Tipo de viagem</p>
      <div className="nr14-52b85aca">
        {TIPOS_VIAGEM.map(tipo => <button key={tipo.id} onClick={()=>props.setTipoViagem(tipo.id)} className="nr-choice-chip" aria-pressed={props.tipoViagem===tipo.id}><span>{tipo.icon}</span>{tipo.label}</button>)}
      </div>
    </div>
  </div>;
}
