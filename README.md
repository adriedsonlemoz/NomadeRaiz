# Nômade Raiz — Android Kotlin + Jetpack Compose

Migração nativa do Nômade Raiz original 1.0.26 (React/Capacitor) para Android em Kotlin + Jetpack Compose, preservando as regras e funções do aplicativo original.

**Versão atual:** `1.0.46-kotlin-alpha.19`

**versionCode:** `100046`

### Correção desta entrega

A versão `1.0.46-kotlin-alpha.19` corrige a falha real observada nos logs da `1.0.45`: o teste Android 15 não falhou mais na asserção semântica, e sim expirou aguardando o valor `+20%` aparecer no armazenamento persistente. A margem deixou de depender do autosave com debounce e agora é persistida imediatamente por ser uma escolha discreta. O seletor também deixou de usar `FilterChip` com semântica sobreposta e passou a usar um controle `selectable` próprio, em que clique, estado selecionado e tag pertencem ao mesmo nó semântico.

**applicationId / namespace:** `com.nomaderaiz.app`

## Esta atualização

- Os logs `Android-Kotlin-APK-18-logs.zip` confirmaram `:app:testDebugUnitTest` e `:app:assembleDebug` com sucesso na `1.0.45-kotlin-alpha.18`.
- No Android 15 foram executados 5 testes: 4 passaram e 1 falhou em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`.
- A falha mudou: não foi `Selected = true`; ocorreu `ComposeTimeoutException: Condition still not satisfied after 5000 ms` enquanto o teste aguardava `safetyMarginPercent == 20` no `AppRepository`.
- A margem `0% / +10% / +20%` agora usa um controle seletivo próprio com `Modifier.selectable`, mantendo clique, estado `Selected`, papel de radio button e `testTag` no mesmo nó semântico.
- Por ser uma escolha de baixa frequência, a margem é salva imediatamente no repositório. Campos numéricos continuam com debounce de 300 ms para preservar desempenho durante digitação.
- O teste instrumentado continua exigindo seleção visual, persistência real, navegação, geração do plano e restauração após `Activity.recreate()`; nenhuma verificação foi removida.
- Assistente de viagem, formatação automática pt-BR, cenários, alimentação, água, energia e compatibilidade de dados foram preservados.
- A tela **Sobre** foi atualizada e o módulo **Backup** não foi alterado.

**Validação desta entrega:** os novos logs da versão-base foram analisados e a sincronização de metadados foi verificada localmente. Este ambiente não possui Gradle/Android SDK configurado para executar novamente o build completo; a `1.0.46` ainda precisa passar pelo GitHub Actions. Nenhum teste Android desta nova versão é declarado como aprovado sem execução.

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
