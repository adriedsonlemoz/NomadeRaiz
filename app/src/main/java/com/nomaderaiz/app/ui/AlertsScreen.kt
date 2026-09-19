package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*

@Composable
internal fun AlertsScreen(equipment:List<EquipmentItem>,minimums:Map<String,Int>,save:(Map<String,Int>)->Unit,back:()->Unit){
    var editing by rememberSaveable{mutableStateOf<String?>(null)}
    var editValue by rememberSaveable{mutableStateOf("")}
    fun owned(item:EquipmentItem)=if(item.status==ItemStatus.COMPRADO)item.quantity else 0
    val stock=remember(equipment,minimums){stockStatus(equipment,minimums)}
    val suggested=remember(equipment,minimums){suggestedMinimums.filterKeys{id->equipment.any{it.id==id}&&minimums[id]==null}}
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),verticalArrangement=Arrangement.spacedBy(8.dp)
    ){
        item{ScreenHeader("Alertas","Estoque e mínimos para seguir viagem",back)}
        item{SectionLabel("Alertas ativos")}
        if(stock.monitoredCount==0){
            item{SectionCard("Nenhum mínimo configurado",Icons.Outlined.Info){Text("Defina os mínimos abaixo para acompanhar o que falta. Zero desativa o acompanhamento daquele item.",fontSize=13.sp)}}
        }else if(stock.belowMinimum.isEmpty()){
            item{SectionCard("Tudo dentro do mínimo",Icons.Outlined.CheckCircle){Text("${stock.monitoredCount} itens monitorados estão com estoque suficiente.",fontSize=13.sp)}}
        }else{
            items(stock.belowMinimum,key={"active-${it.id}"}){item->
                Card(Modifier.fillMaxWidth(),colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.errorContainer)){
                    Row(Modifier.padding(10.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)){
                        Icon(Icons.Outlined.WarningAmber,null,tint=MaterialTheme.colorScheme.error)
                        Column(Modifier.weight(1f)){
                            Text(item.name,fontWeight=FontWeight.Bold)
                            Text("${owned(item)} disponível • mínimo ${minimums[item.id]}",fontSize=12.sp)
                        }
                        Text("Repor",fontSize=12.sp,fontWeight=FontWeight.Bold)
                    }
                }
            }
        }
        item{SectionLabel("Estoque monitorado",Modifier.padding(top=4.dp))}
        item{OutlinedButton(onClick={save(minimums+suggested)},enabled=suggested.isNotEmpty(),modifier=Modifier.fillMaxWidth()){
            Icon(Icons.Outlined.Lightbulb,null);Spacer(Modifier.width(6.dp));Text(if(suggested.isEmpty())"MÍNIMOS SUGERIDOS JÁ DEFINIDOS" else "APLICAR MÍNIMOS SUGERIDOS")
        }}
        items(equipment,key={it.id}){item->
            val min=minimums[item.id]
            val below=(min?:0)>0&&owned(item)<(min?:0)
            Card(Modifier.fillMaxWidth()){
                Row(Modifier.padding(horizontal=12.dp,vertical=6.dp),verticalAlignment=Alignment.CenterVertically){
                    Column(Modifier.weight(1f)){
                        Text(item.name,fontWeight=FontWeight.SemiBold)
                        Text("Disponível: ${owned(item)}${if(item.status==ItemStatus.PENDENTE&&item.quantity>0)" • planejado: ${item.quantity}" else ""}",fontSize=12.sp,color=if(below)MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    TextButton(onClick={editing=item.id;editValue=min?.toString().orEmpty()}){Text(if((min?:0)==0)"Definir" else "Mín. $min")}
                }
            }
        }
    }
    equipment.firstOrNull{it.id==editing}?.let{item->
        AlertDialog(
            onDismissRequest={editing=null},title={Text("Mínimo: ${item.name}")},
            text={NumericField(editValue,{editValue=it},"Quantidade mínima",whole=true,helper="Zero desativa o alerta deste item.")},
            confirmButton={TextButton(enabled=editValue.wholeNumberOrNull()!=null,onClick={
                editValue.wholeNumberOrNull()?.let{save(minimums+(item.id to it));editing=null}
            }){Text("SALVAR")}},dismissButton={TextButton(onClick={editing=null}){Text("CANCELAR")}}
        )
    }
}
