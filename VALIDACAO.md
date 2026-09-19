# Validação — 1.0.46-kotlin-alpha.19

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.45-alpha.18.zip`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100046`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-18-logs.zip` foi analisado antes desta correção e corresponde à versão `1.0.45-kotlin-alpha.18`.

- Verificação `github-manager.json`: **OK** — `1.0.45-kotlin-alpha.18 / 100045`.
- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 50s`; 24 tarefas executadas.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 13s`; 37 tarefas, 19 executadas e 18 atualizadas.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram executados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `androidx.compose.ui.test.ComposeTimeoutException: Condition still not satisfied after 5000 ms`.
- O timeout ocorreu na espera pela persistência de `safetyMarginPercent == 20` no `AppRepository`.
- A Release permaneceu corretamente bloqueada.

Os avisos de console do emulador não impediram a execução dos 5 testes e não são a causa final da falha.

## Conclusão da análise

A versão 1.0.45 já publicava `Selected` explicitamente no chip. O novo log avançou além do problema anterior de asserção semântica e mostrou outro ponto: depois do clique em `+20%`, o teste não observou o valor persistido dentro de 5 segundos.

A margem é uma escolha discreta e de baixa frequência, portanto não precisa depender do mesmo debounce usado para campos digitados continuamente. Além disso, aplicar `testTag`/semântica adicional sobre um `FilterChip` continuava acoplando o teste à implementação semântica interna do Material3.

## Correção aplicada

- `planning-margin-0`, `planning-margin-10` e `planning-margin-20` passam a usar um controle próprio baseado em `Surface` com `Modifier.selectable`.
- Clique, `Selected`, papel `RadioButton` e `testTag` ficam no mesmo nó semântico.
- A seleção de margem atualiza o estado raiz mais recente e chama a persistência imediatamente.
- Os campos numéricos continuam usando o autosave agrupado de 300 ms em `Dispatchers.IO`, preservando o ganho de desempenho da digitação.
- O teste instrumentado continua verificando: clique em `+20%`, `assertIsSelected()`, persistência em `AppRepository`, campos avançados, geração do plano, navegação, `Activity.recreate()`, valores restaurados, `lastGenerated` e seleção visual restaurada.
- Backup não foi alterado; `applicationId` e `namespace` continuam `com.nomaderaiz.app`.

## Verificações desta nova entrega

- `scripts/sync-github-manager.py --check`: deve permanecer obrigatório no workflow e foi usado para manter os metadados sincronizados.
- Estrutura do código e referências do novo callback de persistência imediata foram revisadas.
- Este ambiente não possui executável Gradle nem Gradle Wrapper no projeto. Por isso, **não** é declarado que `:app:testDebugUnitTest`, `:app:assembleDebug` ou os testes Android 15 da versão `1.0.46` passaram.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A publicação deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
