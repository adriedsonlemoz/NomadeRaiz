import { parseNum } from '../utils/format';

export function calcEnergiaAutomatica(items=[]){
  const adquiridos=(items||[]).filter(i=>i.status==='comprado');
  const byName=(termos)=>adquiridos.find(i=>termos.some(t=>String(i.name).toLowerCase().includes(t)));
  const painel=byName(['painel solar','solar']);
  const bateria=byName(['power bank','powerbank','bateria']);
  const temPainel=!!painel;
  const temBateria=!!bateria;
  // Estimativa conservadora quando o cadastro não possui Wh/W explícitos.
  const painelW=temPainel ? 20 : 0;
  const horasSol=5;
  const geracaoDiariaWh=painelW*horasSol*.75;
  const reservaWh=temBateria ? 74 : 0;
  const consumoWhDia=20;
  const saldo=consumoWhDia-geracaoDiariaWh;
  const autossustentavel=temPainel && geracaoDiariaWh>=consumoWhDia;
  const dias=autossustentavel ? null : (reservaWh>0 ? Number((reservaWh/Math.max(saldo,consumoWhDia)).toFixed(1)) : 0);
  const horasRecarga=temPainel&&reservaWh>0 ? Number((reservaWh/Math.max(painelW*.75,1)).toFixed(1)) : null;
  return {temPainel,temBateria,autossustentavel,dias,geracaoDiariaWh,horasRecarga};
}
export const statusPorDias=(disp,necess)=>!disp||!necess?'amarelo':disp>=necess?'verde':disp>=necess*.65?'amarelo':'vermelho';
export const statusPercentual=(ok,total)=>total<=0?'amarelo':ok/total>=.8?'verde':ok/total>=.5?'amarelo':'vermelho';
export const statusBicicleta=(km,media,dias)=>{km=parseNum(km);media=parseNum(media);dias=parseNum(dias);if(!km||!media||!dias)return'amarelo';return media*dias>=km?'verde':media*dias>=km*.75?'amarelo':'vermelho'};
export const statusAgua=(r,dias)=>r?.reabastece?(r.suficientePorIntervalo?'verde':'amarelo'):statusPorDias(r?.dias,dias);
export const statusDinheiro=(d,c)=>!c?'amarelo':d>=c?'verde':d>=c*.7?'amarelo':'vermelho';
const w={verde:0,amarelo:1,vermelho:2};
export const piorStatus=(...s)=>s.sort((a,b)=>(w[b]??1)-(w[a]??1))[0]||'amarelo';

export function gerarRecomendacoes(d={}){
  const r=[];
  const push=(tipo,texto)=>r.push({tipo,texto});
  if(d.diasViagem&&!d.diasComida) push('atencao','Defina a alimentação para calcular a autonomia.');
  else if(d.diasComida<d.diasViagem) push('alerta','Leve mais alimentação ou planeje pontos de compra no caminho.');
  if(!d.agua?.reabastece && d.agua?.valido && d.agua?.dias<d.diasViagem) push('alerta','A água carregada não cobre toda a viagem; planeje pontos de reabastecimento.');
  if(d.agua?.reabastece && !d.agua?.suficientePorIntervalo) push('atencao','A reserva de água pode não cobrir o intervalo informado entre reabastecimentos.');
  if(d.custoTotal>0 && d.dinheiroDisponivel<d.custoTotal) push('alerta','O orçamento disponível está abaixo do custo estimado.');
  if(!d.temBateria) push('atencao','Considere levar uma reserva de energia, como power bank ou bateria.');
  if(!d.temPainel && d.diasViagem>3) push('atencao','Para uma viagem mais longa, um painel solar pode aumentar a autonomia de energia.');
  if((d.itensSegurancaFaltando||[]).length) push('alerta',`Faltam ${d.itensSegurancaFaltando.length} itens essenciais de segurança.`);
  if(!r.length) push('ok','Os recursos principais estão compatíveis com a viagem planejada.');
  return r;
}
