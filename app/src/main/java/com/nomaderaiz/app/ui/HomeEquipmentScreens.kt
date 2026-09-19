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
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.activity.compose.BackHandler
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.R
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
    onTips:()->Unit,
    onAlerts:()->Unit
){
    val ready=items.count{it.status==ItemStatus.COMPRADO}
    val pct=if(items.isEmpty())0 else ready*100/items.size
    val alerts=items.count{item->minimums[item.id]?.let{min->(if(item.status==ItemStatus.COMPRADO)item.quantity else 0)<min}==true}
    val totalInvestment=items.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val pending=items.count{it.status==ItemStatus.PENDENTE}
    val days=settings.startDate?.let{max(1,((System.currentTimeMillis()-it)/(24*60*60*1000L)).toInt()+1)}?:0
    var noteOpen by remember{mutableStateOf(false)}
    var noteDraft by remember(quickNote){mutableStateOf(quickNote)}

    LazyColumn(
        modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=8.dp,bottom=18.dp),
        verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item{
            Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically){
                Column(Modifier.weight(1f)){
                    Text("NÔMADE",fontSize=22.sp,fontWeight=FontWeight.Black,letterSpacing=1.sp)
                    Text("RAIZ",fontSize=12.sp,fontWeight=FontWeight.Black,color=MaterialTheme.colorScheme.primary,letterSpacing=1.6.sp)
                }
                if(days>0)AssistChip(onClick={},label={Text("$days dias")})
                IconButton(onClick={noteOpen=true}){Icon(Icons.Default.EditNote,contentDescription="Nota rápida")}
                Box{
                    IconButton(onClick=onAlerts){Icon(Icons.Default.NotificationsNone,contentDescription="Alertas")}
                    if(alerts>0)Badge(Modifier.align(Alignment.TopEnd)){Text(alerts.toString())}
                }
            }
        }
        item{
            HeroCard(
                imageRes=R.drawable.nr_hero_home_cicloviajante,
                height=292.dp,
                alignment=Alignment.Center
            ){
                Column(
                    Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(16.dp),
                    verticalArrangement=Arrangement.spacedBy(7.dp)
                ){
                    Text("Bora, cicloviajante!",fontSize=23.sp,fontWeight=FontWeight.Black,color=Color.White)
                    Text("Antes de seguir, verifique tudo e viaje com mais segurança.",fontSize=12.sp,color=Color(0xFFE7ECE7))
                    Button(onClick={onVerify("antes-sair")},modifier=Modifier.fillMaxWidth()){
                        Icon(Icons.Default.VerifiedUser,contentDescription=null)
                        Spacer(Modifier.width(7.dp))
                        Text("VERIFICAR AGORA",fontWeight=FontWeight.Bold)
                    }
                }
            }
        }
        item{
            Card(
                Modifier.fillMaxWidth().clickable(onClick=onGear),
                colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.78f))
            ){
                Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){
                    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically){
                        Column(Modifier.weight(1f)){
                            SectionLabel("Inventário da viagem")
                            Text("$ready de ${items.size} itens adquiridos",fontSize=12.sp)
                        }
                        Text("$pct%",fontWeight=FontWeight.Black,color=MaterialTheme.colorScheme.primary)
                        Icon(Icons.Default.ChevronRight,contentDescription="Abrir equipamentos")
                    }
                    LinearProgressIndicator(progress={pct/100f},modifier=Modifier.fillMaxWidth())
                }
            }
        }
        item{
            Card(
                Modifier.fillMaxWidth().clickable(onClick=onJournal),
                colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.78f))
            ){
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.CenterVertically){
                    Icon(Icons.Default.MenuBook,contentDescription=null,tint=MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(11.dp))
                    Column(Modifier.weight(1f)){
                        SectionLabel("Diário da viagem")
                        Text(if(quickNote.isBlank())"Continue registrando sua aventura" else quickNote,maxLines=2,fontSize=12.sp)
                    }
                    Icon(Icons.Default.ChevronRight,contentDescription="Abrir diário")
                }
            }
        }
        item{SectionLabel("Sua viagem")}
        item{
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){
                ActionCard("Planejar","Rota e recursos",Modifier.weight(1f),Icons.Default.Map,onPlanning)
                ActionCard("Autonomia","Faça os cálculos",Modifier.weight(1f),Icons.Default.Calculate,onCalculator)
            }
        }
        item{
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){
                ActionCard("Pontos","Água e oficinas",Modifier.weight(1f),Icons.Default.Place,onPoints)
                ActionCard("Dicas","Conhecimento",Modifier.weight(1f),Icons.Default.Lightbulb,onTips)
            }
        }
        item{
            val next=when{alerts>0->"Revise $alerts ${if(alerts==1)"item abaixo" else "itens abaixo"} do estoque mínimo antes de partir.";pending>0->"Você ainda tem $pending ${if(pending==1)"equipamento pendente" else "equipamentos pendentes"} na lista.";stockStatus(items,minimums).monitoredCount==0->"Defina os mínimos em Alertas para acompanhar a reposição do estoque.";else->"Os itens monitorados estão dentro do estoque mínimo."}
            SectionCard("Próximo passo"){
                Text(next,fontSize=12.sp)
                Text("Investimento registrado: ${money(totalInvestment)}",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        item{SectionLabel("Verificações rápidas")}
        items(checkModes){mode->ActionCard(mode.label,"${mode.items.size} itens",Modifier.fillMaxWidth(),Icons.Default.FactCheck){onVerify(mode.id)}}
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
private fun Stat(value:String,label:String,modifier:Modifier,onClick:(()->Unit)?=null){
    val cardModifier=if(onClick!=null)modifier.clickable(onClick=onClick) else modifier
    Card(cardModifier){Column(Modifier.padding(10.dp),horizontalAlignment=Alignment.CenterHorizontally){Text(value,fontWeight=FontWeight.Bold,fontSize=19.sp);Text(label,fontSize=12.sp)}}
}

@Composable
private fun ActionCard(title:String,body:String,modifier:Modifier=Modifier,icon:androidx.compose.ui.graphics.vector.ImageVector,onClick:()->Unit){
    Card(
        modifier.clickable(onClick=onClick),
        colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.78f))
    ){
        Row(Modifier.padding(horizontal=12.dp,vertical=13.dp),verticalAlignment=Alignment.CenterVertically){
            Icon(icon,contentDescription=null,tint=MaterialTheme.colorScheme.primary)
            Spacer(Modifier.width(9.dp))
            Column(Modifier.weight(1f)){Text(title,fontWeight=FontWeight.Bold,fontSize=13.sp);Text(body,fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)}
            Icon(Icons.Default.ChevronRight,contentDescription=null)
        }
    }
}

@Composable
internal fun EquipmentScreen(modifier:Modifier,equipment:List<EquipmentItem>,save:(List<EquipmentItem>)->Unit,back:()->Unit,repo:AppRepository){
    var categoryId by rememberSaveable{mutableStateOf<String?>(null)}
    var filter by rememberSaveable{mutableStateOf(GearFilter.TODOS)}
    var sort by rememberSaveable{mutableStateOf(GearSort.PRIORIDADE)}
    var editing by remember{mutableStateOf<EquipmentItem?>(null)}
    var add by remember{mutableStateOf(false)}
    BackHandler(enabled=categoryId!=null&&editing==null&&!add){categoryId=null}
    val total=equipment.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val bought=equipment.filter{it.status==ItemStatus.COMPRADO}.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val pending=equipment.filter{it.status==ItemStatus.PENDENTE}.sumOf{it.price*it.quantity.coerceAtLeast(0)}

    LazyColumn(
        modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=18.dp),
        verticalArrangement=Arrangement.spacedBy(8.dp)
    ){
        item{
            ScreenHeader(
                title=if(categoryId==null)"Equipamentos" else equipmentCategories.firstOrNull{it.id==categoryId}?.label?:"Equipamentos",
                subtitle=if(categoryId==null)"Organize a carga para a estrada" else "Itens, prioridades e custos",
                back={if(categoryId==null)back() else categoryId=null}
            )
        }
        item{
            Card(Modifier.fillMaxWidth()){
                Row(Modifier.fillMaxWidth().padding(horizontal=8.dp,vertical=10.dp),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    FinanceMetric(total,"Total",Modifier.weight(1f));FinanceMetric(bought,"Adquirido",Modifier.weight(1f));FinanceMetric(pending,"Falta",Modifier.weight(1f))
                }
            }
        }
        if(categoryId==null){
            items(equipmentCategories,key={it.id}){cat->
                val list=equipment.filter{it.categoryId==cat.id};val ready=list.count{it.status==ItemStatus.COMPRADO}
                val progress=if(list.isEmpty())0f else ready.toFloat()/list.size
                Card(
                    Modifier.fillMaxWidth().clickable{categoryId=cat.id},
                    colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.78f))
                ){
                    Row(Modifier.padding(horizontal=12.dp,vertical=10.dp),verticalAlignment=Alignment.CenterVertically){
                        Icon(categoryIcon(cat.id),null,Modifier.size(27.dp),tint=MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(3.dp)){
                            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){
                                Text(cat.label,Modifier.weight(1f),fontWeight=FontWeight.Bold)
                                Text("${(progress*100).toInt()}%",fontSize=12.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
                            }
                            Text("$ready de ${list.size} itens",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                            LinearProgressIndicator(progress={progress},modifier=Modifier.fillMaxWidth())
                        }
                        Spacer(Modifier.width(8.dp))
                        Icon(Icons.Default.ChevronRight,contentDescription="Abrir ${cat.label}")
                    }
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
            items(visible,key={it.id}){item->
                Card(Modifier.fillMaxWidth().clickable{editing=item}){
                    Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically){
                        Checkbox(checked=item.status==ItemStatus.COMPRADO,onCheckedChange={checked->save(equipment.map{if(it.id==item.id)it.copy(status=if(checked)ItemStatus.COMPRADO else ItemStatus.PENDENTE,updatedAt=System.currentTimeMillis()) else it})})
                        Column(Modifier.weight(1f)){Text(item.name,fontWeight=FontWeight.SemiBold);Text("${priorityLabel(item.priority)} • Qtd. ${item.quantity} • ${money(item.price*item.quantity)}",fontSize=12.sp);if(item.notes.isNotBlank())Text(item.notes,fontSize=12.sp)}
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

private fun priorityLabel(p:Priority)=when(p){Priority.URGENTE->"Urgente";Priority.MEDIO->"Médio";Priority.BAIXO->"Baixo"}

@Composable
private fun FinanceMetric(value:Double,label:String,modifier:Modifier){
    Column(modifier,horizontalAlignment=Alignment.CenterHorizontally){
        Text(money(value),fontWeight=FontWeight.Bold,fontSize=14.sp,textAlign=androidx.compose.ui.text.style.TextAlign.Center)
        Text(label,fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun ItemDialog(item:EquipmentItem,dismiss:()->Unit,done:(EquipmentItem)->Unit){
    var name by remember{mutableStateOf(item.name)};var qty by remember{mutableStateOf(item.quantity.toString())};var price by remember{mutableStateOf(item.price.toString())};var notes by remember{mutableStateOf(item.notes)}
    var priority by remember{mutableStateOf(item.priority)};var category by remember{mutableStateOf(item.categoryId)};var catMenu by remember{mutableStateOf(false)}
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button(enabled=name.isNotBlank()&&qty.wholeNumberOrNull()!=null&&numberError(price)==null,onClick={done(item.copy(name=name.trim(),categoryId=category,priority=priority,quantity=qty.wholeNumberOrNull()?:0,price=price.numberOrNull()?:0.0,notes=notes,updatedAt=System.currentTimeMillis()))}){Text("SALVAR")}},
        dismissButton={TextButton(onClick=dismiss){Text("CANCELAR")}},
        title={Text(if(item.name.isBlank())"Novo item" else "Editar item")},
        text={LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){
            item{OutlinedTextField(name,{name=it},label={Text("Nome")},modifier=Modifier.fillMaxWidth())}
            item{Box{OutlinedButton(onClick={catMenu=true},modifier=Modifier.fillMaxWidth()){Text(equipmentCategories.firstOrNull{it.id==category}?.label?:"Categoria")};DropdownMenu(expanded=catMenu,onDismissRequest={catMenu=false}){equipmentCategories.forEach{cat->DropdownMenuItem(text={Text(cat.label)},leadingIcon={Icon(categoryIcon(cat.id),null)},onClick={category=cat.id;catMenu=false})}}}}
            item{Text("Prioridade",fontWeight=FontWeight.SemiBold);Row(horizontalArrangement=Arrangement.spacedBy(5.dp)){Priority.entries.forEach{p->FilterChip(selected=priority==p,onClick={priority=p},label={Text(priorityLabel(p))})}}}
            item{NumericField(qty,{qty=it},"Quantidade",whole=true)}
            item{NumericField(price,{price=it},"Preço unitário")}
            item{OutlinedTextField(notes,{notes=it},label={Text("Observações")},modifier=Modifier.fillMaxWidth(),minLines=2)}
        }}
    )
}
