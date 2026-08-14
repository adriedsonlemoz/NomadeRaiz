export type NumericLike = string | number | null | undefined;

export const parseNum = (value: NumericLike | unknown): number => {
  const normalized = typeof value === 'string' ? value.replace(',', '.') : value;
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const fmt = (value: NumericLike | unknown): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseNum(value));
