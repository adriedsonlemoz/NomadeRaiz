import { parseNum } from '../../utils/format';
import { calcEnergia } from '../../services/calculator.service';
import { EmptyState } from '../../components/common';
import type { ThemeTokens } from '../../styles/theme';
import { CalcField, ResultBadge } from './CalcAtoms';
import type { EnergyFormState, StateSetter } from './types';

interface EnergiaCardProps {
  energia: EnergyFormState;
  setEnergia: StateSetter<EnergyFormState>;
  T: ThemeTokens;
}

export function EnergiaCard({ energia, setEnergia, T }: EnergiaCardProps) {
  const r = calcEnergia(energia.painel, energia.horasSol, energia.bateria, energia.powerbank, energia.equip);
  const toggleEquip = (id: string) => setEnergia(e => ({...e, equip:e.equip.map(q=>q.id===id?{...q, ativo:!q.ativo}:q)}));
  const setConsumo = (id: string, value: string) => setEnergia(e => ({
    ...e,
    equip:e.equip.map(q=>q.id===id?{...q, consumoWhDia:parseNum(value)}:q),
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <CalcField T={T} label="Painel solar" suffix="W" placeholder="Ex: 20"
          value={energia.painel} onChange={v=>setEnergia(e=>({...e, painel:v}))}/>
        <CalcField T={T} label="Horas de sol/dia" suffix="h" placeholder="Ex: 5"
          value={energia.horasSol} onChange={v=>setEnergia(e=>({...e, horasSol:v}))}/>
        <CalcField T={T} label="Bateria LiFePO₄" suffix="Wh" placeholder="Ex: 240"
          value={energia.bateria} onChange={v=>setEnergia(e=>({...e, bateria:v}))}/>
        <CalcField T={T} label="Power Bank" suffix="Wh" placeholder="Ex: 37"
          value={energia.powerbank} onChange={v=>setEnergia(e=>({...e, powerbank:v}))}/>
      </div>
      <div>
        <p style={{ color:T.textSub, fontSize:11.5, fontWeight:600, margin:'0 0 6px' }}>Equipamentos em uso:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {energia.equip.map(eq => (
            <div key={eq.id} style={{ display:'flex', alignItems:'center', gap:8,
              background:T.white, border:`1px solid ${T.border}`, borderRadius:10, padding:'7px 10px' }}>
              <button onClick={()=>toggleEquip(eq.id)} style={{ width:20, height:20, borderRadius:6,
                border:`1.5px solid ${eq.ativo?T.blue:T.border}`, background:eq.ativo?T.blue:'transparent',
                color:'#fff', fontSize:12, cursor:'pointer', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}>{eq.ativo?'✓':''}</button>
              <span style={{ flex:1, color:T.textMain, fontSize:12.5 }}>{eq.nome}</span>
              <input type="number" min="0" value={eq.consumoWhDia} onChange={ev=>setConsumo(eq.id, ev.target.value)}
                style={{ width:50, padding:'4px 6px', border:`1px solid ${T.border}`, borderRadius:6,
                  fontSize:11, textAlign:'right', background:T.blueLight, outline:'none' }}/>
              <span style={{ fontSize:9.5, color:T.textMuted }}>Wh/d</span>
            </div>
          ))}
        </div>
      </div>
      {r.valido ? (
        <>
          {r.autossustentavel ? (
            <div style={{ background:T.doneBg, border:`1.5px solid ${T.doneBorder}`, borderRadius:14,
              padding:'14px', textAlign:'center' }}>
              <p style={{ color:T.doneCheck, fontSize:18, fontWeight:900, margin:0 }}>♾️ Autossustentável</p>
              <p style={{ color:T.textSub, fontSize:11.5, margin:'4px 0 0' }}>
                O painel gera mais do que você consome por dia.</p>
            </div>
          ) : <ResultBadge T={T} dias={r.dias} label="dias de uso dos equipamentos"/>}
          <div style={{ background:T.blueLight, border:`1px solid ${T.border}`, borderRadius:10,
            padding:'10px 12px', display:'flex', justifyContent:'space-between' }}>
            <span style={{ color:T.textSub, fontSize:12 }}>Geração estimada do painel</span>
            <span style={{ color:T.blue, fontWeight:800, fontSize:12 }}>{Math.round(r.geracaoDiariaWh)} Wh/dia</span>
          </div>
        </>
      ) : <EmptyState text="Marque ao menos um equipamento em uso para calcular."/>}
    </div>
  );
}
