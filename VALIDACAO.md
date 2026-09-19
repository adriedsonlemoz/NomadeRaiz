# Validação — 1.0.45-kotlin-alpha.18

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.44-alpha.17.zip`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100045`.

## Resultado real dos logs recebidos

O arquivo `Android-Kotlin-APK-17-logs.zip` foi analisado antes desta correção e corresponde à versão `1.0.44-kotlin-alpha.17`.

- `:app:testDebugUnitTest`: **OK** — `BUILD SUCCESSFUL in 52s`; 24 tarefas executadas.
- `:app:assembleDebug`: **OK** — `BUILD SUCCESSFUL in 17s`; 37 tarefas, 19 executadas e 18 atualizadas.
- `:app:connectedDebugAndroidTest` no Android 15: **FALHOU**. Foram executados 5 testes; 4 passaram e 1 falhou.
- Teste que falhou: `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- Falha registrada: `java.lang.AssertionError: Failed to assert the following: (Selected = 'true')`.
- A Release permaneceu corretamente bloqueada.

Os avisos iniciais de ADB ocorreram durante a inicialização do emulador, mas o runner se recuperou e os 5 testes foram executados; eles não são a causa final da falha.

## Conclusão da análise

A versão 1.0.44 já separava o clique, executava `waitForIdle()` e consultava novamente a tag, mas o mesmo `Selected = true` voltou a falhar. Portanto, o problema não deve ser explicado apenas como uma corrida de recomposição.

A validação usava a tag aplicada ao `FilterChip`, enquanto o estado selecionado é produzido pela implementação interna `selectable` do Material3. Em Android 15/Compose, depender implicitamente da composição dessas camadas semânticas deixou a asserção instável. A tela agora publica explicitamente o estado `selected` no mesmo modificador semântico da tag de teste e também fornece `stateDescription` coerente para acessibilidade.

## Correção aplicada

- `planning-margin-0`, `planning-margin-10` e `planning-margin-20` continuam sendo chips reais e clicáveis.
- Cada chip agora expõe explicitamente `Selected` de acordo com `draft.safetyMarginPercent`.
- O chip também expõe uma descrição de estado como `+20% selecionado` ou `+20% não selecionado`.
- O teste não perdeu `assertIsSelected()`. Antes dele, passa a aguardar até 5 s pela persistência real refletir `safetyMarginPercent == 20`; como o autosave usa debounce de 300 ms, isso também garante que `waitForIdle()` não seja usado indevidamente como substituto de espera por uma corrotina atrasada.
- Depois de `Activity.recreate()`, continuam sendo conferidos os valores do rascunho, dias estimados, alimentação, água, energia, `lastGenerated` e a seleção visual de `+20%`.
- A lógica de atualização sobre o estado mais recente e o fluxo serializado de persistência foram preservados.
- Backup não foi alterado; `applicationId` e `namespace` continuam `com.nomaderaiz.app`.

## Verificações possíveis neste ambiente

- Estrutura, referências e alterações foram revisadas.
- `app/build.gradle.kts`, README, CHANGELOG, Sobre e `github-manager.json` foram sincronizados para `1.0.45-kotlin-alpha.18` / `100045`.
- `scripts/sync-github-manager.py --check` deve permanecer como verificação obrigatória no workflow.
- Este ambiente não possui executável Gradle nem Gradle Wrapper no projeto; portanto, **não** é declarado que os testes Android desta nova versão passaram.

A próxima execução do GitHub Actions deve repetir testes unitários → build APK → testes instrumentados Android 15. A Release deve continuar bloqueada se qualquer etapa falhar e deve publicar somente `Nomade-Raiz.apk`.
