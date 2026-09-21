# Validação — 1.0.57-kotlin-alpha.30

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.56-alpha.29`. A fonte principal da versão permanece `app/build.gradle.kts`; `versionCode`: `100057`.

## Objetivo desta entrega

Esta versão não continua o ciclo de pequenos remendos no Planejar. A tela foi reorganizada para reduzir complexidade visual e trabalho de composição:

1. tela principal = lista de rotas + **Criar nova rota**;
2. editor separado = campos da rota e cálculos instantâneos;
3. detalhes separados = resumo e análise completa somente quando solicitada.

O armazenamento também foi alterado de um único `PlanningSession` para `PlanningWorkspace`, que contém uma coleção de `PlannedRoute` e um único rascunho de edição.

## Compatibilidade e migração

- `applicationId`/`namespace`: `com.nomaderaiz.app` — inalterados.
- O antigo `planning_session_v1` não foi removido.
- O novo formato usa `planning_routes_v1`.
- Na primeira abertura, se `planning_routes_v1` ainda não existir, `AppRepository.loadPlanningWorkspace()` importa o planejamento antigo.
- O `lastGenerated` antigo vira uma rota.
- Se o rascunho antigo for diferente do plano salvo e contiver dados, ele também vira uma rota, evitando perda silenciosa.
- O módulo `BackupScreen.kt` não foi alterado nesta etapa.

## Desempenho

A lista de rotas não executa `buildPlanningResult(...)`, recomendações, segurança, custos ou formulários avançados. Ela calcula apenas os dados leves necessários ao card: estimativa de ritmo, datas e totais essenciais quando existirem.

`buildPlanningResult(...)` só é criado na tela de detalhes e a UI só compõe a análise completa quando o usuário toca em **Ver custos e recomendações**. Alimentação detalhada, reabastecimento e opções avançadas também só são compostos quando expandidos no editor.

Além disso, ações discretas (salvar rota, margem, duplicar/excluir) atualizam o estado Compose imediatamente, mas o `SharedPreferences.commit()` é feito em `Dispatchers.IO`. Uma revisão monotônica cancela/invalida gravações antigas para evitar regressão de estado sem bloquear a UI thread.

## Sugestão do Nômade

Foi adicionada `nomadRouteSuggestion(draft)`. Ela mantém a distância, velocidade e margem do usuário e propõe uma referência de horas/dia:

- até 120 km: 4 h/dia;
- de 120 a 500 km: 5 h/dia;
- acima de 500 km: 6 h/dia.

A sugestão não substitui automaticamente o valor digitado. A alteração só ocorre ao tocar em **Usar sugestão**.

Exemplo validado: 2.000 km, 15 km/h e +10% de margem. O plano de 5 h/dia resulta em 30 dias; a sugestão de 6 h/dia resulta em 90 km/dia e 25 dias.

## Testes alterados

### Unitários

- `PlanningStateTest`: margem sobre o rascunho mais recente, edição sem apagar margem, criação de rota independente, atualização apenas da rota selecionada e duplicação.
- `TravelFormJsonTest`: round-trip de várias rotas, migração do planejamento único e preservação de rascunho antigo diferente.
- `TripPlannerTest`: cálculo da Sugestão do Nômade e garantia de que a sugestão não altera silenciosamente o ritmo do usuário.

### Instrumentados Android 15

`NavigationUiTest` agora cobre:

- navegação repetida Mais → módulos → voltar;
- criação de uma rota;
- persistência imediata de +20%/+10% dentro do editor;
- salvamento e retorno automático à lista;
- preservação da rota após `Activity.recreate()`;
- abertura dos detalhes e edição;
- múltiplas rotas e duplicação;
- telas principais, equipamentos, alertas e configurações.

`DraftPersistenceTest` foi atualizado para validar `PlanningWorkspace` sem alterar outras preferências.

## Validação executada neste ambiente

Foi executado `kotlinc` sobre a camada Kotlin pura usada pelo novo fluxo (`Models`, `NumberInput`, `SeedData`, `Calculator`, `TravelForms`, `TripPlanner` e `PlanningState`). Resultado: **compilação concluída sem erros**.

Também foi executado um programa de verificação do novo redutor e da sugestão. Resultado real:

```text
OK routes=1 current=30 suggested=25
```

Isso confirma no ambiente atual o fluxo: editar → calcular sugestão → salvar rota, preservando o plano atual de 30 dias e a sugestão independente de 25 dias.

## O que não foi possível validar localmente

O projeto não possui Gradle Wrapper e o ambiente atual não possui o executável `gradle`. Portanto **não** foram executados nesta entrega:

- `:app:testDebugUnitTest` pelo Gradle;
- `:app:assembleDebug`;
- `:app:connectedDebugAndroidTest` no Android 15.

A próxima execução do GitHub Actions deve validar, nesta ordem, sincronização de metadados → testes unitários → APK → testes instrumentados Android 15. A Release deve permanecer bloqueada em qualquer falha e publicar somente `Nomade-Raiz.apk`.
