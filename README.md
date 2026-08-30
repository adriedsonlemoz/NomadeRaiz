# Nômade Raiz — Kotlin Native

Primeira etapa da conversão do Nômade Raiz 1.0.26 (React/Capacitor) para Android nativo em Kotlin + Jetpack Compose.

## Já migrado nesta alpha
- Projeto Android Kotlin/Compose independente de Node/React/Capacitor.
- Tema visual escuro inspirado nos novos mockups.
- Home nativa inicial.
- Equipamentos com as categorias reais do projeto original.
- Checklist "Antes de sair" com os 5 itens reais.
- Estrutura de navegação: Início, Planejamento, Diário e Mais.
- Entradas preservadas para Calculadora, Pontos, Alertas, Manual da Bike, Dicas, Backup, Configurações e Sobre.
- Ícone Android reaproveitado do projeto original.
- GitHub Actions para gerar APK debug.

## Próximas etapas
Persistência local nativa, CRUD completo de equipamentos, demais verificações, Planejamento, Calculadora, Diário, Pontos, Manual da Bike, Dicas, backup/importação e configurações.


## Build GitHub
O workflow publica somente `Nomade-Raiz.apk` como asset de uma GitHub Release. Não usa `upload-artifact`, portanto não cria pacote ZIP de artifact.


## Estado da migração 1.0.30-kotlin-alpha.4
Equipamentos, checklists e diário já possuem fluxo funcional e persistência local. Planejamento e Calculadora começaram a receber as regras reais do aplicativo original.
\n\n## Estado 1.0.30\nPontos de apoio possui CRUD persistente. A Calculadora cobre bicicleta, água, energia, dinheiro, peso e custo da viagem. O workflow publica somente `Nomade-Raiz.apk`.\n