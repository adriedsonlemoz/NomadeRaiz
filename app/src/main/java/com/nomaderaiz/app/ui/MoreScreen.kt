package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.ui.draw.alpha
import androidx.compose.material3.Badge
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.testTag
import com.nomaderaiz.app.R

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
    Box(modifier.fillMaxSize()){
        Image(
            painter=painterResource(R.drawable.nr_fundo_montanhas_escuro),
            contentDescription=null,
            contentScale=ContentScale.Crop,
            alignment=Alignment.BottomCenter,
            modifier=Modifier.fillMaxSize().alpha(.34f)
        )
        LazyVerticalGrid(
            modifier=Modifier.testTag("more-grid"),
            columns=GridCells.Fixed(3),
            contentPadding=PaddingValues(start=14.dp,end=14.dp,top=6.dp,bottom=24.dp),
            horizontalArrangement=Arrangement.spacedBy(8.dp),
            verticalArrangement=Arrangement.spacedBy(8.dp)
        ){
            item(span={GridItemSpan(maxLineSpan)}){
                ScreenHeader("Mais","Todas as ferramentas da sua cicloviagem")
            }
            items(moreMenuEntries,key={it.destination}){entry->
                Card(
                    Modifier.fillMaxWidth().heightIn(min=118.dp).testTag("more-${entry.destination.name}").clickable{open(entry.destination)},
                    colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.90f))
                ){
                    Box(Modifier.fillMaxWidth().heightIn(min=118.dp).padding(9.dp)){
                        Column(
                            Modifier.align(Alignment.Center),
                            horizontalAlignment=Alignment.CenterHorizontally,
                            verticalArrangement=Arrangement.spacedBy(7.dp)
                        ){
                            if(entry.destination==Screen.Backup)Text(entry.icon,fontSize=27.sp)
                            else Icon(destinationIcon(entry.destination),null,Modifier.size(27.dp),tint=MaterialTheme.colorScheme.primary)
                            Text(
                                entry.title.replace(" da Viagem","").replace(" de Autonomia","").replace(" de Reposição",""),
                                fontSize=12.sp,
                                lineHeight=15.sp,
                                fontWeight=FontWeight.Bold,
                                textAlign=androidx.compose.ui.text.style.TextAlign.Center,
                                maxLines=3
                            )
                        }
                        if(entry.destination==Screen.Alerts&&alertCount>0){
                            Badge(Modifier.align(Alignment.TopEnd)){Text(alertCount.toString())}
                        }
                    }
                }
            }
        }
    }
}
