import { useMemo } from 'react';
import { ALIMENTOS_CONFIG } from '../../constants/travel';
import { EQUIPAMENTOS_SEGURANCA_IDS } from '../../constants/equipment';
import {
  calcAguaInteligente,
  calcAlimentacaoInteligente,
  montarLinhasAlimentacaoInteligente,
  type FoodResult,
  type WaterResult,
} from '../../services/calculator.service';
import { calcTotal } from '../../services/equipment.service';
import {
  calcEnergiaAutomatica,
  gerarRecomendacoes,
  piorStatus,
  statusAgua,
  statusBicicleta,
  statusDinheiro,
  statusPercentual,
  statusPorDias,
  type EnergiaAutomaticaResult,
  type PlanningRecommendation,
  type PlanningStatus,
} from '../../services/planning.service';
import type { Item } from '../../types';
import { parseNum } from '../../utils/format';
import type { FoodFormState } from '../Calculadora/types';

export interface PlanningSummaryItem {
  id: string;
  icon: string;
  label: string;
  status: PlanningStatus;
}

export interface PlanningAnalysis {
  diasNum: number;
  dinheiroNum: number;
  custoEquipPendentes: number;
  custoTotal: number;
  rComida: FoodResult;
  rAgua: WaterResult;
  rEnergia: EnergiaAutomaticaResult;
  itensSeguranca: Item[];
  segurancaFaltando: Item[];
  segurancaComprados: number;
  resumo: PlanningSummaryItem[];
  recomendacoes: PlanningRecommendation[];
}

interface PlanningAnalysisInput {
  items: Item[];
  dias: string;
  kmPrevistos: string;
  mediaKmDia: string;
  dinheiro: string;
  alimentos: FoodFormState;
  litrosAgua: string;
  reabastece: boolean;
  frequenciaDias: string;
}

export function usePlanningAnalysis(input: PlanningAnalysisInput): PlanningAnalysis {
  return useMemo(() => {
    const diasNum = parseNum(input.dias);
    const linhasComida = montarLinhasAlimentacaoInteligente(ALIMENTOS_CONFIG, input.alimentos);
    const rComida = calcAlimentacaoInteligente(linhasComida);
    const rAgua = calcAguaInteligente(input.litrosAgua, input.reabastece, input.frequenciaDias);
    const rEnergia = calcEnergiaAutomatica(input.items);
    const custoEquipPendentes = calcTotal(input.items.filter(item => item.status === 'pendente'));
    const custoTotal = rComida.valorTotal + custoEquipPendentes;
    const dinheiroNum = parseNum(input.dinheiro);
    const itensSeguranca = input.items.filter(item => EQUIPAMENTOS_SEGURANCA_IDS.includes(item.id));
    const segurancaFaltando = itensSeguranca.filter(item => item.status === 'pendente');
    const segurancaComprados = itensSeguranca.filter(item => item.status === 'comprado').length;
    const abrigoItens = input.items.filter(item => item.categoryId === 'abrigo');
    const abrigoComprados = abrigoItens.filter(item => item.status === 'comprado').length;

    const statusBike = piorStatus(
      statusBicicleta(parseNum(input.kmPrevistos), parseNum(input.mediaKmDia), diasNum),
      statusPercentual(segurancaComprados, itensSeguranca.length),
    );

    const resumo: PlanningSummaryItem[] = [
      { id:'bike', icon:'🚲', label:'Bicicleta', status:statusBike },
      { id:'comida', icon:'🍱', label:'Alimentação', status:statusPorDias(rComida.valido ? rComida.dias : null, diasNum) },
      { id:'agua', icon:'💧', label:'Água', status:statusAgua(rAgua, diasNum) },
      { id:'energia', icon:'⚡', label:'Energia', status:rEnergia.autossustentavel ? 'verde' : statusPorDias(rEnergia.dias, diasNum) },
      { id:'abrigo', icon:'🏕️', label:'Abrigo', status:statusPercentual(abrigoComprados, abrigoItens.length) },
      { id:'dinheiro', icon:'💰', label:'Dinheiro', status:statusDinheiro(dinheiroNum, custoTotal) },
    ];

    const recomendacoes = gerarRecomendacoes({
      diasViagem:diasNum,
      linhasComida,
      diasComida:rComida.valido ? rComida.dias : null,
      agua:rAgua,
      dinheiroDisponivel:dinheiroNum,
      custoTotal,
      energiaAutossustentavel:rEnergia.autossustentavel,
      diasEnergia:rEnergia.dias,
      temPainel:rEnergia.temPainel,
      temBateria:rEnergia.temBateria,
      itensSegurancaFaltando:segurancaFaltando,
    });

    return {
      diasNum, dinheiroNum, custoEquipPendentes, custoTotal,
      rComida, rAgua, rEnergia, itensSeguranca, segurancaFaltando,
      segurancaComprados, resumo, recomendacoes,
    };
  }, [
    input.items, input.dias, input.kmPrevistos, input.mediaKmDia, input.dinheiro,
    input.alimentos, input.litrosAgua, input.reabastece, input.frequenciaDias,
  ]);
}
