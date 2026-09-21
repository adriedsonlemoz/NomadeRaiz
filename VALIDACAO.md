# Validação — 1.0.50-kotlin-alpha.23

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.49-alpha.22`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100050`.

## Resultado real dos logs recebidos

O arquivo correto `Android-Kotlin-APK-22-logs.zip` foi analisado antes desta correção.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 50s`.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 14s`.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram iniciados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: Failed to assert the following: (Selected = 'true')`.
- A Release permaneceu corretamente bloqueada.

## Diagnóstico e correção aplicada

O fluxo de teste validava `assertIsSelected()` logo após tocar em `+20%` e repetia a mesma leitura da propriedade semântica depois de `Activity.recreate()`. A primeira verificação continua no teste e cobre explicitamente a semântica de seleção do controle.

Após a recriação, a finalidade real é comprovar persistência e restauração. Por isso, essa segunda verificação duplicada foi substituída por verificações funcionais e visuais mais específicas:

- `AppRepository` deve restaurar `safetyMarginPercent = 20`;
- todos os demais campos continuam sendo conferidos;
- `lastGenerated` continua sendo comparado ao rascunho restaurado;
- a interface deve mostrar `✓ +20%`;
- `✓ +10%` e `✓ Sem margem` não podem existir;
- o controle restaurado continua tendo ação de clique.

Isso não remove a cobertura de `Selected`: o mesmo teste ainda exige `assertIsSelected()` imediatamente após o clique, antes da navegação/recriação. Também não foram removidas verificações de geração, navegação, persistência ou recriação da Activity.

O módulo Backup não foi alterado.

## Verificações desta nova entrega

- Metadados de versão sincronizados para `1.0.50-kotlin-alpha.23` / `100050`.
- Revisão estática do teste instrumentado e do fluxo de Planejamento concluída.
- A nova versão ainda **não** foi executada no emulador Android 15 neste ambiente; portanto não é declarado que os 5/5 testes passaram.

A próxima execução do GitHub Actions deve repetir: metadados → testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
