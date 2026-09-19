# Validação — 1.0.42-kotlin-alpha.15

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.41-alpha.14.zip`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100042`.

## Análise antes das alterações

- A tela Planejar concentrava um card visual grande, resumo completo do último planejamento e estados de seis categorias antes dos campos principais. Isso aumentava a quantidade de composição e obrigava o usuário a rolar antes de informar o que define a viagem.
- O fluxo anterior dependia principalmente de `dias` e `km/dia`; velocidade média e horas reais de pedal não faziam parte do modelo de Planejamento, embora já existissem conceitos semelhantes na Calculadora.
- Alimentação detalhada era composta diretamente na tela principal, mesmo quando o usuário queria apenas uma estimativa rápida. O editor item a item e os controles avançados agora só são compostos quando `Detalhes opcionais` está aberto.
- A imagem raster do hero de Planejamento era decodificada/composta toda vez que a tela era criada. O novo Planejamento usa somente componentes Compose nessa área; o arquivo antigo permanece no projeto para não alterar recursos de outras telas/compatibilidade.
- A persistência com debounce de 300 ms e `Dispatchers.IO` introduzida na versão anterior foi mantida. Não foi reintroduzida gravação de `SharedPreferences` a cada tecla. O botão explícito **Salvar planejamento** grava o snapshot imediatamente uma única vez, evitando corrida com a recriação da Activity sem penalizar a digitação.

## Mudanças verificadas em código

- Novo `TripPlanner.kt` implementa o cálculo determinístico de distância diária, horas teóricas, horas com margem, dias estimados, último dia, cenários e data de chegada.
- `PlanningDraft` recebeu `speedKmh`, `hoursPerDay`, `safetyMarginPercent`, `departureDate`, `foodDailyCost`, `waterDailyPerPerson` e `energyDailyWh`.
- `TravelFormJson` passou ao schema local 2. Ao ler JSON antigo, velocidade e horas ficam vazias e os dias antigos permanecem como fallback; nenhum valor de ritmo é inventado para dados já salvos.
- `buildPlanningResult` usa a duração calculada quando existe, mas continua aceitando planos legados baseados em duração manual.
- O cálculo rápido de recursos usa a duração atual: alimentação = custo/dia × pessoas × dias; água = L/pessoa/dia × pessoas × dias; energia = Wh/dia do grupo × dias.
- A função de água aceita consumo por pessoa/dia configurável e mantém 3 L/pessoa/dia como padrão somente para caminhos antigos que não informam um valor específico.
- Campos avançados, editor detalhado de alimentos, reabastecimento, orçamento, tipos de viagem, segurança e inventário continuam no projeto e não foram removidos.
- A tela Sobre lista as mudanças da nova versão.
- `applicationId` e `namespace` permanecem `com.nomaderaiz.app`, preservando a instalação sobre versões anteriores quando assinadas com a mesma chave.
- O módulo Backup não foi alterado.

## Testes e validações executados neste ambiente

- Compilação conjunta dos arquivos puros de regra de negócio com `kotlinc`: **OK**. Foram compilados `Models.kt`, `NumberInput.kt`, `TripPlanner.kt`, `TravelForms.kt`, `Calculator.kt`, `Planning.kt`, `PlanningResult.kt` e `SeedData.kt`.
- A compilação acima valida sintaxe e tipos da nova lógica de planejamento sem depender do Android/Compose.
- Execução isolada da nova lógica: **OK** — 300 km a 20 km/h por 7 h/dia resultou em 3 dias, 15 h teóricas e 1 h no último dia; saída em 22/09/2026 resultou em chegada estimada em 24/09/2026. Para 2 pessoas, R$ 40/pessoa/dia, 3 L/pessoa/dia e 30 Wh/dia resultaram em R$ 240, 18 L e 90 Wh para a viagem.
- `python3 scripts/sync-github-manager.py --check`: **OK**.
- Testes JUnit foram atualizados para cobrir 300 km a 20 km/h por 7 h/dia, margem de segurança, previsão de chegada, migração de JSON antigo e totais rápidos de alimentação/água/energia.
- Teste instrumentado de Planejamento foi atualizado para editar distância, velocidade, horas, recursos essenciais, margem, abrir detalhes opcionais, salvar, navegar, recriar a Activity e verificar a persistência.
- `github-manager.json`, README, CHANGELOG e `app/build.gradle.kts` foram sincronizados para `1.0.42-kotlin-alpha.15` / `100042`.

## Validações que ainda exigem o ambiente Android

- Tentativa real de executar `gradle :app:testDebugUnitTest :app:assembleDebug --stacktrace`: **não iniciou**, porque este ambiente retorna `gradle: command not found` e o projeto não contém Gradle Wrapper. Uma tentativa de obter a distribuição do Gradle também não ficou disponível neste ambiente.
- `:app:testDebugUnitTest`: ainda precisa ser executado pelo Gradle Android.
- `:app:assembleDebug`: ainda precisa ser executado pelo Gradle Android.
- `:app:connectedDebugAndroidTest` em Android 15: ainda precisa ser executado em emulador/dispositivo.
- Home → Mais → módulos → voltar, abertura repetida de Mais e navegação inferior continuam cobertas pela suíte instrumentada existente, mas só podem ser declaradas aprovadas depois da execução real.

O workflow do GitHub Actions continua na ordem testes unitários → build APK → Android 15 → publicação e continua bloqueando a Release se qualquer etapa falhar. A Release continua publicando somente `Nomade-Raiz.apk`, sem AAB e sem `upload-artifact`.
