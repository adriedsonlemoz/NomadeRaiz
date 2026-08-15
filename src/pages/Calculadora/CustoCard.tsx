import { fmt } from '../../utils/format';
import { calcCustoViagem } from '../../services/calculator.service';
import { CalcField } from './CalcAtoms';
import type { CostFormState, StateSetter } from './types';

interface CustoCardProps {
  custo: CostFormState;
  setCusto: StateSetter<CostFormState>;
}

export function CustoCard({ custo, setCusto }: CustoCardProps) {
  const r = calcCustoViagem(custo.dias, custo.alimentacao, custo.transporte, custo.manutencao, custo.outros);
  return (
    <div className="nr14-42841f2c">
      <CalcField label="Quantidade de dias" suffix="dias" placeholder="Ex: 20"
        value={custo.dias} onChange={v=>setCusto(c=>({...c, dias:v}))}/>
      <div className="nr14-4e330d89">
        <CalcField label="Alimentação/dia" suffix="R$" placeholder="Ex: 15"
          value={custo.alimentacao} onChange={v=>setCusto(c=>({...c, alimentacao:v}))}/>
        <CalcField label="Transporte" suffix="R$" placeholder="Ex: 0"
          value={custo.transporte} onChange={v=>setCusto(c=>({...c, transporte:v}))}/>
        <CalcField label="Manutenção" suffix="R$" placeholder="Ex: 50"
          value={custo.manutencao} onChange={v=>setCusto(c=>({...c, manutencao:v}))}/>
        <CalcField label="Outros gastos" suffix="R$" placeholder="Ex: 30"
          value={custo.outros} onChange={v=>setCusto(c=>({...c, outros:v}))}/>
      </div>
      <div className="nr14-4e57948a">
        <p className="nr14-2a07615b">{fmt(r.total)}</p>
        <p className="nr14-73458692">custo total estimado da viagem</p>
      </div>
    </div>
  );
}
