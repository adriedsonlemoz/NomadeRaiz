# Validação — 1.0.62-kotlin-alpha.35

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.61-alpha.34`. Fonte principal da versão: `app/build.gradle.kts`; `versionCode`: `100062`.

## Resultado real do GitHub Actions anterior

Foi analisado `Android-Kotlin-APK-34-logs.zip`.

- Verificação de metadados: **PASSOU**.
- Testes unitários / regras de negócio: **PASSOU** (`BUILD SUCCESSFUL in 1m 1s`).
- Compilação do APK: **PASSOU** (`BUILD SUCCESSFUL in 18s`).
- Android 15: **7 testes executados, 6 passaram e 1 falhou**.
- Release: **bloqueada corretamente** pela falha instrumentada.

Falha exata:

```text
com.nomaderaiz.app.ui.NavigationUiTest > savedRouteReturnsToListAndSurvivesActivityRecreation FAILED
java.lang.AssertionError: Assert failed: The component is not displayed!
    at androidx.compose.ui.test.AssertionsKt.assertIsDisplayed(Assertions.kt:34)
```

## Causa

A correção da alpha.34 resolveu a busca de `planning-resources-toggle`, mas o mesmo teste ainda continha outras verificações diretas de visibilidade em filhos de `LazyColumn`. Em Compose, um nó pode existir na árvore semântica ou ser recriado após navegação/recriação da Activity sem estar atualmente dentro da viewport. `assertIsDisplayed()` então falha mesmo quando a rota e os dados estão corretos.

O log não inclui a linha Kotlin exata da asserção, por isso a correção foi aplicada a todos os pontos equivalentes desse teste: card da rota após salvar, card após recriação, resumo/ação da tela de detalhes e indicador de margem ao reabrir o editor.

## Correção aplicada

Antes de qualquer asserção de visibilidade nesses itens virtuais, o teste agora rola pelo contêiner estável:

```kotlin
compose.onNodeWithTag("planning-routes-list")
    .performScrollToNode(hasTestTag("planning-route-${route.id}"))
compose.onNodeWithTag("planning-route-${route.id}").assertIsDisplayed()
```

O mesmo padrão foi usado com `planning-details` e `planning-list`. A rota persistida é lida antes da verificação visual, permitindo usar o `id` real como alvo determinístico.

As asserções de persistência continuam verificando margem 20%, 5 dias, dinheiro, alimentação, água, energia e igualdade do `PlanningWorkspace` depois de `Activity.recreate()`.

## Verificações desta entrega

- Todos os filhos de `LazyColumn` usados por `savedRouteReturnsToListAndSurvivesActivityRecreation` foram revisados: **PASSOU**.
- Scroll por contêiner antes das asserções de visibilidade: **APLICADO**.
- Regras de negócio/UI de produção alteradas: **NÃO**.
- `python3 scripts/sync-github-manager.py --check`: **PASSOU**.
- `versionName`/`versionCode`: `1.0.62-kotlin-alpha.35` / `100062`.
- Integridade do ZIP final: verificar após empacotamento.

## Validação ainda necessária

Este ambiente não possui Gradle/Gradle Wrapper para executar o conjunto Android completo. A `1.0.62-kotlin-alpha.35` ainda precisa passar pelo GitHub Actions para confirmar novamente testes unitários, APK e os 7 testes instrumentados no Android 15.
