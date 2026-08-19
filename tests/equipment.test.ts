import assert from 'node:assert/strict';
import type { TestCase } from './test.types';
import { calcTotal, isBelowMinimum, ownedQuantity } from '../src/services/equipment.service';
import type { Item } from '../src/types';

const item = (overrides: Partial<Item> = {}): Item => ({
  id: 'item-1',
  name: 'Item',
  categoryId: 'ferramentas',
  status: 'pendente',
  priority: 'medio',
  quantity: 1,
  price: 10,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

export const cases: TestCase[] = [
  { name: 'quantidade zero permanece zero no cálculo de total', run: () => {
    assert.equal(calcTotal([item({ quantity: 0, price: 99 })]), 0);
    assert.equal(calcTotal([item({ quantity: 2, price: 15 })]), 30);
  } },
  { name: 'item pendente não conta como estoque disponível', run: () => {
    assert.equal(ownedQuantity(item({ status: 'pendente', quantity: 3 })), 0);
    assert.equal(ownedQuantity(item({ status: 'comprado', quantity: 3 })), 3);
  } },
  { name: 'mínimo alerta item pendente mesmo quando há quantidade planejada', run: () => {
    assert.equal(isBelowMinimum(item({ status: 'pendente', quantity: 2 }), 1), true);
    assert.equal(isBelowMinimum(item({ status: 'comprado', quantity: 2 }), 1), false);
  } },
  { name: 'mínimo zero não gera alerta de reposição', run: () => {
    assert.equal(isBelowMinimum(item({ status: 'pendente', quantity: 0 }), 0), false);
  } },
];
