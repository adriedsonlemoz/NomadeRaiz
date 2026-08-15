import { parseNum } from '../../utils/format';
import { calcEnergia } from '../../services/calculator.service';
import { EmptyState } from '../../components/common';
import { CalcField, ResultBadge } from './CalcAtoms';
import type { EnergyFormState, StateSetter } from './types';

interface EnergiaCardProps {
  energia: EnergyFormState;
  setEnergia: StateSetter<EnergyFormState>;
}

export function EnergiaCard({ energia, setEnergia }: EnergiaCardProps) {
  const r = calcEnergia(energia.painel, energia.horasSol, energia.bateria, energia.powerbank, energia.equip);
  const toggleEquip = (id: string) => setEnergia(e => ({...e, equip:e.equip.map(q=>q.id===id?{...q, ativo:!q.ativo}:q)}));
  const setConsumo = (id: string, value: string) => setEnergia(e => ({
    ...e,
    equip:e.equip.map(q=>q.id===id?{...q, consumoWhDia:parseNum(value)}:q),
  }));

  return (
    <div className="nr14-42841f2c">
      <div className="nr14-4e330d89">
        <CalcField label="Painel solar" suffix="W" placeholder="Ex: 20"
          value={energia.painel} onChange={v=>setEnergia(e=>({...e, painel:v}))}/>
        <CalcField label="Horas de sol/dia" suffix="h" placeholder="Ex: 5"
          value={energia.horasSol} onChange={v=>setEnergia(e=>({...e, horasSol:v}))}/>
        <CalcField label="Bateria LiFePO₄" suffix="Wh" placeholder="Ex: 240"
          value={energia.bateria} onChange={v=>setEnergia(e=>({...e, bateria:v}))}/>
        <CalcField label="Power Bank" suffix="Wh" placeholder="Ex: 37"
          value={energia.powerbank} onChange={v=>setEnergia(e=>({...e, powerbank:v}))}/>
      </div>
      <div>
        <p className="nr14-07725563">Equipamentos em uso:</p>
        <div className="nr14-14b4b58a">
          {energia.equip.map(eq => (
            <div key={eq.id} className="nr14-ebd8227f">
              <button onClick={()=>toggleEquip(eq.id)} className="nr-check-square" aria-pressed={eq.ativo}>{eq.ativo?'✓':''}</button>
              <span className="nr14-e4ba29ac">{eq.nome}</span>
              <input type="number" min="0" value={eq.consumoWhDia} onChange={ev=>setConsumo(eq.id, ev.target.value)}
                className="nr14-6c40acdc"/>
              <span className="nr14-bed7c238">Wh/d</span>
            </div>
          ))}
        </div>
      </div>
      {r.valido ? (
        <>
          {r.autossustentavel ? (
            <div className="nr14-93361cb1">
              <p className="nr14-7da00e72">♾️ Autossustentável</p>
              <p className="nr14-1d7ab11e">
                O painel gera mais do que você consome por dia.</p>
            </div>
          ) : <ResultBadge dias={r.dias} label="dias de uso dos equipamentos"/>}
          <div className="nr14-545bf27b">
            <span className="nr14-ad7dcd81">Geração estimada do painel</span>
            <span className="nr14-81a1cd3e">{Math.round(r.geracaoDiariaWh)} Wh/dia</span>
          </div>
        </>
      ) : <EmptyState text="Marque ao menos um equipamento em uso para calcular."/>}
    </div>
  );
}
