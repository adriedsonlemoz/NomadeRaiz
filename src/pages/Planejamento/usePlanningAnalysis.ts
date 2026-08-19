import { useMemo } from 'react';
import { ALIMENTOS_CONFIG } from '../../constants/travel';
import {
  calcAguaInteligente,
  calcAlimentacaoInteligente,
  calcNecessidadeAlimentacao,
  montarLinhasAlimentacaoInteligente,
  type FoodRequirementResult,
  type FoodResult,
  type WaterResult,
} from '../../services/calculator.service';
import { calcTotal } from '../../services/equipment.service';
import {
  calcEnergiaAutomatica,
  calcFinancialReserve,
  gerarRecomendacoes,
  getTravelPlanningProfile,
  mapSafetyEssentials,
  piorStatus,
  requiresShelter,
  statusAgua,
  statusBicicleta,
  statusDinheiro,
  statusPercentual,
  statusPorDias,
  statusRequiredItems,
  type EnergiaAutomaticaResult,
  type PlanningEssentialItem,
  type PlanningRecommendation,
  type PlanningStatus,
} from '../../services/planning.service';
import type { Item, TravelTypeId } from '../../types';
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
  pessoasNum: number;
  destino: string;
  tipoViagem: TravelTypeId;
  tipoViagemLabel: string;
  dinheiroNum: number;
  custoEquipPendentes: number;
  custoAlimentacaoInformada: number;
  custoAlimentacaoNecessaria: number;
  custoAlimentacaoFaltante: number;
  custoBase: number;
  reservaFinanceira: number;
  reservaFinanceiraPercent: number;
  custoTotal: number;
  rComida: FoodResult;
  necessidadeComida: FoodRequirementResult;
  rAgua: WaterResult;
  rEnergia: EnergiaAutomaticaResult;
  itensSeguranca: PlanningEssentialItem[];
  segurancaFaltando: PlanningEssentialItem[];
  segurancaComprados: number;
  abrigoRequerido: boolean;
  abrigoComprados: number;
  abrigoTotal: number;
  locaisAguaInformados: boolean;
  resumo: PlanningSummaryItem[];
  recomendacoes: PlanningRecommendation[];
}

interface PlanningAnalysisInput {
  items: Item[];
  destino: string;
  tipoViagem: TravelTypeId;
  pessoas: string;
  dias: string;
  kmPrevistos: string;
  mediaKmDia: string;
  dinheiro: string;
  alimentos: FoodFormState;
  litrosAgua: string;
  reabastece: boolean;
  frequenciaDias: string;
  locaisAgua: string;
}

export function usePlanningAnalysis(input: PlanningAnalysisInput): PlanningAnalysis {
  return useMemo(() => {
    const diasNum = Math.max(0, parseNum(input.dias));
    const pessoasNum = Math.max(0, Math.floor(parseNum(input.pessoas)));
    const pessoasCalculo = Math.max(1, pessoasNum);
    const profile = getTravelPlanningProfile(input.tipoViagem);
    const destino = input.destino.trim();
    const locaisAguaInformados = input.locaisAgua.trim().length > 0;

    const linhasComida = montarLinhasAlimentacaoInteligente(
      ALIMENTOS_CONFIG,
      input.alimentos,
      pessoasCalculo,
    );
    const rComida = calcAlimentacaoInteligente(linhasComida);
    const necessidadeComida = calcNecessidadeAlimentacao(linhasComida, diasNum, pessoasCalculo);
    const aguaBase = calcAguaInteligente(
      input.litrosAgua,
      input.reabastece,
      input.frequenciaDias,
      pessoasCalculo,
    );
    const rAgua: WaterResult = {
      ...aguaBase,
      pontosConfirmados: !input.reabastece || locaisAguaInformados,
    };
    const rEnergia = calcEnergiaAutomatica(input.items, pessoasCalculo);

    const custoEquipPendentes = calcTotal(input.items.filter(item => item.status === 'pendente'));
    const custoAlimentacaoInformada = rComida.valorTotal;
    const custoAlimentacaoNecessaria = necessidadeComida.valido
      ? necessidadeComida.valorNecessario
      : custoAlimentacaoInformada;
    const custoAlimentacaoFaltante = necessidadeComida.valorFaltante;
    const custoBase = custoAlimentacaoNecessaria + custoEquipPendentes;
    const reservaFinanceira = calcFinancialReserve(custoBase, input.tipoViagem);
    const custoTotal = custoBase + reservaFinanceira;
    const dinheiroNum = Math.max(0, parseNum(input.dinheiro));

    const itensSeguranca = mapSafetyEssentials(input.items);
    const segurancaFaltando = itensSeguranca.filter(item => !item.comprado);
    const segurancaComprados = itensSeguranca.length - segurancaFaltando.length;

    const abrigoItens = input.items.filter(item => item.categoryId === 'abrigo');
    const abrigoComprados = abrigoItens.filter(item => item.status === 'comprado' && parseNum(item.quantity) > 0).length;
    const abrigoRequerido = requiresShelter(input.tipoViagem, diasNum);

    const statusBike = piorStatus(
      statusBicicleta(parseNum(input.kmPrevistos), parseNum(input.mediaKmDia), diasNum),
      statusPercentual(segurancaComprados, itensSeguranca.length),
    );

    const resumo: PlanningSummaryItem[] = [
      { id:'bike', icon:'🚲', label:'Bicicleta', status:statusBike },
      { id:'comida', icon:'🍱', label:'Alimentação', status:statusPorDias(rComida.valido ? rComida.dias : null, diasNum) },
      { id:'agua', icon:'💧', label:'Água', status:statusAgua(rAgua, diasNum) },
      { id:'energia', icon:'⚡', label:'Energia', status:rEnergia.autossustentavel ? 'verde' : statusPorDias(rEnergia.dias, diasNum) },
      { id:'abrigo', icon:'🏕️', label:'Abrigo', status:statusRequiredItems(abrigoComprados, abrigoItens.length, abrigoRequerido) },
      { id:'dinheiro', icon:'💰', label:'Dinheiro', status:statusDinheiro(dinheiroNum, custoTotal) },
    ];

    const recomendacoes = gerarRecomendacoes({
      diasViagem:diasNum,
      diasComida:rComida.valido ? rComida.dias : null,
      agua:rAgua,
      dinheiroDisponivel:dinheiroNum,
      custoTotal,
      temPainel:rEnergia.temPainel,
      temBateria:rEnergia.temBateria,
      itensSegurancaFaltando:segurancaFaltando,
      tipoViagem:input.tipoViagem,
      abrigoRequerido,
      abrigoComprados,
      destino,
      pessoas:pessoasCalculo,
    });

    return {
      diasNum,
      pessoasNum,
      destino,
      tipoViagem:input.tipoViagem,
      tipoViagemLabel:profile.label,
      dinheiroNum,
      custoEquipPendentes,
      custoAlimentacaoInformada,
      custoAlimentacaoNecessaria,
      custoAlimentacaoFaltante,
      custoBase,
      reservaFinanceira,
      reservaFinanceiraPercent:profile.reservaFinanceiraPercent,
      custoTotal,
      rComida,
      necessidadeComida,
      rAgua,
      rEnergia,
      itensSeguranca,
      segurancaFaltando,
      segurancaComprados,
      abrigoRequerido,
      abrigoComprados,
      abrigoTotal:abrigoItens.length,
      locaisAguaInformados,
      resumo,
      recomendacoes,
    };
  }, [
    input.items,
    input.destino,
    input.tipoViagem,
    input.pessoas,
    input.dias,
    input.kmPrevistos,
    input.mediaKmDia,
    input.dinheiro,
    input.alimentos,
    input.litrosAgua,
    input.reabastece,
    input.frequenciaDias,
    input.locaisAgua,
  ]);
}
