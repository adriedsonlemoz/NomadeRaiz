import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
const source = path.join(root, 'resources', 'android');
if (!fs.existsSync(androidRes)) throw new Error('Pasta android/app/src/main/res não encontrada. Execute npx cap add android antes do branding.');
if (!fs.existsSync(source)) throw new Error('Assets Android da marca não encontrados em resources/android.');
const densities = ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'];
const files = ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png'];
for (const density of densities) {
  const srcDir = path.join(source, `mipmap-${density}`);
  const dstDir = path.join(androidRes, `mipmap-${density}`);
  fs.mkdirSync(dstDir, { recursive: true });
  for (const file of files) {
    const src = path.join(srcDir, file);
    if (!fs.existsSync(src)) throw new Error(`Asset Android ausente: ${src}`);
    fs.copyFileSync(src, path.join(dstDir, file));
  }
}
const valuesDir = path.join(androidRes, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#17251C</color>\n</resources>\n');
console.log('Branding Android aplicado: launcher, round e foreground adaptativo.');
