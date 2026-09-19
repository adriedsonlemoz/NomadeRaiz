# Nômade Raiz — Android Kotlin + Jetpack Compose

Migração nativa do Nômade Raiz original 1.0.26 (React/Capacitor) para Android em Kotlin + Jetpack Compose, preservando as regras e funções do aplicativo original.

**Versão atual:** `1.0.38-kotlin-alpha.11`

**versionCode:** `100038`

**applicationId / namespace:** `com.nomaderaiz.app`

## Esta atualização

- Barra inferior sem altura fixa de 70 dp, com tratamento dos espaços do sistema e do teclado. As barras do Android acompanham o tema do aplicativo.
- Planejamento salva automaticamente o rascunho e mantém o último planejamento gerado separado das edições em andamento. Calculadora também conserva seus campos ao sair e reabrir.
- Campos numéricos aceitam vírgula ou ponto decimal, usam teclado numérico e mostram erros. Cadastros de equipamentos e Diário impedem salvar valores inválidos.
- Média da viagem calculada por distância/duração; a meta nos dias de pedal continua editável, permitindo dias de descanso e sinalizando metas insuficientes.
- Botão de gerar planejamento acessível ao final da tela, com explicação dos campos obrigatórios. Alimentação usa linhas expansíveis que mantêm todos os campos anteriores.
- Retorno ao abrir Planejamento por Mais e retorno do Android dentro das categorias de Equipamentos corrigidos.
- Alertas distingue mínimos não configurados de estoque suficiente. Edição do mínimo valida o número antes de salvar.
- Paleta Material 3 completa, seis cores em duas linhas, ícones vetoriais nos menus e ferramentas, texto secundário mais legível e totais financeiros reunidos.

**Validação desta entrega:** revisão estática, sincronização de metadados, integridade dos recursos e comparação com a base 1.0.37 realizadas localmente. A compilação Kotlin/Android e os testes JUnit/instrumentados **não foram executados neste ambiente**, pois os downloads de Gradle/SDK foram bloqueados. O workflow executará essas etapas antes de publicar o APK. Veja `VALIDACAO.md`.

**Backup fora do escopo:** a tela, as rotinas de exportação/importação e o schema do Backup foram preservados. Os novos rascunhos são locais e não são incluídos no Backup JSON existente. As cores e os espaços do sistema são ajustes globais compartilhados pelas telas.

## Estado funcional atual

- Home visual para cicloviagem com imagem de abertura, progresso real do inventário, alertas clicáveis, nota rápida, diário e atalhos.
- Equipamentos com as 9 categorias e 20 itens-base do original, CRUD, status, quantidade, preço, observações, prioridade, filtros, ordenação e totais financeiros.
- Cinco modos de checklist. Como no original, apenas `Antes de sair` e `Bike/Manutenção` são persistentes; os demais são temporários.
- Planejamento com destino, duração, pessoas, distância, média calculada, meta de pedal, quatro tipos de viagem, alimentação, água, orçamento, reserva financeira, energia automática pelo inventário, abrigo, segurança, estados, recomendações e atalhos para Pontos de apoio/Manual da Bike.
- Calculadora com Resumo Geral, Bike, Comida, Água, Energia, Dinheiro, Peso e Custo da viagem.
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
