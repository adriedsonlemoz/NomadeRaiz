# Validação — 1.0.51-kotlin-alpha.24

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.50-alpha.23`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100051`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-23-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 49s`.
- `:app:assembleDebug`: **OK** — a etapa de compilação concluiu com sucesso antes dos testes instrumentados.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: Failed to assert the following: (Selected = 'true')`.
- A Release permaneceu corretamente bloqueada.

## Diagnóstico e correção aplicada

Na `1.0.50`, o teste já continha apenas uma chamada a `assertIsSelected()`, executada imediatamente após tocar em `+20%`. Portanto, o novo log elimina a dúvida das entregas anteriores: a falha restante não acontece após `Activity.recreate()`, e sim no próprio nó semântico do seletor logo após o clique.

O controle customizado `Surface + Modifier.selectable(...)` foi substituído no ponto testado por `RadioButton` Material3. O `testTag("planning-margin-20")` agora pertence diretamente ao `RadioButton`, que fornece pela implementação padrão do Compose a propriedade `Selected` e a ação `OnClick`. A `Surface` externa continua apenas com a aparência visual, e o texto `✓ +20%` continua indicando a opção ativa.

O teste não foi enfraquecido. Depois do clique ele agora exige, nesta ordem:

1. `safetyMarginPercent = 20` persistido no `AppRepository`;
2. `✓ +20%` visível na interface;
3. `assertIsSelected()` no `RadioButton` identificado pela tag.

Depois disso permanecem as verificações de geração, navegação, `Activity.recreate()`, todos os campos restaurados, dias calculados, `lastGenerated`, indicador visual da margem e ação de clique.

O módulo Backup não foi alterado.

## Verificações desta nova entrega

- Metadados de versão preparados para `1.0.51-kotlin-alpha.24` / `100051`.
- Revisão estática do seletor e do teste instrumentado concluída.
- A nova versão ainda **não** foi executada no emulador Android 15 neste ambiente; portanto não é declarado que os 5/5 testes passaram.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
