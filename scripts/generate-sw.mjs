import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

if (!fs.existsSync(dist)) {
  console.error('[pwa] dist não encontrado. Execute o build do Vite antes de gerar o service worker.');
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(dist)
  .map((file) => path.relative(dist, file).replaceAll(path.sep, '/'))
  .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
  .map((file) => `./${file}`)
  .sort();

if (!files.includes('./index.html')) files.unshift('./index.html');
if (!files.includes('./')) files.unshift('./');

const cacheName = `nomade-raiz-v${pkg.version}`;
const worker = `const CACHE_NAME = ${JSON.stringify(cacheName)};\nconst PRECACHE = ${JSON.stringify(files, null, 2)};\n\nself.addEventListener('install', (event) => {\n  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));\n});\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil((async () => {\n    const names = await caches.keys();\n    await Promise.all(names.filter((name) => name.startsWith('nomade-raiz-v') && name !== CACHE_NAME).map((name) => caches.delete(name)));\n    await self.clients.claim();\n  })());\n});\n\nself.addEventListener('fetch', (event) => {\n  const request = event.request;\n  if (request.method !== 'GET') return;\n  const url = new URL(request.url);\n  if (url.origin !== self.location.origin) return;\n\n  if (request.mode === 'navigate') {\n    event.respondWith((async () => {\n      try {\n        const response = await fetch(request);\n        const cache = await caches.open(CACHE_NAME);\n        cache.put('./', response.clone());\n        return response;\n      } catch {\n        return (await caches.match('./')) || (await caches.match('./index.html')) || Response.error();\n      }\n    })());\n    return;\n  }\n\n  event.respondWith((async () => {\n    const cached = await caches.match(request);\n    if (cached) return cached;\n    const response = await fetch(request);\n    if (response.ok) {\n      const cache = await caches.open(CACHE_NAME);\n      cache.put(request, response.clone());\n    }\n    return response;\n  })());\n});\n`;

fs.writeFileSync(path.join(dist, 'sw.js'), worker);
console.log(`[pwa] Service worker ${cacheName} gerado com ${files.length} arquivo(s) em cache.`);
