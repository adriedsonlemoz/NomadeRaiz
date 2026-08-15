import { fmt } from '../../utils/format';
import { calcDinheiro } from '../../services/calculator.service';
import { EmptyState } from '../../components/common';
import { CalcField, ResultBadge } from './CalcAtoms';
import type { MoneyFormState, StateSetter } from './types';

interface DinheiroCardProps {
  dinheiro: MoneyFormState;
  setDinheiro: StateSetter<MoneyFormState>;
}

export function DinheiroCard({ dinheiro, setDinheiro }: DinheiroCardProps) {
  const r = calcDinheiro(dinheiro.disponivel, dinheiro.gastoDia);
  return (
    <div className="nr14-42841f2c">
      <CalcField label="Dinheiro disponível" suffix="R$" placeholder="Ex: 300"
        value={dinheiro.disponivel} onChange={v=>setDinheiro(d=>({...d, disponivel:v}))}/>
      <CalcField label="Gasto médio por dia" suffix="R$" placeholder="Ex: 15"
        value={dinheiro.gastoDia} onChange={v=>setDinheiro(d=>({...d, gastoDia:v}))}/>
      {r.valido
        ? <ResultBadge dias={r.dias} label="dias antes do dinheiro acabar"
            sub={`${fmt(r.gastoDia)}/dia com ${fmt(r.disponivel)} disponíveis`}/>
        : <EmptyState text="Informe o dinheiro disponível e o gasto médio diário."/>}
    </div>
  );
}
