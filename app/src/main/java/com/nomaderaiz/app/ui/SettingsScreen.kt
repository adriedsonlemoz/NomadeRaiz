package com.nomaderaiz.app.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import com.nomaderaiz.app.data.AppAccent
import com.nomaderaiz.app.data.AppSettings
import com.nomaderaiz.app.data.FontScale
import com.nomaderaiz.app.data.ThemeMode

@Composable
internal fun SettingsScreen(settings:AppSettings,itemCount:Int,journalCount:Int,pointCount:Int,save:(AppSettings)->Unit,clearAll:()->Unit,back:()->Unit){
    var confirmClear by remember{mutableStateOf(false)}
    var confirmReset by remember{mutableStateOf(false)}
    val days=settings.startDate?.let{((System.currentTimeMillis()-it)/(24*60*60*1000L)).toInt()+1}?:0

    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Configurações")}}
        item{
            SectionCard("Aparência"){
                Row(verticalAlignment=Alignment.CenterVertically){Text("Modo escuro",Modifier.weight(1f));Switch(checked=settings.themeMode==ThemeMode.DARK,onCheckedChange={save(settings.copy(themeMode=if(it)ThemeMode.DARK else ThemeMode.LIGHT))})}
                Text("Cor do aplicativo",fontWeight=FontWeight.SemiBold)
                Text("Altera botões, seleção, navegação e destaques.",fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    AppAccent.entries.forEach{accent->
                        FilterChip(
                            selected=settings.accent==accent,
                            onClick={save(settings.copy(accent=accent))},
                            label={Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(5.dp)){Text("●",color=Color(accent.hex),fontSize=20.sp);Text(accent.label)}}
                        )
                    }
                }
                Text("Tamanho da fonte",fontWeight=FontWeight.SemiBold)
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    FontScale.entries.forEach{scale->FilterChip(selected=settings.fontScale==scale,onClick={save(settings.copy(fontScale=scale))},label={Text(when(scale){FontScale.SM->"A pequeno";FontScale.MD->"A médio";FontScale.LG->"A grande"})})}
                }
                OutlinedButton(onClick={save(settings.copy(themeMode=ThemeMode.DARK,fontScale=FontScale.MD,accent=AppAccent.RAIZ))},modifier=Modifier.fillMaxWidth()){Text("RESTAURAR APARÊNCIA PADRÃO")}
            }
        }
        item{SectionCard("Viagem"){Text("Dias na estrada: ${if(days>0)days else "—"}",fontWeight=FontWeight.Bold);Button(onClick={if(settings.startDate!=null)confirmReset=true else save(settings.copy(startDate=System.currentTimeMillis()))},modifier=Modifier.fillMaxWidth()){Text(if(settings.startDate!=null)"🔄 Reiniciar viagem" else "🚀 Iniciar viagem")};if(settings.startDate!=null)OutlinedButton(onClick={save(settings.copy(startDate=null))},modifier=Modifier.fillMaxWidth()){Text("Zerar contador")}}}
        item{SectionCard("Dados"){Text("Itens no inventário: $itemCount");Text("Entradas no diário: $journalCount");Text("Pontos de apoio: $pointCount");Button(onClick={confirmClear=true},modifier=Modifier.fillMaxWidth(),colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.error)){Text("🗑️ Apagar todos os dados")}}}
    }

    if(confirmClear)AlertDialog(onDismissRequest={confirmClear=false},title={Text("Apagar todos os dados?")},text={Text("Isso apagará inventário, checklists, diário, pontos, configurações, nota rápida e favoritos salvos neste dispositivo.")},confirmButton={Button(onClick={confirmClear=false;clearAll()},colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.error)){Text("APAGAR")}},dismissButton={TextButton(onClick={confirmClear=false}){Text("CANCELAR")}})
    if(confirmReset)AlertDialog(onDismissRequest={confirmReset=false},title={Text("Reiniciar viagem?")},text={Text("Isso vai resetar o contador de dias.")},confirmButton={Button(onClick={confirmReset=false;save(settings.copy(startDate=System.currentTimeMillis()))}){Text("REINICIAR")}},dismissButton={TextButton(onClick={confirmReset=false}){Text("CANCELAR")}})
}
