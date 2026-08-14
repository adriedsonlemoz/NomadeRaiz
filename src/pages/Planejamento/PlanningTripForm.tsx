import type { ChangeEvent, Dispatch, SetStateAction, CSSProperties } from 'react';
import { TIPOS_VIAGEM } from '../../constants/travel';
import type { ThemeTokens } from '../../styles/theme';
import type { TravelTypeId } from '../../types';

interface Props {
  T: ThemeTokens;
  destino: string; setDestino: Dispatch<SetStateAction<string>>;
  dias: string; setDias: Dispatch<SetStateAction<string>>;
  pessoas: string; setPessoas: Dispatch<SetStateAction<string>>;
  kmPrevistos: string; setKmPrevistos: Dispatch<SetStateAction<string>>;
  mediaKmDia: string; setMediaKmDia: Dispatch<SetStateAction<string>>;
  dinheiro: string; setDinheiro: Dispatch<SetStateAction<string>>;
  tipoViagem: TravelTypeId; setTipoViagem: Dispatch<SetStateAction<TravelTypeId>>;
}

export function PlanningTripForm(props: Props) {
  const { T } = props;
  const valueOf = (event: ChangeEvent<HTMLInputElement>) => event.target.value;
  const campo: CSSProperties = { padding:'10px 12px', border:`1.5px solid ${T.border}`, borderRadius:10,
    fontSize:13.5, color:T.textMain, background:T.blueLight, outline:'none',
    fontFamily:'inherit', width:'100%', boxSizing:'border-box' };
  const labelStyle: CSSProperties = { color:T.textSub, fontSize:11.5, fontWeight:600, margin:'0 0 4px' };

  return <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
    <div>
      <p style={labelStyle}>📍 Destino (opcional)</p>
      <input style={campo} value={props.destino} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setDestino(valueOf(event))} placeholder="Ex: Serra da Canastra"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
      <div><p style={labelStyle}>📅 Dias de viagem</p><input style={campo} type="number" min="0" value={props.dias} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setDias(valueOf(event))} placeholder="Ex: 7"/></div>
      <div><p style={labelStyle}>👥 Pessoas</p><input style={campo} type="number" min="1" value={props.pessoas} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setPessoas(valueOf(event))} placeholder="1"/></div>
      <div><p style={labelStyle}>🚲 Km previstos</p><input style={campo} type="number" min="0" value={props.kmPrevistos} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setKmPrevistos(valueOf(event))} placeholder="Ex: 280"/></div>
      <div><p style={labelStyle}>🚴 Média km/dia</p><input style={campo} type="number" min="0" value={props.mediaKmDia} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setMediaKmDia(valueOf(event))} placeholder="Ex: 40"/></div>
    </div>
    <div><p style={labelStyle}>💰 Dinheiro disponível</p><input style={campo} type="number" min="0" value={props.dinheiro} onChange={(event: ChangeEvent<HTMLInputElement>)=>props.setDinheiro(valueOf(event))} placeholder="Ex: 300"/></div>
    <div>
      <p style={labelStyle}>🏕️ Tipo de viagem</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {TIPOS_VIAGEM.map(tipo => <button key={tipo.id} onClick={()=>props.setTipoViagem(tipo.id)} style={{
          display:'flex', alignItems:'center', gap:6, padding:'9px 10px', borderRadius:10,
          border:`1.5px solid ${props.tipoViagem===tipo.id?T.blue:T.border}`,
          background:props.tipoViagem===tipo.id?T.blueLight:T.white,
          color:props.tipoViagem===tipo.id?T.blue:T.textSub, fontSize:11.5, fontWeight:700, cursor:'pointer',
        }}><span>{tipo.icon}</span>{tipo.label}</button>)}
      </div>
    </div>
  </div>;
}
