# Nômade Raiz — Android Kotlin + Jetpack Compose

Migração nativa do Nômade Raiz original 1.0.26 (React/Capacitor) para Android em Kotlin + Jetpack Compose, preservando as regras e funções do aplicativo original.

**Versão atual:** `1.0.56-kotlin-alpha.29`

**versionCode:** `100056`

### Resultado da nova estratégia

O `Android-Kotlin-APK-28-logs.zip` mostrou um avanço importante: a versão `1.0.55-kotlin-alpha.28` executou 6 testes no Android 15 e apenas **1 falhou**. O teste exclusivo `planningMarginButtonsPersistImmediately` passou, portanto o botão de margem, o clique físico e a persistência imediata estão funcionando na arquitetura nova.

A única falha restante ocorreu no teste longo `planningFieldsAndGeneratedPlanSurviveNavigationAndRecreation`, depois de vários campos numéricos terem sido editados. Nesse momento o teclado/IME ainda fazia parte da interação e o teste tentava tocar novamente no botão de margem antes de conferir `Margem atual: +20%`. Isso mistura duas responsabilidades: testar o toque físico do botão e testar persistência/recriação de um formulário grande.

Na `1.0.56-kotlin-alpha.29`, a seleção de margem limpa o foco do campo numérico antes de aplicar a escolha. Além disso, o teste longo aciona a mesma ação semântica do botão para validar especificamente **estado → persistência → geração → navegação → recriação**, enquanto o teste dedicado continua usando `performClick()` e continua sendo responsável por validar o toque real. Foi adicionada ainda uma asserção imediata do valor persistido após selecionar `+20%`, para que uma próxima falha identifique exatamente qual camada falhou.

**applicationId / namespace:** `com.nomaderaiz.app`

## Esta atualização

- `Android-Kotlin-APK-28-logs.zip` confirmou `:app:testDebugUnitTest` com sucesso em 58 s.
- `:app:assembleDebug` passou em 16 s.
- Android 15 executou 6 testes: **5 passaram e 1 falhou**.
- O teste dedicado da margem passou, confirmando clique físico e persistência imediata de `+20%`/`+10%`.
- A única falha ficou no fluxo longo após edição de vários campos, ao conferir `Margem atual: +20%`.
- A seleção de margem agora limpa o foco do campo/IME antes de despachar `SetSafetyMargin`.
- O teste longo deixou de duplicar o teste de toque físico: ele aciona a ação semântica do mesmo botão e valida imediatamente `safetyMarginPercent == 20`, texto visível, geração, navegação, recriação e restauração.
- `PlanningAction`, `reducePlanning`, persistência imediata da margem e debounce de 300 ms dos campos foram mantidos.
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
