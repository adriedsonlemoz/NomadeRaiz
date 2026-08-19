import type { Item } from '../types';
import { parseNum } from '../utils/format';

type NumericInput = string | number | null | undefined;

export interface EnergyEquipment {
  id: string;
  nome: string;
  consumoWhDia: number;
  ativo: boolean;
}

export interface FoodUnitConfig {
  id: string;
  label: string;
  precoPadrao: number;
  consumoDiarioPadrao: number;
}

export interface FoodConfig {
  id: string;
  nome: string;
  icone?: string;
  unidades?: readonly FoodUnitConfig[];
  [key: string]: unknown;
}

export interface FoodConfigWithUnits extends FoodConfig {
  unidades: readonly [FoodUnitConfig, ...FoodUnitConfig[]];
}

export interface FoodInput {
  unidade?: string;
  quantidade?: NumericInput;
  preco?: NumericInput;
  consumo?: NumericInput;
}

export interface FoodLine extends FoodConfig {
  unidade?: string;
  quantidade: number;
  preco: number;
  consumo: number;
  valor: number;
  dias: number | null;
}

export interface FoodResult {
  valido: boolean;
  dias: number | null;
  quantidadeTotal: number;
  valorTotal: number;
  gargalo: FoodLine | null;
}

export interface WaterResult {
  valido: boolean;
  litros: number;
  reabastece: boolean;
  dias: number;
  autonomiaCarregada: number;
  consumoDia: number;
  consumoPorPessoaDia: number;
  pessoas: number;
  suficientePorIntervalo: boolean;
  frequenciaDias: number;
  baixo: boolean;
  pontosConfirmados?: boolean;
}

export interface FoodRequirementResult {
  valido: boolean;
  valorNecessario: number;
  valorFaltante: number;
  itensFaltando: number;
}

export interface EnergyResult {
  valido: boolean;
  autossustentavel: boolean;
  dias: number;
  geracaoDiariaWh: number;
  consumoDiarioWh: number;
  reservaWh: number;
}

export interface WeightInput {
  qtd?: NumericInput;
  kg?: NumericInput;
}

export interface WeightLine {
  id: string;
  qtd: NumericInput;
  kg: NumericInput;
}

export interface GeneralResource {
  dias?: number | null;
  neutro?: boolean;
  [key: string]: unknown;
}

export const CONSUMO_AGUA_RECOMENDADO_L = 3;

export const EQUIPAMENTOS_ENERGIA_PADRAO: EnergyEquipment[] = [
  { id: 'celular', nome: 'Celular', consumoWhDia: 12, ativo: true },
  { id: 'luzes', nome: 'Luzes', consumoWhDia: 8, ativo: true },
  { id: 'gps', nome: 'GPS', consumoWhDia: 5, ativo: false },
];

export function calcBicicleta(velocidade: NumericInput, horas: NumericInput, dias: NumericInput) {
  const velocidadeNum = parseNum(velocidade);
  const horasNum = parseNum(horas);
  const diasNum = parseNum(dias);
  const valido = velocidadeNum > 0 && horasNum > 0;
  const kmDia = velocidadeNum * horasNum;

  return {
    valido,
    kmDia,
    distanciaTotal: kmDia * Math.max(diasNum, 0),
    dias: diasNum || 0,
  };
}

export function montarLinhasAlimentacaoInteligente(
  config: readonly FoodConfig[] = [],
  data: Record<string, FoodInput> = {},
  pessoas: NumericInput = 1,
): FoodLine[] {
  const pessoasNum = Math.max(1, Math.floor(parseNum(pessoas) || 1));
  return config.map((alimento) => {
    const raw = data[alimento.id] ?? {};
    const unidade = raw.unidade ?? alimento.unidades?.[0]?.id;
    const unidadeCfg = alimento.unidades?.find((item) => item.id === unidade) ??
      alimento.unidades?.[0] ?? {
        id: unidade ?? 'un',
        precoPadrao: 0,
        consumoDiarioPadrao: 1,
        label: 'un',
      };
    const quantidade = parseNum(raw.quantidade);
    const preco = parseNum(raw.preco !== undefined ? raw.preco : unidadeCfg.precoPadrao);
    const consumo = parseNum(raw.consumo !== undefined ? raw.consumo : unidadeCfg.consumoDiarioPadrao);
    const dias = quantidade > 0 && consumo > 0 ? Math.floor(quantidade / (consumo * pessoasNum)) : null;

    return {
      ...alimento,
      unidade,
      quantidade,
      preco,
      consumo,
      valor: quantidade * preco,
      dias,
    };
  });
}

export function calcAlimentacaoInteligente(linhas: readonly FoodLine[] = []): FoodResult {
  const ativas = linhas.filter((linha) => parseNum(linha.quantidade) > 0);
  const quantidadeTotal = ativas.reduce((sum, linha) => sum + parseNum(linha.quantidade), 0);
  const valorTotal = ativas.reduce((sum, linha) => sum + parseNum(linha.valor), 0);
  const comDias = ativas.filter(
    (linha): linha is FoodLine & { dias: number } => linha.dias !== null && Number.isFinite(linha.dias),
  );
  const gargalo = comDias.length ? [...comDias].sort((a, b) => a.dias - b.dias)[0] : null;

  return {
    valido: ativas.length > 0,
    dias: gargalo?.dias ?? null,
    quantidadeTotal,
    valorTotal,
    gargalo,
  };
}


export function calcNecessidadeAlimentacao(
  linhas: readonly FoodLine[] = [],
  dias: NumericInput = 0,
  pessoas: NumericInput = 1,
): FoodRequirementResult {
  const diasNum = Math.max(0, parseNum(dias));
  const pessoasNum = Math.max(1, Math.floor(parseNum(pessoas) || 1));
  const ativas = linhas.filter((linha) => parseNum(linha.quantidade) > 0 && parseNum(linha.consumo) > 0);

  let valorNecessario = 0;
  let valorFaltante = 0;
  let itensFaltando = 0;

  for (const linha of ativas) {
    const quantidadeAtual = Math.max(0, parseNum(linha.quantidade));
    const quantidadeNecessaria = Math.max(0, parseNum(linha.consumo)) * pessoasNum * diasNum;
    const quantidadeFaltante = Math.max(0, quantidadeNecessaria - quantidadeAtual);
    const preco = Math.max(0, parseNum(linha.preco));
    valorNecessario += quantidadeNecessaria * preco;
    valorFaltante += quantidadeFaltante * preco;
    if (quantidadeFaltante > 0) itensFaltando += 1;
  }

  return {
    valido: ativas.length > 0 && diasNum > 0,
    valorNecessario: Number(valorNecessario.toFixed(2)),
    valorFaltante: Number(valorFaltante.toFixed(2)),
    itensFaltando,
  };
}

export function calcAguaInteligente(
  litros: NumericInput,
  reabastece = false,
  frequencia: NumericInput = 0,
  pessoas: NumericInput = 1,
): WaterResult {
  const litrosNum = parseNum(litros);
  const frequenciaNum = parseNum(frequencia);
  const pessoasNum = Math.max(1, Math.floor(parseNum(pessoas) || 1));
  const consumoDia = CONSUMO_AGUA_RECOMENDADO_L * pessoasNum;
  const autonomia = litrosNum / consumoDia;
  const autonomiaArredondada = Number(autonomia.toFixed(1));

  return {
    valido: litrosNum > 0,
    litros: litrosNum,
    reabastece: Boolean(reabastece),
    dias: autonomiaArredondada,
    autonomiaCarregada: autonomiaArredondada,
    consumoDia,
    consumoPorPessoaDia: CONSUMO_AGUA_RECOMENDADO_L,
    pessoas: pessoasNum,
    suficientePorIntervalo: Boolean(reabastece) && frequenciaNum > 0 && autonomia >= frequenciaNum,
    frequenciaDias: frequenciaNum,
    baixo: litrosNum > 0 && litrosNum < consumoDia,
  };
}

export function calcEnergia(
  painel: NumericInput,
  horasSol: NumericInput,
  bateria: NumericInput,
  powerbank: NumericInput,
  equipamentos: readonly EnergyEquipment[] = [],
): EnergyResult {
  const painelNum = parseNum(painel);
  const horasSolNum = parseNum(horasSol);
  const bateriaNum = parseNum(bateria);
  const powerbankNum = parseNum(powerbank);
  const ativos = equipamentos.filter((item) => item.ativo !== false);
  const consumo = ativos.reduce((sum, item) => sum + parseNum(item.consumoWhDia), 0);
  const geracaoDiariaWh = painelNum * horasSolNum * 0.75;
  const reservaWh = bateriaNum + powerbankNum;
  const saldo = consumo - geracaoDiariaWh;
  const autossustentavel = consumo > 0 && geracaoDiariaWh >= consumo;
  const dias = autossustentavel ? 999 : saldo > 0 ? Math.max(0, reservaWh / saldo) : 0;

  return {
    valido: consumo > 0,
    autossustentavel,
    dias: Number(dias.toFixed(1)),
    geracaoDiariaWh,
    consumoDiarioWh: consumo,
    reservaWh,
  };
}

export function calcDinheiro(disponivel: NumericInput, gastoDia: NumericInput) {
  const disponivelNum = parseNum(disponivel);
  const gastoDiaNum = parseNum(gastoDia);

  return {
    valido: disponivelNum >= 0 && gastoDiaNum > 0,
    disponivel: disponivelNum,
    gastoDia: gastoDiaNum,
    dias: gastoDiaNum > 0 ? Number((disponivelNum / gastoDiaNum).toFixed(1)) : 0,
  };
}

export function montarLinhasPeso(
  items: readonly Item[] = [],
  data: Record<string, WeightInput> = {},
): WeightLine[] {
  return items.map((item) => ({
    id: item.id,
    qtd: data[item.id]?.qtd ?? String(item.quantity ?? 1),
    kg: data[item.id]?.kg ?? '',
  }));
}

export function calcPeso(linhas: readonly WeightLine[] = []) {
  const total = linhas.reduce(
    (sum, linha) => sum + parseNum(linha.qtd) * parseNum(linha.kg),
    0,
  );
  const limite = 25;

  return { total, limite, acimaDoLimite: total > limite };
}

export function calcCustoViagem(
  dias: NumericInput,
  alimentacao: NumericInput,
  transporte: NumericInput,
  manutencao: NumericInput,
  outros: NumericInput,
) {
  const diasNum = parseNum(dias);
  const alimentacaoNum = parseNum(alimentacao);
  const total =
    diasNum * alimentacaoNum +
    parseNum(transporte) +
    parseNum(manutencao) +
    parseNum(outros);

  return { total, dias: diasNum };
}

export interface GeneralIndexResult<T extends GeneralResource = GeneralResource> {
  dias: number | null;
  gargalo: T | null;
}

export function calcIndiceGeral<T extends GeneralResource>(
  recursos: readonly T[] = [],
): GeneralIndexResult<T> {
  const candidatos = recursos.filter(
    (recurso) =>
      !recurso.neutro &&
      recurso.dias !== null &&
      recurso.dias !== undefined &&
      Number.isFinite(Number(recurso.dias)),
  );

  if (!candidatos.length) return { dias: null, gargalo: null };

  const gargalo = [...candidatos].sort(
    (a, b) => Number(a.dias) - Number(b.dias),
  )[0];

  return { dias: gargalo.dias ?? null, gargalo };
}
