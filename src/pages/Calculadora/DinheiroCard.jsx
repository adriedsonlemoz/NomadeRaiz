import { fmt } from "../../utils/format";
import { calcDinheiro } from "../../services/calculator.service";
import { EmptyState } from "../../components/common";
import { CalcField, ResultBadge } from "./CalcAtoms";

export function DinheiroCard({ dinheiro, setDinheiro, T }) {
  const r = calcDinheiro(dinheiro.disponivel, dinheiro.gastoDia);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
      <CalcField T={T} label="Dinheiro disponível" suffix="R$" placeholder="Ex: 300"
        value={dinheiro.disponivel} onChange={v=>setDinheiro(d=>({...d, disponivel:v}))}/>
      <CalcField T={T} label="Gasto médio por dia" suffix="R$" placeholder="Ex: 15"
        value={dinheiro.gastoDia} onChange={v=>setDinheiro(d=>({...d, gastoDia:v}))}/>
      {r.valido
        ? <ResultBadge T={T} dias={r.dias} label="dias antes do dinheiro acabar"
            sub={`${fmt(r.gastoDia)}/dia com ${fmt(r.disponivel)} disponíveis`}/>
        : <EmptyState T={T} text="Informe o dinheiro disponível e o gasto médio diário."/>}
    </div>
  );
}
