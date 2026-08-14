# Changelog

Todas as mudanças relevantes do Nomade Raiz são registradas aqui e também resumidas dentro da página **Sobre o App**.

## 1.0.8 — 14/08/2026
- Manual da Bike migrado integralmente para TypeScript/TSX.
- Todo o código-fonte em `src` agora usa TypeScript; arquivos `.js` e `.jsx` passam a ser bloqueados pelo lint.
- Corrigido o TS2352 da configuração de alimentação: `ALIMENTOS_CONFIG` agora é validado na origem como uma lista com ao menos uma unidade por alimento, sem casts forçados nas telas.
- Tipos compartilhados adicionados para peças, problemas, níveis e alvos do Manual da Bike.
- Node.js fixado na linha 20.x para evitar atualização automática de major no Vercel.
- Validações de build reforçadas para detectar regressões de tipagem antes do deploy.

## 1.0.7 — Home, Alertas e Configurações em TypeScript

- **Home**, **Alertas de Reposição** e **Configurações** migrados de JSX/JavaScript para TypeScript/TSX, incluindo seus barrels.
- Estados de checklist, nota rápida, edição de mínimos e escala de fonte agora possuem contratos de tipos explícitos.
- O progresso dos checklists ganhou proteção contra divisão por zero sem alterar o fluxo normal da interface.
- A aplicação de mínimos sugeridos agora preserva `0` quando ele foi definido manualmente e preenche somente mínimos ausentes.
- Confirmações destrutivas em Configurações passaram a usar explicitamente `window.confirm`, mantendo o comportamento e deixando a intenção clara para o TypeScript.
- O lint protege todos os módulos desta rodada contra o retorno acidental de versões `.jsx`/`.js` legadas.
- Quantidade de arquivos JSX restante caiu de 10 para 5; o **Manual da Bike** passa a ser o último bloco JSX principal.

## 1.0.6 — Planejamento, Diário e Pontos em TypeScript

- **Planejamento**, **Diário de Campo** e **Pontos de Apoio** migrados de JSX/JavaScript para TypeScript/TSX, incluindo páginas, formulários, badge de status e barrels.
- Formulários de diário e pontos passaram a consumir contratos compartilhados do estado persistente, evitando formatos divergentes entre UI e Store.
- Clima, tipos de ponto, avaliações, filtros e tipos de viagem agora possuem uniões TypeScript explícitas.
- `StatusBadge` passou a aceitar somente estados válidos produzidos por `planning.service.ts`.
- A importação de backups agora normaliza clima, tipo de ponto e avaliação para valores válidos, preservando compatibilidade com dados antigos ou incompletos.
- Estilos reutilizados dentro dos formulários e do Planejamento foram tipados como `CSSProperties`, eliminando inferências frouxas na migração.
- O lint protege os módulos desta rodada contra o retorno acidental de versões `.jsx`/`.js` legadas.
- Quantidade de arquivos JSX restante caiu de 16 para 10.

## 1.0.5 — Calculadora e Equipamentos em TypeScript

- Módulos de **Calculadora** e **Equipamentos** migrados de JSX/JavaScript para TypeScript/TSX, incluindo componentes, páginas e barrels.
- Estados de formulários, propriedades, eventos e contratos visuais agora possuem tipos explícitos, reduzindo erros silenciosos na interface.
- Totais globais e por categoria de Equipamentos foram centralizados em `equipment.service.ts`, eliminando recálculos duplicados nas páginas.
- O card de alimentação passou a consumir valor e autonomia já calculados por `calculator.service.ts`, em vez de duplicar a mesma regra na UI.
- `calcIndiceGeral` agora preserva o tipo do recurso que se torna gargalo, permitindo acessar seus metadados com segurança no resumo.
- O lint protege os módulos migrados contra o retorno acidental de versões `.jsx`/`.js` legadas.
- Quantidade de arquivos JSX restante caiu de 32 para 16.

## 1.0.4 — Páginas auxiliares em TypeScript

- Páginas **Extras**, **Dicas**, **Exportar / Importar** e **Sobre o App** migradas de JSX para TSX.
- Modais de dica, apoio e contato agora possuem contratos explícitos de propriedades.
- Fluxo de exportação/importação recebeu tipos para formatos de exportação e estilos compartilhados.
- Integração do QR Code recebeu uma declaração TypeScript local mínima, evitando dependência adicional apenas para tipos.
- O lint passa a proteger este novo conjunto contra o retorno acidental de versões `.jsx` legadas.
- Quantidade de arquivos JSX restante caiu de 39 para 32, mantendo o comportamento existente.

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
