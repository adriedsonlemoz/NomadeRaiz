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
                Text("• O Planejar por rotas foi mantido funcional e a validação Android 15 foi ajustada para navegar corretamente pelos itens virtuais da LazyColumn.")
                Text("• Recursos opcionais e rotas fora da área visível agora são alcançados pelos testes através do contêiner rolável, sem alterar a interface do usuário.")
                Text("• O Planejar agora mostra os itens da cicloviagem dentro dos detalhes da rota, com status e custo de referência.")
                Text("• O catálogo recebeu preços econômicos de referência para power bank, bomba, câmaras, ferramentas, iluminação, painel solar e itens de acampamento.")
                Text("• Foram adicionados ESP32-CAM, câmera de ação, ESP32 DevKit, sensor Hall e sensor de temperatura para o conjunto tecnológico da bike.")
                Text("• Inventários antigos são enriquecidos sem apagar quantidade, status, prioridade ou preços já informados pelo usuário.")
                Text("• Os preços pesquisados são apenas referência e podem variar por vendedor, frete, cupom e especificação.")
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
