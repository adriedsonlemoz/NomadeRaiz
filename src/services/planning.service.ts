import type { Item, TravelTypeId } from '../types';
import { parseNum } from '../utils/format';

export type PlanningStatus = 'verde' | 'amarelo' | 'vermelho';
export type RecommendationType = 'ok' | 'atencao' | 'alerta';

export interface TravelPlanningProfile {
  id: TravelTypeId;
  label: string;
  reservaFinanceiraPercent: number;
  abrigo: 'dispensavel' | 'condicional' | 'essencial';
  painelRecomendadoAposDias: number | null;
  bateriaRecomendada: boolean;
}

const TRAVEL_PROFILES: Record<TravelTypeId, TravelPlanningProfile> = {
  'bate-volta': {
    id: 'bate-volta',
    label: 'Bate-volta',
    reservaFinanceiraPercent: 0.05,
    abrigo: 'dispensavel',
    painelRecomendadoAposDias: null,
    bateriaRecomendada: false,
  },
  cicloviagem: {
    id: 'cicloviagem',
    label: 'Cicloviagem',
    reservaFinanceiraPercent: 0.10,
    abrigo: 'condicional',
    painelRecomendadoAposDias: 4,
    bateriaRecomendada: true,
  },
  camping: {
    id: 'camping',
    label: 'Camping',
    reservaFinanceiraPercent: 0.10,
    abrigo: 'essencial',
    painelRecomendadoAposDias: 3,
    bateriaRecomendada: true,
  },
  longa: {
    id: 'longa',
    label: 'Longa duração',
    reservaFinanceiraPercent: 0.15,
    abrigo: 'essencial',
    painelRecomendadoAposDias: 2,
    bateriaRecomendada: true,
  },
};

export const getTravelPlanningProfile = (tipo: TravelTypeId): TravelPlanningProfile =>
  TRAVEL_PROFILES[tipo] ?? TRAVEL_PROFILES.cicloviagem;

export const requiresShelter = (tipo: TravelTypeId, dias: number): boolean => {
  const profile = getTravelPlanningProfile(tipo);
  if (profile.abrigo === 'essencial') return true;
  if (profile.abrigo === 'dispensavel') return false;
  return dias > 1;
};

export const calcFinancialReserve = (baseCost: number, tipo: TravelTypeId): number => {
  const base = Math.max(0, parseNum(baseCost));
  return Number((base * getTravelPlanningProfile(tipo).reservaFinanceiraPercent).toFixed(2));
};

export interface EnergiaAutomaticaResult {
  temPainel: boolean;
  temBateria: boolean;
  autossustentavel: boolean;
  dias: number | null;
  geracaoDiariaWh: number;
  consumoDiarioWh: number;
  reservaWh: number;
  horasRecarga: number | null;
}

export interface AguaPlanningResult {
  reabastece?: boolean;
  suficientePorIntervalo?: boolean;
  valido?: boolean;
  dias?: number | null;
  pontosConfirmados?: boolean;
}

export interface PlanningEssentialItem {
  key: 'capacete' | 'luz-bike' | 'colete' | 'primeiros-socorros';
  label: string;
  item: Item | null;
  comprado: boolean;
}

const SECURITY_ESSENTIALS: readonly {
  key: PlanningEssentialItem['key'];
  label: string;
  aliases: readonly string[];
}[] = [
  { key: 'capacete', label: 'Capacete', aliases: ['capacete'] },
  { key: 'luz-bike', label: 'Luzes da bicicleta', aliases: ['luz da bicicleta', 'luzes da bicicleta', 'farol bicicleta', 'sinalizador bicicleta'] },
  { key: 'colete', label: 'Colete refletivo', aliases: ['colete refletivo', 'colete reflexivo', 'refletivo'] },
  { key: 'primeiros-socorros', label: 'Kit de primeiros socorros', aliases: ['primeiros socorros', 'primeiro socorro', 'kit socorros'] },
] as const;

const normalizeText = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function mapSafetyEssentials(items: readonly Item[] = []): PlanningEssentialItem[] {
  return SECURITY_ESSENTIALS.map((essential) => {
    const direct = items.find((item) => item.id === essential.key);
    const semantic = direct ?? items.find((item) => {
      const name = normalizeText(item.name);
      return essential.aliases.some((alias) => name.includes(normalizeText(alias)));
    });
    return {
      key: essential.key,
      label: essential.label,
      item: semantic ?? null,
      comprado: semantic?.status === 'comprado' && parseNum(semantic.quantity) > 0,
    };
  });
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
  tipoViagem?: TravelTypeId;
  abrigoRequerido?: boolean;
  abrigoComprados?: number;
  destino?: string;
  pessoas?: number;
  [key: string]: unknown;
}

export interface PlanningRecommendation {
  tipo: RecommendationType;
  texto: string;
}

type NumericInput = string | number | null | undefined;

export function calcEnergiaAutomatica(
  items: readonly Item[] = [],
  pessoas: NumericInput = 1,
): EnergiaAutomaticaResult {
  const adquiridos = items.filter((item) => item.status === 'comprado' && parseNum(item.quantity) > 0);
  const pessoasNum = Math.max(1, Math.floor(parseNum(pessoas) || 1));
  const matches = (item: Item, termos: readonly string[]): boolean => {
    const nome = normalizeText(item.name);
    return termos.some((termo) => nome.includes(normalizeText(termo)));
  };

  const paineis = adquiridos.filter((item) => matches(item, ['painel solar', 'solar']));
  const baterias = adquiridos.filter((item) => matches(item, ['power bank', 'powerbank', 'bateria']));
  const quantidadePaineis = paineis.reduce((sum, item) => sum + Math.max(0, parseNum(item.quantity)), 0);
  const quantidadeBaterias = baterias.reduce((sum, item) => sum + Math.max(0, parseNum(item.quantity)), 0);
  const temPainel = quantidadePaineis > 0;
  const temBateria = quantidadeBaterias > 0;

  // Mantém a estimativa simples do app, mas dimensiona a demanda para o grupo.
  // Para uma pessoa o consumo continua em 20 Wh/dia, preservando o comportamento anterior.
  const painelW = quantidadePaineis * 20;
  const horasSol = 5;
  const geracaoDiariaWh = painelW * horasSol * 0.75;
  const reservaWh = quantidadeBaterias * 74;
  const consumoDiarioWh = 20 * pessoasNum;
  const saldo = consumoDiarioWh - geracaoDiariaWh;
  const autossustentavel = temPainel && geracaoDiariaWh >= consumoDiarioWh;
  const dias = autossustentavel
    ? null
    : reservaWh > 0
      ? Number((reservaWh / Math.max(saldo, consumoDiarioWh)).toFixed(1))
      : 0;
  const horasRecarga =
    temPainel && reservaWh > 0
      ? Number((reservaWh / Math.max(painelW * 0.75, 1)).toFixed(1))
      : null;

  return {
    temPainel,
    temBateria,
    autossustentavel,
    dias,
    geracaoDiariaWh,
    consumoDiarioWh,
    reservaWh,
    horasRecarga,
  };
}

export const statusPorDias = (
  disponivel: number | null | undefined,
  necessario: number | null | undefined,
): PlanningStatus => {
  if (necessario == null || necessario <= 0 || disponivel == null) return 'amarelo';
  if (disponivel >= necessario) return 'verde';
  return disponivel >= necessario * 0.65 ? 'amarelo' : 'vermelho';
};

export const statusPercentual = (ok: number, total: number): PlanningStatus =>
  total <= 0 ? 'amarelo' : ok / total >= 0.8 ? 'verde' : ok / total >= 0.5 ? 'amarelo' : 'vermelho';

export const statusRequiredItems = (ok: number, total: number, required: boolean): PlanningStatus => {
  if (!required) return 'verde';
  if (total <= 0) return 'vermelho';
  return statusPercentual(ok, total);
};

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
      ? agua.pontosConfirmados === false ? 'amarelo' : 'verde'
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
  const tipoViagem = data.tipoViagem ?? 'cicloviagem';
  const profile = getTravelPlanningProfile(tipoViagem);
  const pessoas = Math.max(1, Math.floor(data.pessoas ?? 1));
  const destino = data.destino?.trim();

  if (diasViagem && !diasComida) {
    push('atencao', `Defina a alimentação para calcular a autonomia de ${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'}.`);
  } else if (diasComida != null && diasComida < diasViagem) {
    push('alerta', 'A alimentação informada não cobre o grupo durante toda a viagem; aumente as quantidades ou planeje pontos de compra.');
  }

  if (!data.agua?.reabastece && data.agua?.valido && (data.agua.dias ?? 0) < diasViagem) {
    push('alerta', 'A água carregada não cobre toda a viagem; planeje pontos de reabastecimento.');
  }

  if (data.agua?.reabastece && !data.agua.suficientePorIntervalo) {
    push('atencao', 'A reserva de água pode não cobrir o intervalo informado entre reabastecimentos.');
  }

  if (data.agua?.reabastece && data.agua.suficientePorIntervalo && data.agua.pontosConfirmados === false) {
    push('atencao', 'Você pretende reabastecer água, mas ainda não informou onde. Registre ao menos um ponto de abastecimento previsto.');
  }

  if (custoTotal > 0 && dinheiroDisponivel < custoTotal) {
    push('alerta', 'O orçamento disponível está abaixo do custo estimado com a reserva recomendada para este tipo de viagem.');
  }

  if (profile.bateriaRecomendada && !data.temBateria) {
    push('atencao', 'Considere levar uma reserva de energia, como power bank ou bateria.');
  }

  if (
    profile.painelRecomendadoAposDias !== null &&
    !data.temPainel &&
    diasViagem >= profile.painelRecomendadoAposDias
  ) {
    push('atencao', `Para ${profile.label.toLowerCase()} com essa duração, um painel solar pode aumentar a autonomia de energia.`);
  }

  if (data.abrigoRequerido && (data.abrigoComprados ?? 0) <= 0) {
    push('alerta', `O tipo de viagem “${profile.label}” exige planejamento de abrigo, mas nenhum item de abrigo está marcado como adquirido.`);
  }

  if (tipoViagem === 'bate-volta' && diasViagem > 1) {
    push('atencao', 'O tipo “Bate-volta” normalmente representa uma saída de um dia; revise o tipo ou a duração informada.');
  }

  if (itensSegurancaFaltando.length) {
    push('alerta', `Faltam ${itensSegurancaFaltando.length} itens essenciais de segurança.`);
  }

  if (destino && data.agua?.reabastece && data.agua.pontosConfirmados === false) {
    push('atencao', `Antes de seguir para ${destino}, confirme pontos de água no trajeto e registre-os no planejamento.`);
  }

  if (!recommendations.length) {
    push('ok', 'Os recursos principais estão compatíveis com a viagem planejada.');
  }

  return recommendations;
}
