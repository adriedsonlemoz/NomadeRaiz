import type { TestCase } from '../tests/test.types';
import { cases as calculatorCases } from '../tests/calculator.test';
import { cases as planningCases } from '../tests/planning.test';
import { cases as reducerCases } from '../tests/reducer.test';
import { cases as exportCases } from '../tests/export.test';

const suites: Array<{ name: string; cases: TestCase[] }> = [
  { name: 'Calculadora', cases: calculatorCases },
  { name: 'Planejamento', cases: planningCases },
  { name: 'Reducer', cases: reducerCases },
  { name: 'Backup e importação', cases: exportCases },
];

let passed = 0;
let failed = 0;

for (const suite of suites) {
  if (!suite.cases.length) {
    console.error(`✗ ${suite.name}: nenhum caso de teste exportado.`);
    failed++;
    continue;
  }

  for (const testCase of suite.cases) {
    try {
      await testCase.run();
      passed++;
      console.log(`✓ [${suite.name}] ${testCase.name}`);
    } catch (error) {
      failed++;
      console.error(`✗ [${suite.name}] ${testCase.name}`);
      console.error(error instanceof Error ? error.stack ?? error.message : error);
    }
  }
}

if (failed > 0) {
  console.error(`\n[test] FALHOU — ${passed} passaram, ${failed} falharam.`);
  process.exitCode = 1;
} else {
  console.log(`\n[test] OK — ${passed} testes passaram em ${suites.length} suítes.`);
}
