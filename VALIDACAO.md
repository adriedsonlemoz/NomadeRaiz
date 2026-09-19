# Validação — 1.0.40-kotlin-alpha.13

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.39-alpha.12.zip`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100040`.

## Análise antes das alterações

- A navegação inferior é criada em `NomadeRaizApp.kt` somente para os destinos de `topLevelScreens` e contém as tags `nav-Home`, `nav-Planning`, `nav-Journal` e `nav-More`.
- A condição baseada em `WindowInsets.isImeVisible` não existe mais no código. O conteúdo usa `imePadding()`, sem retirar a barra inferior da composição.
- Os testes instrumentados continuam cobrindo abertura repetida de Mais, todos os módulos internos, Diário, Equipamentos, Verificar, Planejamento, preferências e recriação da Activity.
- A Calculadora estava excessivamente extensa para uso rápido: Bike, inventário detalhado de alimentos, Água, Energia, Dinheiro, peso de cada equipamento e custo detalhado produziam uma tela muito longa.
- Persistência da Calculadora usa a mesma chave `calculator_draft_v1`; portanto foi possível simplificar a UI sem apagar os campos legados já armazenados.
- O módulo Backup não foi alterado.

## Alterações desta entrega

- Calculadora reduzida a: dias da viagem, gasto diário com alimentação, água carregada + consumo diário, energia disponível + consumo diário.
- Totais/autonomia são calculados diretamente a partir desses dados básicos.
- Campos legados da Calculadora continuam no modelo/persistência para preservar dados de versões anteriores, embora não sejam mais exibidos na tela simplificada.
- `versionName`, `versionCode`, `github-manager.json`, README e CHANGELOG sincronizados.

## Validação executada neste ambiente

- Revisão estática da navegação inferior: **OK** — `nav-More` e `nav-Journal` estão sempre compostos nas telas principais.
- Busca por `WindowInsets.isImeVisible`: **OK** — nenhuma ocorrência em `app/src`.
- Verificação do workflow: **OK** — testes unitários → APK → testes instrumentados Android 15 → Release; publicação só acontece após as etapas anteriores; sem `upload-artifact` e sem AAB.
- `python3 scripts/sync-github-manager.py`: **OK** — metadados atualizados para `1.0.40-kotlin-alpha.13` / `100040`.
- Tentativa real de `gradle :app:testDebugUnitTest :app:assembleDebug --stacktrace`: **NÃO EXECUTADA**, porque o executável `gradle` não está instalado neste ambiente (`gradle: command not found`) e o projeto recebido não contém Gradle Wrapper.
- Testes instrumentados Android 15: **NÃO EXECUTADOS localmente**, pois este ambiente não dispõe do emulador/SDK necessário. O workflow existente continua configurado para executá-los e bloquear a Release em caso de falha.

Nenhum teste é declarado como aprovado sem execução. A confirmação final de build e instrumentação deve vir do próximo GitHub Actions.
