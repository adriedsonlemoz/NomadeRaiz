# Nômade Raiz — Android Kotlin + Jetpack Compose

Migração nativa do Nômade Raiz original 1.0.26 (React/Capacitor) para Android em Kotlin + Jetpack Compose, preservando as regras e funções do aplicativo original.

**Versão atual:** `1.0.54-kotlin-alpha.27`

**versionCode:** `100054`

### Mudança de estratégia desta entrega

A versão `1.0.54-kotlin-alpha.27` foi preparada a partir do `Android-Kotlin-APK-26-logs.zip`. A `1.0.53` teve testes unitários e compilação do APK aprovados, mas o Android 15 terminou novamente com 4/5 testes. A falha voltou a ser funcional: `O clique em +20% não atualizou/persistiu a margem expected:<20> but was:<0>`.

Depois de várias versões alternando entre `Selected=true`, timeout, visibilidade e valor persistido incorreto, esta entrega **abandona a sequência de remendos no mesmo seletor**. O Planejamento agora possui uma única porta de entrada de estado (`PlanningAction` + `reducePlanning`). Campos, margem e geração do plano deixam de usar caminhos independentes de mutação.

A margem também foi reescrita. `0%`, `+10%` e `+20%` são botões Material3 comuns, com geometria fixa e `onClick` direto. Não há mais `selectable`, `RadioButton`, `Role.RadioButton` nem teste baseado em `Selected`. O efeito funcional fica explícito em `Margem atual: ...` e no valor realmente persistido no `AppRepository`.

O antigo teste instrumentado monolítico foi dividido em dois: um dedicado ao clique/persistência da margem e outro dedicado aos campos, geração do plano, navegação e `Activity.recreate()`. Isso mantém a cobertura e torna a próxima falha localizada em vez de mascarada por uma sequência extensa.

**applicationId / namespace:** `com.nomaderaiz.app`

## Esta atualização

- `Android-Kotlin-APK-26-logs.zip` confirmou `:app:testDebugUnitTest` com sucesso em 58 s.
- `:app:assembleDebug` passou em 17 s.
- No Android 15 foram executados 5 testes: 4 passaram e 1 falhou no teste do Planejamento.
- A falha voltou a ser `expected:<20> but was:<0>` após clicar em `+20%`.
- Criado `PlanningState.kt` com `PlanningAction`, `reducePlanning` e política de persistência centralizada.
- `NomadeRaizApp` agora despacha toda mudança do Planejamento por esse único redutor.
- O seletor de margem foi reescrito com três botões Material3 estáveis e um texto explícito `Margem atual`.
- O teste antigo foi dividido em `planningMarginButtonsPersistImmediately` e `planningFieldsAndGeneratedPlanSurviveNavigationAndRecreation`.
- Adicionados testes unitários do redutor para garantir que edições posteriores não apaguem a margem e que `GeneratePlan` preserve o valor.
- Persistência imediata continua reservada a margem/geração; campos digitados permanecem com debounce de 300 ms.
- A tela **Sobre**, README, CHANGELOG, VALIDACAO e metadados foram atualizados. O módulo **Backup** não foi alterado.

**Validação desta entrega:** a nova versão ainda precisa passar pelo GitHub Actions no Android 15 antes da Release.

## Estado funcional atual

- Home visual para cicloviagem com imagem de abertura, progresso real do inventário, alertas clicáveis, nota rápida, diário e atalhos.
- Equipamentos com as 9 categorias e 20 itens-base do original, CRUD, status, quantidade, preço, observações, prioridade, filtros, ordenação e totais financeiros.
- Cinco modos de checklist. Como no original, apenas `Antes de sair` e `Bike/Manutenção` são persistentes; os demais são temporários.
- Planejamento como assistente de viagem: destino, distância, pessoas, velocidade média, horas/dia, margem de segurança, data de saída opcional, estimativa instantânea de dias/horas/km por dia, comparação de cenários e cálculo simples de alimentação, água e energia; controles detalhados antigos continuam acessíveis numa seção opcional.
- Calculadora simplificada para uso na estrada: gasto diário com alimentação, água carregada/consumo diário e energia disponível/consumo diário, com autonomia e totais quando aplicáveis.
- Diário com cadastro, edição, clima, quilometragem, notas, exclusão, totais e persistência.
- Pontos de apoio com os tipos originais, filtro por tipo, cadastro, edição, confirmação de exclusão, avaliação e estado aberto/fechado.
- Alertas de reposição com mínimos individuais e sugestões.
- Dicas ilustradas por categoria, com filtros e favoritos persistentes.
- Manual da Bike ilustrado, organizado em Visão geral, Manutenção e Ajustes, com 4 áreas, 12 peças, 9 problemas de estrada, 6 dicas rápidas, 15 termos de glossário, 9 ferramentas, busca, diagnóstico, favoritos e habilidades dominadas.
- Configurações com tema claro/escuro, escala de fonte, cor global do aplicativo (6 opções), contador da viagem e limpeza dos dados.
- Exportação de listas e backup/restauração JSON, com copiar, salvar arquivo, abrir arquivo do dispositivo e compatibilidade com backups antigos de equipamentos.
- Tela Mais em grade, leve e isolada dos módulos internos, com as nove ferramentas do original e contador real de alertas.
- Tela Sobre e navegação nativa tipada, com pilha de retorno e retorno correto à tela de origem para ferramentas abertas por atalhos.
- Geração de exportações e leitura/gravação de backups executadas fora da thread da interface.
- Identidade visual escura verde-raiz aplicada às 12 áreas principais, com imagens locais otimizadas e sem depender de internet durante a viagem.

## Versão e GitHub Manager

`app/build.gradle.kts` é a fonte principal de versão do projeto.

O arquivo `github-manager.json`, na raiz, replica os metadados necessários ao GitHub Manager. Sempre que `versionName`, `versionCode`, `applicationId` ou `namespace` forem alterados, execute:

```bash
python3 scripts/sync-github-manager.py
```

O GitHub Actions executa `python3 scripts/sync-github-manager.py --check` e interrompe o build se o JSON estiver diferente do Gradle. Assim, uma Release não é publicada com metadados desencontrados.

## GitHub Actions

O workflow usa Java 17, Kotlin/JVM 17 e `jvmToolchain(17)`.

A Release publica somente:

```text
Nomade-Raiz.apk
```

Não é usado `upload-artifact` e o workflow não publica ZIP nem AAB.

## Build local

```bash
gradle :app:testDebugUnitTest :app:assembleDebug
```

O APK de debug é gerado em `app/build/outputs/apk/debug/app-debug.apk`.

### APK direto no GitHub

O workflow **não usa GitHub Actions Artifacts**, porque o painel Artifacts entrega downloads em ZIP. Após compilar, `Nomade-Raiz.apk` é publicado diretamente como **asset da GitHub Release** e o próprio workflow valida pela API que o APK existe. O resumo da execução também recebe um link direto para o `.apk`.

O workflow executa testes unitários de navegação, entrada numérica, recursos e serialização, compila o aplicativo e roda testes instrumentados em um emulador Android 15. A publicação só ocorre se todas essas etapas passarem. A validação final exige que a Release tenha exatamente um asset próprio e que ele se chame `Nomade-Raiz.apk`.

Os itens automáticos “Source code (zip)” e “Source code (tar.gz)” são criados pelo próprio GitHub para toda Release e não fazem parte dos assets do aplicativo. O GitHub Manager deve usar o asset `Nomade-Raiz.apk`.
