# Validação — 1.0.53-kotlin-alpha.26

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.52-alpha.25`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100053`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-25-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 57s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 18s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram executados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `Assert failed: The component is not displayed!` em `assertIsDisplayed()`.
- A Release permaneceu corretamente bloqueada.

## Diagnóstico desta execução

Esta falha **não é a mesma da execução imediatamente anterior**. No log 24 o clique em +20% ainda resultava em `safetyMarginPercent = 0`. No log 25 essa mensagem não reapareceu; o erro observado passou a ser exclusivamente de visibilidade de um componente após a recomposição.

O seletor tinha uma fonte concreta de deslocamento: a opção ativa mudava o texto de `+20%` para `✓ +20%`. Dentro de um `FlowRow`, os caracteres extras alteravam a largura do item e podiam causar uma nova quebra de linha exatamente depois do clique ou da restauração. O teste procurava o texto alterado e exigia `assertIsDisplayed()`, então uma opção funcional podia ser considerada não visível por ter sido reposicionada abaixo do limite atual da viewport.

## Correção aplicada

1. O texto das opções de margem ficou estável. Selecionar uma opção não muda mais `+20%` para `✓ +20%`.
2. A seleção continua visível pelo `RadioButton`, pelas cores e pela semântica `Selected` da `Row` selecionável.
3. O teste deixou de depender de um `Text` filho cuja geometria mudava. Ele valida o próprio nó `planning-margin-20`, executa `performScrollTo()` depois da recomposição e então exige `assertIsDisplayed()`, `+20%` e `assertIsSelected()`.
4. Após `Activity.recreate()`, o teste repete a validação do próprio nó e exige que `planning-margin-0` e `planning-margin-10` estejam desmarcados.
5. Persistência imediata da margem, `SharedPreferences.commit()` protegido por revisão/lock e debounce de 300 ms dos campos digitados foram preservados.

O módulo Backup não foi alterado.

## Histórico recente do mesmo teste

| Log | Versão testada | Resultado Android 15 | Falha principal | Mesmo erro exato? |
| --- | --- | --- | --- | --- |
| 15 | 1.0.42-alpha.15 | 4/5 | `expected:<20> but was:<0>` | Persistência |
| 16 | 1.0.43-alpha.16 | 4/5 | `Selected = true` | Semântica |
| 17 | 1.0.44-alpha.17 | 4/5 | `Selected = true` | Semântica |
| 18 | 1.0.45-alpha.18 | 4/5 | `ComposeTimeoutException` | Timeout/persistência |
| 19 | 1.0.46-alpha.19 | 4/5 | `Selected = true` | Semântica |
| 20 | 1.0.47-alpha.20 | 4/5 | `ComposeTimeoutException` | Timeout/persistência |
| 21 | 1.0.48-alpha.21 | 4/5 | `Selected = true` | Semântica |
| 22 | 1.0.49-alpha.22 | 4/5 | `Selected = true` | Semântica |
| 23 | 1.0.50-alpha.23 | 4/5 | `Selected = true` | Semântica |
| 24 | 1.0.51-alpha.24 | 4/5 | clique em +20% persistiu `0` | Persistência funcional |
| 25 | 1.0.52-alpha.25 | 4/5 | `The component is not displayed!` | **Novo: visibilidade/layout** |

Em resumo, é o **mesmo teste e a mesma área da tela**, mas os erros não foram todos iguais. As execuções alternaram entre persistência, semântica de seleção, timeout e agora visibilidade/layout. Cada correção removeu uma camada e permitiu que o teste chegasse à próxima verificação.

## Verificações desta nova entrega

- Metadados preparados para `1.0.53-kotlin-alpha.26` / `100053`.
- Revisão estática do seletor, persistência e teste instrumentado concluída.
- O ambiente atual não possui Gradle/Android SDK configurados para executar o build completo ou o emulador Android 15. Portanto, **não** é declarado que os 5/5 testes passaram nesta nova versão.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
