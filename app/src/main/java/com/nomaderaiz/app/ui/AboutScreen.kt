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
                Text("• Planejamento reformulado como assistente de viagem, com destino, distância, velocidade média e horas de pedal por dia.")
                Text("• Estimativa instantânea de km/dia, horas totais, dias de viagem e duração do último dia.")
                Text("• Cenários de ritmo comparáveis e margem de segurança de 0%, 10% ou 20%.")
                Text("• Data de saída opcional com previsão da data de chegada.")
                Text("• Alimentação, água e energia calculadas diretamente para a duração estimada.")
                Text("• Controles detalhados antigos continuam disponíveis numa seção opcional, preservando dados anteriores.")
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
