#!/usr/bin/env python3
import argparse, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
GRADLE=ROOT/'app'/'build.gradle.kts'
META=ROOT/'github-manager.json'
README=ROOT/'README.md'
CHANGELOG=ROOT/'CHANGELOG.md'

def grab(pattern,text,label,source=GRADLE):
    m=re.search(pattern,text)
    if not m: raise SystemExit(f'Não foi possível ler {label} em {source}')
    return m.group(1)

def expected():
    text=GRADLE.read_text(encoding='utf-8')
    version=grab(r'versionName\s*=\s*"([^"]+)"',text,'versionName')
    code=int(grab(r'versionCode\s*=\s*(\d+)',text,'versionCode'))
    app_id=grab(r'applicationId\s*=\s*"([^"]+)"',text,'applicationId')
    namespace=grab(r'namespace\s*=\s*"([^"]+)"',text,'namespace')
    return {
        'name':'Nômade Raiz','version':version,'versionName':version,'versionCode':code,
        'applicationId':app_id,'namespace':namespace,'language':'Kotlin','type':'Android'
    }

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    target=expected()
    if args.check:
        try: current=json.loads(META.read_text(encoding='utf-8'))
        except Exception as exc: raise SystemExit(f'github-manager.json inválido: {exc}')
        if current!=target:
            print('github-manager.json está fora de sincronia com app/build.gradle.kts.')
            print('Esperado:',json.dumps(target,ensure_ascii=False,indent=2))
            raise SystemExit(1)
        readme=README.read_text(encoding='utf-8')
        readme_version=grab(r'\*\*Versão atual:\*\*\s*`([^`]+)`',readme,'versão do README',README)
        readme_code=int(grab(r'\*\*versionCode:\*\*\s*`(\d+)`',readme,'versionCode do README',README))
        if readme_version!=target['versionName'] or readme_code!=target['versionCode']:
            raise SystemExit('README.md está fora de sincronia com app/build.gradle.kts.')
        changelog=CHANGELOG.read_text(encoding='utf-8')
        first_release=grab(r'(?m)^##\s+([^\n]+)',changelog,'versão mais recente do CHANGELOG',CHANGELOG)
        if first_release.strip()!=target['versionName']:
            raise SystemExit('CHANGELOG.md está fora de sincronia com app/build.gradle.kts.')
        print(f'Metadados sincronizados: {target["versionName"]} / {target["versionCode"]}')
        return
    META.write_text(json.dumps(target,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Atualizado: {META} -> {target["versionName"]} / {target["versionCode"]}')

if __name__=='__main__': main()
