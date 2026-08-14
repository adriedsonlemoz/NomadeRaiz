# Changelog

Todas as mudanças relevantes do Nomade Raiz são registradas aqui e também resumidas dentro da página **Sobre o App**.

## 1.0.3 — Base visual em TypeScript

- Ponto de entrada `App` migrado de JSX para TSX.
- Layouts principais (`AppShell`, `BottomNav`, `SplashScreen` e `ErrorBoundary`) migrados para TypeScript.
- Hooks compartilhados migrados para TypeScript, com contratos explícitos para háptica, dias na estrada e alertas.
- Componentes comuns antigos em JSX (`Badge`, `BicycleIcon`, `EmptyState`, `Modal`, `ProgressBar` e `QtyControl`) migrados para TSX.
- Barrels de layouts e componentes comuns migrados para TypeScript e passaram a exportar tipos públicos.
- Migração mantém as páginas de negócio funcionando em JSX enquanto a base compartilhada passa a fornecer tipos para as próximas etapas.

## 1.0.2 — Identidade e apresentação

- Nome visível padronizado para **Nomade Raiz** no app, splash, Capacitor, navegador e telas internas.
- Título, metadados HTML e manifesto web atualizados para a identidade Nomade Raiz.
- Página **Sobre o App** renovada para destacar a versão atual, propósito, tecnologias e últimas mudanças.
- Ícones em formato de marca-d’água restaurados nos quadros de verificações da tela inicial.
- `README.md` criado com descrição, funcionalidades, stack, dados, scripts e versionamento.
- `.gitignore` criado para impedir envio acidental de dependências, builds, arquivos locais e segredos.
- `package.json` recebeu descrição, palavras-chave, repositório, homepage, issues e requisito de Node.
- `npm run lint` agora exige sincronização da versão entre `package.json`, lockfile, README e changelogs.
- Identificador nativo do Capacitor foi preservado para evitar quebra desnecessária de compatibilidade; apenas o nome exibido foi alterado.

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

## 1.0.0 — Base inicial

- Checklist de equipamentos e verificações rápidas.
- Planejamento de autonomia.
- Manual da bicicleta e diário de campo.
- Funcionamento offline no navegador.
