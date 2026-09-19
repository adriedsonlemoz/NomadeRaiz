# Changelog

## 1.0.43-kotlin-alpha.16

### Persistência do Planejamento e teste Android 15

- Corrigida a falha real observada no GitHub Actions em `planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation`: 4 de 5 testes instrumentados passaram e a margem de segurança selecionada em `+20%` voltou como `0%` após a sequência de edição, navegação e recriação da Activity.
- A causa estava em atualizações de `PlanningDraft` feitas a partir de cópias capturadas por callbacks de campos diferentes. Em interações rápidas, um campo posterior podia reconstruir o rascunho a partir de uma versão anterior e sobrescrever uma alteração recente.
- Os campos do Planejamento agora aplicam transformações sobre o estado mais atual no nível raiz do aplicativo. Assim, editar dinheiro, água, ritmo ou detalhes opcionais não pode apagar silenciosamente a margem ou outro campo atualizado logo antes.
- A persistência com atraso de 300 ms também foi serializada em um único fluxo com `snapshotFlow` + `collectLatest`, evitando que uma gravação antiga termine depois de uma gravação nova e sobrescreva o rascunho mais recente.
- O botão **Salvar planejamento** continua fazendo gravação imediata do snapshot atual, preservando a segurança na recriação da Activity sem voltar a gravar `SharedPreferences` a cada tecla.
- O chip de margem recebeu tag estável (`planning-margin-20`) e o teste instrumentado agora confirma explicitamente que `+20%` ficou selecionado antes de prosseguir. O teste não foi removido nem enfraquecido.
- Os logs recebidos desta versão-base confirmaram: testes unitários **OK**, compilação do APK **OK**, Android 15 com **4/5 testes aprovados e 1 falha**. Esta correção ainda precisa de uma nova execução do GitHub Actions para ser declarada aprovada.
- Tela Sobre, README, CHANGELOG, VALIDACAO e metadados do GitHub Manager atualizados.
- Módulo Backup preservado sem alterações.
- Versão e metadados sincronizados: `1.0.43-kotlin-alpha.16` / `100043`.

## 1.0.42-kotlin-alpha.15

### Planejamento por ritmo e recursos essenciais

- Reformulada a tela Planejar para priorizar o fluxo `destino → distância → ritmo → estimativa → recursos`, em vez de começar por um resumo extenso do inventário.
- Adicionados velocidade média (`km/h`) e horas pedalando por dia; o app calcula em tempo real distância diária, horas efetivas de pedal, quantidade de dias e duração do último dia.
- Adicionada margem de segurança de 0%, 10% ou 20%, aplicada como reserva de tempo sem alterar os quilômetros reais da rota.
- Adicionados três cenários comparáveis de duração diária (4 h, 6 h e 8 h), tocáveis para aplicar rapidamente o cenário escolhido.
- Data de saída opcional passa a produzir previsão de chegada em dias corridos.
- Alimentação, água e energia ganharam entradas rápidas: gasto de alimentação por pessoa/dia, água por pessoa/dia e Wh/dia do grupo. Os totais acompanham automaticamente a duração estimada.
- Último planejamento foi compactado; checklist e recomendações ficam recolhidos. Alimentação item a item, água carregada/reabastecimento, orçamento, tipo de viagem e campos antigos foram movidos para detalhes opcionais, sem excluir dados ou funções existentes.
- Rascunho de Planejamento passou ao schema local 2. Dados antigos são migrados sem inventar velocidade/horas; a duração manual antiga continua válida até o usuário configurar o novo ritmo.
- O cálculo detalhado usa a nova duração estimada quando disponível e mantém a duração antiga como fallback para planos legados.
- A imagem hero deixou de ser usada na tela Planejar para reduzir custo de primeira composição em aparelhos básicos. Nenhuma imagem ou mockup novo foi criado.
- Tela Sobre e documentação atualizadas.
- Testes unitários foram ampliados para ritmo, margem, data de chegada, recursos essenciais e migração do schema antigo; teste instrumentado de Planejamento foi atualizado para cobrir o novo fluxo sem remover os demais cenários.
- Módulo Backup preservado sem alterações.
- Versão e metadados sincronizados: `1.0.42-kotlin-alpha.15` / `100042`.

## 1.0.41-kotlin-alpha.14

### Desempenho e campos numéricos brasileiros

- Corrigido o principal ponto de lentidão encontrado na digitação do Planejamento e da Calculadora: cada tecla atualizava o estado raiz, serializava o rascunho e iniciava uma gravação em `SharedPreferences` pela thread da interface. A persistência desses dois rascunhos agora é agrupada por 300 ms e executada em `Dispatchers.IO`, mantendo o valor atual em `SavedState` para sobreviver à recriação da Activity.
- Reduzidos cálculos repetidos durante recomposições em Home, Equipamentos, Diário, Pontos de apoio e Mais com `remember` para totais, filtros, agrupamentos e estatísticas que só dependem dos dados alterados.
- A busca do Manual da Bike deixou de recompilar a expressão regular de normalização a cada termo pesquisado.
- Removido da Calculadora o parâmetro de inventário que já não era utilizado, reduzindo recomposições sem relação com a tela.
- Todos os `NumericField` passam a manter o valor cru no estado e aplicar agrupamento de milhares apenas na apresentação. Exemplo: `100000` é exibido como `100.000`, sem mudar o número persistido.
- Campos monetários agora exibem prefixo `R$`; campos com unidade mostram sufixos como `km`, `km/dia`, `L`, `L/dia`, `Wh`, `Wh/dia` e `dias` quando aplicável.
- Colagem de valores localizados como `1.500,50` e `1.000.000` é normalizada sem perder o valor; ponto ou vírgula decimal digitados continuam aceitos.
- Resultados monetários e numéricos também passaram a usar separação de milhares em pt-BR.
- Testes de entrada numérica foram ampliados e os testes instrumentados tiveram os rótulos atualizados sem remover cenários existentes.
- Nenhuma imagem ou mockup foi criado/modificado e o módulo Backup não foi alterado.
- Corrigido também o empacotamento: a pasta raiz do ZIP passa a usar o nome da versão atual, evitando carregar internamente o nome da versão anterior.
- Versão e metadados sincronizados: `1.0.41-kotlin-alpha.14` / `100041`.

## 1.0.40-kotlin-alpha.13

### Calculadora enxuta para a cicloviagem

- Simplificada a tela Calculadora para mostrar apenas os dados práticos de alimentação, água e energia, além dos dias da viagem para estimar totais.
- Alimentação agora usa gasto diário; Água usa quantidade carregada e consumo diário; Energia usa reserva disponível e consumo diário.
- Removidos da interface da Calculadora os blocos extensos de Bike, inventário de alimentos, Dinheiro, Peso e custos detalhados. Os campos legados continuam preservados no rascunho persistido, evitando perda de dados de instalações anteriores.
- Revisada a correção da navegação inferior: não há mais uso de `WindowInsets.isImeVisible`; `nav-More` e `nav-Journal` permanecem na composição sempre que uma tela principal está ativa.
- Backup permanece fora do escopo e não foi alterado.
- Versão e metadados sincronizados: `1.0.40-kotlin-alpha.13` / `100040`.

## 1.0.39-kotlin-alpha.12

### Correção do teste Android 15 e da navegação inferior

- Corrigida a causa das quatro falhas instrumentadas observadas no GitHub Actions.
- A barra inferior não depende mais de `WindowInsets.isImeVisible`, que podia permanecer ativo incorretamente no emulador Android 15 e retirar `Mais` e `Diário` da árvore da interface.
- A navegação inferior agora permanece disponível em todas as telas principais; o redimensionamento do teclado continua sendo tratado pelo sistema e por `imePadding` no conteúdo.
- Nenhum módulo, dado persistido ou recurso de Backup foi removido ou alterado.
- Versão e metadados sincronizados: `1.0.39-kotlin-alpha.12` / `100039`.

## 1.0.38-kotlin-alpha.11

- Corrigidas a altura fixa da navegação inferior e a aplicação/consumo dos espaços das barras do Android e do teclado; aparência das barras sincronizada com o tema escolhido.
- Planejamento passou a salvar rascunho e último plano gerado separadamente; Calculadora passou a salvar campos, alimentação e pesos. Nenhuma chave anterior de dados foi substituída.
- Entradas com vírgula e ponto decimal são interpretadas corretamente. Valores inválidos têm mensagem e bloqueiam geração/salvamento, em vez de virarem zero silenciosamente.
- Distância/duração fornecem a média real da viagem; a antiga média editável foi identificada como meta nos dias de pedal. Mantida a possibilidade de descanso, com aviso quando a meta não cobre o percurso.
- Botão de gerar acessível com indicação dos requisitos; alimentação compactada em linhas expansíveis. Todos os campos, cálculos e detalhamentos anteriores continuam acessíveis.
- Resultados do planejamento calculados somente quando o plano gerado ou inventário muda. Busca do Manual e resultados da Calculadora memorizados por suas entradas; lista de pesos renderizada por item.
- Corrigidos o retorno visível de Planejamento aberto por Mais e o retorno do Android dentro de categorias de Equipamentos. Estado de rolagem das telas preservado.
- Alertas passou a diferenciar ausência de mínimos de estoque suficiente; mínimo zero desativa o acompanhamento do item, com edição validada.
- Aplicada a cor escolhida também aos cartões, seletores e diálogos Material 3; cores de Configurações em duas linhas; ícones vetoriais e melhor legibilidade das informações secundárias.
- Totais financeiros de Equipamentos reunidos em uma faixa. Home identifica o progresso como inventário adquirido, evitando confusão com o checklist de segurança.
- Calculadora vazia não conta o consumo padrão de energia como recurso já preenchido. Comparações incompletas são identificadas como parciais.
- Adicionados testes JUnit de números, recursos, estado de estoque e serialização; testes instrumentados de navegação repetida, rascunhos, categorias, outras telas e preservação de preferências.
- Workflow preparado para exigir testes unitários, compilação e testes Android 15 antes de publicar somente `Nomade-Raiz.apk`.
- Backup mantido fora das alterações: tela, exportação/importação e schema preservados; os novos rascunhos locais não foram adicionados ao JSON de backup.
- Sem imagens novas ou alteração dos recursos visuais existentes.
- Versão e metadados sincronizados: `1.0.38-kotlin-alpha.11` / `100038`.
- Validação local limitada a revisão estática e integridade. Build e testes Android/JUnit ainda pendentes de execução no GitHub Actions por bloqueio de downloads neste ambiente; não se afirma ausência de travamentos em aparelho sem esses testes.

## 1.0.37-kotlin-alpha.10

- Implantada a identidade visual do mockup nas 12 áreas principais, mantendo os dados e recursos reais do aplicativo em vez de números demonstrativos.
- Adicionados e otimizados dez recursos visuais locais para Home, Planejamento, Diário, Mais, Pontos, Manual da Bike e Dicas; o uso permanece totalmente offline.
- Home reorganizada com abertura para cicloviagem, verificação imediata, progresso real do inventário, acesso ao Diário e atalhos funcionais.
- Equipamentos ganhou hierarquia por categoria, percentual de conclusão e apresentação compacta, preservando CRUD, filtros, preços, prioridades e ordenação.
- Planejamento, Calculadora, Diário, Alertas, Pontos de apoio, Verificar e Configurações receberam cabeçalhos, resumos e cartões compatíveis com o novo visual sem perder as funções existentes.
- Dicas recebeu filtros por categoria e miniaturas; Manual da Bike foi reorganizado em Visão geral, Manutenção e Ajustes, mantendo busca, diagnósticos, favoritos e domínio.
- Mais passou a usar uma grade leve sobre fundo local, preservando os nove destinos originais e o contador real de alertas.
- Corrigido um fechamento de escopo no novo Manual da Bike identificado pela compilação Kotlin.
- Confirmados por testes os ciclos `Home → Mais → módulo → voltar`, todos os nove destinos, 100 ciclos por módulo e 1.000 aberturas/fechamentos de Mais sem crescimento da pilha.
- Mantido o processamento de Backup fora da UI thread e preservada a persistência/compatibilidade dos dados existentes.
- GitHub Actions permanece restrito ao asset de Release `Nomade-Raiz.apk`, sem `upload-artifact`, AAB ou ZIP de APK.

## 1.0.36-kotlin-alpha.9

- Corrigido o travamento ao abrir **Mais**: o menu e cada ferramenta foram separados do antigo arquivo Compose monolítico, evitando carregar e verificar todos os módulos na UI thread no primeiro acesso.
- Substituída a navegação baseada em textos e em um único destino de retorno por destinos tipados e uma pilha determinística, com suporte ao botão Voltar do Android.
- Adicionados testes de repetição para `Home → Mais → módulo → voltar`, cobrindo todos os destinos e impedindo crescimento indevido da pilha.
- Geração de listas/JSON e leitura, gravação e restauração de arquivos de Backup movidas para processamento fora da thread da interface.
- Corrigido o conflito entre o estado chamado `error` e a função Kotlin `error()` dentro da tela de Backup.
- Restaurada a equivalência do menu Mais com o original: Planejamento, títulos, descrições e contador real de Alertas.
- Restaurado em Pontos de apoio o filtro por tipo do aplicativo original e adicionada confirmação antes de excluir.
- Corrigido o `versionCode` desatualizado no README.
- Workflow passa a executar os testes antes da compilação e valida que a Release contém exatamente um asset próprio: `Nomade-Raiz.apk`.
- `github-manager.json` sincronizado a partir de `app/build.gradle.kts`.

## 1.0.35-kotlin-alpha.8
- Workflow ajustado para não usar GitHub Actions Artifacts, evitando download em ZIP.
- `Nomade-Raiz.apk` passa a ser publicado e validado como asset direto da GitHub Release.
- O workflow falha se o APK não existir antes da Release ou se o asset não aparecer na API da Release.
- Adicionado link direto do APK ao resumo da execução do workflow.
- `github-manager.json` sincronizado com `app/build.gradle.kts`.


## 1.0.34-kotlin-alpha.7

- Adicionada opção **Cor do aplicativo** em Configurações, com seis cores globais: Verde Raiz, Azul, Turquesa, Laranja, Roxo e Vermelho.
- A cor selecionada altera os componentes Material 3 do aplicativo, permanece salva localmente e é incluída no backup/restauração.
- Adicionado botão para restaurar a aparência padrão sem apagar os demais dados.
- Diário ampliado para CRUD completo: agora é possível editar registros existentes; adicionados totais de registros e quilômetros.
- Home: contador de alertas agora abre diretamente a tela Alertas de Reposição.
- Corrigido o retorno de navegação: telas abertas pela Home, Planejamento ou Mais agora voltam para a origem correta.
- Planejamento: adicionados atalhos funcionais para Pontos de apoio durante o planejamento de água e para o Manual da Bike na revisão de segurança.
- Exportar/Backup: além de copiar, agora é possível salvar listas `.txt`, salvar backup `.json` e abrir/restaurar um backup diretamente do armazenamento Android.
- Tela Sobre agora mostra `versionName`, `versionCode` e `applicationId` reais da build.
- Removida anotação Compose duplicada encontrada na tela de Configurações.
- `app/build.gradle.kts` atualizado para `1.0.34-kotlin-alpha.7` / `versionCode 100034`.
- `github-manager.json` regenerado e validado a partir do Gradle.
- GitHub Actions permanece configurado para publicar somente `Nomade-Raiz.apk`.

## 1.0.33-kotlin-alpha.6

- Corrigidos os erros de compilação Compose reportados no log 8:
  - `LocalContext.current` não é mais chamado dentro do bloco de `remember`;
  - chamadas de `Text` foram corrigidas para argumentos nomeados onde necessário;
  - telas grandes foram separadas e reestruturadas para evitar blocos `LazyColumn/item` fora de escopo.
- Adicionado `github-manager.json` na raiz com nome, versão, `versionName`, `versionCode`, `applicationId`, `namespace`, linguagem e tipo do projeto.
- `app/build.gradle.kts` permanece como fonte principal da versão.
- Adicionado `scripts/sync-github-manager.py` para atualizar/verificar o JSON a partir do Gradle.
- GitHub Actions agora falha se `github-manager.json` estiver fora de sincronia.
- Release/tag continua usando o `versionName` e publica somente `Nomade-Raiz.apk`.
- Home ampliada com nota rápida, dias na estrada, alertas, investimento, próximo passo e atalhos funcionais.
- Equipamentos ampliado com prioridade, mudança de categoria, filtros, ordenação e resumos de total/adquirido/falta.
- Restaurados `createdAt` e `updatedAt` nos equipamentos e no backup.
- Corrigidos os tipos de Pontos de apoio para os tipos existentes no original; removido o tipo extra de Energia.
- Checklists temporários e persistentes agora seguem a regra do original: apenas `Antes de sair` e `Bike/Manutenção` permanecem salvos.
- Planejamento ampliado com quatro tipos de viagem, alimentação por grupo, água/reabastecimento, energia baseada no inventário, segurança, abrigo, reserva financeira, custos, estados e recomendações.
- Calculadora ampliada com Alimentação e Resumo Geral, além das áreas Bike, Água, Energia, Dinheiro, Peso e Custo.
- Configurações tornadas funcionais, incluindo tema, escala de fonte e contador da viagem.
- Backup/Importação JSON e exportação de listas tornados funcionais, incluindo leitura de backups antigos de equipamentos.
- Manual da Bike migrado com 4 áreas, 12 peças, 9 problemas de estrada, 6 dicas rápidas, 15 termos, 9 ferramentas, busca, favoritos e habilidades dominadas.
- Favoritos do Manual e habilidades dominadas incluídos na persistência e no backup.
- `versionCode` atualizado para `100033`.

## 1.0.32-kotlin-alpha.5

- Release/tag do GitHub passou a usar automaticamente o `versionName`.
- Release mantida com somente `Nomade-Raiz.apk`.
- Alertas de Reposição migrados com estoque disponível, mínimos por item e mínimos sugeridos.
- Dicas de Sobrevivência migradas com favoritos persistentes.
- `versionCode` 100032.

## 1.0.31-kotlin-alpha.4-fix1

- Corrigida a compilação das telas Calculadora/Pontos de apoio.
- Corrigida a rota de Pontos de apoio no menu Mais.
- Mantida publicação de somente `Nomade-Raiz.apk`.

## 1.0.30-kotlin-alpha.4

- Pontos de apoio ganhou cadastro, edição, exclusão, tipo, localização, observações, avaliação e aberto/fechado.
- Persistência local dos pontos.
- Calculadora ampliada com bicicleta, água, energia, dinheiro, peso e custo da viagem.

## 1.0.29-kotlin-alpha.3

- Equipamentos passaram a usar dados reais, categorias, edição, exclusão, status e persistência local.
- Cinco modos de checklist migrados.
- Diário funcional com criação, listagem, exclusão e persistência.
- Planejamento e Calculadora receberam as primeiras regras reais.
- Home passou a usar estatísticas reais dos equipamentos.
- Workflow ajustado para publicar somente `Nomade-Raiz.apk` na Release.

## 1.0.28-kotlin-alpha.2

- Corrigida a incompatibilidade JVM do GitHub Actions.
- Java e Kotlin configurados para JVM 17.
- Adicionado `jvmToolchain(17)`.

## 1.0.27-kotlin-alpha.1

- Iniciada a conversão para Kotlin nativo + Jetpack Compose.
- Criada a fundação Android sem React/Capacitor.
- Migradas as primeiras telas e navegação nativa.
- Adicionado workflow inicial de APK.
