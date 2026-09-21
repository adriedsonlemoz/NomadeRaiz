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
                Text("• O log 28 confirmou que a nova arquitetura da margem funciona no teste dedicado; apenas o fluxo longo com vários campos ainda falhou ao conferir o texto após usar o teclado.")
                Text("• A seleção de margem agora encerra o foco do campo numérico antes de aplicar 0%, +10% ou +20%, reduzindo interferência do IME.")
                Text("• Os testes foram separados por responsabilidade: o teste da margem continua usando toque físico; o teste longo aciona a mesma ação sem depender da janela do teclado e valida estado, persistência e recriação.")
                Text("• Foi adicionada uma verificação imediata do valor persistido no fluxo longo para que uma próxima falha identifique exatamente estado, UI ou restauração.")
                Text("• O GitHub Actions ainda precisa confirmar esta nova execução antes da Release.")
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
