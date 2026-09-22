# Validação — 1.0.61-kotlin-alpha.34

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.60-alpha.33`. Fonte principal da versão: `app/build.gradle.kts`; `versionCode`: `100061`.

## Resultado real do GitHub Actions anterior

Foi analisado `Android-Kotlin-APK-33-logs.zip`.

- Verificação de metadados: **PASSOU**.
- Testes unitários / regras de negócio: **PASSOU** (`BUILD SUCCESSFUL in 1m 3s`).
- Compilação do APK: **PASSOU** (`BUILD SUCCESSFUL in 1m 24s`).
- Android 15: **7 testes executados, 6 passaram e 1 falhou**.
- Release: **bloqueada corretamente** pela falha instrumentada.

Falha exata:

```text
com.nomaderaiz.app.ui.NavigationUiTest > savedRouteReturnsToListAndSurvivesActivityRecreation FAILED
java.lang.AssertionError: Action performScrollTo() failed.
Reason: Expected exactly '1' node but could not find any node that satisfies:
(TestTag = 'planning-resources-toggle')
```

## Causa

`planning-resources-toggle` existe em `PlanningCalculatorScreens.kt`, dentro da `LazyColumn` do editor de rota.

O teste tentava executar `onNodeWithTag("planning-resources-toggle").performScrollTo()` diretamente. Em uma `LazyColumn`, itens fora da viewport podem não estar compostos e, portanto, não aparecem na árvore semântica para serem encontrados dessa forma. O teste falhava antes mesmo de conseguir rolar.

Logo, esta execução **não indicou defeito no botão Recursos opcionais, nos cálculos ou na persistência**; indicou uma estratégia incorreta do teste para localizar item virtualizado.

## Correção aplicada

O teste passou a rolar através do contêiner que sempre está composto:

```kotlin
compose.onNodeWithTag("planning-list")
    .performScrollToNode(hasTestTag("planning-resources-toggle"))
compose.onNodeWithTag("planning-resources-toggle")
    .assertIsDisplayed()
    .performClick()
```

O mesmo padrão foi aplicado preventivamente ao card de rota usado no teste de duplicação, através de `planning-routes-list.performScrollToNode(...)`.

Nenhum componente de produção precisou ser alterado para fazer o teste passar. O módulo Backup também não foi alterado.

## Verificações desta entrega

- `planning-resources-toggle` confirmado no código de produção: **PASSOU**.
- Correção do padrão de scroll para `LazyColumn`: **APLICADA**.
- Busca por outro uso equivalente e correção preventiva no card de rota: **APLICADA**.
- `python3 scripts/sync-github-manager.py --check`: **PASSOU**.
- `versionName`/`versionCode`: `1.0.61-kotlin-alpha.34` / `100061`.
- Integridade do ZIP final: **PASSOU** após empacotamento e teste do arquivo.

## Validação ainda necessária

Este ambiente não possui Gradle/Gradle Wrapper para executar o conjunto Android completo. A `1.0.61-kotlin-alpha.34` ainda precisa passar pelo GitHub Actions para confirmar novamente testes unitários, APK e os 7 testes instrumentados no Android 15.
