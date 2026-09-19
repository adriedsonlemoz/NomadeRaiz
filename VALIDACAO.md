# Validação — 1.0.44-kotlin-alpha.17

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.43-alpha.16.zip`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100044`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-16-logs.zip` foi analisado antes desta correção. Ele corresponde à execução da versão-base `1.0.43-kotlin-alpha.16`.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 55s`; 24 tarefas executadas.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 19s`; 37 tarefas, 19 executadas e 18 atualizadas.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 chegaram ao estado de aprovados e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: Failed to assert the following: (Selected = 'true')`.
- A falha aconteceu no novo `assertIsSelected()` executado imediatamente depois de tocar no chip `planning-margin-20`. Portanto essa execução **não chegou** às asserções finais que verificam `safetyMarginPercent`, dias, recursos e `lastGenerated` após recriação.
- Como houve falha instrumentada, o workflow terminou com `BUILD FAILED` e a publicação continuou corretamente bloqueada.

Os avisos iniciais de `adb: device offline` ocorreram durante a inicialização do emulador e foram recuperados pelo runner; os 5 testes chegaram a iniciar. Eles não são a causa da falha final.

## Causa desta falha

O teste da versão 1.0.43 reforçou a verificação do chip de margem, mas encadeou `performClick().assertIsSelected()` na mesma `SemanticsNodeInteraction`. O clique altera estado Compose e a propriedade semântica `Selected` é atualizada na recomposição seguinte. Nesta execução do Android 15, a leitura ocorreu antes de a nova árvore semântica refletir a seleção.

Isso é diferente da falha da versão 1.0.42, na qual a execução chegou ao repositório e encontrou `expected:<20> but was:<0>`. Na 1.0.43 o teste parou antes dessa etapa, então os logs atuais não comprovam nem refutam a persistência final da correção anterior.

## Correção aplicada

- O clique em `planning-margin-20` e a asserção foram separados.
- Depois do clique, o teste executa `compose.waitForIdle()` e somente então consulta novamente `planning-margin-20` e exige `assertIsSelected()`.
- A asserção de seleção foi mantida; nenhum teste foi removido ou enfraquecido.
- Depois de `Activity.recreate()`, o teste foi fortalecido: ele ainda exige `saved.draft.safetyMarginPercent == 20` no repositório e agora também rola novamente até o chip e exige que a UI restaurada continue selecionada em `+20%`.
- A lógica de atualização sobre o estado raiz e a persistência serializada com `snapshotFlow` + `collectLatest` da versão 1.0.43 foi preservada.
- Backup não foi alterado. `applicationId` e `namespace` continuam `com.nomaderaiz.app`.

## Verificações desta entrega no ambiente atual

- Estrutura e referências dos arquivos modificados foram revisadas.
- `app/build.gradle.kts`, README, CHANGELOG, Sobre e `github-manager.json` foram sincronizados para `1.0.44-kotlin-alpha.17` / `100044`.
- O ambiente local disponível não possui o executável Gradle; por isso não é declarado que `:app:testDebugUnitTest`, `:app:assembleDebug` ou `:app:connectedDebugAndroidTest` passaram nesta nova versão.

A próxima execução do GitHub Actions deve repetir obrigatoriamente testes unitários → build APK → testes instrumentados Android 15. A Release deve permanecer bloqueada se qualquer etapa falhar e deve publicar somente `Nomade-Raiz.apk`.
