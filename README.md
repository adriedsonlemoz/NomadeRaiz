# Nomade Raiz

Versão atual: **1.0.14**

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

- React 18
- TypeScript/TSX em todo o código-fonte (`src`)
- Vite
- Capacitor 6
- Manifesto web com identidade Nomade Raiz
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
npm run lint
npm run typecheck
npm run test
npm run check
npm run build
```

O `lint` também verifica imports relativos, uso indevido de `localStorage`, sincronização de versão entre `package.json`, `package-lock.json`, README e changelogs, além de regras estruturais da fundação. O `npm run test` executa a suíte automatizada de regras de negócio e backup; `npm run check` combina lint, TypeScript e testes antes do build.

## Capacitor

```bash
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

A identidade visível do aplicativo é **Nomade Raiz**. O identificador nativo existente foi preservado para não quebrar compatibilidade de instalações futuras.

## Versionamento

O projeto segue `MAJOR.MINOR.PATCH`. Toda nova versão deve atualizar:

1. `package.json` e `package-lock.json`;
2. `CHANGELOG.md`;
3. changelog exibido na página **Sobre o App**.

A versão mostrada dentro do aplicativo é lida automaticamente do `package.json`.

## Repositório

Projeto mantido em `adriedsonlemoz/NomadeRaiz` no GitHub.

## Estado atual

A versão 1.0.14 amplia o Design System para Home, Planejamento, Calculadora, Equipamentos e Manual da Bike. Nessas cinco áreas, estilos estáticos foram movidos para CSS centralizado e restaram apenas dois estilos inline, ambos usados para cores configuráveis em runtime. A Calculadora também deixou de depender dos tokens de tema em TypeScript, usando o tema exclusivamente por CSS.
