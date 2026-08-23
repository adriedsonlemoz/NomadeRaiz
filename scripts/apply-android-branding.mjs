import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
const source = path.join(root, 'resources', 'android');
if (!fs.existsSync(androidRes)) throw new Error('Pasta android/app/src/main/res não encontrada. Execute npx cap add android antes do branding.');
if (!fs.existsSync(source)) throw new Error('Assets Android da marca não encontrados em resources/android.');
const densities = ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi'];
const files = ['ic_launcher.png','ic_launcher_round.png','ic_launcher_foreground.png'];
for (const density of densities) {
  const srcDir = path.join(source, `mipmap-${density}`);
  const dstDir = path.join(androidRes, `mipmap-${density}`);
  fs.mkdirSync(dstDir, { recursive: true });
  for (const file of files) {
    const src = path.join(srcDir, file);
    if (!fs.existsSync(src)) throw new Error(`Asset Android ausente: ${src}`);
    fs.copyFileSync(src, path.join(dstDir, file));
  }
}
const valuesDir = path.join(androidRes, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#F3E6C8</color>\n</resources>\n');


// Sincroniza a versão interna do APK com o package.json. O Capacitor recria
// app/build.gradle com versionName "1.0" e versionCode 1 a cada build limpo.
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const appVersion = packageJson.version;
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(appVersion);
if (!match) throw new Error(`Versão inválida no package.json: ${appVersion}. Use major.minor.patch.`);
const [, majorRaw, minorRaw, patchRaw] = match;
const major = Number(majorRaw);
const minor = Number(minorRaw);
const patch = Number(patchRaw);
if (minor > 999 || patch > 999) throw new Error(`Versão ${appVersion} excede o limite suportado para versionCode.`);
const androidVersionCode = major * 1_000_000 + minor * 1_000 + patch;

const appBuildGradle = path.join(root, 'android', 'app', 'build.gradle');
if (!fs.existsSync(appBuildGradle)) throw new Error('android/app/build.gradle não encontrado para sincronizar a versão.');
let gradle = fs.readFileSync(appBuildGradle, 'utf8');
if (!/versionName\s+["'][^"']+["']/.test(gradle) || !/versionCode\s+\d+/.test(gradle)) {
  throw new Error('Não foi possível localizar versionName/versionCode em android/app/build.gradle.');
}
gradle = gradle
  .replace(/versionName\s+["'][^"']+["']/, `versionName "${appVersion}"`)
  .replace(/versionCode\s+\d+/, `versionCode ${androidVersionCode}`);
fs.writeFileSync(appBuildGradle, gradle);

// Mantém a experiência realmente imersiva no APK. A pasta Android é recriada
// pelo workflow, por isso o MainActivity precisa ser reaplicado nesta etapa.
const mainActivity = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'nomade', 'checklist', 'MainActivity.java');
fs.mkdirSync(path.dirname(mainActivity), { recursive: true });
fs.writeFileSync(mainActivity, `package com.nomade.checklist;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enableImmersiveMode();
    }

    @Override
    protected void onResume() {
        super.onResume();
        enableImmersiveMode();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enableImmersiveMode();
    }

    private void enableImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }
}
`);

console.log(`Branding Android aplicado: launcher, round, foreground adaptativo, modo imersivo e versão ${appVersion} (${androidVersionCode}).`);
