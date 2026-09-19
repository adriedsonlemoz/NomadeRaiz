# Validação — 1.0.43-kotlin-alpha.16

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.42-alpha.15.zip`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100043`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-15-logs.zip` foi analisado antes da correção. Ele corresponde à execução da versão-base `1.0.42-kotlin-alpha.15`.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram executados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: expected:<20> but was:<0>`. O valor era `PlanningDraft.safetyMarginPercent`: a interface havia selecionado `+20%`, mas o rascunho persistido terminou com `0%`.
- Como os testes instrumentados falharam, o workflow encerrou com `BUILD FAILED` e a publicação permaneceu corretamente bloqueada.

## Causa encontrada

Os campos de `PlanningScreen` recebiam um `PlanningDraft` e, em seus callbacks, faziam `draft.copy(...)`. Esse `draft` era a cópia capturada pela composição daquele componente. Em uma sequência rápida de ações, outro campo podia executar usando uma cópia anterior e reconstruir todo o rascunho, apagando um valor atualizado poucos instantes antes. O cenário do teste reproduziu isso com a margem `+20%` seguida da abertura dos detalhes e edição do dinheiro.

Havia também um segundo risco de ordem na persistência automática: cada mudança criava um `LaunchedEffect(planning)` próprio com atraso de 300 ms. Embora a intenção fosse debounce, uma gravação já iniciada em `Dispatchers.IO` podia competir com uma gravação mais nova.

## Correção aplicada

- `PlanningScreen` não recebe mais snapshots inteiros para substituir o rascunho em cada campo. Cada controle envia uma transformação `(PlanningDraft) -> PlanningDraft`.
- `NomadeRaizApp` aplica essa transformação sobre `planning.draft` no instante da ação, sempre usando o estado raiz mais recente.
- O botão **Salvar planejamento** cria o snapshot a partir do estado raiz atual e o persiste imediatamente junto com `lastGenerated`.
- A persistência automática de Planejamento e Calculadora agora usa um coletor estável com `snapshotFlow`, `distinctUntilChanged` e `collectLatest`, mantendo o atraso de 300 ms sem permitir inversão da ordem dos snapshots.
- O chip `+20%` recebeu `testTag("planning-margin-20")`; o teste instrumentado passou a clicar nessa tag e chamar `assertIsSelected()` antes de continuar. Isso aumenta a precisão do teste sem remover nenhuma verificação de persistência.
- Backup não foi alterado. `applicationId` e `namespace` continuam `com.nomaderaiz.app`.

## Verificações desta entrega no ambiente atual

- Estrutura e referências dos arquivos modificados foram revisadas.
- As regras puras de negócio continuam compiláveis separadamente com `kotlinc`; a alteração principal desta entrega está na camada Compose/estado.
- `python3 scripts/sync-github-manager.py --check` deve ser executado após a sincronização dos metadados e faz parte da preparação do pacote.
- O ambiente atual não possui Gradle/Android SDK configurado para executar `:app:testDebugUnitTest`, `:app:assembleDebug` ou o emulador Android 15. Portanto, **não é declarado que a correção passou nos testes Android ainda**.

A próxima execução do GitHub Actions deve repetir obrigatoriamente testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada se qualquer etapa falhar e deve publicar somente `Nomade-Raiz.apk`.
