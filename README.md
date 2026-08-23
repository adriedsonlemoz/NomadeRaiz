# Nomade Raiz

Versão atual: **1.0.22**

Nomade Raiz é um aplicativo offline-first para cicloviagem, bikepacking e vida na estrada. Ele reúne planejamento, equipamentos, autonomia, diário, pontos de apoio e um manual prático da bicicleta em uma interface pensada para funcionar também sem conexão constante.

## O que o app oferece

- Checklist e inventário de equipamentos.
- Verificações rápidas antes de sair, para chuva, noite, bicicleta e emergência.
- Planejamento de viagem e calculadoras de autonomia.
- Diário de campo e pontos de apoio.
- Alertas de reposição e mínimos de estoque.
- Manual básico da bicicleta e soluções para problemas na estrada.
- Backup completo em JSON, com importação e exportação.
- Persistência local em IndexedDB usando Dexie.
- Tema claro/escuro e funcionamento offline-first.

## Tecnologias

- React 19.2
- TypeScript/TSX em todo o código-fonte (`src`)
- Vite
- Capacitor 8.5 com Android preparado para build automatizado no GitHub
- PWA instalável com Service Worker, cache offline e ícones próprios
- Dexie / IndexedDB
- Design System próprio em CSS (tokens, componentes, formulários e utilitários)
- PostCSS + Autoprefixer

## Design System

A interface está migrando gradualmente dos estilos inline legados para um Design System próprio em `src/styles/`:

- `tokens.css`: cores, tema claro/escuro, espaçamento, raios, sombras e tipografia;
- `globals.css`: reset e comportamento global;
- `components.css`: componentes e layouts compartilhados;
- `forms.css`: inputs, selects, textareas e campos;
- `utilities.css`: utilitários pequenos e semânticos.

Estilos inline continuam permitidos quando o valor depende realmente de runtime (por exemplo, porcentagem de progresso ou escala da interface). O lint impede regressões nos módulos que já foram migrados.

## Estrutura de dados

Os dados persistentes do usuário ficam no IndexedDB do próprio dispositivo. A camada `StorageService` centraliza leitura, gravação, migração e limpeza. O formato de backup é versionado para permitir evolução sem perder compatibilidade com versões anteriores.

## Desenvolvimento

```bash
npm install
npm run dev
```

Verificações de qualidade:

```bash
npm run doctor
npm run lint
npm run typecheck
npm run test
npm run check
npm run build
```

O `lint` também verifica imports relativos, uso indevido de `localStorage`, sincronização de versão entre `package.json`, README e changelogs e, quando existir, também valida o `package-lock.json`. O `doctor` confere Node e o alinhamento das versões críticas do toolchain. O `npm run test` executa a suíte automatizada de regras de negócio e backup; `npm run check` combina lint, TypeScript e testes antes do build.

## Capacitor / Android

Requisitos desta versão: **Node 24.19+ (linha 24.x)**. Para o Android, o workflow usa **Java 21** e recria a plataforma nativa a partir do template do Capacitor 8.5 para evitar incompatibilidades de Gradle herdadas.

O projeto usa Capacitor 8.5. A pasta `android/` pode ser criada localmente quando necessário com:

```bash
npm run build
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

A identidade visível do aplicativo é **Nomade Raiz**. O identificador nativo existente foi preservado para não quebrar compatibilidade de instalações futuras.

### Gerar APK pelo GitHub

O workflow `.github/workflows/android-apk.yml` gera um APK de teste instalável sem exigir Android Studio no seu computador:

1. envie os arquivos do projeto para a branch **main**;
2. o workflow **Build Android APK** inicia automaticamente;
3. também é possível iniciá-lo manualmente em **Actions → Build Android APK → Run workflow**;
4. ao terminar, abra a execução e baixe o artefato **NomadeRaiz-Android-...** na seção **Artifacts**.

O arquivo gerado se chama `NomadeRaiz-X.Y.Z-debug.apk`. O workflow também roda quando uma tag `v*` é enviada. A própria execução mostra um resumo com o nome do APK; se falhar, imprime a árvore de saída Android para facilitar o diagnóstico.

## PWA e modo offline

O build gera `dist/sw.js` automaticamente. O Service Worker pré-armazena o shell e os assets versionados do Vite, permitindo reabrir o app web sem conexão depois do primeiro carregamento bem-sucedido. O registro é desativado dentro do Capacitor, pois o APK já carrega os arquivos web empacotados localmente.

## Versionamento

O projeto segue `MAJOR.MINOR.PATCH`. Toda nova versão deve atualizar:

1. `package.json` e, quando houver, `package-lock.json`;
2. `CHANGELOG.md`;
3. changelog exibido na página **Sobre o App**.

A versão mostrada dentro do aplicativo é lida automaticamente do `package.json`.

## Repositório

Projeto mantido em `adriedsonlemoz/NomadeRaiz` no GitHub.

## Estado atual

A versão 1.0.20 integrou a nova identidade visual ao aplicativo: a logo passa a aparecer no Splash e na tela Sobre, torna-se ícone PWA e favicon, e o workflow Android aplica automaticamente os ícones de launcher e o foreground adaptativo em todas as densidades.

A versão 1.0.19 corrige o gatilho do APK no GitHub: pushes na `main` agora executam o build Android automaticamente, com validação explícita do arquivo e resumo/diagnóstico da execução. O Manual da Bike também foi ampliado com mais peças, problemas, diagnóstico, segurança e dicas práticas.
