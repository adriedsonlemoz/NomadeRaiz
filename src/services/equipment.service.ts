import type { Item, ItemFilter, ItemSort, Priority } from '../types';
import { parseNum } from '../utils/format';

export interface EquipmentStats {
  total: number;
  comprados: number;
  pendentes: number;
  valorTotal: number;
  valorComprado: number;
}

export interface CategoryStats {
  total: number;
  comprados: number;
  pendentes: number;
  valor: number;
  valorComprado: number;
  valorPendente: number;
}

type ItemList = readonly Item[] | null | undefined;

export const normalizedQuantity = (item: Pick<Item, 'quantity'>): number =>
  Math.max(0, parseNum(item.quantity));

export const ownedQuantity = (item: Pick<Item, 'status' | 'quantity'>): number =>
  item.status === 'comprado' ? normalizedQuantity(item) : 0;

export const isBelowMinimum = (
  item: Pick<Item, 'status' | 'quantity'>,
  minimum: number | null | undefined,
): boolean => {
  if (minimum == null || !Number.isFinite(minimum)) return false;
  const normalizedMinimum = Math.max(0, minimum);
  return ownedQuantity(item) < normalizedMinimum;
};

export const calcTotal = (items: ItemList): number =>
  (items ?? []).reduce(
    (sum, item) => sum + parseNum(item.price) * normalizedQuantity(item),
    0,
  );

export const globalStats = (items: ItemList): EquipmentStats => {
  const list = items ?? [];
  const comprados = list.filter((item) => item.status === 'comprado').length;

  return {
    total: list.length,
    comprados,
    pendentes: list.length - comprados,
    valorTotal: calcTotal(list),
    valorComprado: calcTotal(list.filter((item) => item.status === 'comprado')),
  };
};

export const catStats = (items: ItemList, catId: string): CategoryStats => {
  const list = (items ?? []).filter((item) => item.categoryId === catId);
  const comprados = list.filter((item) => item.status === 'comprado').length;

  const valor = calcTotal(list);
  const valorComprado = calcTotal(list.filter((item) => item.status === 'comprado'));

  return {
    total: list.length,
    comprados,
    pendentes: list.length - comprados,
    valor,
    valorComprado,
    valorPendente: valor - valorComprado,
  };
};

export const filterItems = (
  items: ItemList,
  filter: ItemFilter,
  catId?: string | null,
): Item[] =>
  (items ?? []).filter(
    (item) =>
      (!catId || item.categoryId === catId) &&
      (filter === 'pendentes'
        ? item.status === 'pendente'
        : filter === 'comprados'
          ? item.status === 'comprado'
          : true),
  );

const priorityRank: Record<Priority, number> = {
  urgente: 0,
  medio: 1,
  baixo: 2,
};

export const sortItems = (items: ItemList, sort: ItemSort): Item[] =>
  [...(items ?? [])].sort((a, b) => {
    if (sort === 'preco-asc') return parseNum(a.price) - parseNum(b.price);
    if (sort === 'preco-desc') return parseNum(b.price) - parseNum(a.price);

    return (
      (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) ||
      a.name.localeCompare(b.name, 'pt-BR')
    );
  });
