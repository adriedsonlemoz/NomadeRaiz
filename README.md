# Nômade Raiz — Android Kotlin + Jetpack Compose

Migração nativa do Nômade Raiz original 1.0.26 (React/Capacitor) para Android em Kotlin + Jetpack Compose, preservando as regras e funções do aplicativo original.

**Versão atual:** `1.0.61-kotlin-alpha.34`

**versionCode:** `100061`

### Planejar reorganizado por rotas

A `1.0.57-kotlin-alpha.30` muda a estrutura da tela **Planejar**. A tela principal deixou de ser um formulário/relatório único e agora funciona como um gerenciador leve de rotas. Ela mostra somente o botão **Criar nova rota** e os cards das viagens cadastradas.

Criar ou editar uma rota acontece em uma tela separada. Os campos principais são destino, distância, pessoas, data de saída, velocidade média, horas por dia e margem de segurança. Alimentação, água e energia ficam em uma seção opcional recolhida; os controles avançados legados continuam disponíveis em outra seção recolhida.

Cada rota salva possui uma tela de detalhes própria. Nela ficam o resumo, a estimativa de chegada, recursos essenciais e, somente quando solicitado, custos, inventário, segurança e recomendações. Isso evita executar os cálculos mais pesados durante a simples abertura da lista.

Foi adicionada a **Sugestão do Nômade**. A partir da distância, velocidade e margem informadas, o app monta uma referência de horas por dia e mostra quantos km/dia e quantos dias aquela ideia produziria. A sugestão pode ser aplicada ao editor com um toque, sem substituir silenciosamente a escolha do usuário.

O planejamento único usado até a alpha.29 é migrado para a nova lista de rotas. Se existir um rascunho antigo diferente do último plano salvo, os dois são preservados para evitar perda de dados.

**applicationId / namespace:** `com.nomaderaiz.app`

## Esta atualização

- Corrigida a única falha restante do `Android-Kotlin-APK-33-logs.zip`.
- A interface já continha `planning-resources-toggle`; o teste Android 15 não conseguia encontrá-lo porque o item estava fora da viewport de uma `LazyColumn` e, portanto, ainda não estava composto.
- A navegação do teste agora usa `planning-list.performScrollToNode(...)` antes de interagir com Recursos opcionais.
- O mesmo padrão foi aplicado preventivamente à lista de rotas para evitar falhas equivalentes quando um card estiver fora da área visível.
- A correção é exclusiva da infraestrutura de teste: nenhuma regra de negócio, dado, tela, inventário, planejamento ou Backup foi alterado.
- Gradle, `github-manager.json`, README, CHANGELOG, VALIDACAO e Sobre foram sincronizados para `1.0.61-kotlin-alpha.34` / `100061`.

**Validação do log anterior:** testes unitários e build do APK passaram; Android 15 executou 7 testes e teve 1 falha causada pelo modo incorreto de rolar até um item virtual da `LazyColumn`. A nova versão ainda precisa do GitHub Actions para confirmar 7/7.

## Estado funcional atual

- Home visual para cicloviagem com imagem de abertura, progresso real do inventário, alertas clicáveis, nota rápida, diário e atalhos.
- Equipamentos com as 9 categorias e 20 itens-base do original, CRUD, status, quantidade, preço, observações, prioridade, filtros, ordenação e totais financeiros.
- Cinco modos de checklist. Como no original, apenas `Antes de sair` e `Bike/Manutenção` são persistentes; os demais são temporários.
- Planejamento por múltiplas rotas: lista leve de viagens, editor separado, detalhes por rota, destino/distância/ritmo/data, estimativa instantânea, alimentação/água/energia opcionais e Sugestão do Nômade; controles avançados antigos continuam acessíveis sob demanda.
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
