\
package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*
import java.text.SimpleDateFormat
import java.util.*

enum class Screen { Home, Gear, Planning, Calculator, Journal, Points, More, Verify }

@Composable fun NomadeRaizApp() {
    val repo=remember { AppRepository(LocalContext.current) }
    var screen by remember { mutableStateOf(Screen.Home) }
    Scaffold(bottomBar={
        if(screen!=Screen.Verify) NavigationBar(containerColor=Color(0xFF0B1516)) {
            listOf(Screen.Home,Screen.Planning,Screen.Journal,Screen.More).forEach { s->
                NavigationBarItem(screen==s,{screen=s},{Icon(when(s){Screen.Home->Icons.Default.Home;Screen.Planning->Icons.Default.Map;Screen.Journal->Icons.Default.MenuBook;else->Icons.Default.MoreHoriz},null)},{Text(when(s){Screen.Home->"Início";Screen.Planning->"Planejamento";Screen.Journal->"Diário";else->"Mais"})})
            }
        }
    }) { p->
        when(screen){
            Screen.Home->Home(Modifier.padding(p),{screen=Screen.Verify},{screen=Screen.Gear},{screen=Screen.Calculator})
            Screen.Gear->Gear(repo,Modifier.padding(p))
            Screen.Planning->Planning(Modifier.padding(p))
            Screen.Calculator->Calculator(Modifier.padding(p))
            Screen.Journal->Journal(repo,Modifier.padding(p))
            Screen.Points->Points(repo,Modifier.padding(p))
            Screen.More->More(Modifier.padding(p),{screen=Screen.Calculator},{screen=Screen.Points})
            Screen.Verify->Verify({screen=Screen.Home})
        }
    }
}

@Composable fun Title(t:String,s:String=""){ Column(Modifier.padding(bottom=14.dp)){Text(t,26.sp, fontWeight=FontWeight.Black);if(s.isNotBlank())Text(s,color=Color(0xFFAFBAB4))} }
@Composable fun Panel(content:@Composable ColumnScope.()->Unit){Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF141E1E))){Column(Modifier.fillMaxWidth().padding(16.dp),verticalArrangement=Arrangement.spacedBy(9.dp),content=content)}}
@Composable fun Num(label:String,value:String,on:(String)->Unit){OutlinedTextField(value,on,label={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true)}

@Composable fun Home(m:Modifier,verify:()->Unit,gear:()->Unit,calc:()->Unit){
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
  item{Title("NÔMADE RAIZ","Bora, cicloviajante!")}
  item{Panel{Text("Sua segurança começa antes da estrada.",20.sp,fontWeight=FontWeight.Bold);Text("Confira bike, bagagem e itens essenciais.");Button(verify,Modifier.fillMaxWidth()){Text("VERIFICAR AGORA")}}}
  item{Panel{Text("Equipamentos",fontWeight=FontWeight.Bold);Text("20 itens-base do projeto original.");TextButton(gear){Text("ABRIR EQUIPAMENTOS")}}}
  item{Panel{Text("Calculadora de autonomia",fontWeight=FontWeight.Bold);Text("Bike, água, energia, dinheiro e custo da viagem.");TextButton(calc){Text("CALCULAR")}}}
 }
}

@Composable fun Gear(repo:AppRepository,m:Modifier){
 var bought by remember{mutableStateOf(repo.purchased())}; var cat by remember{mutableStateOf<String?>(null)}
 val shown=if(cat==null) seedItems else seedItems.filter{it.category==cat}
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
  item{Title("Equipamentos","Lista-base migrada da versão 1.0.26")}
  item{Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(6.dp)){TextButton({cat=null}){Text("Todos")};gearCategories.take(4).forEach{c->TextButton({cat=c.id}){Text(c.icon)}}}}
  items(shown){g->Panel{Row(Modifier.fillMaxWidth()){Column(Modifier.weight(1f)){Text(g.name,fontWeight=FontWeight.Bold);Text("${g.quantity} un • ${g.priority}",fontSize=12.sp,color=Color(0xFFAFBAB4))};Checkbox(bought.contains(g.id),{repo.togglePurchased(g.id);bought=repo.purchased()})}}}
 }
}

@Composable fun Verify(back:()->Unit){
 var mode by remember{mutableStateOf(checkModes.first())}; var done by remember{mutableStateOf(setOf<String>())}
 LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
  item{Row{IconButton(back){Icon(Icons.Default.ArrowBack,null)};Title("Verificar")}}
  item{Row(horizontalArrangement=Arrangement.spacedBy(5.dp)){checkModes.forEach{m->TextButton({mode=m;done=emptySet()}){Text(m.icon)}}}}
  item{Panel{Text("${mode.icon} ${mode.title}",20.sp,fontWeight=FontWeight.Bold);Text(mode.description)}}
  items(mode.checks){c->Panel{Row{Checkbox(done.contains(c),{if(it)done=done+c else done=done-c});Text(c,Modifier.padding(top=12.dp))}}}
  item{LinearProgressIndicator({done.size/mode.checks.size.toFloat()},Modifier.fillMaxWidth());Text("${done.size} de ${mode.checks.size} verificados")}
 }
}

@Composable fun Planning(m:Modifier){
 var type by remember{mutableStateOf("cicloviagem")};var destination by remember{mutableStateOf("")};var days by remember{mutableStateOf("3")};var people by remember{mutableStateOf("1")};var base by remember{mutableStateOf("0")}
 val d=days.toDoubleOrNull()?:0.0; val b=base.toDoubleOrNull()?:0.0; val reserve=financialReserve(b,type)
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
  item{Title("Planejamento","Prepare recursos antes da viagem")}
  item{Panel{Text("Tipo de viagem",fontWeight=FontWeight.Bold);Row{listOf("bate-volta","cicloviagem","camping","longa").forEach{x->FilterChip(type==x,{type=x},{Text(x)})}};OutlinedTextField(destination,{destination=it},label={Text("Destino")},modifier=Modifier.fillMaxWidth());Num("Dias",days){days=it};Num("Pessoas",people){people=it};Num("Custo-base (R$)",base){base=it}}}
  item{Panel{Text("Análise",fontWeight=FontWeight.Bold);Text("Duração: ${d.toInt()} dias");Text("Reserva financeira recomendada: R$ %.2f".format(reserve));Text(if(type=="bate-volta"&&d>1)"Atenção: bate-volta normalmente representa uma saída de um dia." else "Perfil compatível com a duração informada.")}}
 }
}

@Composable fun Calculator(m:Modifier){
 var speed by remember{mutableStateOf("15")};var hours by remember{mutableStateOf("5")};var days by remember{mutableStateOf("3")}
 var liters by remember{mutableStateOf("6")};var people by remember{mutableStateOf("1")};var money by remember{mutableStateOf("300")};var daily by remember{mutableStateOf("60")}
 val bike=bikeCalc(speed.toDoubleOrNull()?:0.0,hours.toDoubleOrNull()?:0.0,days.toDoubleOrNull()?:0.0)
 val water=waterCalc(liters.toDoubleOrNull()?:0.0,people.toIntOrNull()?:1);val cash=moneyCalc(money.toDoubleOrNull()?:0.0,daily.toDoubleOrNull()?:0.0)
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
  item{Title("Calculadora","Regras principais portadas do projeto original")}
  item{Panel{Text("Bicicleta",fontWeight=FontWeight.Bold);Num("Velocidade média km/h",speed){speed=it};Num("Horas pedalando/dia",hours){hours=it};Num("Dias",days){days=it};Text("%.1f km/dia • %.1f km total".format(bike.kmDay,bike.total))}}
  item{Panel{Text("Água",fontWeight=FontWeight.Bold);Num("Litros carregados",liters){liters=it};Num("Pessoas",people){people=it};Text("Consumo recomendado: %.1f L/dia".format(water.consumptionDay));Text("Autonomia: %.1f dias".format(water.days))}}
  item{Panel{Text("Dinheiro",fontWeight=FontWeight.Bold);Num("Disponível (R$)",money){money=it};Num("Gasto por dia (R$)",daily){daily=it};Text("Autonomia financeira: %.1f dias".format(cash.days))}}
 }
}

@Composable fun Journal(repo:AppRepository,m:Modifier){
 var list by remember{mutableStateOf(repo.journal())};var place by remember{mutableStateOf("")};var km by remember{mutableStateOf("")};var note by remember{mutableStateOf("")}
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
  item{Title("Diário de Campo","Total pedalado: %.1f km".format(list.sumOf{it.km}))}
  item{Panel{OutlinedTextField(place,{place=it},label={Text("Local")},modifier=Modifier.fillMaxWidth());Num("Km",km){km=it};OutlinedTextField(note,{note=it},label={Text("Nota")},modifier=Modifier.fillMaxWidth());Button({val now=System.currentTimeMillis();repo.addJournal(JournalEntry(now,place,"☀️",km.toDoubleOrNull()?:0.0,note,now));list=repo.journal();place="";km="";note=""},Modifier.fillMaxWidth()){Text("NOVO REGISTRO")}}}
  items(list){e->Panel{Text("${e.weather} ${e.place.ifBlank{"Local não informado"}}",fontWeight=FontWeight.Bold);Text("${e.km} km • ${SimpleDateFormat("dd/MM/yyyy",Locale("pt","BR")).format(Date(e.createdAt))}");if(e.note.isNotBlank())Text(e.note);TextButton({repo.deleteJournal(e.id);list=repo.journal()}){Text("Excluir")}}}
 }
}

@Composable fun Points(repo:AppRepository,m:Modifier){
 var list by remember{mutableStateOf(repo.points())};var name by remember{mutableStateOf("")};var ref by remember{mutableStateOf("")}
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
  item{Title("Pontos de Apoio","Cadastro offline")}
  item{Panel{OutlinedTextField(name,{name=it},label={Text("Nome")},modifier=Modifier.fillMaxWidth());OutlinedTextField(ref,{ref=it},label={Text("Referência")},modifier=Modifier.fillMaxWidth());Button({if(name.isNotBlank()){val id=System.currentTimeMillis();repo.addPoint(SupportPoint(id,"agua",name,ref,"",3,false));list=repo.points();name="";ref=""}},Modifier.fillMaxWidth()){Text("ADICIONAR PONTO")}}}
  items(list){p->Panel{Text("💧 ${p.name}",fontWeight=FontWeight.Bold);if(p.reference.isNotBlank())Text("📌 ${p.reference}");Text("⭐".repeat(p.rating));TextButton({repo.deletePoint(p.id);list=repo.points()}){Text("Excluir")}}}
 }
}

@Composable fun More(m:Modifier,calc:()->Unit,points:()->Unit){
 LazyColumn(m.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
  item{Title("Mais","Ferramentas do Nômade Raiz")}
  item{Panel{TextButton(calc){Text("🧮 Calculadora")};TextButton(points){Text("📍 Pontos de Apoio")};Text("⚠️ Alertas");Text("🚲 Manual da Bike");Text("💡 Dicas");Text("💾 Exportar / Backup");Text("⚙️ Configurações");Text("ℹ️ Sobre")}}
 }
}
