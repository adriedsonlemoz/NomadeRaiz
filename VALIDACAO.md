# Validação — 1.0.59-kotlin-alpha.32

Base utilizada: `Nomade-Raiz-Kotlin-v1.0.58-alpha.31`. Fonte principal da versão: `app/build.gradle.kts`; `versionCode`: `100059`.

## Erro encontrado no GitHub Actions

Foi analisado `Android-Kotlin-APK-31-logs.zip`. A execução referente à `1.0.58-kotlin-alpha.31` foi interrompida na etapa **Verify GitHub Manager metadata**.

Mensagem real do workflow:

```text
CHANGELOG.md está fora de sincronia com app/build.gradle.kts.
Process completed with exit code 1.
```

A causa era objetiva: `app/build.gradle.kts`, `github-manager.json` e README já estavam em `1.0.58-kotlin-alpha.31` / `100058`, enquanto o primeiro cabeçalho de versão do `CHANGELOG.md` ainda era `1.0.57-kotlin-alpha.30`. O script de verificação exige que a primeira versão do CHANGELOG seja exatamente a versão definida no Gradle e bloqueou corretamente a Release.

## Correção aplicada

- Adicionado o histórico que faltava para `1.0.58-kotlin-alpha.31`.
- Adicionada a entrada desta correção, `1.0.59-kotlin-alpha.32`.
- Incrementados `versionName` e `versionCode` para `1.0.59-kotlin-alpha.32` / `100059`.
- Sincronizados `github-manager.json`, README, CHANGELOG, VALIDACAO e a versão exibida pela tela Sobre via `BuildConfig`.
- Nenhuma lógica do Planejar, equipamentos, persistência, identidade do aplicativo ou módulo Backup foi alterada.

## Resultado real do log anterior

A execução anterior **não chegou** a executar testes unitários, compilação do APK ou testes instrumentados Android 15, pois falhou antes deles na checagem de metadados. Portanto não há resultado de build/testes a declarar para a `1.0.58-kotlin-alpha.31` nesse log.

## Validações executadas nesta correção

- `python3 scripts/sync-github-manager.py` para regenerar `github-manager.json` a partir de `app/build.gradle.kts`.
- `python3 scripts/sync-github-manager.py --check`: **PASSOU**.
- Verificação de que o primeiro cabeçalho do CHANGELOG é `1.0.59-kotlin-alpha.32`: **PASSOU**.
- Verificação de integridade do ZIP final: **PASSOU**.

## Validação ainda necessária

A nova `1.0.59-kotlin-alpha.32` ainda precisa passar pelo GitHub Actions para confirmar testes unitários, compilação do APK e testes instrumentados Android 15. A Release continua bloqueada automaticamente se qualquer uma dessas etapas falhar.
