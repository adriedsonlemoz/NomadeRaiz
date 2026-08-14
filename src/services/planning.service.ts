import type { Item } from '../types';
import { parseNum } from '../utils/format';

export type PlanningStatus = 'verde' | 'amarelo' | 'vermelho';
export type RecommendationType = 'ok' | 'atencao' | 'alerta';

export interface EnergiaAutomaticaResult {
  temPainel: boolean;
  temBateria: boolean;
  autossustentavel: boolean;
  dias: number | null;
  geracaoDiariaWh: number;
  horasRecarga: number | null;
}

export interface AguaPlanningResult {
  reabastece?: boolean;
  suficientePorIntervalo?: boolean;
  valido?: boolean;
  dias?: number | null;
}

export interface PlanningRecommendationInput {
  diasViagem?: number | null;
  diasComida?: number | null;
  agua?: AguaPlanningResult | null;
  dinheiroDisponivel?: number;
  custoTotal?: number;
  temPainel?: boolean;
  temBateria?: boolean;
  itensSegurancaFaltando?: readonly unknown[];
  [key: string]: unknown;
}

export interface PlanningRecommendation {
  tipo: RecommendationType;
  texto: string;
}

type NumericInput = string | number | null | undefined;

export function calcEnergiaAutomatica(items: readonly Item[] = []): EnergiaAutomaticaResult {
  const adquiridos = items.filter((item) => item.status === 'comprado');
  const byName = (termos: readonly string[]): Item | undefined =>
    adquiridos.find((item) => {
      const nome = item.name.toLowerCase();
      return termos.some((termo) => nome.includes(termo));
    });

  const painel = byName(['painel solar', 'solar']);
  const bateria = byName(['power bank', 'powerbank', 'bateria']);
  const temPainel = Boolean(painel);
  const temBateria = Boolean(bateria);

  // Estimativa conservadora quando o cadastro não possui Wh/W explícitos.
  const painelW = temPainel ? 20 : 0;
  const horasSol = 5;
  const geracaoDiariaWh = painelW * horasSol * 0.75;
  const reservaWh = temBateria ? 74 : 0;
  const consumoWhDia = 20;
  const saldo = consumoWhDia - geracaoDiariaWh;
  const autossustentavel = temPainel && geracaoDiariaWh >= consumoWhDia;
  const dias = autossustentavel
    ? null
    : reservaWh > 0
      ? Number((reservaWh / Math.max(saldo, consumoWhDia)).toFixed(1))
      : 0;
  const horasRecarga =
    temPainel && reservaWh > 0
      ? Number((reservaWh / Math.max(painelW * 0.75, 1)).toFixed(1))
      : null;

  return { temPainel, temBateria, autossustentavel, dias, geracaoDiariaWh, horasRecarga };
}

export const statusPorDias = (
  disponivel: number | null | undefined,
  necessario: number | null | undefined,
): PlanningStatus =>
  !disponivel || !necessario
    ? 'amarelo'
    : disponivel >= necessario
      ? 'verde'
      : disponivel >= necessario * 0.65
        ? 'amarelo'
        : 'vermelho';

export const statusPercentual = (ok: number, total: number): PlanningStatus =>
  total <= 0 ? 'amarelo' : ok / total >= 0.8 ? 'verde' : ok / total >= 0.5 ? 'amarelo' : 'vermelho';

export const statusBicicleta = (
  km: NumericInput,
  media: NumericInput,
  dias: NumericInput,
): PlanningStatus => {
  const kmValue = parseNum(km);
  const mediaValue = parseNum(media);
  const diasValue = parseNum(dias);

  if (!kmValue || !mediaValue || !diasValue) return 'amarelo';
  if (mediaValue * diasValue >= kmValue) return 'verde';
  return mediaValue * diasValue >= kmValue * 0.75 ? 'amarelo' : 'vermelho';
};

export const statusAgua = (
  agua: AguaPlanningResult | null | undefined,
  dias: number | null | undefined,
): PlanningStatus =>
  agua?.reabastece
    ? agua.suficientePorIntervalo
      ? 'verde'
      : 'amarelo'
    : statusPorDias(agua?.dias, dias);

export const statusDinheiro = (disponivel: number, custo: number): PlanningStatus =>
  !custo ? 'amarelo' : disponivel >= custo ? 'verde' : disponivel >= custo * 0.7 ? 'amarelo' : 'vermelho';

const statusWeight: Record<PlanningStatus, number> = {
  verde: 0,
  amarelo: 1,
  vermelho: 2,
};

export const piorStatus = (...statuses: Array<PlanningStatus | null | undefined>): PlanningStatus =>
  statuses
    .filter((status): status is PlanningStatus => Boolean(status))
    .sort((a, b) => statusWeight[b] - statusWeight[a])[0] ?? 'amarelo';

export function gerarRecomendacoes(
  data: PlanningRecommendationInput = {},
): PlanningRecommendation[] {
  const recommendations: PlanningRecommendation[] = [];
  const push = (tipo: RecommendationType, texto: string): void => {
    recommendations.push({ tipo, texto });
  };

  const diasViagem = data.diasViagem ?? 0;
  const diasComida = data.diasComida;
  const custoTotal = data.custoTotal ?? 0;
  const dinheiroDisponivel = data.dinheiroDisponivel ?? 0;
  const itensSegurancaFaltando = data.itensSegurancaFaltando ?? [];

  if (diasViagem && !diasComida) {
    push('atencao', 'Defina a alimentação para calcular a autonomia.');
  } else if (diasComida != null && diasComida < diasViagem) {
    push('alerta', 'Leve mais alimentação ou planeje pontos de compra no caminho.');
  }

  if (!data.agua?.reabastece && data.agua?.valido && (data.agua.dias ?? 0) < diasViagem) {
    push('alerta', 'A água carregada não cobre toda a viagem; planeje pontos de reabastecimento.');
  }

  if (data.agua?.reabastece && !data.agua.suficientePorIntervalo) {
    push('atencao', 'A reserva de água pode não cobrir o intervalo informado entre reabastecimentos.');
  }

  if (custoTotal > 0 && dinheiroDisponivel < custoTotal) {
    push('alerta', 'O orçamento disponível está abaixo do custo estimado.');
  }

  if (!data.temBateria) {
    push('atencao', 'Considere levar uma reserva de energia, como power bank ou bateria.');
  }

  if (!data.temPainel && diasViagem > 3) {
    push('atencao', 'Para uma viagem mais longa, um painel solar pode aumentar a autonomia de energia.');
  }

  if (itensSegurancaFaltando.length) {
    push('alerta', `Faltam ${itensSegurancaFaltando.length} itens essenciais de segurança.`);
  }

  if (!recommendations.length) {
    push('ok', 'Os recursos principais estão compatíveis com a viagem planejada.');
  }

  return recommendations;
}
