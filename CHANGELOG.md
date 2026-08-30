# Changelog

## 1.0.29-kotlin-alpha.3
- Equipamentos agora usa os 20 itens-base reais da versão 1.0.26 e permite marcar itens adquiridos com persistência local.
- Verificar agora contém os cinco modos reais: Antes de sair, Chuva, Noite, Bike e Emergência.
- Planejamento recebeu tipo de viagem, destino, duração, pessoas e reserva financeira conforme regras do projeto antigo.
- Calculadora recebeu cálculos reais de bicicleta, água e dinheiro.
- Diário de Campo agora permite cadastrar, listar e excluir registros persistidos.
- Pontos de Apoio agora permite cadastro offline, listagem e exclusão persistida.
- Mantido workflow que publica somente Nomade-Raiz.apk na GitHub Release.

## 1.0.28-kotlin-alpha.2
- Corrigido build do GitHub Actions.
- Java e Kotlin agora usam JVM 17 de forma consistente.
- Adicionado JVM Toolchain 17 ao módulo Android.
- Mantido o workflow com Java 17 e Gradle 8.11.1.

## 1.0.27-kotlin-alpha.1
- Iniciada conversão para Kotlin nativo + Jetpack Compose.
- Criada nova fundação Android sem React/Capacitor.
- Migradas Home, categorias de Equipamentos e checklist inicial.
- Adicionada navegação nativa e identidade visual inicial.
- Adicionado workflow GitHub Actions para APK debug.
