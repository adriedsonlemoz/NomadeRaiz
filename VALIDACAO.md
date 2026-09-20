# Validação — 1.0.47-kotlin-alpha.20

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.46-alpha.19`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100047`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-19-logs.zip` foi analisado antes desta correção e corresponde à versão `1.0.46-kotlin-alpha.19`.

- Verificação de metadados do GitHub Manager: executada antes dos testes no workflow.
- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 38s`; 24 tarefas executadas.
- `:app:assembleDebug`: **OK** — a compilação terminou com sucesso antes do emulador Android 15.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: Failed to assert the following: (Selected = 'true')`.
- A Release permaneceu corretamente bloqueada.

Os avisos do emulador e as tentativas iniciais de ADB não são a causa final: o emulador iniciou e os cinco testes chegaram à execução.

## É o mesmo erro?

Não é o mesmo erro da execução imediatamente anterior. No `Android-Kotlin-APK-18-logs.zip`, a falha era `ComposeTimeoutException` aguardando `safetyMarginPercent == 20` aparecer no repositório. No log atual, o erro voltou a ser a leitura semântica `Selected = true`. É, portanto, o mesmo **tipo de erro de seleção semântica** visto em versões anteriores, mas diferente do timeout de persistência da última execução.

## Causa tratada nesta entrega

O controle customizado colocava `testTag` e `selectable` em modificadores semânticos distintos. Em Compose, `testTag` é uma propriedade de semântica e não deve depender de uma árvore separada para representar o mesmo estado de seleção. O teste podia encontrar a tag correta, mas consultar um nó cuja configuração não refletia o mesmo `Selected`.

## Correção aplicada

- `PlanningMarginChoice` usa agora `clearAndSetSemantics`.
- `testTag`, `selected`, `Role.RadioButton`, `stateDescription` e `onClick` são declarados explicitamente no mesmo nó semântico.
- O clique físico continua independente via `Modifier.clickable`.
- A opção selecionada exibe `✓`, tornando o estado visível também sem depender apenas de cor.
- A persistência imediata da margem continua ativa.
- O teste instrumentado mantém todas as verificações anteriores e ganhou checkpoints de log para distinguir falha de clique, seleção, persistência ou restauração.
- Foi acrescentado teste unitário para confirmar que a margem 20% sobrevive a `snapshotForPlanning()` e serialização/deserialização da sessão.
- O módulo Backup não foi alterado.

## Verificações desta nova entrega

- `scripts/sync-github-manager.py --check`: executado após sincronização dos documentos/metadados.
- Estrutura do seletor e do teste instrumentado revisada estaticamente.
- A nova versão ainda **não** foi executada no emulador Android 15 neste ambiente. Portanto não é declarado que os 5/5 testes passaram.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
