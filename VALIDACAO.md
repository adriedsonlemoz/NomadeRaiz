# Validação — 1.0.49-kotlin-alpha.22

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.48-alpha.21`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100049`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-21-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 56s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 17s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: Failed to assert the following: (Selected = 'true')`.
- A Release permaneceu corretamente bloqueada.

Esta execução não voltou a apresentar o `ComposeTimeoutException` da persistência observado em versões anteriores. O erro registrado está novamente na leitura semântica do estado selecionado do controle `+20%`.

## Correção aplicada

- O `FilterChip` foi removido somente do seletor de margem `0% / +10% / +20%`.
- `PlanningMarginChoice` usa agora `Surface` para o visual e `Modifier.testTag(...).selectable(...)` diretamente no mesmo `LayoutNode`.
- `Selected`, ação de seleção e `Role.RadioButton` são fornecidos pelo `selectable` padrão do Compose; não existe `clearAndSetSemantics`, `clickable` duplicado nem ação semântica manual.
- O indicador visual `✓` continua aparecendo na opção ativa.
- A persistência serializada da 1.0.48 foi preservada: digitação usa debounce de 300 ms e escolhas discretas cancelam/invalida snapshots antigos antes de salvar imediatamente.
- O teste não foi removido nem enfraquecido: continua exigindo `assertIsSelected()` e `✓ +20%`, valor `20` no repositório, geração do plano, navegação, recriação da Activity, restauração de todos os campos e igualdade com `lastGenerated`.
- O módulo Backup não foi alterado.

## Verificações desta nova entrega

- Metadados de versão sincronizados para `1.0.49-kotlin-alpha.22` / `100049`.
- Revisão estática do seletor e do caminho de persistência concluída.
- Integridade do pacote final deve ser verificada após o empacotamento.
- Esta nova versão ainda **não** foi executada no emulador Android 15 neste ambiente; portanto não é declarado que os 5/5 testes passaram.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
