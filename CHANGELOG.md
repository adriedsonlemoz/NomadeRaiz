# Changelog

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
