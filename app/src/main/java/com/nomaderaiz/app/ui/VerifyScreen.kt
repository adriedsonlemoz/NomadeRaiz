package com.nomaderaiz.app.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
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
import com.nomaderaiz.app.R
import com.nomaderaiz.app.data.AppRepository
import com.nomaderaiz.app.data.checkModes
import com.nomaderaiz.app.data.persistentCheckModes

@Composable
internal fun VerifyScreen(repo:AppRepository,initialMode:String,onModeChanged:(String)->Unit,back:()->Unit){
    var mode by remember(initialMode){mutableStateOf(checkModes.firstOrNull{it.id==initialMode}?:checkModes.first())}
    var checks by remember(mode.id){mutableStateOf(repo.loadChecks(mode.id))}
    val completed=mode.items.count{checks[it.id]==true}
    val percent=if(mode.items.isEmpty())0 else completed*100/mode.items.size
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),
        verticalArrangement=Arrangement.spacedBy(8.dp)
    ){
        item{ScreenHeader("Verificar",mode.label,back)}
        item{
            HeroCard(R.drawable.nr_fundo_montanhas_escuro,height=155.dp){
                Row(Modifier.align(Alignment.Center).fillMaxWidth().padding(16.dp),verticalAlignment=Alignment.CenterVertically){
                    Icon(Icons.Default.VerifiedUser,contentDescription=null,tint=MaterialTheme.colorScheme.primary,modifier=Modifier.padding(end=12.dp))
                    Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(4.dp)){
                        Text("Sua segurança começa na verificação.",fontWeight=FontWeight.Black,color=Color.White)
                        Text("$completed de ${mode.items.size} itens verificados",fontSize=12.sp,color=Color.White.copy(alpha=.82f))
                        androidx.compose.material3.LinearProgressIndicator(progress={percent/100f},modifier=Modifier.fillMaxWidth())
                    }
                    Text("$percent%",fontWeight=FontWeight.Black,color=Color.White,modifier=Modifier.padding(start=10.dp))
                }
            }
        }
        item{Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(5.dp)){checkModes.forEach{m->FilterChip(selected=mode.id==m.id,onClick={mode=m;onModeChanged(m.id)},label={Text("${m.icon} ${m.label}")})}}}
        item{SectionLabel("Checklist")}
        items(mode.items,key={it.id}){definition->
            Card(Modifier.fillMaxWidth()){
                Row(Modifier.padding(10.dp),verticalAlignment=Alignment.CenterVertically){
                    Checkbox(checked=checks[definition.id]==true,onCheckedChange={checked->checks=checks+(definition.id to checked);repo.saveChecks(mode.id,checks)})
                    Column{Text(definition.text);if(definition.tip.isNotBlank())Text(definition.tip,fontSize=12.sp)}
                }
            }
        }
        item{Text(if(mode.id in persistentCheckModes)"Esta checagem fica salva." else "Esta checagem é temporária e será limpa ao sair.",fontSize=12.sp)}
        item{androidx.compose.material3.TextButton(onClick={checks=emptyMap();repo.saveChecks(mode.id,checks)}){Text("LIMPAR CHECAGEM")}}
    }
}
