package com.nomaderaiz.app.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.BuildConfig
import com.nomaderaiz.app.data.AppAccent
import com.nomaderaiz.app.data.AppSettings
import com.nomaderaiz.app.data.FontScale
import com.nomaderaiz.app.data.ThemeMode

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun SettingsScreen(settings:AppSettings,itemCount:Int,journalCount:Int,pointCount:Int,save:(AppSettings)->Unit,clearAll:()->Unit,back:()->Unit){
    var confirmClear by remember{mutableStateOf(false)}
    var confirmReset by remember{mutableStateOf(false)}
    val days=settings.startDate?.let{((System.currentTimeMillis()-it)/(24*60*60*1000L)).toInt()+1}?:0

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),
        verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item{ScreenHeader("Configurações","Aparência, viagem e dados",back)}
        item{SectionLabel("Geral")}
        item{
            SectionCard("Aparência"){
                Row(verticalAlignment=Alignment.CenterVertically){Text("Modo escuro",Modifier.weight(1f));Switch(checked=settings.themeMode==ThemeMode.DARK,onCheckedChange={save(settings.copy(themeMode=if(it)ThemeMode.DARK else ThemeMode.LIGHT))})}
                Text("Cor do aplicativo",fontWeight=FontWeight.SemiBold)
                Text("Altera botões, seleção, navegação e destaques.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                AppAccent.entries.chunked(3).forEach{row->
                  Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    row.forEach{accent->
                        FilterChip(
                            modifier=Modifier.weight(1f),
                            selected=settings.accent==accent,
                            onClick={save(settings.copy(accent=accent))},
                            label={Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(4.dp)){Box(Modifier.size(10.dp).background(Color(accent.hex),CircleShape));Text(accent.label,fontSize=12.sp)}}
                        )
                    }
                  }
                }
                Text("Tamanho da fonte",fontWeight=FontWeight.SemiBold)
                FlowRow(horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    FontScale.entries.forEach{scale->FilterChip(selected=settings.fontScale==scale,onClick={save(settings.copy(fontScale=scale))},label={Text(when(scale){FontScale.SM->"A pequeno";FontScale.MD->"A médio";FontScale.LG->"A grande"})})}
                }
                OutlinedButton(onClick={save(settings.copy(themeMode=ThemeMode.DARK,fontScale=FontScale.MD,accent=AppAccent.RAIZ))},modifier=Modifier.fillMaxWidth()){Text("RESTAURAR APARÊNCIA PADRÃO")}
            }
        }
        item{SectionLabel("Viagem")}
        item{SectionCard("Viagem"){Text("Dias na estrada: ${if(days>0)days else "—"}",fontWeight=FontWeight.Bold);Button(onClick={if(settings.startDate!=null)confirmReset=true else save(settings.copy(startDate=System.currentTimeMillis()))},modifier=Modifier.fillMaxWidth()){Text(if(settings.startDate!=null)"Reiniciar viagem" else "Iniciar viagem")};if(settings.startDate!=null)OutlinedButton(onClick={save(settings.copy(startDate=null))},modifier=Modifier.fillMaxWidth()){Text("Zerar contador")}}}
        item{SectionLabel("Dados e segurança")}
        item{SectionCard("Dados"){Text("Itens no inventário: $itemCount");Text("Entradas no diário: $journalCount");Text("Pontos de apoio: $pointCount");Button(onClick={confirmClear=true},modifier=Modifier.fillMaxWidth(),colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.error,contentColor=MaterialTheme.colorScheme.onError)){Text("Apagar todos os dados")}}}
        item{SectionCard("Sobre"){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("Nômade Raiz");Text(BuildConfig.VERSION_NAME,fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)}}}
    }

    if(confirmClear)AlertDialog(onDismissRequest={confirmClear=false},title={Text("Apagar todos os dados?")},text={Text("Isso apagará inventário, checklists, diário, pontos, configurações, nota rápida, favoritos, planejamento e rascunhos salvos neste dispositivo.")},confirmButton={Button(onClick={confirmClear=false;clearAll()},colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.error,contentColor=MaterialTheme.colorScheme.onError)){Text("APAGAR")}},dismissButton={TextButton(onClick={confirmClear=false}){Text("CANCELAR")}})
    if(confirmReset)AlertDialog(onDismissRequest={confirmReset=false},title={Text("Reiniciar viagem?")},text={Text("Isso vai resetar o contador de dias.")},confirmButton={Button(onClick={confirmReset=false;save(settings.copy(startDate=System.currentTimeMillis()))}){Text("REINICIAR")}},dismissButton={TextButton(onClick={confirmReset=false}){Text("CANCELAR")}})
}
