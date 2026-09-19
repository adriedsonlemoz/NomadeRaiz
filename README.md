# Nômade Raiz — Android Kotlin + Jetpack Compose

Migração nativa do Nômade Raiz original 1.0.26 (React/Capacitor) para Android em Kotlin + Jetpack Compose, preservando as regras e funções do aplicativo original.

**Versão atual:** `1.0.42-kotlin-alpha.15`

**versionCode:** `100042`

**applicationId / namespace:** `com.nomaderaiz.app`

## Esta atualização

- Tela **Planejar** reformulada como assistente de viagem: o fluxo principal agora pergunta destino, distância, pessoas, velocidade média e horas de pedal por dia.
- A estimativa é atualizada enquanto o usuário digita e mostra km/dia, horas efetivas de pedal, dias previstos e horas do último dia.
- Nova margem de segurança de `0%`, `+10%` ou `+20%`, tratada como tempo adicional de planejamento sem alterar a distância real.
- Três cenários rápidos (`Leve`, `Equilibrado` e `Longo`) permitem comparar 4 h, 6 h e 8 h de pedal por dia mantendo velocidade e margem.
- Data de saída opcional calcula a data estimada de chegada usando dias corridos do planejamento.
- Recursos essenciais foram simplificados no Planejamento: alimentação por pessoa/dia, água por pessoa/dia e consumo de energia do grupo por dia geram os totais da viagem automaticamente.
- O antigo resumo grande de estados deixou de dominar o topo. O último planejamento agora aparece de forma compacta; checklist, inventário, alimentação detalhada, água carregada, reabastecimento, tipo de viagem, orçamento e campos legados ficam em detalhes opcionais.
- Dados de versões anteriores continuam preservados. O schema local do rascunho passou para `2`, mas rascunhos antigos mantêm `dias`/`km por dia` e não recebem velocidade ou horas inventadas durante a migração.
- A imagem hero da tela Planejar deixou de ser composta, reduzindo decodificação de bitmap e trabalho visual nessa tela. Nenhuma imagem ou mockup novo foi criado ou adicionado.
- Campos numéricos continuam usando apresentação pt-BR automática (`100000` → `100.000`, dinheiro com `R$` e unidades no próprio campo).
- Persistência de Planejamento e Calculadora continua agrupada por 300 ms e executada fora da thread da UI; estado em edição permanece em `SavedState`.
- A tela **Sobre** foi atualizada com as mudanças desta versão.
- O módulo **Backup** não foi alterado.

**Validação desta entrega:** os arquivos puros de regra de negócio (`Models`, entrada numérica, planejamento, calculadora, cenários e resultados) foram compilados juntos com `kotlinc` com sucesso. A validação Android completa depende de Gradle/Android SDK e está detalhada em `VALIDACAO.md`; nenhum teste Android é declarado como aprovado sem execução.

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
