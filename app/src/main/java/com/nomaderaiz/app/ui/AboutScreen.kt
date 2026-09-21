package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.BuildConfig

@Composable
internal fun AboutScreen(back:()->Unit){
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),
        verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item{ScreenHeader("Sobre","Nômade Raiz ${BuildConfig.VERSION_NAME}",back)}
        item{
            SectionCard("Nômade Raiz"){
                Text("Planejamento, equipamentos e autonomia para quem vive a estrada sobre duas rodas.")
                Text("Android nativo • Kotlin • Jetpack Compose",fontWeight=FontWeight.SemiBold)
            }
        }
        item{
            SectionCard("Novidades desta versão"){
                Text("• O Planejamento mudou de estratégia: o estado agora passa por um único redutor, em vez de callbacks paralelos para campos, margem e geração do plano.")
                Text("• A margem 0% / +10% / +20% foi reescrita com botões Material3 comuns e largura fixa, removendo selectable, RadioButton e dependência da semântica Selected que vinha oscilando no Android 15.")
                Text("• A seleção mostra um estado explícito 'Margem atual', e escolhas discretas continuam com persistência imediata; digitação mantém debounce para preservar desempenho.")
                Text("• O antigo teste gigante foi dividido: um teste exclusivo valida a margem e outro valida campos, geração, navegação e recriação da Activity.")
                Text("• O log anterior repetiu o erro funcional 20 esperado / 0 salvo; esta versão ainda precisa da nova execução do GitHub Actions.")
            }
        }
        item{
            SectionCard("Recursos"){
                Text("📋 Equipamentos e checklists")
                Text("🧭 Planejamento inteligente de viagem")
                Text("🧮 Calculadoras de autonomia")
                Text("📓 Diário de campo")
                Text("📍 Pontos de apoio")
                Text("🚲 Manual da bicicleta")
                Text("🔔 Alertas de reposição")
                Text("💾 Backup completo")
            }
        }
        item{
            SectionCard("Versão"){
                Text("versionName: ${BuildConfig.VERSION_NAME}")
                Text("versionCode: ${BuildConfig.VERSION_CODE}")
                Text("applicationId: ${BuildConfig.APPLICATION_ID}",fontSize=12.sp)
            }
        }
        item{SectionCard("Migração Kotlin"){Text("Esta versão preserva dados e regras do aplicativo original enquanto substitui a base web por Android nativo.",fontSize=13.sp)}}
    }
}
