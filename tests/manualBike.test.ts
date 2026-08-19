import { DICAS_RAPIDAS_BIKE, GLOSSARIO_BIKE, KIT_MINIMO_FERRAMENTAS, PECAS_BIKE, PROBLEMAS_ESTRADA } from '../src/constants/manualBike';
import type { TestCase } from './test.types';

const assert = (condition:boolean, message:string) => { if (!condition) throw new Error(message); };

export const cases: TestCase[] = [
 { name:'manual possui conteúdo técnico expandido', run:()=>{ assert(PECAS_BIKE.length>=10,'esperado pelo menos 10 peças'); assert(PROBLEMAS_ESTRADA.length>=8,'esperado pelo menos 8 problemas'); assert(GLOSSARIO_BIKE.length>=12,'glossário ainda pequeno'); assert(DICAS_RAPIDAS_BIKE.length>=6,'dicas rápidas insuficientes'); } },
 { name:'todas as peças têm diagnóstico, ferramentas e critério de parada', run:()=>{ for (const p of PECAS_BIKE) { assert(p.sinaisAtencao.length>=2,`${p.nome}: sinais insuficientes`); assert(p.ferramentas.length>=1,`${p.nome}: sem ferramentas`); assert(p.antesDeMexer.length>=1,`${p.nome}: sem orientação prévia`); assert(p.comoResolver.length>=3,`${p.nome}: passo a passo curto`); assert(p.quandoParar.length>20,`${p.nome}: sem critério de parada`); } } },
 { name:'problemas de alta gravidade explicam quando não continuar', run:()=>{ const criticos=PROBLEMAS_ESTRADA.filter(p=>p.gravidade==='alta'); assert(criticos.length>=3,'poucos problemas críticos'); for (const p of criticos) { assert(p.naoFaca.length>=2,`${p.nome}: alertas insuficientes`); assert(/não|pare|somente|só/i.test(p.podeContinuar),`${p.nome}: continuidade pouco clara`); } } },
 { name:'kit de estrada cobre ferramentas essenciais ampliadas', run:()=>{ const ids=new Set(KIT_MINIMO_FERRAMENTAS.map(x=>x.id)); for (const id of ['bomba','remendo','camara-reserva','multitool','elo','extrator']) assert(ids.has(id),`ferramenta ausente: ${id}`); } },
];
