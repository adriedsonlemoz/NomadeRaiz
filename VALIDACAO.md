# Validação — 1.0.54-kotlin-alpha.27

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.53-alpha.26`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100054`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-26-logs.zip` foi analisado antes desta mudança.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 58s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 17s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 chegaram concluídos sem falha e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha: `O clique em +20% não atualizou/persistiu a margem expected:<20> but was:<0>`.
- A Release permaneceu corretamente bloqueada.

Os avisos iniciais de `adb`/Emulator Console não foram a causa final: o emulador iniciou os testes e a falha determinante foi a asserção funcional acima.

## Por que a tática mudou

O mesmo trecho já havia recebido várias correções locais. O histórico mostrou quatro classes de falha alternando no mesmo teste: persistência (`20` esperado, `0` salvo), semântica (`Selected=true`), `ComposeTimeoutException` e visibilidade do componente. O log 26 voltou ao primeiro tipo, mostrando que continuar trocando apenas o componente visual não estava produzindo uma base estável.

Por isso a versão 1.0.54 **não aplica outro remendo no mesmo seletor**. O estado do Planejamento foi reorganizado e o controle foi reescrito com uma solução mais simples.

## Nova arquitetura do Planejamento

1. Novo `PlanningState.kt` define `PlanningAction`, `reducePlanning` e `PlanningPersistence`.
2. `NomadeRaizApp` possui agora uma única porta de entrada (`dispatchPlanning`) para campos, margem e geração do plano.
3. O redutor recebe sempre o `PlanningSession` mais recente; uma edição posterior transforma esse estado atual, em vez de reconstruir o fluxo por callbacks independentes.
4. Ações discretas (`SetSafetyMargin` e `GeneratePlan`) persistem imediatamente; `EditDraft` mantém debounce de 300 ms.
5. O mecanismo de revisão/cancelamento de gravações pendentes permanece para impedir snapshot antigo de sobrescrever estado novo.

## Seletor de margem reescrito

- `0%`, `+10%` e `+20%` agora são três `Button` Material3 comuns em uma `Row` de largura fixa.
- Não são mais usados `FlowRow`, `selectable`, `selectableGroup`, `RadioButton`, `Role.RadioButton` ou uma árvore semântica de seleção customizada nesse controle.
- O estado escolhido aparece explicitamente no texto com tag `planning-margin-current`, por exemplo `Margem atual: +20%`.
- A seleção funcional é validada também pelo valor salvo em `AppRepository`.

## Testes reorganizados

O teste gigante anterior foi dividido sem reduzir a cobertura:

- `planningMarginButtonsPersistImmediately`: valida os botões `+20%` e `+10%`, o texto `Margem atual` e o valor persistido imediatamente.
- `planningFieldsAndGeneratedPlanSurviveNavigationAndRecreation`: valida destino, distância, velocidade, horas, recursos, margem, dinheiro, geração, retorno, reabertura, `Activity.recreate()` e `lastGenerated`.
- `PlanningStateTest` adiciona testes unitários do redutor: margem, edição posterior sem apagar margem e geração do snapshot.

## Histórico recente

| Log | Versão testada | Resultado Android 15 | Falha principal |
| --- | --- | --- | --- |
| 15 | 1.0.42-alpha.15 | 4/5 | `expected:<20> but was:<0>` |
| 16 | 1.0.43-alpha.16 | 4/5 | `Selected = true` |
| 17 | 1.0.44-alpha.17 | 4/5 | `Selected = true` |
| 18 | 1.0.45-alpha.18 | 4/5 | `ComposeTimeoutException` |
| 19 | 1.0.46-alpha.19 | 4/5 | `Selected = true` |
| 20 | 1.0.47-alpha.20 | 4/5 | `ComposeTimeoutException` |
| 21 | 1.0.48-alpha.21 | 4/5 | `Selected = true` |
| 22 | 1.0.49-alpha.22 | 4/5 | `Selected = true` |
| 23 | 1.0.50-alpha.23 | 4/5 | `Selected = true` |
| 24 | 1.0.51-alpha.24 | 4/5 | clique em +20% manteve `0` |
| 25 | 1.0.52-alpha.25 | 4/5 | `The component is not displayed!` |
| 26 | 1.0.53-alpha.26 | 4/5 | clique em +20% manteve `0` |

## Verificações desta nova entrega

- A lógica Kotlin pura de `PlanningState.kt` foi compilada localmente com `kotlinc` junto das dependências de dados do Planejamento: **OK**.
- Hash do `BackupScreen.kt` é idêntico ao da versão-base: o módulo Backup não foi alterado.
- O ambiente atual não possui `gradle` nem Gradle Wrapper no projeto, portanto o build Android completo e o emulador Android 15 **não foram executados nesta nova versão**.
- A próxima execução do GitHub Actions deve validar metadados → testes unitários → APK → testes instrumentados Android 15. A Release deve permanecer bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
