import { fmt } from "../../utils/format";
import { calcCustoViagem } from "../../services/calculator.service";
import { CalcField } from "./CalcAtoms";

export function CustoCard({ custo, setCusto, T }) {
  const r = calcCustoViagem(custo.dias, custo.alimentacao, custo.transporte, custo.manutencao, custo.outros);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
      <CalcField T={T} label="Quantidade de dias" suffix="dias" placeholder="Ex: 20"
        value={custo.dias} onChange={v=>setCusto(c=>({...c, dias:v}))}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <CalcField T={T} label="Alimentação/dia" suffix="R$" placeholder="Ex: 15"
          value={custo.alimentacao} onChange={v=>setCusto(c=>({...c, alimentacao:v}))}/>
        <CalcField T={T} label="Transporte" suffix="R$" placeholder="Ex: 0"
          value={custo.transporte} onChange={v=>setCusto(c=>({...c, transporte:v}))}/>
        <CalcField T={T} label="Manutenção" suffix="R$" placeholder="Ex: 50"
          value={custo.manutencao} onChange={v=>setCusto(c=>({...c, manutencao:v}))}/>
        <CalcField T={T} label="Outros gastos" suffix="R$" placeholder="Ex: 30"
          value={custo.outros} onChange={v=>setCusto(c=>({...c, outros:v}))}/>
      </div>
      <div style={{ background:T.navy, borderRadius:14, padding:"16px", textAlign:"center" }}>
        <p style={{ color:"#fff", fontSize:26, fontWeight:900, margin:0 }}>{fmt(r.total)}</p>
        <p style={{ color:"#7ea3d4", fontSize:12, fontWeight:700, margin:"2px 0 0" }}>custo total estimado da viagem</p>
      </div>
    </div>
  );
}
