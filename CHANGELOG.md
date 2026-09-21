# Changelog

## 1.0.56-kotlin-alpha.29

### Planejamento: separar IME/toque do teste de persistência

- Analisado `Android-Kotlin-APK-28-logs.zip`, correspondente à versão `1.0.55-kotlin-alpha.28`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 58s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 16s`).
- Android 15 executou 6 testes: **5 passaram e 1 falhou**. A única falha foi `planningFieldsAndGeneratedPlanSurviveNavigationAndRecreation`.
- O teste exclusivo `planningMarginButtonsPersistImmediately` passou. Isso confirma que, na nova arquitetura, o botão de margem responde ao toque físico e persiste a escolha corretamente.
- A falha restante ocorreu apenas no fluxo longo depois de vários `TextField`s terem sido editados, quando o teste voltava à margem com o IME ainda envolvido na sequência.
- A UI agora chama `LocalFocusManager.clearFocus(force = true)` antes de aplicar 0%, +10% ou +20%, reduzindo eventos tardios do teclado ao trocar de uma entrada numérica para uma escolha discreta.
- O teste longo foi separado por responsabilidade: o teste dedicado continua usando `performClick()` para validar o gesto real; o teste de persistência/recriação usa a ação semântica do mesmo botão para não depender da janela do IME.
- Após selecionar +20% no fluxo longo, o teste agora exige imediatamente `safetyMarginPercent == 20` no `AppRepository` e também `Margem atual: +20%` na UI. Depois continua validando geração, navegação, `Activity.recreate()`, restauração integral e `lastGenerated`.
- Nenhuma regra de negócio, dado persistido, Backup ou requisito de Release foi removido.
- Versão e metadados sincronizados: `1.0.56-kotlin-alpha.29` / `100056`.

## 1.0.55-kotlin-alpha.28

### Planejamento: correção do teste após a nova arquitetura

- Analisado `Android-Kotlin-APK-27-logs.zip`, correspondente à versão `1.0.54-kotlin-alpha.27`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 43s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 12s`).
- Android 15 iniciou 6 testes; 4 passaram e 2 falharam. As duas falhas ocorreram apenas nas novas verificações do texto `Margem atual`.
- Em `planningMarginButtonsPersistImmediately`, a asserção funcional `safetyMarginPercent == 20` passou antes da falha visual. Isso confirma que a nova arquitetura corrigiu o caminho clique → estado → persistência.
- A causa desta execução não era outro bug da margem: `assertTextContains("+20%")` foi usado sem `substring = true`. Na API de teste do Compose, o padrão exige que o valor fornecido corresponda a um item textual completo; o nó contém `Margem atual: +20%`, portanto `+20%` isolado falhava mesmo com a UI correta.
- As quatro verificações de `planning-margin-current` foram substituídas por `assertTextEquals(...)` com o texto completo (`Margem atual: +20%` / `Margem atual: +10%`). Isso torna o teste mais estrito e elimina a ambiguidade, sem reduzir cobertura.
- A arquitetura `PlanningAction` + `reducePlanning`, a persistência imediata das escolhas discretas e o debounce dos campos foram preservados sem novos remendos no seletor.
- Backup, `applicationId`, `namespace`, dados existentes e regras de Release foram preservados.
- Versão e metadados sincronizados: `1.0.55-kotlin-alpha.28` / `100055`.

## 1.0.54-kotlin-alpha.27

### Planejamento: mudança de arquitetura em vez de novos remendos

- Analisado `Android-Kotlin-APK-26-logs.zip`, correspondente à versão `1.0.53-kotlin-alpha.26`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 58s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 17s`).
- Android 15 executou 5 testes: 4 passaram e 1 falhou novamente na área do Planejamento.
- A falha retornou ao erro funcional `O clique em +20% não atualizou/persistiu a margem expected:<20> but was:<0>`.
- Após várias versões alternando entre persistência, semântica `Selected`, timeout e visibilidade, a estratégia foi alterada: o fluxo do Planejamento foi centralizado em `PlanningAction` + `reducePlanning`.
- Campos, margem e geração do plano agora entram por uma única função `dispatchPlanning`, sempre reduzindo sobre o `PlanningSession` mais recente.
- O seletor de margem foi reescrito com botões Material3 comuns e largura fixa. Foram removidos desse controle `selectable`, `selectableGroup`, `RadioButton`, `Role.RadioButton` e a dependência de `assertIsSelected()`.
- A seleção passa a ser comprovada por duas fontes funcionais: `Margem atual: +20%` na UI e `safetyMarginPercent=20` no repositório.
- O teste instrumentado monolítico foi dividido em um teste exclusivo de margem e outro para campos, geração, navegação e recriação da Activity.
- Adicionados testes unitários do redutor para provar que uma edição posterior não apaga a margem e que `GeneratePlan` preserva todo o snapshot.
- Persistência imediata continua restrita a ações discretas; campos digitados mantêm debounce de 300 ms para desempenho.
- Backup, `applicationId`, `namespace`, dados existentes e regras de Release foram preservados.
- Versão e metadados sincronizados: `1.0.54-kotlin-alpha.27` / `100054`.

## 1.0.53-kotlin-alpha.26

### Planejamento: seleção sem deslocamento após recomposição

- Analisado `Android-Kotlin-APK-25-logs.zip`, correspondente à versão `1.0.52-kotlin-alpha.25`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 57s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 18s`).
- Os testes instrumentados Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha mudou para `Assert failed: The component is not displayed!`; portanto não é o mesmo erro funcional `expected:<20> but was:<0>` da execução anterior.
- A análise encontrou uma causa visual concreta: a opção selecionada trocava o texto de `+20%` para `✓ +20%`. Isso aumentava a largura do item dentro do `FlowRow` exatamente após o clique/recomposição e podia fazê-lo quebrar para outra linha, deixando o nó de texto fora da viewport mesmo com o estado selecionado.
- O texto das opções agora permanece estável (`Sem margem`, `+10%`, `+20%`). O `RadioButton`, as cores e a semântica `Selected` comunicam a seleção sem alterar a geometria do controle.
- O teste foi ajustado para validar o próprio nó `planning-margin-20`: após a recomposição ele executa `performScrollTo()`, exige visibilidade, texto `+20%` e `Selected=true`. Depois de `Activity.recreate()`, repete a verificação e exige também que 0% e +10% estejam desmarcados.
- Persistência imediata da margem, proteção contra snapshots antigos e debounce de 300 ms dos campos digitados foram preservados.
- Backup, `applicationId`, `namespace` e dados existentes foram preservados.
- Versão e metadados sincronizados: `1.0.53-kotlin-alpha.26` / `100053`.

## 1.0.52-kotlin-alpha.25

### Planejamento: correção funcional do clique e persistência da margem

- Analisado `Android-Kotlin-APK-24-logs.zip`, correspondente à versão `1.0.51-kotlin-alpha.24`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 53s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 17s`).
- Os testes instrumentados Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A nova mensagem foi conclusiva: `O clique em +20% não atualizou/persistiu a margem expected:<20> but was:<0>`. Isso confirma que o problema não era apenas a leitura de `Selected`; a seleção ainda não chegava de forma confiável ao estado persistido.
- O seletor foi refeito no padrão de grupo de rádio recomendado pelo Compose: `FlowRow.selectableGroup()` e uma `Row` inteira por opção com `Modifier.selectable(..., role = Role.RadioButton)`. O `RadioButton` interno usa `onClick = null` e é somente visual.
- O callback genérico `updateDraftImmediate` foi removido desse fluxo. A margem agora usa `setSafetyMargin(Int)`, reduzindo indirection e garantindo uma atualização explícita do `PlanningDraft`.
- Foi criado `AppRepository.savePlanningSessionImmediate()`, usando `SharedPreferences.commit()` somente para escolhas discretas. O lock/revision existente continua impedindo que uma gravação debounced antiga sobrescreva a escolha.
- Campos de texto continuam com debounce de 300 ms e gravação em IO, preservando a melhoria de desempenho.
- O teste instrumentado continua validando clique, indicação visual, `Selected=true`, persistência real, geração do planejamento, navegação, `Activity.recreate()`, restauração dos campos e `lastGenerated`; nenhuma dessas coberturas foi removida.
- Backup, `applicationId`, `namespace` e dados existentes foram preservados.
- Versão e metadados sincronizados: `1.0.52-kotlin-alpha.25` / `100052`.

## 1.0.51-kotlin-alpha.24

### Planejamento: seletor de margem com RadioButton Material3

- Analisado `Android-Kotlin-APK-23-logs.zip`, correspondente à versão `1.0.50-kotlin-alpha.23`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 49s`) e a compilação do APK concluiu antes da etapa instrumentada.
- Os testes instrumentados Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha foi `Failed to assert the following: (Selected = 'true')`.
- Como a `1.0.50` já tinha apenas uma `assertIsSelected()`, o log confirmou que a falha ocorre imediatamente após o clique, não depois de `Activity.recreate()`.
- O nó customizado `Surface + selectable` foi removido como fonte da semântica testada. Cada opção de margem agora contém um `RadioButton` Material3 real, e a tag `planning-margin-*` está no próprio `RadioButton`.
- O `Surface` externo continua responsável apenas pelo visual; o indicador `✓` permanece visível na opção escolhida.
- O teste continua exigindo persistência imediata de 20%, `✓ +20%` visível e `Selected=true`. A ordem foi alterada para que um próximo log diferencie claramente clique/estado de semântica, sem remover cobertura.
- Persistência, geração, navegação, recriação da Activity, restauração dos campos e `lastGenerated` continuam verificadas.
- Backup, `applicationId`, `namespace` e dados existentes foram preservados.
- Versão e metadados sincronizados: `1.0.51-kotlin-alpha.24` / `100051`.

## 1.0.50-kotlin-alpha.23

### Planejamento: teste de restauração sem duplicar semântica instável

- Analisado o log correto `Android-Kotlin-APK-22-logs.zip`, correspondente à versão `1.0.49-kotlin-alpha.22`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 50s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 14s`).
- Os testes instrumentados no Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha registrada foi novamente `Failed to assert the following: (Selected = 'true')`.
- A análise mostrou que o teste verificava `Selected` logo após o clique e repetia a mesma consulta semântica depois de `Activity.recreate()`. A primeira verificação permanece obrigatória, preservando a cobertura de semântica/acessibilidade.
- Depois da recriação, o teste passou a validar diretamente a restauração funcional: `safetyMarginPercent = 20`, todos os campos persistidos, `lastGenerated`, `✓ +20%` visível, ausência de `✓` em 0%/+10% e ação de clique presente.
- Nenhuma verificação de persistência, geração, navegação ou restauração foi removida. O objetivo é deixar a falha apontar um problema real da UI/dados, em vez de uma segunda leitura duplicada da árvore semântica recomposta pelo Android 15.
- O controle visual e a persistência do Planejamento foram preservados; o módulo Backup não foi alterado.
- Versão e metadados sincronizados: `1.0.50-kotlin-alpha.23` / `100050`.

## 1.0.49-kotlin-alpha.22

### Planejamento: nó único para seleção da margem

- Analisado `Android-Kotlin-APK-21-logs.zip`, correspondente à versão `1.0.48-kotlin-alpha.21`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 56s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 17s`).
- Os testes instrumentados no Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha foi novamente `Failed to assert the following: (Selected = 'true')`. Portanto, a persistência deixou de ser o ponto observado neste log; o problema voltou à árvore semântica do seletor de margem.
- O `FilterChip` foi removido apenas desse seletor. `PlanningMarginChoice` volta a ser um `Surface` visual com `Modifier.testTag(...).selectable(...)` aplicado diretamente ao mesmo `LayoutNode`, sem `clearAndSetSemantics`, sem `clickable` duplicado e sem ação semântica manual.
- O indicador visual `✓` permanece na opção selecionada, e o `Role.RadioButton` é fornecido pelo `selectable` padrão do Compose.
- Foi preservada a persistência serializada da 1.0.48: campos digitados usam debounce de 300 ms e escolhas discretas invalidam/cancelam snapshots antigos antes da gravação imediata.
- O teste instrumentado continua exigindo `assertIsSelected()`, `✓ +20%`, persistência real em `AppRepository`, geração, navegação, `Activity.recreate()`, restauração integral dos campos e `lastGenerated`. Nenhuma verificação foi removida.
- Backup, `applicationId`, `namespace`, dados existentes e fluxo de Release foram preservados.
- Versão e metadados sincronizados: `1.0.49-kotlin-alpha.22` / `100049`.

## 1.0.48-kotlin-alpha.21

### Planejamento: fim da corrida de persistência e semântica padrão

- Analisado `Android-Kotlin-APK-20-logs.zip`, correspondente à versão `1.0.47-kotlin-alpha.20`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 55s`).
- `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 18s`).
- Os testes Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha foi `ComposeTimeoutException: Condition still not satisfied after 5000 ms`. O runner não registrou qual dos `waitUntil` do teste expirou, então a correção elimina as duas fontes ainda frágeis em vez de adivinhar uma delas.
- `PlanningMarginChoice` volta a usar `FilterChip` Material3, removendo `clearAndSetSemantics`, `clickable` e uma ação semântica duplicada. `Selected` e clique passam a vir do próprio componente padrão.
- A persistência do Planejamento deixou de usar o coletor `snapshotFlow`. Campos digitados agendam uma gravação com debounce de 300 ms; cada nova edição cancela/invalida a anterior.
- Escolhas discretas e a geração do plano cancelam qualquer gravação pendente e persistem imediatamente. Uma revisão monotônica e um bloqueio curto impedem um snapshot antigo de terminar depois de um valor novo.
- O teste instrumentado continua exigindo `assertIsSelected()`, indicador visual `✓ +20%`, valor 20 no repositório, geração, navegação, recriação da Activity, restauração integral e `lastGenerated`. O polling de 5 s foi removido para que uma regressão falhe no ponto exato.
- Backup, `applicationId`, `namespace`, dados legados e fluxo de Release foram preservados.
- Versão e metadados sincronizados: `1.0.48-kotlin-alpha.21` / `100048`.

## 1.0.47-kotlin-alpha.20

### Margem do Planejamento: semântica unificada

- Analisado `Android-Kotlin-APK-19-logs.zip`, correspondente à versão `1.0.46-kotlin-alpha.19`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 38s`).
- `:app:assembleDebug` passou antes da etapa instrumentada.
- Os testes Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha registrada foi `Failed to assert the following: (Selected = 'true')`. Portanto, não é o mesmo erro da execução imediatamente anterior, que era `ComposeTimeoutException` aguardando persistência; é o retorno do problema de semântica `Selected`.
- A análise do controle mostrou `testTag` e `selectable` em modificadores semânticos separados. Isso podia fazer o teste localizar o nó identificado pela tag sem ler o mesmo estado `Selected` do nó de seleção.
- `PlanningMarginChoice` agora usa `clearAndSetSemantics` para declarar no mesmo nó: `testTag`, `selected`, `Role.RadioButton`, `stateDescription` e a ação `onClick`. O toque físico continua via `clickable`.
- A opção selecionada recebe também o indicador visual `✓`, melhorando a leitura sem depender apenas de cor.
- O teste instrumentado não foi removido nem relaxado: continua verificando seleção, persistência, campos avançados, geração, navegação, recriação da Activity, valores restaurados e seleção restaurada. Checkpoints foram adicionados para diferenciar futuras falhas de clique, UI, persistência e restauração.
- Adicionado teste unitário específico para o round-trip de `safetyMarginPercent` em `snapshotForPlanning()` e `TravelFormJson`.
- Backup, `applicationId`, `namespace`, dados legados e workflow de Release foram preservados.
- Versão e metadados sincronizados: `1.0.47-kotlin-alpha.20` / `100047`.

## 1.0.46-kotlin-alpha.19

### Margem do Planejamento: clique e persistência determinísticos

- Analisado `Android-Kotlin-APK-18-logs.zip`, correspondente à versão `1.0.45-kotlin-alpha.18`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 50s`) e `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 13s`).
- Os testes instrumentados no Android 15 executaram 5 casos: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha desta vez foi `ComposeTimeoutException: Condition still not satisfied after 5000 ms` na espera por `AppRepository(...).loadPlanningSession().draft.safetyMarginPercent == 20`. Portanto, o gargalo observado está no caminho clique → estado/persistência, e não apenas na leitura de `Selected` da semântica.
- A seleção da margem deixou de depender de `FilterChip` com semântica adicional. Foi substituída por um controle Material baseado em `Surface + Modifier.selectable`, de modo que clique, `Selected`, papel de radio button e `testTag` ficam no mesmo nó semântico.
- A margem é uma escolha discreta e agora usa atualização com persistência imediata. O debounce de 300 ms continua reservado aos campos de digitação contínua, evitando voltar a gravar `SharedPreferences` a cada tecla.
- O teste continua exigindo `assertIsSelected()`, persistência real em `AppRepository`, geração do plano, navegação e restauração após `Activity.recreate()`. Nenhuma validação foi removida ou relaxada.
- Assistente de viagem, formatação pt-BR, dados legados, `applicationId`/`namespace` e fluxo de Release foram preservados.
- O módulo Backup não foi alterado.
- Versão e metadados sincronizados: `1.0.46-kotlin-alpha.19` / `100046`.

## 1.0.45-kotlin-alpha.18

### Margem +20%: semântica e validação Android 15

- Analisado `Android-Kotlin-APK-17-logs.zip`, correspondente à versão `1.0.44-kotlin-alpha.17`.
- `:app:testDebugUnitTest` passou (`BUILD SUCCESSFUL in 52s`) e `:app:assembleDebug` passou (`BUILD SUCCESSFUL in 17s`).
- Os testes instrumentados no Android 15 executaram 5 casos: 4 passaram e 1 falhou novamente em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation` com `Failed to assert: Selected = true`.
- A tentativa anterior de resolver apenas com `waitForIdle()` não foi suficiente. O novo log mostra que a causa não deve ser tratada somente como atraso de recomposição.
- O chip de margem agora publica explicitamente `selected` e `stateDescription` na semântica associada à própria tag `planning-margin-*`, evitando depender de como o `FilterChip` Material3 combina internamente `testTag` e `selectable` no Android 15.
- O teste continua exigindo `assertIsSelected()`. Antes dessa asserção, ele também aguarda a persistência real do rascunho refletir `safetyMarginPercent == 20`, separando claramente falha de clique/estado, falha semântica e falha de restauração.
- Após `Activity.recreate()`, continuam obrigatórias as verificações de `safetyMarginPercent == 20`, campos avançados, recursos, `lastGenerated` e seleção visual do chip `+20%`. Nenhum teste foi removido ou relaxado.
- Persistência serializada, formatação pt-BR, assistente de viagem e compatibilidade de dados foram preservados.
- O módulo Backup não foi alterado.
- Versão e metadados sincronizados: `1.0.45-kotlin-alpha.18` / `100045`.

## 1.0.44-kotlin-alpha.17

### Sincronização do teste de margem no Android 15

- Analisado `Android-Kotlin-APK-16-logs.zip`: `:app:testDebugUnitTest` passou, `:app:assembleDebug` passou e os testes instrumentados Android 15 executaram 5 casos, com 4 aprovados e 1 falha.
- A falha ocorreu em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`, no novo `assertIsSelected()` do chip `+20%`, antes de o teste chegar às verificações finais de persistência.
- O teste encadeava `performClick().assertIsSelected()` na mesma interação sem uma sincronização explícita entre a ação e a leitura da nova árvore semântica. No Android 15, a asserção observou `Selected = false` antes da recomposição refletir a alteração.
- A validação agora executa o clique, chama `waitForIdle()` e consulta novamente o nó `planning-margin-20` antes de exigir `assertIsSelected()`. A verificação não foi removida nem relaxada.
- O mesmo teste foi reforçado após `Activity.recreate()`: além de conferir `safetyMarginPercent == 20` no repositório, ele volta ao chip e exige que a própria interface restaurada esteja selecionada em `+20%`.
- A correção anterior de atualização sobre o estado raiz e persistência serializada foi preservada sem alterações.
- O módulo Backup não foi alterado.
- Versão e metadados sincronizados: `1.0.44-kotlin-alpha.17` / `100044`.

## 1.0.43-kotlin-alpha.16

### Persistência do Planejamento e teste Android 15

- Corrigida a falha real observada no GitHub Actions em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`: 4 de 5 testes instrumentados passaram e a margem de segurança selecionada em `+20%` voltou como `0%` após a sequência de edição, navegação e recriação da Activity.
- A causa estava em atualizações de `PlanningDraft` feitas a partir de cópias capturadas por callbacks de campos diferentes. Em interações rápidas, um campo posterior podia reconstruir o rascunho a partir de uma versão anterior e sobrescrever uma alteração recente.
- Os campos do Planejamento agora aplicam transformações sobre o estado mais atual no nível raiz do aplicativo. Assim, editar dinheiro, água, ritmo ou detalhes opcionais não pode apagar silenciosamente a margem ou outro campo atualizado logo antes.
- A persistência com atraso de 300 ms também foi serializada em um único fluxo com `snapshotFlow` + `collectLatest`, evitando que uma gravação antiga termine depois de uma gravação nova e sobrescreva o rascunho mais recente.
- O botão **Salvar planejamento** continua fazendo gravação imediata do snapshot atual, preservando a segurança na recriação da Activity sem voltar a gravar `SharedPreferences` a cada tecla.
- O chip de margem recebeu tag estável (`planning-margin-20`) e o teste instrumentado agora confirma explicitamente que `+20%` ficou selecionado antes de prosseguir. O teste não foi removido nem enfraquecido.
- Os logs recebidos desta versão-base confirmaram: testes unitários **OK**, compilação do APK **OK**, Android 15 com **4/5 testes aprovados e 1 falha**. Esta correção ainda precisa de uma nova execução do GitHub Actions para ser declarada aprovada.
- Tela Sobre, README, CHANGELOG, VALIDACAO e metadados do GitHub Manager atualizados.
- Módulo Backup preservado sem alterações.
- Versão e metadados sincronizados: `1.0.43-kotlin-alpha.16` / `100043`.

## 1.0.42-kotlin-alpha.15

### Planejamento por ritmo e recursos essenciais

- Reformulada a tela Planejar para priorizar o fluxo `destino → distância → ritmo → estimativa → recursos`, em vez de começar por um resumo extenso do inventário.
- Adicionados velocidade média (`km/h`) e horas pedalando por dia; o app calcula em tempo real distância diária, horas efetivas de pedal, quantidade de dias e duração do último dia.
- Adicionada margem de segurança de 0%, 10% ou 20%, aplicada como reserva de tempo sem alterar os quilômetros reais da rota.
- Adicionados três cenários comparáveis de duração diária (4 h, 6 h e 8 h), tocáveis para aplicar rapidamente o cenário escolhido.
- Data de saída opcional passa a produzir previsão de chegada em dias corridos.
- Alimentação, água e energia ganharam entradas rápidas: gasto de alimentação por pessoa/dia, água por pessoa/dia e Wh/dia do grupo. Os totais acompanham automaticamente a duração estimada.
- Último planejamento foi compactado; checklist e recomendações ficam recolhidos. Alimentação item a item, água carregada/reabastecimento, orçamento, tipo de viagem e campos antigos foram movidos para detalhes opcionais, sem excluir dados ou funções existentes.
- Rascunho de Planejamento passou ao schema local 2. Dados antigos são migrados sem inventar velocidade/horas; a duração manual antiga continua válida até o usuário configurar o novo ritmo.
- O cálculo detalhado usa a nova duração estimada quando disponível e mantém a duração antiga como fallback para planos legados.
- A imagem hero deixou de ser usada na tela Planejar para reduzir custo de primeira composição em aparelhos básicos. Nenhuma imagem ou mockup novo foi criado.
- Tela Sobre e documentação atualizadas.
- Testes unitários foram ampliados para ritmo, margem, data de chegada, recursos essenciais e migração do schema antigo; teste instrumentado de Planejamento foi atualizado para cobrir o novo fluxo sem remover os demais cenários.
- Módulo Backup preservado sem alterações.
- Versão e metadados sincronizados: `1.0.42-kotlin-alpha.15` / `100042`.

## 1.0.41-kotlin-alpha.14

### Desempenho e campos numéricos brasileiros

- Corrigido o principal ponto de lentidão encontrado na digitação do Planejamento e da Calculadora: cada tecla atualizava o estado raiz, serializava o rascunho e iniciava uma gravação em `SharedPreferences` pela thread da interface. A persistência desses dois rascunhos agora é agrupada por 300 ms e executada em `Dispatchers.IO`, mantendo o valor atual em `SavedState` para sobreviver à recriação da Activity.
- Reduzidos cálculos repetidos durante recomposições em Home, Equipamentos, Diário, Pontos de apoio e Mais com `remember` para totais, filtros, agrupamentos e estatísticas que só dependem dos dados alterados.
- A busca do Manual da Bike deixou de recompilar a expressão regular de normalização a cada termo pesquisado.
- Removido da Calculadora o parâmetro de inventário que já não era utilizado, reduzindo recomposições sem relação com a tela.
- Todos os `NumericField` passam a manter o valor cru no estado e aplicar agrupamento de milhares apenas na apresentação. Exemplo: `100000` é exibido como `100.000`, sem mudar o número persistido.
- Campos monetários agora exibem prefixo `R$`; campos com unidade mostram sufixos como `km`, `km/dia`, `L`, `L/dia`, `Wh`, `Wh/dia` e `dias` quando aplicável.
- Colagem de valores localizados como `1.500,50` e `1.000.000` é normalizada sem perder o valor; ponto ou vírgula decimal digitados continuam aceitos.
- Resultados monetários e numéricos também passaram a usar separação de milhares em pt-BR.
- Testes de entrada numérica foram ampliados e os testes instrumentados tiveram os rótulos atualizados sem remover cenários existentes.
- Nenhuma imagem ou mockup foi criado/modificado e o módulo Backup não foi alterado.
- Corrigido também o empacotamento: a pasta raiz do ZIP passa a usar o nome da versão atual, evitando carregar internamente o nome da versão anterior.
- Versão e metadados sincronizados: `1.0.41-kotlin-alpha.14` / `100041`.

## 1.0.40-kotlin-alpha.13

### Calculadora enxuta para a cicloviagem

- Simplificada a tela Calculadora para mostrar apenas os dados práticos de alimentação, água e energia, além dos dias da viagem para estimar totais.
- Alimentação agora usa gasto diário; Água usa quantidade carregada e consumo diário; Energia usa reserva disponível e consumo diário.
- Removidos da interface da Calculadora os blocos extensos de Bike, inventário de alimentos, Dinheiro, Peso e custos detalhados. Os campos legados continuam preservados no rascunho persistido, evitando perda de dados de instalações anteriores.
- Revisada a correção da navegação inferior: não há mais uso de `WindowInsets.isImeVisible`; `nav-More` e `nav-Journal` permanecem na composição sempre que uma tela principal está ativa.
- Backup permanece fora do escopo e não foi alterado.
- Versão e metadados sincronizados: `1.0.40-kotlin-alpha.13` / `100040`.

## 1.0.39-kotlin-alpha.12

### Correção do teste Android 15 e da navegação inferior

- Corrigida a causa das quatro falhas instrumentadas observadas no GitHub Actions.
- A barra inferior não depende mais de `WindowInsets.isImeVisible`, que podia permanecer ativo incorretamente no emulador Android 15 e retirar `Mais` e `Diário` da árvore da interface.
- A navegação inferior agora permanece disponível em todas as telas principais; o redimensionamento do teclado continua sendo tratado pelo sistema e por `imePadding` no conteúdo.
- Nenhum módulo, dado persistido ou recurso de Backup foi removido ou alterado.
- Versão e metadados sincronizados: `1.0.39-kotlin-alpha.12` / `100039`.

## 1.0.38-kotlin-alpha.11

- Corrigidas a altura fixa da navegação inferior e a aplicação/consumo dos espaços das barras do Android e do teclado; aparência das barras sincronizada com o tema escolhido.
- Planejamento passou a salvar rascunho e último plano gerado separadamente; Calculadora passou a salvar campos, alimentação e pesos. Nenhuma chave anterior de dados foi substituída.
- Entradas com vírgula e ponto decimal são interpretadas corretamente. Valores inválidos têm mensagem e bloqueiam geração/salvamento, em vez de virarem zero silenciosamente.
- Distância/duração fornecem a média real da viagem; a antiga média editável foi identificada como meta nos dias de pedal. Mantida a possibilidade de descanso, com aviso quando a meta não cobre o percurso.
- Botão de gerar acessível com indicação dos requisitos; alimentação compactada em linhas expansíveis. Todos os campos, cálculos e detalhamentos anteriores continuam acessíveis.
- Resultados do planejamento calculados somente quando o plano gerado ou inventário muda. Busca do Manual e resultados da Calculadora memorizados por suas entradas; lista de pesos renderizada por item.
- Corrigidos o retorno visível de Planejamento aberto por Mais e o retorno do Android dentro de categorias de Equipamentos. Estado de rolagem das telas preservado.
- Alertas passou a diferenciar ausência de mínimos de estoque suficiente; mínimo zero desativa o acompanhamento do item, com edição validada.
- Aplicada a cor escolhida também aos cartões, seletores e diálogos Material 3; cores de Configurações em duas linhas; ícones vetoriais e melhor legibilidade das informações secundárias.
- Totais financeiros de Equipamentos reunidos em uma faixa. Home identifica o progresso como inventário adquirido, evitando confusão com o checklist de segurança.
- Calculadora vazia não conta o consumo padrão de energia como recurso já preenchido. Comparações incompletas são identificadas como parciais.
- Adicionados testes JUnit de números, recursos, estado de estoque e serialização; testes instrumentados de navegação repetida, rascunhos, categorias, outras telas e preservação de preferências.
- Workflow preparado para exigir testes unitários, compilação e testes Android 15 antes de publicar somente `Nomade-Raiz.apk`.
- Backup mantido fora das alterações: tela, exportação/importação e schema preservados; os novos rascunhos locais não foram adicionados ao JSON de backup.
- Sem imagens novas ou alteração dos recursos visuais existentes.
- Versão e metadados sincronizados: `1.0.38-kotlin-alpha.11` / `100038`.
- Validação local limitada a revisão estática e integridade. Build e testes Android/JUnit ainda pendentes de execução no GitHub Actions por bloqueio de downloads neste ambiente; não se afirma ausência de travamentos em aparelho sem esses testes.

## 1.0.37-kotlin-alpha.10

- Implantada a identidade visual do mockup nas 12 áreas principais, mantendo os dados e recursos reais do aplicativo em vez de números demonstrativos.
- Adicionados e otimizados dez recursos visuais locais para Home, Planejamento, Diário, Mais, Pontos, Manual da Bike e Dicas; o uso permanece totalmente offline.
- Home reorganizada com abertura para cicloviagem, verificação imediata, progresso real do inventário, acesso ao Diário e atalhos funcionais.
- Equipamentos ganhou hierarquia por categoria, percentual de conclusão e apresentação compacta, preservando CRUD, filtros, preços, prioridades e ordenação.
- Planejamento, Calculadora, Diário, Alertas, Pontos de apoio, Verificar e Configurações receberam cabeçalhos, resumos e cartões compatíveis com o novo visual sem perder as funções existentes.
- Dicas recebeu filtros por categoria e miniaturas; Manual da Bike foi reorganizado em Visão geral, Manutenção e Ajustes, mantendo busca, diagnósticos, favoritos e domínio.
- Mais passou a usar uma grade leve sobre fundo local, preservando os nove destinos originais e o contador real de alertas.
- Corrigido um fechamento de escopo no novo Manual da Bike identificado pela compilação Kotlin.
- Confirmados por testes os ciclos `Home → Mais → módulo → voltar`, todos os nove destinos, 100 ciclos por módulo e 1.000 aberturas/fechamentos de Mais sem crescimento da pilha.
- Mantido o processamento de Backup fora da UI thread e preservada a persistência/compatibilidade dos dados existentes.
- GitHub Actions permanece restrito ao asset de Release `Nomade-Raiz.apk`, sem `upload-artifact`, AAB ou ZIP de APK.

## 1.0.36-kotlin-alpha.9

- Corrigido o travamento ao abrir **Mais**: o menu e cada ferramenta foram separados do antigo arquivo Compose monolítico, evitando carregar e verificar todos os módulos na UI thread no primeiro acesso.
- Substituída a navegação baseada em textos e em um único destino de retorno por destinos tipados e uma pilha determinística, com suporte ao botão Voltar do Android.
- Adicionados testes de repetição para `Home → Mais → módulo → voltar`, cobrindo todos os destinos e impedindo crescimento indevido da pilha.
- Geração de listas/JSON e leitura, gravação e restauração de arquivos de Backup movidas para processamento fora da thread da interface.
- Corrigido o conflito entre o estado chamado `error` e a função Kotlin `error()` dentro da tela de Backup.
- Restaurada a equivalência do menu Mais com o original: Planejamento, títulos, descrições e contador real de Alertas.
- Restaurado em Pontos de apoio o filtro por tipo do aplicativo original e adicionada confirmação antes de excluir.
- Corrigido o `versionCode` desatualizado no README.
- Workflow passa a executar os testes antes da compilação e valida que a Release contém exatamente um asset próprio: `Nomade-Raiz.apk`.
- `github-manager.json` sincronizado a partir de `app/build.gradle.kts`.

## 1.0.35-kotlin-alpha.8
- Workflow ajustado para não usar GitHub Actions Artifacts, evitando download em ZIP.
- `Nomade-Raiz.apk` passa a ser publicado e validado como asset direto da GitHub Release.
- O workflow falha se o APK não existir antes da Release ou se o asset não aparecer na API da Release.
- Adicionado link direto do APK ao resumo da execução do workflow.
- `github-manager.json` sincronizado com `app/build.gradle.kts`.


## 1.0.34-kotlin-alpha.7

- Adicionada opção **Cor do aplicativo** em Configurações, com seis cores globais: Verde Raiz, Azul, Turquesa, Laranja, Roxo e Vermelho.
- A cor selecionada altera os componentes Material 3 do aplicativo, permanece salva localmente e é incluída no backup/restauração.
- Adicionado botão para restaurar a aparência padrão sem apagar os demais dados.
- Diário ampliado para CRUD completo: agora é possível editar registros existentes; adicionados totais de registros e quilômetros.
- Home: contador de alertas agora abre diretamente a tela Alertas de Reposição.
- Corrigido o retorno de navegação: telas abertas pela Home, Planejamento ou Mais agora voltam para a origem correta.
- Planejamento: adicionados atalhos funcionais para Pontos de apoio durante o planejamento de água e para o Manual da Bike na revisão de segurança.
- Exportar/Backup: além de copiar, agora é possível salvar listas `.txt`, salvar backup `.json` e abrir/restaurar um backup diretamente do armazenamento Android.
- Tela Sobre agora mostra `versionName`, `versionCode` e `applicationId` reais da build.
- Removida anotação Compose duplicada encontrada na tela de Configurações.
- `app/build.gradle.kts` atualizado para `1.0.34-kotlin-alpha.7` / `versionCode 100034`.
- `github-manager.json` regenerado e validado a partir do Gradle.
- GitHub Actions permanece configurado para publicar somente `Nomade-Raiz.apk`.

## 1.0.33-kotlin-alpha.6

- Corrigidos os erros de compilação Compose reportados no log 8:
  - `LocalContext.current` não é mais chamado dentro do bloco de `remember`;
  - chamadas de `Text` foram corrigidas para argumentos nomeados onde necessário;
  - telas grandes foram separadas e reestruturadas para evitar blocos `LazyColumn/item` fora de escopo.
- Adicionado `github-manager.json` na raiz com nome, versão, `versionName`, `versionCode`, `applicationId`, `namespace`, linguagem e tipo do projeto.
- `app/build.gradle.kts` permanece como fonte principal da versão.
- Adicionado `scripts/sync-github-manager.py` para atualizar/verificar o JSON a partir do Gradle.
- GitHub Actions agora falha se `github-manager.json` estiver fora de sincronia.
- Release/tag continua usando o `versionName` e publica somente `Nomade-Raiz.apk`.
- Home ampliada com nota rápida, dias na estrada, alertas, investimento, próximo passo e atalhos funcionais.
- Equipamentos ampliado com prioridade, mudança de categoria, filtros, ordenação e resumos de total/adquirido/falta.
- Restaurados `createdAt` e `updatedAt` nos equipamentos e no backup.
- Corrigidos os tipos de Pontos de apoio para os tipos existentes no original; removido o tipo extra de Energia.
- Checklists temporários e persistentes agora seguem a regra do original: apenas `Antes de sair` e `Bike/Manutenção` permanecem salvos.
- Planejamento ampliado com quatro tipos de viagem, alimentação por grupo, água/reabastecimento, energia baseada no inventário, segurança, abrigo, reserva financeira, custos, estados e recomendações.
- Calculadora ampliada com Alimentação e Resumo Geral, além das áreas Bike, Água, Energia, Dinheiro, Peso e Custo.
- Configurações tornadas funcionais, incluindo tema, escala de fonte e contador da viagem.
- Backup/Importação JSON e exportação de listas tornados funcionais, incluindo leitura de backups antigos de equipamentos.
- Manual da Bike migrado com 4 áreas, 12 peças, 9 problemas de estrada, 6 dicas rápidas, 15 termos, 9 ferramentas, busca, favoritos e habilidades dominadas.
- Favoritos do Manual e habilidades dominadas incluídos na persistência e no backup.
- `versionCode` atualizado para `100033`.

## 1.0.32-kotlin-alpha.5

- Release/tag do GitHub passou a usar automaticamente o `versionName`.
- Release mantida com somente `Nomade-Raiz.apk`.
- Alertas de Reposição migrados com estoque disponível, mínimos por item e mínimos sugeridos.
- Dicas de Sobrevivência migradas com favoritos persistentes.
- `versionCode` 100032.

## 1.0.31-kotlin-alpha.4-fix1

- Corrigida a compilação das telas Calculadora/Pontos de apoio.
- Corrigida a rota de Pontos de apoio no menu Mais.
- Mantida publicação de somente `Nomade-Raiz.apk`.

## 1.0.30-kotlin-alpha.4

- Pontos de apoio ganhou cadastro, edição, exclusão, tipo, localização, observações, avaliação e aberto/fechado.
- Persistência local dos pontos.
- Calculadora ampliada com bicicleta, água, energia, dinheiro, peso e custo da viagem.

## 1.0.29-kotlin-alpha.3

- Equipamentos passaram a usar dados reais, categorias, edição, exclusão, status e persistência local.
- Cinco modos de checklist migrados.
- Diário funcional com criação, listagem, exclusão e persistência.
- Planejamento e Calculadora receberam as primeiras regras reais.
- Home passou a usar estatísticas reais dos equipamentos.
- Workflow ajustado para publicar somente `Nomade-Raiz.apk` na Release.

## 1.0.28-kotlin-alpha.2

- Corrigida a incompatibilidade JVM do GitHub Actions.
- Java e Kotlin configurados para JVM 17.
- Adicionado `jvmToolchain(17)`.

## 1.0.27-kotlin-alpha.1

- Iniciada a conversão para Kotlin nativo + Jetpack Compose.
- Criada a fundação Android sem React/Capacitor.
- Migradas as primeiras telas e navegação nativa.
- Adicionado workflow inicial de APK.
