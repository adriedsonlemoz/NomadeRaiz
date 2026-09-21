# Validação — 1.0.55-kotlin-alpha.28

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.54-alpha.27`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100055`.

## Resultado real do log 27

O arquivo `Android-Kotlin-APK-27-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 43s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 12s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 6 testes; 4 passaram e 2 falharam.
- Falharam `planningMarginButtonsPersistImmediately` e `planningFieldsAndGeneratedPlanSurviveNavigationAndRecreation`.
- As duas mensagens foram iguais: `Text + InputText + EditableText contains '+20%'`.
- A Release permaneceu corretamente bloqueada.

Os avisos de `adb`/Emulator Console ocorreram durante a inicialização, mas não foram a causa determinante: o emulador iniciou e executou os seis testes.

## O que o log provou sobre a nova arquitetura

No teste `planningMarginButtonsPersistImmediately`, a sequência era: clicar em `+20%` → esperar Compose → carregar o repositório → exigir `safetyMarginPercent == 20` → conferir o texto da UI. A falha aconteceu apenas na última etapa. Portanto, a asserção de persistência de 20% **passou**.

Isso é diferente dos logs 24 e 26, nos quais o valor persistido permanecia em `0`. A mudança arquitetural da 1.0.54 (`PlanningAction` + `reducePlanning` + persistência imediata) resolveu o defeito funcional que vinha motivando os remendos.

## Causa das duas falhas atuais

O teste usava:

```kotlin
assertTextContains("+20%")
```

O nó com tag `planning-margin-current` contém o item textual completo `Margem atual: +20%`. Na API de teste do Compose, `assertTextContains` usa `substring = false` por padrão, portanto exige correspondência completa de um item da lista de textos. `+20%` sozinho não corresponde a `Margem atual: +20%`.

A mesma inconsistência existia para `+10%`. Isso explica por que dois testes diferentes falharam com a mesma mensagem depois de o estado já estar correto.

## Correção aplicada

As quatro verificações do estado visível foram convertidas para correspondência exata do texto realmente exibido:

```kotlin
assertTextEquals("Margem atual: +20%")
assertTextEquals("Margem atual: +10%")
```

Não foram removidas verificações. O teste continua validando:

- clique nos botões de margem;
- persistência imediata no `AppRepository`;
- estado visível da margem;
- preenchimento dos campos;
- geração do plano;
- navegação;
- `Activity.recreate()`;
- restauração dos dados;
- `lastGenerated`.

A arquitetura nova do Planejamento não foi alterada nesta entrega porque o log 27 mostrou que o fluxo funcional já chegou corretamente ao repositório.

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
| 27 | 1.0.54-alpha.27 | 4/6 | asserção textual incorreta após persistência de 20% passar |

## Verificações desta nova entrega

- Todas as ocorrências de `assertTextContains` no teste instrumentado do Planejamento foram revisadas; as quatro verificações de `planning-margin-current` agora usam o texto completo.
- `python3 scripts/sync-github-manager.py --check`: deve permanecer sincronizado após a atualização dos metadados.
- O hash do `BackupScreen.kt` deve permanecer idêntico ao da versão-base; o módulo Backup não foi alterado.
- O ambiente atual não possui `gradle` nem Gradle Wrapper no projeto, portanto o build Android completo e o emulador Android 15 **não foram executados nesta nova versão**.
- A próxima execução do GitHub Actions deve validar metadados → testes unitários → APK → testes instrumentados Android 15. A Release deve permanecer bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
