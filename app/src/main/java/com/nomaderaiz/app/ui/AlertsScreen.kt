package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import com.nomaderaiz.app.data.EquipmentItem
import com.nomaderaiz.app.data.ItemStatus
import com.nomaderaiz.app.data.suggestedMinimums

@Composable
internal fun AlertsScreen(equipment:List<EquipmentItem>,minimums:Map<String,Int>,save:(Map<String,Int>)->Unit,back:()->Unit){
    var editing by remember{mutableStateOf<String?>(null)}
    var editValue by remember{mutableStateOf("")}
    fun owned(item:EquipmentItem)=if(item.status==ItemStatus.COMPRADO)item.quantity else 0
    val alerts=remember(equipment,minimums){equipment.filter{item->minimums[item.id]?.let{owned(item)<it}==true}}
    LazyColumn(Modifier.fillMaxSize().padding(16.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Alertas de Reposição","Estoque e mínimos por item")}}
        item{Card(Modifier.fillMaxWidth()){Column(Modifier.padding(14.dp)){Text(if(alerts.isEmpty())"✅ Tudo dentro do mínimo" else "⚠️ ${alerts.size} ${if(alerts.size==1)"item precisa" else "itens precisam"} de reposição",fontWeight=FontWeight.Bold,color=if(alerts.isEmpty())LocalContentColor.current else MaterialTheme.colorScheme.error);alerts.forEach{Text("${it.name}: ${owned(it)} disponível / mín ${minimums[it.id]}",fontSize=12.sp)}}}}
        item{OutlinedButton(onClick={save(minimums+suggestedMinimums.filterKeys{minimums[it]==null})},modifier=Modifier.fillMaxWidth()){Text("💡 APLICAR MÍNIMOS SUGERIDOS")}}
        items(equipment,key={it.id}){item->
            val min=minimums[item.id]
            val below=min!=null&&owned(item)<min
            Card(Modifier.fillMaxWidth().padding(top=8.dp)){
                Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically){
                    Column(Modifier.weight(1f)){Text(item.name,fontWeight=FontWeight.SemiBold);Text("Disponível: ${owned(item)}${if(item.status==ItemStatus.PENDENTE&&item.quantity>0)" • planejado: ${item.quantity}" else ""}",fontSize=11.sp,color=if(below)MaterialTheme.colorScheme.error else LocalContentColor.current)}
                    if(editing==item.id){
                        OutlinedTextField(editValue,{value->editValue=value.filter{character->character.isDigit()}},modifier=Modifier.width(80.dp),singleLine=true)
                        TextButton(onClick={val n=editValue.toIntOrNull();if(n!=null&&n>=0)save(minimums+(item.id to n));editing=null}){Text("OK")}
                    }else TextButton(onClick={editing=item.id;editValue=(min?:0).toString()}){Text(if(min==null)"+ definir" else "mín $min")}
                }
            }
        }
    }
}
