# Changelog

## 1.0.1 — Fundação

- Persistência migrada de `localStorage` para IndexedDB usando Dexie.
- Migração automática e segura dos dados salvos pela versão 1.0.0.
- Backup JSON completo, versionado e com validação básica na restauração.
- Compatibilidade com backups antigos que continham somente o inventário.
- Versão do aplicativo centralizada no `package.json`.
- Tipos de estado persistente, backup, configurações e filtros consolidados.
- Componentes básicos `PageHeader`, `AppButton`, `Card` e `SectionLabel`.
- Tokens básicos de espaçamento, raio e sombra adicionados ao tema.
- Scripts `lint`, `typecheck` e `check` adicionados ao fluxo de build.
- Removido uso destrutivo de `localStorage.clear()`.
- Inventário vazio agora permanece vazio após reiniciar o aplicativo.

## 1.0.0

- Base inicial do Nômade.
