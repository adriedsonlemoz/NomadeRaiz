# Validação — 1.0.38-kotlin-alpha.11

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.37-alpha.10.zip`, entregue anteriormente. A versão principal continua em `app/build.gradle.kts`; `versionCode` atual: `100038`.

## O que foi verificado aqui

- Sincronização de `app/build.gradle.kts`, `github-manager.json`, README e primeira versão do CHANGELOG: aprovada por `python3 scripts/sync-github-manager.py --check`.
- XML do manifesto/recursos e sintaxe YAML do workflow: válidos.
- Comparação dos arquivos com a base: nenhum dos 50 arquivos anteriores removido.
- Os 16 arquivos de recursos anteriores, incluindo as dez imagens ilustrativas e os ícones de launcher, permanecem idênticos. Nenhuma imagem nova foi produzida.
- `BackupScreen.kt` permanece idêntico, SHA-256: `9feef80c747e854c1fc6ab541af3ecef415944960a4e408f206eadb38db231e7`.
- O trecho de `AppRepository.kt` que contém exportação de listas, exportação/importação de Backup e auxiliares permanece idêntico. Somente métodos adicionais para rascunhos foram inseridos antes desse trecho.
- `Models.kt`, `SeedData.kt`, `Calculator.kt`, `Planning.kt` e `ManualBike.kt` permanecem idênticos. Os cálculos novos de apresentação usam os motores anteriores.
- Os nove destinos de Mais continuam presentes, inclusive o acesso a Backup.
- Workflow sem `upload-artifact`, AAB ou ZIP de APK, com publicação exclusiva de `Nomade-Raiz.apk` após os testes.

## Limite da validação

Gradle e Android SDK não estão disponíveis no ambiente local e seu download foi bloqueado pela política de rede. Por isso **não houve compilação Kotlin/Android, execução JUnit ou teste em emulador/aparelho nesta entrega**. Após essa limitação ser informada, o usuário autorizou continuar com o código e a validação preparada no GitHub Actions.

Não se deve interpretar a revisão estática como prova de compilação ou de ausência de travamentos. Nenhum APK novo é incluído neste ZIP. A Release só será publicada pelo workflow se as etapas abaixo forem concluídas com sucesso.

## Testes preparados

| Suíte | Quantidade | Cobertura |
| --- | ---: | --- |
| `NavigationStateTest` | 6 | Pilha de navegação, nove destinos, 100 ciclos por módulo, 1.000 alternâncias Home/Mais e retorno de Pontos/Manual por Planejamento até Mais. |
| `TravelFormsTest` | 9 | Vírgula/ponto decimal, agrupamento de milhares, entradas inválidas, inteiros, média/meta de pedal, validação de campos, regras de recursos, resultado parcial e estoque não configurado. |
| `TravelFormJsonTest` | 4 | Rascunho e último plano independentes, alimentos/pesos, edições incompletas, primeira instalação e dados de rascunho inválidos. |
| `NavigationUiTest` | 4 | Cinco ciclos dos oito módulos incluídos na revisão, 50 alternâncias Home/Mais, rascunho/geração/recriação de Activity, categorias de Equipamentos, Diário, Verificar, tema e fonte grande. |
| `DraftPersistenceTest` | 1 | Escrita dos rascunhos sem alterar preferências anteriores, reabertura do repositório e limpeza explícita de dados. |

Os testes instrumentados não exercitam o módulo Backup, por solicitação do usuário. O teste unitário verifica apenas que o destino continua disponível no menu.

## Execução

Em ambiente com Java 17, Gradle 8.11.1 e Android SDK 35:

```bash
python3 scripts/sync-github-manager.py --check
gradle :app:testDebugUnitTest :app:assembleDebug
# Com emulador ou dispositivo conectado:
gradle :app:connectedDebugAndroidTest
```

O workflow `Android Kotlin APK` usa emulador Android 15 para os testes instrumentados. A ordem é: metadados → testes unitários → compilação → testes Android → publicação do APK. Falha em qualquer etapa interrompe a publicação. Nenhuma execução remota ou Release foi iniciada durante esta entrega.

## Conferência em aparelho ainda necessária

1. Instalar a atualização compatível sobre a instalação anterior e conferir inventário, Diário, pontos, mínimos, favoritos e configurações.
2. Repetir Home → Mais → cada módulo → voltar, incluindo o retorno por Planejamento, e alternar as abas principais.
3. Em Equipamentos, entrar em uma categoria e voltar pelo botão do Android; o primeiro retorno deve mostrar as categorias.
4. Preencher dias `20`, distância `500` e meta de pedal `50`: média da viagem `25 km/dia`, estimativa de `10` dias de pedal. Gerar, sair, encerrar e reabrir o app.
5. Informar valores como `12,50` e `12.50`; ambos devem produzir o mesmo cálculo. Valores inválidos precisam ser corrigidos antes de salvar/gerar.
6. Conferir os campos de Planejamento e Calculadora após navegação e reabertura. O último planejamento deve continuar separado de alterações ainda não geradas.
7. Conferir barras, botões e formulários com teclado aberto, navegação por gestos e por três botões, tema claro/escuro e fonte grande.

## Dados e Backup

Os novos rascunhos usam `planning_session_v1` e `calculator_draft_v1` no mesmo armazenamento local, sem substituir chaves existentes. A gravação é disparada por edição/geração, usando a escrita assíncrona de `SharedPreferences.apply()`, e não por chamadas de salvamento durante a composição.

O formato de Backup foi preservado. Consequentemente, os rascunhos novos **não fazem parte do Backup JSON atual**. Os ajustes globais de tema e espaços do sistema também se refletem na aparência da tela Backup, mas seu código e suas operações permanecem inalterados.

Referências técnicas utilizadas na configuração: [insets do Material 3](https://developer.android.com/develop/ui/compose/system/material-insets), [testes Compose](https://developer.android.com/develop/ui/compose/testing/apis) e [Android Emulator Runner](https://github.com/ReactiveCircus/android-emulator-runner).
