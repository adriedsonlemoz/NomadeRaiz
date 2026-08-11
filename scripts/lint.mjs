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

const configPage = fs.readFileSync(path.join(src,'pages/Configuracoes/ConfiguracoesPage.jsx'),'utf8');
if (/v\d+\.\d+\.\d+/.test(configPage)) errors.push('ConfiguracoesPage: versão não pode ser hardcoded; use APP_VERSION.');

const constants = fs.readFileSync(path.join(src,'constants/index.js'),'utf8');
if (!constants.includes('APP_VERSAO=APP_VERSION')) errors.push('constants/index.js: APP_VERSAO deve derivar de APP_VERSION.');

const storage = fs.readFileSync(path.join(src,'services/storage.service.ts'),'utf8');
if (!storage.includes("from '../database/db'")) errors.push('storage.service.ts: persistência deve usar a camada IndexedDB/Dexie.');
if (fs.existsSync(path.join(src,'services/storage.service.js'))) errors.push('storage.service.js antigo ainda existe e pode sombrear a implementação TypeScript.');
if (fs.existsSync(path.join(src,'services/export.service.js'))) errors.push('export.service.js antigo ainda existe e pode sombrear a implementação TypeScript.');

const tsconfig = JSON.parse(fs.readFileSync(path.join(root,'tsconfig.json'),'utf8'));
if ((tsconfig.include ?? []).includes('capacitor.config.ts')) errors.push('tsconfig.json: capacitor.config.ts não deve estar no projeto web principal.');
if (Array.isArray(tsconfig.references) && tsconfig.references.length) errors.push('tsconfig.json: project references não são necessários nesta configuração e podem reintroduzir TS6305.');

if (errors.length) {
  console.error(`\n[lint] ${errors.length} problema(s) encontrado(s):`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(`[lint] OK — ${filesChecked} arquivos e ${importsChecked} imports relativos verificados.`);
