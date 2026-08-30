package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*

enum class Screen { Home, Gear, Planning, Journal, More, Verify, Calculator }
@Composable fun NomadeRaizApp(){
 val repo=remember{AppRepository(LocalContext.current)}; var screen by remember{mutableStateOf(Screen.Home)}
 var itemsState by remember{mutableStateOf(repo.loadItems())}; var journal by remember{mutableStateOf(repo.loadJournal())}
 Scaffold(
  bottomBar = {
   if (screen !in listOf(Screen.Verify, Screen.Gear, Screen.Calculator)) {
    NavigationBar {
     listOf(Screen.Home, Screen.Planning, Screen.Journal, Screen.More).forEach { s ->
      NavigationBarItem(
       selected = screen == s, onClick = { screen = s },
       icon = { Icon(when(s){ Screen.Home->Icons.Default.Home; Screen.Planning->Icons.Default.Map; Screen.Journal->Icons.Default.MenuBook; else->Icons.Default.MoreHoriz }, null) },
       label = { Text(when(s){ Screen.Home->"Início"; Screen.Planning->"Planejamento"; Screen.Journal->"Diário"; else->"Mais" }) }
      )
     }
    }
   }
  }
 ) { p ->
  when(screen){
   Screen.Home->HomeScreen(Modifier.padding(p),{screen=Screen.Verify},{screen=Screen.Gear},{screen=Screen.Planning},{screen=Screen.Journal},itemsState)
   Screen.Gear->EquipmentScreen(Modifier.padding(p),itemsState,{itemsState=it;repo.saveItems(it)},{screen=Screen.Home})
   Screen.Verify->VerifyScreen(repo,{screen=Screen.Home})
   Screen.Planning->PlanningScreen(Modifier.padding(p))
   Screen.Journal->JournalScreen(Modifier.padding(p),journal,{journal=it;repo.saveJournal(it)},repo)
   Screen.More->MoreScreen(Modifier.padding(p)){if(it=="Calculadora")screen=Screen.Calculator}
   Screen.Calculator->CalculatorScreen({screen=Screen.More})
  }
 }
}
@Composable private fun Header(t:String,s:String?=null){Column(Modifier.fillMaxWidth().padding(bottom=16.dp)){Text(t,26.sp,fontWeight=FontWeight.Black);s?.let{Text(it,color=Color(0xFFB6C0BA))}}}
@Composable private fun HomeScreen(m:Modifier,verify:()->Unit,gear:()->Unit,plan:()->Unit,journal:()->Unit,equipment:List<EquipmentItem>){val ready=equipment.count{it.status==ItemStatus.COMPRADO};LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){item{Header("NÔMADE RAIZ","Bora, cicloviajante!")}item{Button(verify,Modifier.fillMaxWidth()){Text("VERIFICAR ANTES DE SAIR")}}item{Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){Stat("${equipment.size}","itens",Modifier.weight(1f));Stat("${if(equipment.isEmpty())0 else ready*100/equipment.size}%","pronto",Modifier.weight(1f));Stat("5","checagens",Modifier.weight(1f))}}item{ActionCard("Equipamentos","Organize e acompanhe o que falta.",gear)}item{ActionCard("Planejamento","Distância, dias, água, energia e orçamento.",plan)}item{ActionCard("Diário da viagem","Registre quilômetros, clima, local e notas.",journal)}}}
@Composable private fun Stat(v:String,l:String,m:Modifier){Card(m){Column(Modifier.padding(12.dp),horizontalAlignment=Alignment.CenterHorizontally){Text(v,fontWeight=FontWeight.Bold,fontSize=20.sp);Text(l,fontSize=11.sp)}}}
@Composable private fun ActionCard(t:String,b:String,c:()->Unit){Card(Modifier.fillMaxWidth().clickable(onClick=c)){Column(Modifier.padding(16.dp)){Text(t,fontWeight=FontWeight.Bold,fontSize=18.sp);Text(b);TextButton(c){Text("ABRIR")}}}}

@Composable private fun EquipmentScreen(m:Modifier,current:List<EquipmentItem>,save:(List<EquipmentItem>)->Unit,back:()->Unit){var selectedCat by remember{mutableStateOf<String?>(null)};var editing by remember{mutableStateOf<EquipmentItem?>(null)};var add by remember{mutableStateOf(false)}
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,null)};Header(if(selectedCat==null)"Equipamentos" else equipmentCategories.first{it.id==selectedCat}.label)}}
 if(selectedCat==null){items(equipmentCategories){cat->val list=current.filter{it.categoryId==cat.id};val ready=list.count{it.status==ItemStatus.COMPRADO};Card(Modifier.fillMaxWidth().clickable{selectedCat=cat.id}){Row(Modifier.padding(16.dp)){Text(cat.icon,fontSize=26.sp);Spacer(Modifier.width(12.dp));Text(cat.label,Modifier.weight(1f),fontWeight=FontWeight.Bold);Text("$ready/${list.size}")}}}} else {items(current.filter{it.categoryId==selectedCat}){item->Card(Modifier.fillMaxWidth().clickable{editing=item}){Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically){Checkbox(item.status==ItemStatus.COMPRADO,{v->save(current.map{if(it.id==item.id)it.copy(status=if(v)ItemStatus.COMPRADO else ItemStatus.PENDENTE)else it})});Column(Modifier.weight(1f)){Text(item.name,fontWeight=FontWeight.SemiBold);Text("Qtd. ${item.quantity} • R$ %.2f".format(item.price),fontSize=12.sp)};IconButton({save(current.filterNot{it.id==item.id})}){Icon(Icons.Default.Delete,null)}}}};item{Button({add=true},Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Text(" ADICIONAR ITEM")}}}}
 if(editing!=null) ItemDialog(editing!!,{editing=null}){new->save(current.map{if(it.id==new.id)new else it});editing=null}; if(add) ItemDialog(EquipmentItem(System.currentTimeMillis().toString(),"",selectedCat?:"mobilidade"),{add=false}){save(current+it);add=false}}
}
@Composable private fun ItemDialog(item:EquipmentItem,dismiss:()->Unit,done:(EquipmentItem)->Unit){var name by remember{mutableStateOf(item.name)};var qty by remember{mutableStateOf(item.quantity.toString())};var price by remember{mutableStateOf(item.price.toString())};var notes by remember{mutableStateOf(item.notes)};AlertDialog(onDismissRequest=dismiss,confirmButton={Button(enabled=name.isNotBlank(),onClick={done(item.copy(name=name.trim(),quantity=qty.toIntOrNull()?.coerceAtLeast(0)?:0,price=price.toDoubleOrNull()?.coerceAtLeast(0.0)?:0.0,notes=notes))}){Text("SALVAR")}},dismissButton={TextButton(dismiss){Text("CANCELAR")}},title={Text(if(item.name.isBlank())"Novo item" else "Editar item")},text={Column(verticalArrangement=Arrangement.spacedBy(8.dp)){OutlinedTextField(name,{name=it},label={Text("Nome")});OutlinedTextField(qty,{qty=it},label={Text("Quantidade")});OutlinedTextField(price,{price=it},label={Text("Preço")});OutlinedTextField(notes,{notes=it},label={Text("Observações")})}})}

@Composable private fun VerifyScreen(repo:AppRepository,back:()->Unit){var mode by remember{mutableStateOf(checkModes.first())};var checks by remember(mode){mutableStateOf(repo.loadChecks(mode.id))};LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,null)};Header("Verificar",mode.description)}}item{Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(4.dp)){checkModes.forEach{m->FilterChip(selected=mode.id==m.id,onClick={mode=m},label={Text(m.icon)})}}}items(mode.items){ci->Card{Row(Modifier.fillMaxWidth().padding(10.dp),verticalAlignment=Alignment.CenterVertically){Checkbox(checks[ci.id]==true,{v->checks=checks+(ci.id to v);repo.saveChecks(mode.id,checks)});Column{Text(ci.text);if(ci.tip.isNotBlank())Text(ci.tip,fontSize=11.sp)}}}}item{TextButton({checks=emptyMap();repo.saveChecks(mode.id,checks)}){Text("LIMPAR CHECAGEM")}}}}

@Composable private fun PlanningScreen(m:Modifier){var km by remember{mutableStateOf("")};var vel by remember{mutableStateOf("")};var horas by remember{mutableStateOf("")};var dias by remember{mutableStateOf("")};var agua by remember{mutableStateOf("")};var pessoas by remember{mutableStateOf("1")};val bike=Calculator.bike(vel.toDoubleOrNull()?:0.0,horas.toDoubleOrNull()?:0.0,dias.toDoubleOrNull()?:0.0);val water=Calculator.water(agua.toDoubleOrNull()?:0.0,false,0.0,pessoas.toIntOrNull()?:1);LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){item{Header("Planejamento","Cálculos funcionais migrados da versão original")};item{OutlinedTextField(km,{km=it},label={Text("Distância prevista (km)")});OutlinedTextField(vel,{vel=it},label={Text("Velocidade média (km/h)")});OutlinedTextField(horas,{horas=it},label={Text("Horas pedalando/dia")});OutlinedTextField(dias,{dias=it},label={Text("Dias")});OutlinedTextField(pessoas,{pessoas=it},label={Text("Pessoas")});OutlinedTextField(agua,{agua=it},label={Text("Água carregada (L)")})};item{Card{Column(Modifier.padding(16.dp)){Text("Capacidade diária: %.1f km".format(bike.kmDia));Text("Distância calculada: %.1f km".format(bike.distanciaTotal));Text("Autonomia de água: %.1f dia(s)".format(water.dias));if((km.toDoubleOrNull()?:0.0)>bike.distanciaTotal)Text("Atenção: ritmo/dias não cobrem a distância.")}}}}}

@Composable private fun JournalScreen(m:Modifier,entries:List<JournalEntry>,save:(List<JournalEntry>)->Unit,repo:AppRepository){var add by remember{mutableStateOf(false)};LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){item{Header("Diário da viagem");Button({add=true},Modifier.fillMaxWidth()){Text("NOVO REGISTRO")}}items(entries){e->Card{Row(Modifier.padding(14.dp)){Column(Modifier.weight(1f)){Text("${e.clima} ${e.local}",fontWeight=FontWeight.Bold);Text("${e.km} km • ${e.nota}")};IconButton({save(entries.filterNot{it.id==e.id})}){Icon(Icons.Default.Delete,null)}}}}};if(add)JournalDialog({add=false}){local,clima,km,nota->save(listOf(JournalEntry(repo.id(),local,clima,km,nota,System.currentTimeMillis()))+entries);add=false}}
@Composable private fun JournalDialog(dismiss:()->Unit,done:(String,String,Double,String)->Unit){var local by remember{mutableStateOf("")};var clima by remember{mutableStateOf("☀️")};var km by remember{mutableStateOf("")};var nota by remember{mutableStateOf("")};AlertDialog(onDismissRequest=dismiss,confirmButton={Button({done(local,clima,km.toDoubleOrNull()?:0.0,nota)},enabled=local.isNotBlank()){Text("SALVAR")}},dismissButton={TextButton(dismiss){Text("CANCELAR")}},title={Text("Novo registro")},text={Column{OutlinedTextField(local,{local=it},label={Text("Local")});OutlinedTextField(clima,{clima=it},label={Text("Clima")});OutlinedTextField(km,{km=it},label={Text("Km")});OutlinedTextField(nota,{nota=it},label={Text("Nota")})}})}

@Composable private fun MoreScreen(m:Modifier,open:(String)->Unit){val es=listOf("Calculadora","Pontos de apoio","Alertas","Manual da Bike","Dicas","Exportar / Backup","Configurações","Sobre");LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){item{Header("Mais","Ferramentas do Nômade Raiz")};items(es){e->Card(Modifier.fillMaxWidth().clickable{open(e)}){Row(Modifier.padding(18.dp)){Text(e,Modifier.weight(1f));Icon(Icons.Default.ChevronRight,null)}}}}}
@Composable private fun CalculatorScreen(back:()->Unit){var v by remember{mutableStateOf("")};var h by remember{mutableStateOf("")};var d by remember{mutableStateOf("")};var money by remember{mutableStateOf("")};var gasto by remember{mutableStateOf("")};val b=Calculator.bike(v.toDoubleOrNull()?:0.0,h.toDoubleOrNull()?:0.0,d.toDoubleOrNull()?:0.0);val md=Calculator.money(money.toDoubleOrNull()?:0.0,gasto.toDoubleOrNull()?:0.0);LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){item{Row{IconButton(back){Icon(Icons.Default.ArrowBack,null)};Header("Calculadora")}}item{OutlinedTextField(v,{v=it},label={Text("Velocidade km/h")});OutlinedTextField(h,{h=it},label={Text("Horas/dia")});OutlinedTextField(d,{d=it},label={Text("Dias")});OutlinedTextField(money,{money=it},label={Text("Dinheiro disponível")});OutlinedTextField(gasto,{gasto=it},label={Text("Gasto por dia")})};item{Card{Column(Modifier.padding(16.dp)){Text("Distância/dia: %.1f km".format(b.kmDia));Text("Distância total: %.1f km".format(b.distanciaTotal));Text("Autonomia financeira: %.1f dias".format(md))}}}}}
