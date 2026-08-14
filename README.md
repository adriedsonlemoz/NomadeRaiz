# Nomade Raiz

Versão atual: **1.0.6**

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
- TypeScript + JavaScript/JSX em migração gradual
- Vite
- Capacitor 6
- Manifesto web com identidade Nomade Raiz
- Dexie / IndexedDB
- Tailwind/PostCSS disponíveis na base

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
npm run check
npm run build
```

O `lint` também verifica imports relativos, uso indevido de `localStorage`, sincronização de versão entre `package.json`, `package-lock.json`, README e changelogs, além de regras estruturais da fundação.

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

A versão 1.0.2 padroniza a identidade **Nomade Raiz**, melhora a página Sobre, restaura as marcas-d’água visuais da Home e fortalece a apresentação e validação do projeto no GitHub.
