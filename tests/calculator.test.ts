import assert from 'node:assert/strict';
import type { TestCase } from './test.types';
import {
  calcAguaInteligente,
  calcAlimentacaoInteligente,
  calcBicicleta,
  calcCustoViagem,
  calcDinheiro,
  calcEnergia,
  calcIndiceGeral,
  calcPeso,
  montarLinhasAlimentacaoInteligente,
} from '../src/services/calculator.service';
import { ALIMENTOS_CONFIG } from '../src/constants/travel';

export const cases: TestCase[] = [
  {
    name: 'bicicleta calcula distância diária e total',
    run: () => {
      assert.deepEqual(calcBicicleta(15, 4, 3), {
        valido: true,
        kmDia: 60,
        distanciaTotal: 180,
        dias: 3,
      });
    },
  },
  {
    name: 'água sinaliza reserva abaixo do consumo diário recomendado',
    run: () => {
      const result = calcAguaInteligente(2, false, 0);
      assert.equal(result.valido, true);
      assert.equal(result.baixo, true);
      assert.equal(result.dias, 0.7);
    },
  },
  {
    name: 'água considera intervalo de reabastecimento',
    run: () => {
      assert.equal(calcAguaInteligente(6, true, 2).suficientePorIntervalo, true);
      assert.equal(calcAguaInteligente(3, true, 2).suficientePorIntervalo, false);
    },
  },
  {
    name: 'energia reconhece cenário autossustentável',
    run: () => {
      const result = calcEnergia(20, 5, 0, 0, [
        { id: 'celular', nome: 'Celular', consumoWhDia: 12, ativo: true },
      ]);
      assert.equal(result.autossustentavel, true);
      assert.equal(result.dias, 999);
      assert.equal(result.geracaoDiariaWh, 75);
    },
  },
  {
    name: 'alimentação usa a configuração tipada e encontra o gargalo',
    run: () => {
      const [primeiro, segundo] = ALIMENTOS_CONFIG;
      assert.ok(primeiro && segundo, 'A configuração precisa ter ao menos dois alimentos para este cenário.');
      const linhas = montarLinhasAlimentacaoInteligente(ALIMENTOS_CONFIG, {
        [primeiro.id]: { quantidade: 4, consumo: 1, preco: 5 },
        [segundo.id]: { quantidade: 6, consumo: 3, preco: 2 },
      });
      const result = calcAlimentacaoInteligente(linhas);
      assert.equal(result.valido, true);
      assert.equal(result.dias, 2);
      assert.equal(result.gargalo?.id, segundo.id);
      assert.equal(result.valorTotal, 32);
    },
  },
  {
    name: 'dinheiro nunca divide por zero',
    run: () => {
      const result = calcDinheiro(100, 0);
      assert.equal(result.valido, false);
      assert.equal(result.dias, 0);
    },
  },
  {
    name: 'peso soma quantidade vezes quilos e detecta excesso',
    run: () => {
      const result = calcPeso([
        { id: 'a', qtd: 2, kg: 10 },
        { id: 'b', qtd: 1, kg: 6 },
      ]);
      assert.equal(result.total, 26);
      assert.equal(result.acimaDoLimite, true);
    },
  },
  {
    name: 'custo da viagem separa custo diário de custos únicos',
    run: () => {
      assert.deepEqual(calcCustoViagem(5, 30, 100, 50, 20), { total: 320, dias: 5 });
    },
  },
  {
    name: 'índice geral ignora recursos neutros e encontra menor autonomia',
    run: () => {
      const result = calcIndiceGeral([
        { nome: 'comida', dias: 5 },
        { nome: 'energia', dias: 2 },
        { nome: 'ignorado', dias: 1, neutro: true },
      ]);
      assert.equal(result.dias, 2);
      assert.equal(result.gargalo?.nome, 'energia');
    },
  },
];
