import { calcBicicleta } from "../../services/calculator.service";
import { EmptyState } from "../../components/common";
import { CalcField } from "./CalcAtoms";

export function BikeCard({ bike, setBike, T }) {
  const r = calcBicicleta(bike.velocidade, bike.horas, bike.dias);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <CalcField T={T} label="Velocidade média" suffix="km/h" placeholder="Ex: 15"
          value={bike.velocidade} onChange={v=>setBike(b=>({...b, velocidade:v}))}/>
        <CalcField T={T} label="Horas pedalando/dia" suffix="h" placeholder="Ex: 4"
          value={bike.horas} onChange={v=>setBike(b=>({...b, horas:v}))}/>
      </div>
      <CalcField T={T} label="Dias de viagem" suffix="dias" placeholder="Ex: 20"
        value={bike.dias} onChange={v=>setBike(b=>({...b, dias:v}))}/>
      {r.valido ? (
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1, background:T.white, border:`1px solid ${T.border}`, borderRadius:14,
            padding:"14px", textAlign:"center" }}>
            <p style={{ color:T.blue, fontSize:24, fontWeight:900, margin:0 }}>{Math.round(r.kmDia)}</p>
            <p style={{ color:T.textMuted, fontSize:10.5, margin:"2px 0 0" }}>km/dia</p>
          </div>
          <div style={{ flex:1, background:T.white, border:`1px solid ${T.border}`, borderRadius:14,
            padding:"14px", textAlign:"center" }}>
            <p style={{ color:T.blue, fontSize:24, fontWeight:900, margin:0 }}>{Math.round(r.distanciaTotal)}</p>
            <p style={{ color:T.textMuted, fontSize:10.5, margin:"2px 0 0" }}>km na viagem</p>
          </div>
        </div>
      ) : <EmptyState T={T} text="Informe velocidade média e horas por dia para calcular."/>}
    </div>
  );
}
