package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Badge
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal data class MoreMenuEntry(
    val destination: Screen,
    val icon: String,
    val title: String,
    val description: String
)

internal val moreMenuEntries = listOf(
    MoreMenuEntry(Screen.Planning,"🧭","Planejamento da Viagem","Veja se você já está pronto para partir"),
    MoreMenuEntry(Screen.Manual,"🚲","Manual da Bike","Peças, manutenção e problemas na estrada"),
    MoreMenuEntry(Screen.Calculator,"🧮","Calculadora de Autonomia","Planeje orçamento e dias na estrada"),
    MoreMenuEntry(Screen.Points,"📍","Pontos de Apoio","Água, mercados, campings offline"),
    MoreMenuEntry(Screen.Alerts,"🔔","Alertas de Reposição","Defina mínimos de estoque"),
    MoreMenuEntry(Screen.Backup,"📤","Exportar / Backup","Copie listas ou restaure seu backup JSON"),
    MoreMenuEntry(Screen.Tips,"🧠","Dicas de Sobrevivência","Autonomia, segurança e recursos"),
    MoreMenuEntry(Screen.Settings,"⚙️","Configurações","Tema, fonte, viagem e dados"),
    MoreMenuEntry(Screen.About,"ℹ️","Sobre o App","Propósito, versão e informações do projeto")
)

/**
 * Menu deliberadamente leve. Cada módulo vive em seu próprio arquivo/classe,
 * portanto abrir Mais não carrega nem verifica todas as ferramentas de uma vez.
 */
@Composable
internal fun MoreScreen(modifier:Modifier,alertCount:Int,open:(Screen)->Unit){
    LazyColumn(
        modifier.fillMaxSize().padding(16.dp),
        verticalArrangement=Arrangement.spacedBy(8.dp)
    ){
        item{Header("Mais","Ferramentas do Nômade Raiz")}
        items(moreMenuEntries,key={it.destination}){entry->
            val description=if(entry.destination==Screen.Alerts&&alertCount>0){
                "⚠️ $alertCount ${if(alertCount==1)"item abaixo" else "itens abaixo"} do mínimo"
            }else entry.description
            Card(Modifier.fillMaxWidth().clickable{open(entry.destination)}){
                Row(
                    Modifier.fillMaxWidth().padding(horizontal=14.dp,vertical=12.dp),
                    verticalAlignment=Alignment.CenterVertically
                ){
                    Text(entry.icon,fontSize=24.sp,modifier=Modifier.width(38.dp))
                    Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(2.dp)){
                        Text(entry.title,fontWeight=FontWeight.Bold)
                        Text(description,fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    if(entry.destination==Screen.Alerts&&alertCount>0){
                        Badge(Modifier.padding(horizontal=8.dp)){Text(alertCount.toString())}
                    }
                    Icon(Icons.Default.ChevronRight,contentDescription="Abrir ${entry.title}",modifier=Modifier.size(20.dp))
                }
            }
        }
    }
}
