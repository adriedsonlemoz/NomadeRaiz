package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.BuildConfig

@Composable
internal fun AboutScreen(back:()->Unit){
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Sobre","Nômade Raiz ${BuildConfig.VERSION_NAME}")}}
        item{SectionCard("Nômade Raiz"){Text("Planejamento, equipamentos e autonomia para quem vive a estrada sobre duas rodas.");Text("Android nativo • Kotlin • Jetpack Compose",fontWeight=FontWeight.SemiBold)}}
        item{SectionCard("Recursos"){Text("📋 Equipamentos e checklists");Text("🧭 Planejamento de viagem");Text("🧮 Calculadoras de autonomia");Text("📓 Diário de campo");Text("📍 Pontos de apoio");Text("🚲 Manual da bicicleta");Text("🔔 Alertas de reposição");Text("💾 Backup completo")}}
        item{SectionCard("Versão"){Text("versionName: ${BuildConfig.VERSION_NAME}");Text("versionCode: ${BuildConfig.VERSION_CODE}");Text("applicationId: ${BuildConfig.APPLICATION_ID}",fontSize=12.sp)}}
        item{SectionCard("Migração Kotlin"){Text("Esta versão preserva dados e regras do aplicativo original enquanto substitui a base web por Android nativo.",fontSize=13.sp)}}
    }
}
