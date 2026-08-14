import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const extensions = ['.js','.jsx','.ts','.tsx','.json'];
const errors = [];
let filesChecked = 0;
let importsChecked = 0;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes:true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolves(importer, specifier) {
  const base = path.resolve(path.dirname(importer), specifier);
  const candidates = [base, ...extensions.map(ext => base + ext), ...extensions.map(ext => path.join(base, 'index' + ext))];
  return candidates.some(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

for (const file of walk(src).filter(file => /\.(?:js|jsx|ts|tsx)$/.test(file))) {
  filesChecked++;
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  const patterns = [
    /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"](\.[^'"]+)['"]/g,
    /import\(\s*['"](\.[^'"]+)['"]\s*\)/g,
    /require\(\s*['"](\.[^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      importsChecked++;
      if (!resolves(file, match[1])) errors.push(`${rel}: import não resolvido: ${match[1]}`);
    }
  }
  if (text.includes('localStorage.clear(')) errors.push(`${rel}: uso proibido de localStorage.clear(); apague apenas dados do app.`);
  if (text.includes('localStorage') && rel !== 'src/services/storage.service.ts' && !rel.endsWith('StoreContext.tsx')) errors.push(`${rel}: localStorage direto não é permitido; use StorageService.`);
}

const legacySourceFiles = walk(src).filter(file => /\.(?:js|jsx)$/.test(file));
for (const file of legacySourceFiles) {
  errors.push(`${path.relative(root,file)}: JavaScript/JSX legado não é permitido em src; use .ts/.tsx.`);
}

const requiredTestFiles = [
  'tests/calculator.test.ts',
  'tests/planning.test.ts',
  'tests/reducer.test.ts',
  'tests/export.test.ts',
  'tests/test.types.ts',
  'scripts/run-tests.ts',
  'scripts/ts-loader.mjs',
  'scripts/register-test-loader.mjs',
  'tsconfig.test.json',
];
for (const rel of requiredTestFiles) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`${rel}: arquivo obrigatório da suíte de testes não encontrado.`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) errors.push('package.json: version deve seguir X.Y.Z.');
const lock = JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) errors.push('package-lock.json: versão deve acompanhar package.json.');
if (pkg.name !== 'nomade-raiz') errors.push('package.json: name deve permanecer nomade-raiz.');
if (!pkg.scripts?.test || !pkg.scripts.test.includes('run-tests.ts')) errors.push('package.json: script test deve executar a suíte TypeScript automatizada.');
if (!pkg.scripts?.check || !pkg.scripts.check.includes('npm run test')) errors.push('package.json: check deve incluir npm run test antes do build.');
if (!pkg.scripts?.typecheck || !pkg.scripts.typecheck.includes('tsconfig.test.json')) errors.push('package.json: typecheck deve validar também tsconfig.test.json.');
if (pkg.engines?.node !== '20.x') errors.push('package.json: engines.node deve permanecer fixado em 20.x para builds reproduzíveis.');
const nvmrcPath = path.join(root,'.nvmrc');
if (!fs.existsSync(nvmrcPath) || fs.readFileSync(nvmrcPath,'utf8').trim() !== '20') errors.push('.nvmrc: deve fixar Node 20.');


const ciPath = path.join(root,'.github/workflows/ci.yml');
if (!fs.existsSync(ciPath)) errors.push('.github/workflows/ci.yml: workflow de CI obrigatório.');
else {
  const ci = fs.readFileSync(ciPath,'utf8');
  if (!ci.includes('run: npm run build')) errors.push('CI: deve executar npm run build para validar check + bundle.');
  if (ci.includes('run: npm run check')) errors.push('CI: não execute check separadamente; npm run build já o inclui.');
}

const readmePath = path.join(root,'README.md');
if (!fs.existsSync(readmePath)) errors.push('README.md: arquivo obrigatório para apresentação do projeto no GitHub.');
else {
  const readme = fs.readFileSync(readmePath,'utf8');
  if (!readme.includes(`Versão atual: **${pkg.version}**`)) errors.push(`README.md: versão atual deve ser ${pkg.version}.`);
  if (!readme.includes('# Nomade Raiz')) errors.push('README.md: título principal deve ser Nomade Raiz.');
}

const changelogPath = path.join(root,'CHANGELOG.md');
if (!fs.existsSync(changelogPath)) errors.push('CHANGELOG.md: arquivo obrigatório.');
else {
  const changelogMd = fs.readFileSync(changelogPath,'utf8');
  if (!changelogMd.includes(`## ${pkg.version}`)) errors.push(`CHANGELOG.md: deve conter a versão ${pkg.version}.`);
}

const appConfig = fs.readFileSync(path.join(src,'config/app.ts'),'utf8');
if (!appConfig.includes("APP_NAME = 'Nomade Raiz'")) errors.push('config/app.ts: APP_NAME deve ser Nomade Raiz.');

const manifestPath = path.join(root,'public/manifest.webmanifest');
if (!fs.existsSync(manifestPath)) errors.push('public/manifest.webmanifest: manifesto do app é obrigatório.');
else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if (manifest.name !== 'Nomade Raiz' || manifest.short_name !== 'Nomade Raiz') errors.push('manifest.webmanifest: name e short_name devem ser Nomade Raiz.');
}

const configPage = fs.readFileSync(path.join(src,'pages/Configuracoes/ConfiguracoesPage.tsx'),'utf8');
if (/v\d+\.\d+\.\d+/.test(configPage)) errors.push('ConfiguracoesPage: versão não pode ser hardcoded; use APP_VERSION.');

const constantsDir = path.join(src,'constants');
const constantsIndex = fs.readFileSync(path.join(constantsDir,'index.ts'),'utf8');
const appConstants = fs.readFileSync(path.join(constantsDir,'app.ts'),'utf8');
const travelConstants = fs.readFileSync(path.join(constantsDir,'travel.ts'),'utf8');
const appChangelog = fs.readFileSync(path.join(constantsDir,'changelog.ts'),'utf8');
const constantDomains = ['app','equipment','checks','travel','tips','changelog','manualBike'];
for (const domain of constantDomains) {
  if (!fs.existsSync(path.join(constantsDir,`${domain}.ts`))) errors.push(`constants/${domain}.ts: módulo de domínio obrigatório não encontrado.`);
}
if (!/APP_VERSAO\s*=\s*APP_VERSION/.test(appConstants)) errors.push('constants/app.ts: APP_VERSAO deve derivar de APP_VERSION.');
if (!appChangelog.includes(`versao:'${pkg.version}'`)) errors.push(`constants/changelog.ts: CHANGELOG exibido no app deve conter a versão ${pkg.version}.`);
if (!travelConstants.includes('satisfies readonly FoodConfigWithUnits[]')) errors.push('constants/travel.ts: ALIMENTOS_CONFIG deve ser validado por FoodConfigWithUnits na origem.');
if (/export\s+const\s+/.test(constantsIndex) || Buffer.byteLength(constantsIndex,'utf8') > 1024) errors.push('constants/index.ts: deve permanecer um barrel pequeno, sem dados de domínio.');
for (const domain of constantDomains) {
  if (!constantsIndex.includes(`export * from './${domain}'`)) errors.push(`constants/index.ts: deve reexportar constants/${domain}.ts.`);
}

const migratedSharedModules = [
  'App',
  'layouts/AppShell', 'layouts/BottomNav', 'layouts/ErrorBoundary', 'layouts/SplashScreen', 'layouts/index',
  'components/common/Badge', 'components/common/BicycleIcon', 'components/common/EmptyState',
  'components/common/Modal', 'components/common/ProgressBar', 'components/common/QtyControl',
  'components/common/index', 'components/common/FormField', 'hooks/index',
  'pages/Extras/ExtrasPage', 'pages/Dicas/DicasPage', 'pages/Dicas/DicaModal',
  'pages/Exportar/ExportarPage', 'pages/Sobre/SobrePage', 'pages/Sobre/ApoioModal', 'pages/Sobre/ContatoModal',
  'pages/Calculadora/AguaCard', 'pages/Calculadora/BikeCard', 'pages/Calculadora/CalcAtoms',
  'pages/Calculadora/CalculadoraPage', 'pages/Calculadora/ComidaCard', 'pages/Calculadora/CustoCard',
  'pages/Calculadora/DinheiroCard', 'pages/Calculadora/EnergiaCard', 'pages/Calculadora/PesoCard',
  'pages/Calculadora/ResumoCard', 'pages/Calculadora/index',
  'pages/Equipamentos/CategoryItemsView', 'pages/Equipamentos/EquipamentosPage', 'pages/Equipamentos/index',
  'components/equipment/CategoryCard', 'components/equipment/EquipmentCard',
  'components/equipment/ItemDetailModal', 'components/equipment/ItemFormModal', 'components/equipment/index',
  'pages/Planejamento/PlanejamentoPage', 'pages/Planejamento/StatusBadge', 'pages/Planejamento/index',
  'pages/Diario/DiarioPage', 'pages/Diario/DiarioForm', 'pages/Diario/index',
  'pages/Pontos/PontosPage', 'pages/Pontos/PontoForm', 'pages/Pontos/index',
  'pages/Home/HomePage', 'pages/Home/ChecklistVerificacao', 'pages/Home/NotaRapidaModal', 'pages/Home/index',
  'pages/Alertas/AlertasPage', 'pages/Alertas/index',
  'pages/Configuracoes/ConfiguracoesPage', 'pages/Configuracoes/index',
  'pages/ManualBike/ManualBikePage', 'pages/ManualBike/GlossarioModal', 'pages/ManualBike/NivelBadge',
  'pages/ManualBike/PecaModal', 'pages/ManualBike/ProblemaModal', 'pages/ManualBike/index',
  'pages/Dicas/index', 'pages/Exportar/index', 'pages/Extras/index', 'pages/Sobre/index',
  'constants/index',
];
for (const moduleName of migratedSharedModules) {
  const tsxPath = path.join(src, `${moduleName}.tsx`);
  const tsPath = path.join(src, `${moduleName}.ts`);
  if (!fs.existsSync(tsxPath) && !fs.existsSync(tsPath)) errors.push(`${moduleName}: módulo TypeScript migrado não encontrado.`);
  for (const legacyExt of ['.js', '.jsx']) {
    if (fs.existsSync(path.join(src, `${moduleName}${legacyExt}`))) errors.push(`${moduleName}${legacyExt}: versão antiga não pode coexistir com o módulo TypeScript.`);
  }
}

const serviceNames = ['calculator','equipment','export','pix','planning','storage'];
for (const serviceName of serviceNames) {
  const tsPath = path.join(src, `services/${serviceName}.service.ts`);
  const jsPath = path.join(src, `services/${serviceName}.service.js`);
  if (!fs.existsSync(tsPath)) errors.push(`${serviceName}.service.ts: service TypeScript obrigatório não encontrado.`);
  if (fs.existsSync(jsPath)) errors.push(`${serviceName}.service.js antigo ainda existe e pode sombrear a implementação TypeScript.`);
}

// Arquitetura pós-refatoração 1.0.9–1.0.11.
const storeContextPath = path.join(src,'contexts/StoreContext.tsx');
const storeContext = fs.readFileSync(storeContextPath,'utf8');
if (Buffer.byteLength(storeContext,'utf8') > 2500) errors.push('StoreContext.tsx: contexto voltou a concentrar responsabilidades; mantenha ações/persistência nos hooks dedicados.');
if (!storeContext.includes('useStorePersistence') || !storeContext.includes('useStoreActions')) errors.push('StoreContext.tsx: deve coordenar useStorePersistence e useStoreActions.');
if (storeContext.includes('StorageService')) errors.push('StoreContext.tsx: persistência direta não é permitida; use useStorePersistence.');
for (const rel of ['contexts/store/useStoreActions.ts','contexts/store/useStorePersistence.ts','contexts/store/store.types.ts','pages/Planejamento/PlanningTripForm.tsx','pages/Planejamento/PlanningResults.tsx','pages/Planejamento/usePlanningAnalysis.ts','pages/ManualBike/ManualOverview.tsx','pages/ManualBike/ManualSearchResults.tsx','pages/ManualBike/useManualBikeData.ts']) {
  if (!fs.existsSync(path.join(src,rel))) errors.push(`${rel}: módulo extraído obrigatório não encontrado.`);
}
const planningPage = fs.readFileSync(path.join(src,'pages/Planejamento/PlanejamentoPage.tsx'),'utf8');
const manualPage = fs.readFileSync(path.join(src,'pages/ManualBike/ManualBikePage.tsx'),'utf8');
if (Buffer.byteLength(planningPage,'utf8') > 8000) errors.push('PlanejamentoPage.tsx: página voltou a ficar grande; extraia seções/cálculos.');
if (Buffer.byteLength(manualPage,'utf8') > 7000) errors.push('ManualBikePage.tsx: página voltou a ficar grande; preserve os componentes extraídos.');
const persistenceHook = fs.readFileSync(path.join(src,'contexts/store/useStorePersistence.ts'),'utf8');
if (!persistenceHook.includes('WRITE_DELAYS') || !persistenceHook.includes("nota: 450")) errors.push('useStorePersistence.ts: debounce por domínio/nota deve permanecer ativo.');

for (const file of walk(src).filter(file => /\.(?:ts|tsx)$/.test(file))) {
  const text = fs.readFileSync(file,'utf8');
  if (/from\s+['"](?:\.\.\/)+constants['"]/.test(text)) errors.push(`${path.relative(root,file)}: importe constantes do módulo de domínio, não do barrel global.`);
}


// Design System próprio — 1.0.13.
const designStyleFiles = ['tokens.css','globals.css','components.css','forms.css','utilities.css'];
for (const file of designStyleFiles) {
  if (!fs.existsSync(path.join(src,'styles',file))) errors.push(`styles/${file}: arquivo obrigatório do Design System não encontrado.`);
}
const indexCss = fs.readFileSync(path.join(src,'index.css'),'utf8');
for (const file of designStyleFiles) {
  if (!indexCss.includes(`./styles/${file}`)) errors.push(`index.css: deve importar styles/${file}.`);
}
if (indexCss.includes('@tailwind')) errors.push('index.css: diretivas Tailwind não são permitidas; use o Design System próprio.');
if (pkg.devDependencies?.tailwindcss || pkg.dependencies?.tailwindcss) errors.push('package.json: Tailwind foi removido na 1.0.13; não reintroduza sem uma decisão arquitetural explícita.');
if (fs.existsSync(path.join(root,'tailwind.config.js')) || fs.existsSync(path.join(root,'tailwind.config.ts'))) errors.push('tailwind.config: configuração legada deve permanecer removida.');
const postcss = fs.readFileSync(path.join(root,'postcss.config.js'),'utf8');
if (postcss.includes('tailwindcss')) errors.push('postcss.config.js: plugin Tailwind não deve ser carregado.');
const themeContext = fs.readFileSync(path.join(src,'contexts/ThemeContext.tsx'),'utf8');
if (!themeContext.includes('root.dataset.theme') || !themeContext.includes('root.dataset.fontScale')) errors.push('ThemeContext.tsx: deve sincronizar tema e escala de fonte com os tokens CSS globais.');

const cssMigratedUi = [
  'components/common/AppButton.tsx','components/common/Card.tsx','components/common/PageHeader.tsx',
  'components/common/Modal.tsx','components/common/Badge.tsx','components/common/QtyControl.tsx',
  'components/common/SectionLabel.tsx','components/common/EmptyState.tsx',
  'layouts/BottomNav.tsx','layouts/ErrorBoundary.tsx','pages/Configuracoes/ConfiguracoesPage.tsx',
];
for (const rel of cssMigratedUi) {
  const text = fs.readFileSync(path.join(src,rel),'utf8');
  if (text.includes('style={{')) errors.push(`${rel}: bloco de estilo inline reintroduzido em módulo já migrado para o Design System.`);
  if (!text.includes('className=')) errors.push(`${rel}: módulo migrado deve consumir classes do Design System.`);
}
for (const rel of ['components/common/FormField.tsx','styles/tokens.css','styles/components.css']) {
  if (!fs.existsSync(path.join(src,rel))) errors.push(`${rel}: fundação obrigatória do Design System não encontrada.`);
}

const storage = fs.readFileSync(path.join(src,'services/storage.service.ts'),'utf8');
if (!storage.includes("from '../database/db'")) errors.push('storage.service.ts: persistência deve usar a camada IndexedDB/Dexie.');

const tsconfig = JSON.parse(fs.readFileSync(path.join(root,'tsconfig.json'),'utf8'));
if ((tsconfig.include ?? []).includes('capacitor.config.ts')) errors.push('tsconfig.json: capacitor.config.ts não deve estar no projeto web principal.');
if (Array.isArray(tsconfig.references) && tsconfig.references.length) errors.push('tsconfig.json: project references não são necessários nesta configuração e podem reintroduzir TS6305.');
if (tsconfig.compilerOptions?.allowJs !== false) errors.push('tsconfig.json: allowJs deve permanecer false; src é integralmente TypeScript.');

for (const rel of ['pages/Calculadora/CalculadoraPage.tsx','pages/Calculadora/ComidaCard.tsx']) {
  const text = fs.readFileSync(path.join(src,rel),'utf8');
  if (/ALIMENTOS_CONFIG\s+as\s+/.test(text)) errors.push(`${rel}: não faça cast de ALIMENTOS_CONFIG; tipagem deve ser validada na origem.`);
}

if (errors.length) {
  console.error(`\n[lint] ${errors.length} problema(s) encontrado(s):`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(`[lint] OK — ${filesChecked} arquivos e ${importsChecked} imports relativos verificados.`);
