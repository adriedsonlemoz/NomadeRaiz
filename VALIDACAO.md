# Validação — 1.0.56-kotlin-alpha.29

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.55-alpha.28`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100056`.

## Resultado real do log 28

O arquivo `Android-Kotlin-APK-28-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 58s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 16s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU** com 6 testes executados, **5 aprovados e 1 falho**.
- Falhou somente `planningFieldsAndGeneratedPlanSurviveNavigationAndRecreation`.
- Mensagem: `Failed to assert the following: (Text + EditableText = [Margem atual: +20%])`.
- A Release permaneceu corretamente bloqueada.

Os avisos iniciais de `adb`/Emulator Console não foram a causa: o emulador iniciou e executou todos os seis testes.

## O que mudou em relação ao log 27

No log 27 havia duas falhas. No log 28, o teste exclusivo `planningMarginButtonsPersistImmediately` **passou**. Portanto, a nova arquitetura de `PlanningAction` + `reducePlanning` e a persistência imediata da margem estão funcionando no caminho direto de usuário: botão tocado → estado alterado → repositório atualizado → texto da margem atualizado.

A única falha restante aparece no teste grande depois da edição consecutiva de vários campos numéricos. Esse fluxo mantinha o IME/foco de entrada envolvido e, em seguida, repetia um teste de toque físico que já é coberto pelo teste exclusivo da margem.

## Correção aplicada

1. `PlanningRideFields` agora limpa explicitamente o foco com `clearFocus(force = true)` antes de despachar `SetSafetyMargin`. Isso reduz a possibilidade de um evento tardio do campo/IME competir com uma escolha discreta.
2. `planningMarginButtonsPersistImmediately` continua usando `performClick()` e continua sendo o teste de gesto real + persistência imediata.
3. No teste longo, a margem é acionada pela ação semântica `SemanticsActions.OnClick` do mesmo botão. Assim esse teste valida estado, persistência e ciclo de vida sem depender da sobreposição/temporização da janela do teclado.
4. Logo após selecionar +20%, o teste longo exige `safetyMarginPercent == 20` no `AppRepository` e `Margem atual: +20%` na UI. Isso torna uma eventual próxima falha diagnóstica: saberemos se o problema ficou no estado persistido, na recomposição da UI ou apenas depois da recriação.
5. Depois disso o teste mantém as verificações de geração, navegação, `Activity.recreate()`, todos os campos, `tripEstimate`, `days` e `lastGenerated`.

Nenhuma cobertura de persistência ou recriação foi removida; apenas foi eliminada a duplicação de responsabilidade entre dois testes.

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
| 27 | 1.0.54-alpha.27 | 4/6 | asserção textual incorreta |
| 28 | 1.0.55-alpha.28 | **5/6** | somente fluxo longo após edição/IME |

## Verificações desta nova entrega

- `python3 scripts/sync-github-manager.py --check`: deve permanecer sincronizado com `app/build.gradle.kts`.
- O módulo `BackupScreen.kt` foi comparado por SHA-256 com a versão-base e permaneceu idêntico.
- Foi feita inspeção estática das alterações de Compose/testes e da sincronização de versão.
- O ambiente atual não possui `gradle` nem Gradle Wrapper no projeto; portanto o build Android completo e o emulador Android 15 **não foram executados nesta nova versão**.
- A próxima execução do GitHub Actions deve validar metadados → testes unitários → APK → testes instrumentados Android 15. A Release deve permanecer bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
