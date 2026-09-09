package com.nomaderaiz.app.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.AppRepository
import com.nomaderaiz.app.data.checkModes
import com.nomaderaiz.app.data.persistentCheckModes

@Composable
internal fun VerifyScreen(repo:AppRepository,initialMode:String,onModeChanged:(String)->Unit,back:()->Unit){
    var mode by remember(initialMode){mutableStateOf(checkModes.firstOrNull{it.id==initialMode}?:checkModes.first())}
    var checks by remember(mode.id){mutableStateOf(repo.loadChecks(mode.id))}
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Verificar",mode.description)}}
        item{Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(5.dp)){checkModes.forEach{m->FilterChip(selected=mode.id==m.id,onClick={mode=m;onModeChanged(m.id)},label={Text("${m.icon} ${m.label}")})}}}
        items(mode.items,key={it.id}){definition->
            Card(Modifier.fillMaxWidth()){
                Row(Modifier.padding(10.dp),verticalAlignment=Alignment.CenterVertically){
                    Checkbox(checked=checks[definition.id]==true,onCheckedChange={checked->checks=checks+(definition.id to checked);repo.saveChecks(mode.id,checks)})
                    Column{Text(definition.text);if(definition.tip.isNotBlank())Text(definition.tip,fontSize=11.sp)}
                }
            }
        }
        item{Text(if(mode.id in persistentCheckModes)"Esta checagem fica salva." else "Esta checagem é temporária e será limpa ao sair.",fontSize=11.sp)}
        item{androidx.compose.material3.TextButton(onClick={checks=emptyMap();repo.saveChecks(mode.id,checks)}){Text("LIMPAR CHECAGEM")}}
    }
}
