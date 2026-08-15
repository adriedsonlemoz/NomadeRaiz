import { calcBicicleta } from '../../services/calculator.service';
import { EmptyState } from '../../components/common';
import { CalcField } from './CalcAtoms';
import type { BikeFormState, StateSetter } from './types';

interface BikeCardProps {
  bike: BikeFormState;
  setBike: StateSetter<BikeFormState>;
}

export function BikeCard({ bike, setBike }: BikeCardProps) {
  const r = calcBicicleta(bike.velocidade, bike.horas, bike.dias);
  return (
    <div className="nr14-42841f2c">
      <div className="nr14-4e330d89">
        <CalcField label="Velocidade média" suffix="km/h" placeholder="Ex: 15"
          value={bike.velocidade} onChange={v=>setBike(b=>({...b, velocidade:v}))}/>
        <CalcField label="Horas pedalando/dia" suffix="h" placeholder="Ex: 4"
          value={bike.horas} onChange={v=>setBike(b=>({...b, horas:v}))}/>
      </div>
      <CalcField label="Dias de viagem" suffix="dias" placeholder="Ex: 20"
        value={bike.dias} onChange={v=>setBike(b=>({...b, dias:v}))}/>
      {r.valido ? (
        <div className="nr14-3efc9879">
          <div className="nr14-dfed5799">
            <p className="nr14-aef0095b">{Math.round(r.kmDia)}</p>
            <p className="nr14-3464d7af">km/dia</p>
          </div>
          <div className="nr14-dfed5799">
            <p className="nr14-aef0095b">{Math.round(r.distanciaTotal)}</p>
            <p className="nr14-3464d7af">km na viagem</p>
          </div>
        </div>
      ) : <EmptyState text="Informe velocidade média e horas por dia para calcular."/>}
    </div>
  );
}
