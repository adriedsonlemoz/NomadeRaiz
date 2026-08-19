import assert from 'node:assert/strict';
import type { TestCase } from './test.types';
import {
  calcEnergiaAutomatica,
  calcFinancialReserve,
  gerarRecomendacoes,
  getTravelPlanningProfile,
  mapSafetyEssentials,
  piorStatus,
  statusAgua,
  statusBicicleta,
  statusDinheiro,
  statusPercentual,
  statusRequiredItems,
  statusPorDias,
} from '../src/services/planning.service';
import type { Item } from '../src/types';

const item = (name: string, status: Item['status'] = 'comprado'): Item => ({
  id: name,
  name,
  categoryId: 'energia',
  status,
  priority: 'medio',
  quantity: 1,
  price: 0,
  createdAt: 1,
  updatedAt: 1,
});

export const cases: TestCase[] = [
  { name: 'status por dias respeita verde/amarelo/vermelho', run: () => {
    assert.equal(statusPorDias(5, 5), 'verde');
    assert.equal(statusPorDias(4, 5), 'amarelo');
    assert.equal(statusPorDias(2, 5), 'vermelho');
    assert.equal(statusPorDias(null, 5), 'amarelo');
    assert.equal(statusPorDias(0, 5), 'vermelho');
  } },
  { name: 'status percentual usa os limites esperados', run: () => {
    assert.equal(statusPercentual(8, 10), 'verde');
    assert.equal(statusPercentual(5, 10), 'amarelo');
    assert.equal(statusPercentual(4, 10), 'vermelho');
    assert.equal(statusPercentual(0, 0), 'amarelo');
  } },
  { name: 'status bicicleta compara capacidade com distância', run: () => {
    assert.equal(statusBicicleta(100, 50, 2), 'verde');
    assert.equal(statusBicicleta(100, 40, 2), 'amarelo');
    assert.equal(statusBicicleta(100, 30, 2), 'vermelho');
  } },
  { name: 'status de água prioriza intervalo quando há reabastecimento', run: () => {
    assert.equal(statusAgua({ reabastece: true, suficientePorIntervalo: true }, 10), 'verde');
    assert.equal(statusAgua({ reabastece: true, suficientePorIntervalo: false }, 10), 'amarelo');
    assert.equal(statusAgua({ reabastece: false, dias: 2 }, 10), 'vermelho');
  } },
  { name: 'status financeiro e pior status mantêm lógica conservadora', run: () => {
    assert.equal(statusDinheiro(100, 100), 'verde');
    assert.equal(statusDinheiro(75, 100), 'amarelo');
    assert.equal(statusDinheiro(60, 100), 'vermelho');
    assert.equal(piorStatus('verde', 'amarelo', 'vermelho'), 'vermelho');
  } },
  { name: 'energia automática considera apenas equipamentos comprados', run: () => {
    const result = calcEnergiaAutomatica([
      item('Painel solar 20W'),
      item('Power Bank'),
      item('Bateria reserva', 'pendente'),
    ]);
    assert.equal(result.temPainel, true);
    assert.equal(result.temBateria, true);
    assert.equal(result.autossustentavel, true);
  } },
  { name: 'recomendações ficam positivas quando não há gargalos', run: () => {
    const result = gerarRecomendacoes({
      diasViagem: 3,
      diasComida: 3,
      agua: { reabastece: false, valido: true, dias: 3 },
      dinheiroDisponivel: 300,
      custoTotal: 200,
      temPainel: true,
      temBateria: true,
      itensSegurancaFaltando: [],
    });
    assert.deepEqual(result, [{ tipo: 'ok', texto: 'Os recursos principais estão compatíveis com a viagem planejada.' }]);
  } },
  { name: 'recomendações acumulam alertas de recursos insuficientes', run: () => {
    const result = gerarRecomendacoes({
      diasViagem: 5,
      diasComida: 2,
      agua: { reabastece: false, valido: true, dias: 1 },
      dinheiroDisponivel: 50,
      custoTotal: 200,
      temPainel: false,
      temBateria: false,
      itensSegurancaFaltando: ['capacete'],
    });
    assert.ok(result.filter((r) => r.tipo === 'alerta').length >= 4);
    assert.ok(result.some((r) => r.texto.includes('painel solar')));
  } },

  { name: 'tipo de viagem altera reserva financeira e exigência de abrigo', run: () => {
    assert.equal(calcFinancialReserve(100, 'bate-volta'), 5);
    assert.equal(calcFinancialReserve(100, 'cicloviagem'), 10);
    assert.equal(calcFinancialReserve(100, 'longa'), 15);
    assert.equal(getTravelPlanningProfile('camping').abrigo, 'essencial');
    assert.equal(statusRequiredItems(0, 0, true), 'vermelho');
    assert.equal(statusRequiredItems(0, 0, false), 'verde');
  } },
  { name: 'energia automática dimensiona consumo para o grupo', run: () => {
    const one = calcEnergiaAutomatica([item('Power Bank')], 1);
    const two = calcEnergiaAutomatica([item('Power Bank')], 2);
    assert.equal(one.consumoDiarioWh, 20);
    assert.equal(two.consumoDiarioWh, 40);
    assert.ok((two.dias ?? 0) < (one.dias ?? 0));
  } },
  { name: 'segurança reconhece item recriado por nome e detecta item apagado', run: () => {
    const items: Item[] = [
      { ...item('custom-capacete'), id: 'custom-1', name: 'Capacete MTB' },
      { ...item('luz-bike'), id: 'luz-bike', name: 'Luzes da bicicleta' },
      { ...item('colete'), id: 'colete', name: 'Colete refletivo' },
    ];
    const essentials = mapSafetyEssentials(items);
    assert.equal(essentials.find(e => e.key === 'capacete')?.comprado, true);
    assert.equal(essentials.find(e => e.key === 'primeiros-socorros')?.item, null);
    assert.equal(essentials.filter(e => !e.comprado).length, 1);
  } },
  { name: 'reabastecimento sem local confirmado mantém água em atenção', run: () => {
    assert.equal(statusAgua({ reabastece: true, suficientePorIntervalo: true, pontosConfirmados: false }, 5), 'amarelo');
    assert.equal(statusAgua({ reabastece: true, suficientePorIntervalo: true, pontosConfirmados: true }, 5), 'verde');
  } },
];
