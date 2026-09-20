# Validação — 1.0.48-kotlin-alpha.21

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.47-alpha.20`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100048`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-20-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 55s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 18s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `androidx.compose.ui.test.ComposeTimeoutException: Condition still not satisfied after 5000 ms`.
- A Release permaneceu corretamente bloqueada.

O log do runner não inclui linha do teste nem o `stdout` dos checkpoints, portanto não permite distinguir com segurança se o timeout ocorreu na espera da semântica `Selected`, na persistência da margem ou na verificação restaurada. A correção desta entrega remove os dois mecanismos ainda suscetíveis a corrida.

## Correção aplicada

- `PlanningMarginChoice` agora usa `FilterChip` Material3 padrão. Foram removidos `clearAndSetSemantics`, ação semântica manual e `clickable` duplicado.
- `testTag` permanece no próprio `FilterChip`; o estado `Selected` passa a ser fornecido pelo componente Material padrão.
- O Planejamento não usa mais um `snapshotFlow` independente para persistir o mesmo estado que também podia ser salvo imediatamente por um clique.
- Edições de texto/número continuam com debounce de 300 ms para desempenho.
- Cada nova edição cancela/invalida a gravação pendente anterior.
- Margem de segurança e geração do plano cancelam qualquer gravação pendente e salvam o snapshot atual imediatamente.
- Uma revisão monotônica impede snapshots antigos de serem aceitos; um bloqueio curto ordena a transição final para o repositório.
- O teste continua verificando seleção visual, `safetyMarginPercent == 20`, geração, navegação, `Activity.recreate()`, restauração dos campos e `lastGenerated`. A espera genérica de 5 s foi substituída por verificações diretas, tornando uma futura falha localizada.
- O módulo Backup não foi alterado.

## Verificações desta nova entrega

- Metadados de versão sincronizados para `1.0.48-kotlin-alpha.21` / `100048`.
- `scripts/sync-github-manager.py --check`: **OK** — metadados sincronizados com `app/build.gradle.kts`.
- Revisão estática do seletor, persistência e teste instrumentado concluída.
- Esta nova versão ainda **não** foi executada no emulador Android 15 neste ambiente; portanto não é declarado que os 5/5 testes passaram.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
