package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*
import kotlin.math.max

private enum class GearFilter { TODOS, PENDENTES, COMPRADOS }
private enum class GearSort { PRIORIDADE, PRECO_ASC, PRECO_DESC }

@Composable
internal fun HomeScreen(
    modifier:Modifier,
    items:List<EquipmentItem>,
    minimums:Map<String,Int>,
    settings:AppSettings,
    quickNote:String,
    onQuickNote:(String)->Unit,
    onVerify:(String)->Unit,
    onGear:()->Unit,
    onPlanning:()->Unit,
    onJournal:()->Unit,
    onCalculator:()->Unit,
    onPoints:()->Unit,
    onTips:()->Unit
){
    val ready=items.count{it.status==ItemStatus.COMPRADO}
    val pct=if(items.isEmpty())0 else ready*100/items.size
    val alerts=items.count{item->minimums[item.id]?.let{min->(if(item.status==ItemStatus.COMPRADO)item.quantity else 0)<min}==true}
    val totalInvestment=items.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val pending=items.count{it.status==ItemStatus.PENDENTE}
    val days=settings.startDate?.let{max(1,((System.currentTimeMillis()-it)/(24*60*60*1000L)).toInt()+1)}?:0
    var noteOpen by remember{mutableStateOf(false)}
    var noteDraft by remember(quickNote){mutableStateOf(quickNote)}

    LazyColumn(modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
        item{
            Row(verticalAlignment=Alignment.CenterVertically){
                Column(Modifier.weight(1f)){Header("NÔMADE RAIZ","Qual é a missão?")}
                if(days>0)AssistChip(onClick={},label={Text("$days dias")})
                IconButton(onClick={onTips}){Icon(Icons.Default.Lightbulb,contentDescription="Dicas")}
                IconButton(onClick={noteOpen=true}){Icon(Icons.Default.EditNote,contentDescription="Nota rápida")}
            }
        }
        item{
            SectionCard("Sua jornada, organizada"){
                Text("Planeje melhor. Pedale mais longe.",fontWeight=FontWeight.Bold)
                Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){
                    Stat("$pct%","inventário",Modifier.weight(1f));Stat("$alerts","alertas",Modifier.weight(1f));Stat(if(days>0)"$days" else "—","dias",Modifier.weight(1f))
                }
                Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    OutlinedButton(onPlanning,Modifier.weight(1f)){Text("🧭 Planejar")}
                    OutlinedButton(onCalculator,Modifier.weight(1f)){Text("📊 Autonomia")}
                }
                OutlinedButton(onPoints,Modifier.fillMaxWidth()){Text("📍 Pontos de apoio")}
                val next=when{alerts>0->"Revise $alerts ${if(alerts==1)"item abaixo" else "itens abaixo"} do estoque mínimo antes de partir.";pending>0->"Você ainda tem $pending ${if(pending==1)"equipamento pendente" else "equipamentos pendentes"} na lista.";else->"Seu inventário não tem alertas críticos. Use o planejamento para revisar a viagem completa."}
                Text("💡 Próximo passo",fontWeight=FontWeight.Bold);Text(next,fontSize=13.sp)
            }
        }
        item{
            SectionCard("Inventário"){
                Text("$ready/${items.size} itens adquiridos • $pct% pronto")
                LinearProgressIndicator(progress={pct/100f},modifier=Modifier.fillMaxWidth())
                Text("Investimento total: ${money(totalInvestment)}",fontWeight=FontWeight.SemiBold)
                Button(onGear,Modifier.fillMaxWidth()){Text("ABRIR EQUIPAMENTOS")}
            }
        }
        item{Text("Verificações rápidas",fontWeight=FontWeight.Bold,fontSize=16.sp)}
        items(checkModes){mode->ActionCard("${mode.icon} ${mode.label}","${mode.items.size} itens • ${mode.description}"){onVerify(mode.id)}}
        item{ActionCard("📖 Diário da viagem","Registre quilômetros, clima, local e notas.",onJournal)}
    }

    if(noteOpen){
        AlertDialog(
            onDismissRequest={noteOpen=false},
            title={Text("Nota rápida")},
            text={OutlinedTextField(value=noteDraft,onValueChange={noteDraft=it},label={Text("Anotação")},modifier=Modifier.fillMaxWidth(),minLines=4)},
            confirmButton={Button(onClick={onQuickNote(noteDraft);noteOpen=false}){Text("SALVAR")}},
            dismissButton={TextButton(onClick={noteDraft=quickNote;noteOpen=false}){Text("CANCELAR")}}
        )
    }
}

@Composable
private fun Stat(value:String,label:String,modifier:Modifier){
    Card(modifier){Column(Modifier.padding(10.dp),horizontalAlignment=Alignment.CenterHorizontally){Text(value,fontWeight=FontWeight.Bold,fontSize=19.sp);Text(label,fontSize=10.sp)}}
}

@Composable
private fun ActionCard(title:String,body:String,onClick:()->Unit){
    Card(Modifier.fillMaxWidth().clickable(onClick=onClick)){
        Row(Modifier.padding(15.dp),verticalAlignment=Alignment.CenterVertically){
            Column(Modifier.weight(1f)){Text(title,fontWeight=FontWeight.Bold);Text(body,fontSize=12.sp)}
            Icon(Icons.Default.ChevronRight,contentDescription=null)
        }
    }
}

@Composable
internal fun EquipmentScreen(modifier:Modifier,equipment:List<EquipmentItem>,save:(List<EquipmentItem>)->Unit,back:()->Unit,repo:AppRepository){
    var categoryId by remember{mutableStateOf<String?>(null)}
    var filter by remember{mutableStateOf(GearFilter.TODOS)}
    var sort by remember{mutableStateOf(GearSort.PRIORIDADE)}
    var editing by remember{mutableStateOf<EquipmentItem?>(null)}
    var add by remember{mutableStateOf(false)}
    val total=equipment.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val bought=equipment.filter{it.status==ItemStatus.COMPRADO}.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val pending=equipment.filter{it.status==ItemStatus.PENDENTE}.sumOf{it.price*it.quantity.coerceAtLeast(0)}

    LazyColumn(modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{
            Row(verticalAlignment=Alignment.CenterVertically){
                IconButton(onClick={if(categoryId==null) back() else categoryId=null}){Icon(Icons.Default.ArrowBack,contentDescription="Voltar")}
                Header(if(categoryId==null)"Equipamentos" else equipmentCategories.firstOrNull{it.id==categoryId}?.label?:"Equipamentos")
            }
        }
        item{
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                Stat(money(total),"Total",Modifier.weight(1f));Stat(money(bought),"Adquirido",Modifier.weight(1f));Stat(money(pending),"Falta",Modifier.weight(1f))
            }
        }
        if(categoryId==null){
            items(equipmentCategories){cat->
                val list=equipment.filter{it.categoryId==cat.id};val ready=list.count{it.status==ItemStatus.COMPRADO}
                Card(Modifier.fillMaxWidth().clickable{categoryId=cat.id}){
                    Row(Modifier.padding(16.dp),verticalAlignment=Alignment.CenterVertically){Text(cat.icon,fontSize=26.sp);Spacer(Modifier.width(12.dp));Text(cat.label,Modifier.weight(1f),fontWeight=FontWeight.Bold);Text("$ready/${list.size}")}
                }
            }
            item{Button(onClick={add=true},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.Add,contentDescription=null);Text(" ADICIONAR ITEM")}}
        }else{
            item{
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    FilterChip(selected=filter==GearFilter.TODOS,onClick={filter=GearFilter.TODOS},label={Text("Todos")})
                    FilterChip(selected=filter==GearFilter.PENDENTES,onClick={filter=GearFilter.PENDENTES},label={Text("Pendentes")})
                    FilterChip(selected=filter==GearFilter.COMPRADOS,onClick={filter=GearFilter.COMPRADOS},label={Text("Adquiridos")})
                }
            }
            item{
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    AssistChip(onClick={sort=GearSort.PRIORIDADE},label={Text(if(sort==GearSort.PRIORIDADE)"✓ Prioridade" else "Prioridade")})
                    AssistChip(onClick={sort=GearSort.PRECO_ASC},label={Text(if(sort==GearSort.PRECO_ASC)"✓ Menor preço" else "Menor preço")})
                    AssistChip(onClick={sort=GearSort.PRECO_DESC},label={Text(if(sort==GearSort.PRECO_DESC)"✓ Maior preço" else "Maior preço")})
                }
            }
            val visible=equipment.filter{it.categoryId==categoryId}.filter{when(filter){GearFilter.TODOS->true;GearFilter.PENDENTES->it.status==ItemStatus.PENDENTE;GearFilter.COMPRADOS->it.status==ItemStatus.COMPRADO}}.let{list->
                when(sort){
                    GearSort.PRIORIDADE->list.sortedWith(compareBy<EquipmentItem>{when(it.priority){Priority.URGENTE->0;Priority.MEDIO->1;Priority.BAIXO->2}}.thenBy{it.name})
                    GearSort.PRECO_ASC->list.sortedBy{it.price*it.quantity}
                    GearSort.PRECO_DESC->list.sortedByDescending{it.price*it.quantity}
                }
            }
            items(visible){item->
                Card(Modifier.fillMaxWidth().clickable{editing=item}){
                    Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically){
                        Checkbox(checked=item.status==ItemStatus.COMPRADO,onCheckedChange={checked->save(equipment.map{if(it.id==item.id)it.copy(status=if(checked)ItemStatus.COMPRADO else ItemStatus.PENDENTE,updatedAt=System.currentTimeMillis()) else it})})
                        Column(Modifier.weight(1f)){Text(item.name,fontWeight=FontWeight.SemiBold);Text("${priorityLabel(item.priority)} • Qtd. ${item.quantity} • ${money(item.price*item.quantity)}",fontSize=12.sp);if(item.notes.isNotBlank())Text(item.notes,fontSize=11.sp)}
                        IconButton(onClick={save(equipment.filterNot{it.id==item.id})}){Icon(Icons.Default.Delete,contentDescription="Excluir")}
                    }
                }
            }
            item{Button(onClick={add=true},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.Add,contentDescription=null);Text(" ADICIONAR ITEM")}}
        }
    }
    editing?.let{old->ItemDialog(old,{editing=null}){new->save(equipment.map{if(it.id==new.id)new.copy(updatedAt=System.currentTimeMillis()) else it});editing=null}}
    if(add){ItemDialog(EquipmentItem(repo.id(),"",categoryId?:"mobilidade"),{add=false}){new->save(equipment+new);add=false}}
}

private fun priorityLabel(p:Priority)=when(p){Priority.URGENTE->"🔴 Urgente";Priority.MEDIO->"🟡 Médio";Priority.BAIXO->"🟢 Baixo"}

@Composable
private fun ItemDialog(item:EquipmentItem,dismiss:()->Unit,done:(EquipmentItem)->Unit){
    var name by remember{mutableStateOf(item.name)};var qty by remember{mutableStateOf(item.quantity.toString())};var price by remember{mutableStateOf(item.price.toString())};var notes by remember{mutableStateOf(item.notes)}
    var priority by remember{mutableStateOf(item.priority)};var category by remember{mutableStateOf(item.categoryId)};var catMenu by remember{mutableStateOf(false)}
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button(enabled=name.isNotBlank(),onClick={done(item.copy(name=name.trim(),categoryId=category,priority=priority,quantity=qty.toIntOrNull()?.coerceAtLeast(0)?:0,price=price.toDoubleOrNull()?.coerceAtLeast(0.0)?:0.0,notes=notes,updatedAt=System.currentTimeMillis()))}){Text("SALVAR")}},
        dismissButton={TextButton(onClick=dismiss){Text("CANCELAR")}},
        title={Text(if(item.name.isBlank())"Novo item" else "Editar item")},
        text={LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){
            item{OutlinedTextField(name,{name=it},label={Text("Nome")},modifier=Modifier.fillMaxWidth())}
            item{Box{OutlinedButton(onClick={catMenu=true},modifier=Modifier.fillMaxWidth()){Text(equipmentCategories.firstOrNull{it.id==category}?.let{"${it.icon} ${it.label}"}?:"Categoria")};DropdownMenu(expanded=catMenu,onDismissRequest={catMenu=false}){equipmentCategories.forEach{cat->DropdownMenuItem(text={Text("${cat.icon} ${cat.label}")},onClick={category=cat.id;catMenu=false})}}}}
            item{Text("Prioridade",fontWeight=FontWeight.SemiBold);Row(horizontalArrangement=Arrangement.spacedBy(5.dp)){Priority.entries.forEach{p->FilterChip(selected=priority==p,onClick={priority=p},label={Text(priorityLabel(p))})}}}
            item{NumericField(qty,{qty=it},"Quantidade")}
            item{NumericField(price,{price=it},"Preço unitário")}
            item{OutlinedTextField(notes,{notes=it},label={Text("Observações")},modifier=Modifier.fillMaxWidth(),minLines=2)}
        }}
    )
}
