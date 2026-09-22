# Validação — 1.0.60-kotlin-alpha.33

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.59-alpha.32`. Fonte principal da versão: `app/build.gradle.kts`; `versionCode`: `100060`.

## Erro encontrado no GitHub Actions

Foi analisado `Android-Kotlin-APK-32-logs.zip`. A checagem de metadados passou e o workflow avançou para **Test navigation and business rules**, mas a compilação Kotlin falhou antes de concluir os testes.

Mensagens reais do compilador:

```text
PlanningCalculatorScreens.kt:285:65 No value passed for parameter 'apply'.
PlanningCalculatorScreens.kt:285:69 Argument type mismatch ... but 'String' was expected.
PlanningCalculatorScreens.kt:285:71 Cannot infer type for this parameter. Specify it explicitly.
```

O build terminou com `CompilationErrorException` e `BUILD FAILED in 56s`.

## Causa

`NomadSuggestionCard` possui a assinatura:

```text
NomadSuggestionCard(draft, suggestion, apply: (Double) -> Unit, actionLabel: String = ...)
```

No editor ela era chamada com uma trailing lambda. Como `actionLabel` é o último parâmetro, o compilador tentava associar a trailing lambda à posição final e deixava `apply` sem valor.

## Correção aplicada

- O callback agora é passado explicitamente como `apply = { ... }`.
- A lógica existente de aplicar `hoursPerDay` ao rascunho foi mantida.
- Nenhum cálculo, persistência, rota, catálogo de equipamentos ou Backup foi removido ou alterado por esta correção.
- `versionName`/`versionCode` incrementados para `1.0.60-kotlin-alpha.33` / `100060`.
- README, CHANGELOG, VALIDACAO, Sobre e `github-manager.json` sincronizados.

## Resultado real do log anterior

- Verificação de metadados: **PASSOU**.
- Compilação Kotlin do app durante a etapa de testes: **FALHOU**.
- Testes unitários: **não concluídos**, pois a compilação falhou primeiro.
- Compilação final do APK: **não executada**.
- Testes instrumentados Android 15: **não executados**.
- Release: **bloqueada corretamente**.

## Validações desta correção

- Conferência do arquivo e linha apontados pelo compilador: **PASSOU**.
- Busca por outras chamadas de `NomadSuggestionCard`: a outra chamada já fornece `onUseSuggestion` posicionalmente e `actionLabel` nomeado, portanto não possui o mesmo erro.
- `python3 scripts/sync-github-manager.py --check`: **PASSOU**.
- Padrão Kotlin da chamada corrigida reproduzido em teste mínimo com `kotlinc`: **PASSOU**.
- Arquivo `BackupScreen.kt` comparado com a base `1.0.59-alpha.32`: **inalterado**.
- Integridade do ZIP final: **PASSOU**.

## Validação ainda necessária

Este ambiente não possui Gradle/Gradle Wrapper para executar o build Android completo. A `1.0.60-kotlin-alpha.33` ainda precisa passar pelo GitHub Actions para confirmar compilação, testes unitários, APK e testes instrumentados Android 15.
