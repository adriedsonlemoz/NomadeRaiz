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

const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) errors.push('package.json: version deve seguir X.Y.Z.');
const lock = JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) errors.push('package-lock.json: versão deve acompanhar package.json.');
if (pkg.name !== 'nomade-raiz') errors.push('package.json: name deve permanecer nomade-raiz.');

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

const configPage = fs.readFileSync(path.join(src,'pages/Configuracoes/ConfiguracoesPage.jsx'),'utf8');
if (/v\d+\.\d+\.\d+/.test(configPage)) errors.push('ConfiguracoesPage: versão não pode ser hardcoded; use APP_VERSION.');

const constants = fs.readFileSync(path.join(src,'constants/index.js'),'utf8');
if (!constants.includes('APP_VERSAO=APP_VERSION')) errors.push('constants/index.js: APP_VERSAO deve derivar de APP_VERSION.');
if (!constants.includes(`versao:'${pkg.version}'`)) errors.push(`constants/index.js: CHANGELOG exibido no app deve conter a versão ${pkg.version}.`);

const migratedSharedModules = [
  'App',
  'layouts/AppShell', 'layouts/BottomNav', 'layouts/ErrorBoundary', 'layouts/SplashScreen', 'layouts/index',
  'components/common/Badge', 'components/common/BicycleIcon', 'components/common/EmptyState',
  'components/common/Modal', 'components/common/ProgressBar', 'components/common/QtyControl',
  'components/common/index', 'hooks/index',
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

const storage = fs.readFileSync(path.join(src,'services/storage.service.ts'),'utf8');
if (!storage.includes("from '../database/db'")) errors.push('storage.service.ts: persistência deve usar a camada IndexedDB/Dexie.');

const tsconfig = JSON.parse(fs.readFileSync(path.join(root,'tsconfig.json'),'utf8'));
if ((tsconfig.include ?? []).includes('capacitor.config.ts')) errors.push('tsconfig.json: capacitor.config.ts não deve estar no projeto web principal.');
if (Array.isArray(tsconfig.references) && tsconfig.references.length) errors.push('tsconfig.json: project references não são necessários nesta configuração e podem reintroduzir TS6305.');

if (errors.length) {
  console.error(`\n[lint] ${errors.length} problema(s) encontrado(s):`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(`[lint] OK — ${filesChecked} arquivos e ${importsChecked} imports relativos verificados.`);
