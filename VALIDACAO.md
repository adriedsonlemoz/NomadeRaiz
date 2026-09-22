# Validação — 1.0.58-kotlin-alpha.31

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.57-alpha.30`. Fonte principal da versão: `app/build.gradle.kts`; `versionCode`: `100058`.

## Alterações verificadas estaticamente

- Catálogo de equipamentos passou a conter preços econômicos de referência e os novos itens tecnológicos da bike.
- `mergeEquipmentCatalog()` preserva itens existentes e só preenche preço de referência quando o valor salvo está zerado; itens ausentes são adicionados.
- A tela Planejar recebe `onGear` e os detalhes da rota exibem **Itens da cicloviagem** sem tornar a lista principal de rotas mais pesada.
- `applicationId` e `namespace` permanecem `com.nomaderaiz.app`.
- O módulo Backup não foi alterado nesta etapa.
- `versionName`, `versionCode`, `github-manager.json`, README, CHANGELOG e Sobre foram sincronizados.

## Pesquisa de preços

Os valores usados são referências de anúncios online observados em 21/09/2026, priorizando opções econômicas. Eles não representam garantia de estoque, frete ou qualidade e devem ser ajustáveis pelo usuário no próprio app.

## Validação não executada neste ambiente

O projeto recebido não contém Gradle Wrapper e o ambiente não dispõe de executável `gradle`. Portanto não foram declarados como aprovados build Android, testes unitários Gradle nem testes instrumentados Android 15 desta nova versão. O GitHub Actions continua responsável por validar e bloquear a Release em caso de falha.
