# Validação — 1.0.52-kotlin-alpha.25

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.51-alpha.24`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100052`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-24-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 53s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 17s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `O clique em +20% não atualizou/persistiu a margem expected:<20> but was:<0>`.
- A Release permaneceu corretamente bloqueada.

## Diagnóstico e correção aplicada

O novo log diferencia esta falha das anteriores de `Selected = true`: antes de verificar a semântica, o teste leu o `AppRepository` e encontrou `safetyMarginPercent = 0`. Isso demonstra que o problema restante era funcional no caminho clique → estado → persistência, e não apenas uma leitura instável da árvore semântica.

A correção foi feita em três camadas:

1. O seletor usa agora o padrão canônico de rádio do Compose: `selectableGroup()` no grupo e uma `Row` inteira como único alvo `selectable`/`Role.RadioButton`. O `RadioButton` interno tem `onClick = null`, eliminando ações concorrentes ou uma área de toque restrita ao círculo.
2. O callback genérico de transformação imediata foi substituído por `setSafetyMargin(Int)`. A opção escolhida é aplicada explicitamente ao `PlanningDraft` mais atual e só então o novo `PlanningSession` é persistido.
3. Para escolhas discretas, foi adicionado `savePlanningSessionImmediate()`, usando `SharedPreferences.commit()` dentro do lock/revision já existente. Assim, ao terminar o clique, uma nova instância de `AppRepository` deve enxergar o valor gravado e uma gravação debounced antiga não pode sobrescrevê-lo. Os campos digitados continuam usando debounce de 300 ms e gravação em IO.

O teste não foi enfraquecido. Depois de localizar a opção ele exige `assertHasClickAction()`, executa o clique, verifica `✓ +20%`, `assertIsSelected()` e então exige `safetyMarginPercent = 20` no repositório. Depois continuam geração, navegação, `Activity.recreate()`, restauração de todos os campos, cálculo de dias e `lastGenerated`.

O módulo Backup não foi alterado.

## Verificações desta nova entrega

- Metadados preparados para `1.0.52-kotlin-alpha.25` / `100052`.
- Revisão estática do fluxo de clique, atualização de estado, serialização e persistência concluída.
- O ambiente atual não possui Gradle/Android SDK configurados para executar o build completo ou o emulador Android 15. Portanto, **não** é declarado que os 5/5 testes passaram nesta nova versão.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
