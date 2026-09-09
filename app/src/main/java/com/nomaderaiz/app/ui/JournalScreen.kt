package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.AppRepository
import com.nomaderaiz.app.data.JournalEntry
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
internal fun JournalScreen(modifier:Modifier,entries:List<JournalEntry>,save:(List<JournalEntry>)->Unit,repo:AppRepository){
    var add by remember{mutableStateOf(false)}
    var editing by remember{mutableStateOf<JournalEntry?>(null)}
    val totalKm=entries.sumOf{it.km}
    val dateFormat=remember{SimpleDateFormat("dd/MM/yyyy",Locale("pt","BR"))}

    LazyColumn(modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Header("Diário da viagem","Registre e edite os dias da jornada")}
        item{
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){
                JournalStatCard(entries.size.toString(),"registros",Modifier.weight(1f))
                JournalStatCard("%.1f km".format(totalKm),"pedalados",Modifier.weight(1f))
            }
        }
        item{Button(onClick={add=true},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Text(" NOVO REGISTRO")}}
        if(entries.isEmpty())item{Card(Modifier.fillMaxWidth()){Text("Nenhum registro ainda.",Modifier.padding(18.dp))}}
        items(entries,key={it.id}){entry->
            Card(Modifier.fillMaxWidth().clickable{editing=entry}){
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.Top){
                    Column(Modifier.weight(1f)){
                        Text("${entry.clima} ${entry.local}",fontWeight=FontWeight.Bold)
                        Text("${entry.km} km • ${dateFormat.format(Date(entry.createdAt))}",fontSize=11.sp)
                        if(entry.nota.isNotBlank())Text(entry.nota)
                        Text("Toque para editar",fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    IconButton(onClick={save(entries.filterNot{it.id==entry.id})}){Icon(Icons.Default.Delete,"Excluir")}
                }
            }
        }
    }

    if(add)JournalDialog(null,{add=false}){local,weather,km,note->
        save(listOf(JournalEntry(repo.id(),local,weather,km,note,System.currentTimeMillis()))+entries);add=false
    }
    editing?.let{old->JournalDialog(old,{editing=null}){local,weather,km,note->
        val updated=old.copy(local=local,clima=weather,km=km,nota=note)
        save(entries.map{if(it.id==old.id)updated else it});editing=null
    }}
}

@Composable
private fun JournalStatCard(value:String,label:String,modifier:Modifier){
    Card(modifier){Column(Modifier.padding(10.dp),horizontalAlignment=Alignment.CenterHorizontally){Text(value,fontWeight=FontWeight.Bold);Text(label,fontSize=10.sp)}}
}

@Composable
private fun JournalDialog(entry:JournalEntry?,dismiss:()->Unit,done:(String,String,Double,String)->Unit){
    var local by remember(entry?.id){mutableStateOf(entry?.local?:"")}
    var weather by remember(entry?.id){mutableStateOf(entry?.clima?:"☀️")}
    var km by remember(entry?.id){mutableStateOf(entry?.km?.takeIf{it>0}?.toString()?:"")}
    var note by remember(entry?.id){mutableStateOf(entry?.nota?:"")}
    val weathers=listOf("☀️","⛅","☁️","🌧️","⛈️","🌬️")
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button(onClick={done(local.trim(),weather,km.toDoubleOrNull()?.coerceAtLeast(0.0)?:0.0,note)},enabled=local.isNotBlank()){Text("SALVAR")}},
        dismissButton={TextButton(dismiss){Text("CANCELAR")}},
        title={Text(if(entry==null)"Novo registro" else "Editar registro")},
        text={Column(verticalArrangement=Arrangement.spacedBy(8.dp)){
            OutlinedTextField(local,{local=it},label={Text("Local")},modifier=Modifier.fillMaxWidth())
            Row(Modifier.horizontalScroll(rememberScrollState())){weathers.forEach{w->FilterChip(selected=weather==w,onClick={weather=w},label={Text(w)},modifier=Modifier.padding(end=4.dp))}}
            NumericField(km,{km=it},"Km pedalados")
            OutlinedTextField(note,{note=it},label={Text("Nota")},modifier=Modifier.fillMaxWidth(),minLines=3)
        }}
    )
}
