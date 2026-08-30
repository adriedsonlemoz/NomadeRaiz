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

enum class Screen { Home, Gear, Planning, Journal, More, Verify, Calculator, Points }
@Composable fun NomadeRaizApp(){
 val repo=remember{AppRepository(LocalContext.current)}; var screen by remember{mutableStateOf(Screen.Home)}
 var itemsState by remember{mutableStateOf(repo.loadItems())}; var journal by remember{mutableStateOf(repo.loadJournal())}; var points by remember{mutableStateOf(repo.loadPoints())}
 Scaffold(
  bottomBar = {
   if (screen !in listOf(Screen.Verify, Screen.Gear, Screen.Calculator, Screen.Points)) {
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
   Screen.More->MoreScreen(Modifier.padding(p)){ destination -> when(destination) { "Calculadora" -> screen=Screen.Calculator; "Pontos de apoio" -> screen=Screen.Points } }
   Screen.Calculator->CalculatorScreen({screen=Screen.More})
   Screen.Points->PointsScreen(points,{points=it;repo.savePoints(it)},repo,{screen=Screen.More})
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
@Composable
private fun CalculatorScreen(back: () -> Unit) {
    var v by remember { mutableStateOf("") }
    var h by remember { mutableStateOf("") }
    var d by remember { mutableStateOf("") }
    var water by remember { mutableStateOf("") }
    var people by remember { mutableStateOf("1") }
    var refill by remember { mutableStateOf(false) }
    var freq by remember { mutableStateOf("") }
    var panel by remember { mutableStateOf("") }
    var sun by remember { mutableStateOf("") }
    var battery by remember { mutableStateOf("") }
    var power by remember { mutableStateOf("") }
    var money by remember { mutableStateOf("") }
    var gasto by remember { mutableStateOf("") }
    var qty by remember { mutableStateOf("") }
    var kg by remember { mutableStateOf("") }
    var food by remember { mutableStateOf("") }
    var transport by remember { mutableStateOf("") }
    var maintenance by remember { mutableStateOf("") }
    var others by remember { mutableStateOf("") }

    val bike = Calculator.bike(v.toDoubleOrNull() ?: 0.0, h.toDoubleOrNull() ?: 0.0, d.toDoubleOrNull() ?: 0.0)
    val agua = Calculator.water(water.toDoubleOrNull() ?: 0.0, refill, freq.toDoubleOrNull() ?: 0.0, people.toIntOrNull() ?: 1)
    val energia = Calculator.energy(
        panel.toDoubleOrNull() ?: 0.0, sun.toDoubleOrNull() ?: 0.0,
        battery.toDoubleOrNull() ?: 0.0, power.toDoubleOrNull() ?: 0.0,
        listOf(EnergyEquipment("celular","Celular",12.0), EnergyEquipment("luzes","Luzes",8.0), EnergyEquipment("gps","GPS",5.0,false))
    )
    val dinheiro = Calculator.money(money.toDoubleOrNull() ?: 0.0, gasto.toDoubleOrNull() ?: 0.0)
    val peso = Calculator.weight(listOf((qty.toDoubleOrNull() ?: 0.0) to (kg.toDoubleOrNull() ?: 0.0)))
    val custo = Calculator.tripCost(d.toDoubleOrNull() ?: 0.0, food.toDoubleOrNull() ?: 0.0, transport.toDoubleOrNull() ?: 0.0, maintenance.toDoubleOrNull() ?: 0.0, others.toDoubleOrNull() ?: 0.0)

    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Row(verticalAlignment = Alignment.CenterVertically) { IconButton(back) { Icon(Icons.Default.ArrowBack,null) }; Header("Calculadora","Regras migradas do aplicativo original") } }
        item { CalcSection("🚲 Bicicleta") { NumField(v,{v=it},"Velocidade média (km/h)"); NumField(h,{h=it},"Horas pedalando/dia"); NumField(d,{d=it},"Dias"); ResultText("Distância/dia: %.1f km • Total: %.1f km".format(bike.kmDia,bike.distanciaTotal)) } }
        item { CalcSection("💧 Água") { NumField(water,{water=it},"Água carregada (L)"); NumField(people,{people=it},"Pessoas"); Row(verticalAlignment=Alignment.CenterVertically){ Checkbox(refill,{refill=it}); Text("Haverá reabastecimento") }; if(refill) NumField(freq,{freq=it},"Intervalo entre pontos (dias)"); ResultText("Consumo: %.1f L/dia • Autonomia: %.1f dia(s)".format(agua.consumoDia,agua.dias)); if(refill) ResultText(if(agua.suficientePorIntervalo) "Água suficiente até o próximo ponto." else "Água insuficiente para o intervalo.") } }
        item { CalcSection("⚡ Energia") { NumField(panel,{panel=it},"Painel solar (W)"); NumField(sun,{sun=it},"Horas de sol/dia"); NumField(battery,{battery=it},"Bateria (Wh)"); NumField(power,{power=it},"Power bank (Wh)"); ResultText("Geração: %.1f Wh/dia • Consumo padrão: %.1f Wh/dia".format(energia.geracaoDiariaWh,energia.consumoDiarioWh)); ResultText(if(energia.autossustentavel) "Sistema autossustentável" else "Autonomia estimada: %.1f dia(s)".format(energia.dias)) } }
        item { CalcSection("💰 Dinheiro") { NumField(money,{money=it},"Disponível (R$)"); NumField(gasto,{gasto=it},"Gasto por dia (R$)"); ResultText("Autonomia financeira: %.1f dia(s)".format(dinheiro.dias)) } }
        item { CalcSection("⚖️ Peso") { NumField(qty,{qty=it},"Quantidade"); NumField(kg,{kg=it},"Peso por item (kg)"); ResultText("Carga: %.1f kg / limite %.0f kg".format(peso.total,peso.limite)); if(peso.acimaDoLimite) Text("Acima do limite de referência.",color=MaterialTheme.colorScheme.error) } }
        item { CalcSection("🧾 Custo da viagem") { NumField(food,{food=it},"Alimentação por dia (R$)"); NumField(transport,{transport=it},"Transporte (R$)"); NumField(maintenance,{maintenance=it},"Manutenção (R$)"); NumField(others,{others=it},"Outros (R$)"); ResultText("Custo estimado: R$ %.2f".format(custo.total)) } }
    }
}

@Composable
private fun CalcSection(title:String, content:@Composable ColumnScope.()->Unit) {
    Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(7.dp)) { Text(title,fontWeight=FontWeight.Bold,fontSize=17.sp); content() } }
}
@Composable private fun NumField(value:String,on:(String)->Unit,label:String) { OutlinedTextField(value,on,label={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true) }
@Composable private fun ResultText(text:String) { Text(text,fontWeight=FontWeight.SemiBold,fontSize=13.sp) }

private val supportTypes = listOf(
    "agua" to "💧 Água", "mercado" to "🛒 Mercado", "camping" to "⛺ Camping",
    "oficina" to "🔧 Oficina", "saude" to "🏥 Saúde", "energia" to "🔌 Energia", "outro" to "📍 Outro"
)

@Composable
private fun PointsScreen(points:List<SupportPoint>, save:(List<SupportPoint>)->Unit, repo:AppRepository, back:()->Unit) {
    var edit by remember { mutableStateOf<SupportPoint?>(null) }
    var add by remember { mutableStateOf(false) }
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)) {
        item { Row(verticalAlignment=Alignment.CenterVertically) { IconButton(back){Icon(Icons.Default.ArrowBack,null)}; Header("Pontos de apoio","Referências úteis da rota") } }
        item { Button({add=true},Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Text(" NOVO PONTO")} }
        if(points.isEmpty()) item { Card(Modifier.fillMaxWidth()){Text("Nenhum ponto cadastrado.",Modifier.padding(18.dp))} }
        items(points) { p ->
            Card(Modifier.fillMaxWidth().clickable{edit=p}) {
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.Top) {
                    Text(supportTypes.firstOrNull{it.first==p.tipo}?.second?.substringBefore(" ") ?: "📍",fontSize=24.sp)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Row { Text(p.nome,fontWeight=FontWeight.Bold); if(p.fechado) Text(" • Fechado",color=MaterialTheme.colorScheme.error,fontSize=11.sp) }
                        if(p.referencia.isNotBlank()) Text("📌 ${p.referencia}",fontSize=12.sp)
                        if(p.obs.isNotBlank()) Text(p.obs,fontSize=12.sp)
                        Text("⭐".repeat(p.avaliacao),fontSize=12.sp)
                    }
                    IconButton({save(points.filterNot{it.id==p.id})}){Icon(Icons.Default.Delete,null)}
                }
            }
        }
    }
    if(add) PointDialog(SupportPoint(repo.id(),"agua","","","",2,false),{add=false}) { save(points+it);add=false }
    edit?.let { old -> PointDialog(old,{edit=null}) { new -> save(points.map{if(it.id==new.id)new else it});edit=null } }
}

@Composable
private fun PointDialog(point:SupportPoint,dismiss:()->Unit,done:(SupportPoint)->Unit) {
    var type by remember { mutableStateOf(point.tipo) }
    var name by remember { mutableStateOf(point.nome) }
    var ref by remember { mutableStateOf(point.referencia) }
    var obs by remember { mutableStateOf(point.obs) }
    var rating by remember { mutableStateOf(point.avaliacao) }
    var closed by remember { mutableStateOf(point.fechado) }
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button({done(point.copy(tipo=type,nome=name.trim(),referencia=ref,obs=obs,avaliacao=rating,fechado=closed))},enabled=name.isNotBlank()){Text("SALVAR")}},
        dismissButton={TextButton(dismiss){Text("CANCELAR")}},
        title={Text(if(point.nome.isBlank())"Novo ponto" else "Editar ponto")},
        text={
            LazyColumn(verticalArrangement=Arrangement.spacedBy(7.dp)) {
                item { supportTypes.forEach { t -> FilterChip(selected=type==t.first,onClick={type=t.first},label={Text(t.second)},modifier=Modifier.padding(end=4.dp)) } }
                item { OutlinedTextField(name,{name=it},label={Text("Nome / descrição")},modifier=Modifier.fillMaxWidth()) }
                item { OutlinedTextField(ref,{ref=it},label={Text("Referência de localização")},modifier=Modifier.fillMaxWidth()) }
                item { OutlinedTextField(obs,{obs=it},label={Text("Observações")},modifier=Modifier.fillMaxWidth()) }
                item { Row(verticalAlignment=Alignment.CenterVertically) { Text("Avaliação: "); (1..3).forEach { n -> FilterChip(selected=rating>=n,onClick={rating=n},label={Text("⭐")},modifier=Modifier.padding(end=4.dp)) } } }
                item { Row(verticalAlignment=Alignment.CenterVertically) { Switch(closed,{closed=it});Text(if(closed)" Fechado" else " Aberto") } }
            }
        }
    )
}
