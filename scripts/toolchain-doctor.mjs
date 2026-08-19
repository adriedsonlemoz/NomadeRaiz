import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const errors = [];
const notes = [];

const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major !== 24 || minor < 19) {
  errors.push(`Node ${process.versions.node} detectado; use Node 24.19.0 ou outro 24.x mais novo.`);
}

const capNames = ['@capacitor/core', '@capacitor/android', '@capacitor/ios'];
const capVersions = capNames.map((name) => pkg.dependencies?.[name]);
const capCli = pkg.devDependencies?.['@capacitor/cli'];
if ([...capVersions, capCli].some((v) => v !== '8.5.0')) {
  errors.push('Todos os pacotes oficiais do Capacitor devem permanecer alinhados em 8.5.0.');
}

if (pkg.dependencies?.react !== pkg.dependencies?.['react-dom']) {
  errors.push('react e react-dom devem usar exatamente a mesma versão.');
}
if (pkg.dependencies?.react !== '19.2.8') {
  errors.push('React esperado nesta release: 19.2.8.');
}
if (pkg.devDependencies?.vite !== '8.2.1') {
  errors.push('Vite esperado nesta release: 8.2.1.');
}
if (pkg.devDependencies?.typescript !== '5.9.3') {
  errors.push('TypeScript foi mantido deliberadamente em 5.9.3 nesta migração.');
}

notes.push(`Node ${process.versions.node}`);
notes.push(`Capacitor ${capCli}`);
notes.push(`React ${pkg.dependencies.react}`);
notes.push(`Vite ${pkg.devDependencies.vite}`);
notes.push(`TypeScript ${pkg.devDependencies.typescript}`);

if (errors.length) {
  console.error('Falha na verificação do toolchain:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Toolchain OK — ${notes.join(' · ')}`);
