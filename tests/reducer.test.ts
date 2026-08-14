import assert from 'node:assert/strict';
import type { TestCase } from './test.types';
import { INITIAL, reducer } from '../src/store/reducer';
import type { AppState, Item } from '../src/types';

const existingItem: Item = {
  id: 'item-1',
  name: 'Barraca',
  categoryId: 'abrigo',
  status: 'pendente',
  priority: 'medio',
  quantity: 1,
  price: 100,
  createdAt: 1,
  updatedAt: 1,
};

const stateWithItem = (): AppState => ({ ...INITIAL, items: [existingItem] });

export const cases: TestCase[] = [
  { name: 'TOGGLE alterna status sem alterar o restante do item', run: () => {
    const next = reducer(stateWithItem(), { type: 'TOGGLE', payload: 'item-1' });
    assert.equal(next.items[0]?.status, 'comprado');
    assert.equal(next.items[0]?.name, 'Barraca');
    assert.ok((next.items[0]?.updatedAt ?? 0) >= existingItem.updatedAt);
  } },
  { name: 'ADJUST_QTY nunca produz quantidade negativa', run: () => {
    const next = reducer(stateWithItem(), { type: 'ADJUST_QTY', payload: { id: 'item-1', delta: -10 } });
    assert.equal(next.items[0]?.quantity, 0);
  } },
  { name: 'UPDATE_PRICE normaliza preço negativo para zero', run: () => {
    const next = reducer(stateWithItem(), { type: 'UPDATE_PRICE', payload: { id: 'item-1', price: -20 } });
    assert.equal(next.items[0]?.price, 0);
  } },
  { name: 'TOGGLE_CHECK altera somente o item informado', run: () => {
    const first = reducer(INITIAL, { type: 'TOGGLE_CHECK', payload: { modoId: 'chuva', itemId: 'capa' } });
    const second = reducer(first, { type: 'TOGGLE_CHECK', payload: { modoId: 'chuva', itemId: 'luzes' } });
    assert.deepEqual(second.checks.chuva, { capa: true, luzes: true });
  } },
  { name: 'favoritos funcionam como toggle sem duplicação', run: () => {
    const added = reducer(INITIAL, { type: 'TOGGLE_FAVORITO_DICA', payload: 'dica-1' });
    const removed = reducer(added, { type: 'TOGGLE_FAVORITO_DICA', payload: 'dica-1' });
    assert.deepEqual(added.favoritosDicas, ['dica-1']);
    assert.deepEqual(removed.favoritosDicas, []);
  } },
  { name: 'RESTORE_PERSISTED preserva estado de sessão da interface', run: () => {
    const current: AppState = { ...INITIAL, page: 'manual-bike', filter: 'comprados', sort: 'preco-desc', manualBikeAlvo: { tipo: 'peca', id: 'corrente' } };
    const next = reducer(current, {
      type: 'RESTORE_PERSISTED',
      payload: {
        items: [existingItem], modoAtivo: 'chuva', checks: {}, diario: [], pontos: [], minimos: {},
        settings: INITIAL.settings, notaRapida: 'backup', favoritosDicas: [], favoritosTutoriais: [], habilidadesDominadas: [],
      },
    });
    assert.equal(next.page, 'manual-bike');
    assert.equal(next.filter, 'comprados');
    assert.equal(next.sort, 'preco-desc');
    assert.equal(next.manualBikeAlvo, null);
    assert.equal(next.notaRapida, 'backup');
  } },
];
