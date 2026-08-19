import assert from 'node:assert/strict';
import type { TestCase } from './test.types';
import { APP_ID, BACKUP_SCHEMA_VERSION } from '../src/config/app';
import { createBackup, exportBackupJSON, exportText, importBackupJSON, toPersistedState } from '../src/services/export.service';
import { INITIAL } from '../src/store/reducer';
import type { AppState } from '../src/types';

const state: AppState = {
  ...INITIAL,
  page: 'sobre',
  filter: 'comprados',
  sort: 'preco-desc',
  notaRapida: 'teste',
  settings: { themeMode: 'dark', fontScale: 'lg', startDate: 123 },
};

export const cases: TestCase[] = [
  { name: 'backup não inclui estado temporário da interface', run: () => {
    const persisted = toPersistedState(state);
    assert.equal('page' in persisted, false);
    assert.equal('filter' in persisted, false);
    assert.equal('sort' in persisted, false);
    assert.equal('manualBikeAlvo' in persisted, false);
    assert.equal(persisted.notaRapida, 'teste');
  } },
  { name: 'backup completo inclui identificador e schema corretos', run: () => {
    const backup = createBackup(state);
    assert.equal(backup.app, APP_ID);
    assert.equal(backup.schemaVersion, BACKUP_SCHEMA_VERSION);
    assert.equal(backup.data.settings.themeMode, 'dark');
  } },
  { name: 'exportação e importação completas fazem round-trip', run: () => {
    const imported = importBackupJSON(exportBackupJSON(state));
    assert.equal(imported.kind, 'full');
    if (imported.kind !== 'full') return;
    assert.equal(imported.data.notaRapida, 'teste');
    assert.deepEqual(imported.data.settings, state.settings);
  } },
  { name: 'importação normaliza valores antigos ou inválidos', run: () => {
    const raw = JSON.stringify({
      app: APP_ID,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appVersion: '1.0.0',
      data: {
        items: [], modoAtivo: null, checks: { chuva: { capa: true, invalido: 'sim' } },
        diario: [{ id: 'd1', local: 'A', clima: '???', km: -5, nota: '', createdAt: 1 }],
        pontos: [{ id: 'p1', tipo: '???', nome: 'P', referencia: '', obs: '', avaliacao: 99, fechado: false }],
        minimos: { agua: -3, comida: 2, invalido: 'x' },
        settings: { themeMode: 'qualquer', fontScale: 'xxl', startDate: 'ontem' },
        notaRapida: 123, favoritosDicas: ['a', 4], favoritosTutoriais: [], habilidadesDominadas: [],
      },
    });
    const imported = importBackupJSON(raw);
    assert.equal(imported.kind, 'full');
    if (imported.kind !== 'full') return;
    assert.equal(imported.data.diario[0]?.clima, '☀️');
    assert.equal(imported.data.diario[0]?.km, 0);
    assert.equal(imported.data.pontos[0]?.tipo, 'outro');
    assert.equal(imported.data.pontos[0]?.avaliacao, 3);
    assert.deepEqual(imported.data.checks.chuva, { capa: true });
    assert.deepEqual(imported.data.minimos, { agua: 0, comida: 2 });
    assert.deepEqual(imported.data.settings, { themeMode: 'light', fontScale: 'md', startDate: null });
    assert.equal(imported.data.notaRapida, '');
    assert.deepEqual(imported.data.favoritosDicas, ['a']);
  } },
  { name: 'importação preserva compatibilidade com array legado de itens', run: () => {
    const imported = importBackupJSON(JSON.stringify([{ id:'1', name:'Item', categoryId:'x', quantity:1, price:2 }]));
    assert.equal(imported.kind, 'legacy-items');
    if (imported.kind !== 'legacy-items') return;
    assert.equal(imported.items.length, 1);
    assert.equal(imported.items[0]?.status, 'pendente');
  } },
  { name: 'backup de outro app ou schema é rejeitado', run: () => {
    assert.throws(() => importBackupJSON(JSON.stringify({ app: 'outro', schemaVersion: 999, data: {} })), /incompatível|inválido/);
  } },

  { name: 'formatos de exportação têm conteúdos realmente distintos', run: () => {
    const items = [
      { id:'a', name:'Comprado', categoryId:'x', status:'comprado' as const, priority:'medio' as const, quantity:1, price:20, notes:'levar', createdAt:1, updatedAt:1 },
      { id:'b', name:'Pendente', categoryId:'x', status:'pendente' as const, priority:'medio' as const, quantity:2, price:15, createdAt:1, updatedAt:1 },
    ];
    const resumo = exportText(items, 'resumo');
    const compras = exportText(items, 'compras');
    const completo = exportText(items, 'completo');
    assert.match(resumo, /Comprados: 1/);
    assert.match(resumo, /Pendentes: 1/);
    assert.equal(compras.includes('Comprado'), false);
    assert.match(compras, /Pendente ×2/);
    assert.match(completo, /Comprado ×1/);
    assert.match(completo, /levar/);
    assert.notEqual(resumo, compras);
    assert.notEqual(compras, completo);
  } },
  { name: 'exportação respeita quantidade zero', run: () => {
    const items = [
      { id:'z', name:'Zero', categoryId:'x', status:'pendente' as const, priority:'medio' as const, quantity:0, price:100, createdAt:1, updatedAt:1 },
    ];
    assert.match(exportText(items, 'resumo'), /Investimento total: R\$\s*0,00/);
    assert.match(exportText(items, 'compras'), /Nenhuma compra pendente/);
    assert.match(exportText(items, 'completo'), /Zero ×0/);
  } },
];
