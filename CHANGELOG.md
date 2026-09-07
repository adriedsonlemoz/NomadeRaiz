# Changelog

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
