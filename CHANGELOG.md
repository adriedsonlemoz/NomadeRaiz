# Changelog\n\n## 1.0.30-kotlin-alpha.4\n- Pontos de apoio funcional: cadastro, edição, exclusão, tipo, localização, observações, avaliação e aberto/fechado.\n- Persistência local dos pontos.\n- Calculadora ampliada: bicicleta, água, energia, dinheiro, peso e custo da viagem.\n- GitHub Actions publica somente `Nomade-Raiz.apk` na Release.\n\n# 1.0.29-kotlin-alpha.3

- Equipamentos agora possuem dados reais, categorias, edição, exclusão, status e persistência local.
- Checklists completos dos cinco modos do app original com persistência.
- Diário funcional com criação, listagem, exclusão e persistência.
- Planejamento recebeu cálculos reais de bicicleta e água.
- Calculadora recebeu cálculos funcionais iniciais.
- Home usa estatísticas reais dos equipamentos.
- Workflow ajustado para publicar somente o arquivo Nomade-Raiz.apk na Release.

# Changelog

## 1.0.31-kotlin-alpha.4-fix1
- Corrigida compilação Kotlin/Compose da tela Calculadora/Pontos de apoio.
- Corrigida rota de Pontos de apoio no menu Mais.
- Mantida publicação de somente `Nomade-Raiz.apk` na Release.

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
