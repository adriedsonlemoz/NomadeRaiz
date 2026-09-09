package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.AppRepository
import com.nomaderaiz.app.data.SupportPoint

private val supportTypes=listOf(
    "agua" to "💧 Água",
    "mercado" to "🛒 Mercado",
    "camping" to "⛺ Camping",
    "saude" to "🏥 Saúde",
    "oficina" to "🔧 Oficina",
    "outro" to "📍 Outro"
)

@Composable
internal fun PointsScreen(points:List<SupportPoint>,save:(List<SupportPoint>)->Unit,repo:AppRepository,back:()->Unit){
    var editing by remember{mutableStateOf<SupportPoint?>(null)}
    var adding by remember{mutableStateOf<SupportPoint?>(null)}
    var deleting by remember{mutableStateOf<SupportPoint?>(null)}
    var typeFilter by remember{mutableStateOf<String?>(null)}
    val visiblePoints=remember(points,typeFilter){typeFilter?.let{type->points.filter{it.tipo==type}}?:points}

    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Pontos de apoio","Referências úteis da rota")}}
        item{
            Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(5.dp)){
                FilterChip(selected=typeFilter==null,onClick={typeFilter=null},label={Text("Todos")})
                supportTypes.forEach{type->
                    FilterChip(selected=typeFilter==type.first,onClick={typeFilter=if(typeFilter==type.first)null else type.first},label={Text(type.second)})
                }
            }
        }
        item{Button(onClick={adding=SupportPoint(repo.id(),"agua","","","",2,false)},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Text(" NOVO PONTO")}}
        if(visiblePoints.isEmpty())item{Card(Modifier.fillMaxWidth()){Text(if(points.isEmpty())"Nenhum ponto cadastrado." else "Nenhum ponto neste filtro.",Modifier.padding(18.dp))}}
        items(visiblePoints,key={it.id}){point->
            Card(Modifier.fillMaxWidth().clickable{editing=point}){
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.Top){
                    Text(supportTypes.firstOrNull{it.first==point.tipo}?.second?.substringBefore(" ")?:"📍",fontSize=24.sp)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)){
                        Row{Text(point.nome,fontWeight=FontWeight.Bold);if(point.fechado)Text(" • Fechado",color=MaterialTheme.colorScheme.error,fontSize=11.sp)}
                        if(point.referencia.isNotBlank())Text("📌 ${point.referencia}",fontSize=12.sp)
                        if(point.obs.isNotBlank())Text(point.obs,fontSize=12.sp)
                        Text("⭐".repeat(point.avaliacao),fontSize=12.sp)
                    }
                    IconButton(onClick={deleting=point}){Icon(Icons.Default.Delete,"Excluir")}
                }
            }
        }
    }

    adding?.let{draft->PointDialog(draft,{adding=null}){save(points+it);adding=null}}
    editing?.let{old->PointDialog(old,{editing=null}){new->save(points.map{if(it.id==new.id)new else it});editing=null}}
    deleting?.let{point->
        AlertDialog(
            onDismissRequest={deleting=null},
            title={Text("Excluir ponto de apoio?")},
            text={Text("O ponto “${point.nome}” será removido.")},
            confirmButton={Button(onClick={save(points.filterNot{it.id==point.id});deleting=null}){Text("EXCLUIR")}},
            dismissButton={TextButton(onClick={deleting=null}){Text("CANCELAR")}}
        )
    }
}

@Composable
private fun PointDialog(point:SupportPoint,dismiss:()->Unit,done:(SupportPoint)->Unit){
    var type by remember(point.id){mutableStateOf(point.tipo)}
    var name by remember(point.id){mutableStateOf(point.nome)}
    var reference by remember(point.id){mutableStateOf(point.referencia)}
    var note by remember(point.id){mutableStateOf(point.obs)}
    var rating by remember(point.id){mutableIntStateOf(point.avaliacao)}
    var closed by remember(point.id){mutableStateOf(point.fechado)}
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button(onClick={done(point.copy(tipo=type,nome=name.trim(),referencia=reference,obs=note,avaliacao=rating,fechado=closed))},enabled=name.isNotBlank()){Text("SALVAR")}},
        dismissButton={TextButton(dismiss){Text("CANCELAR")}},
        title={Text(if(point.nome.isBlank())"Novo ponto" else "Editar ponto")},
        text={LazyColumn(verticalArrangement=Arrangement.spacedBy(7.dp)){
            item{Row(Modifier.horizontalScroll(rememberScrollState())){supportTypes.forEach{entry->FilterChip(selected=type==entry.first,onClick={type=entry.first},label={Text(entry.second)},modifier=Modifier.padding(end=4.dp))}}}
            item{OutlinedTextField(name,{name=it},label={Text("Nome / descrição")},modifier=Modifier.fillMaxWidth())}
            item{OutlinedTextField(reference,{reference=it},label={Text("Referência de localização")},modifier=Modifier.fillMaxWidth())}
            item{OutlinedTextField(note,{note=it},label={Text("Observações")},modifier=Modifier.fillMaxWidth())}
            item{Row(verticalAlignment=Alignment.CenterVertically){Text("Avaliação: ");(1..3).forEach{n->FilterChip(selected=rating>=n,onClick={rating=n},label={Text("⭐")},modifier=Modifier.padding(end=4.dp))}}}
            item{Row(verticalAlignment=Alignment.CenterVertically){Switch(checked=closed,onCheckedChange={closed=it});Text(if(closed)" Fechado" else " Aberto")}}
        }}
    )
}
