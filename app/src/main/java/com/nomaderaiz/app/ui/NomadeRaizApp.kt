package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.gearCategories
import com.nomaderaiz.app.data.quickChecks

enum class Screen(val label:String) { Home("Início"), Gear("Equipamentos"), Planning("Planejamento"), Journal("Diário"), More("Mais"), Verify("Verificar") }

@Composable
fun NomadeRaizApp() {
    var screen by remember { mutableStateOf(Screen.Home) }
    Scaffold(
        bottomBar = {
            if (screen != Screen.Verify) NavigationBar(containerColor = Color(0xFF0B1516)) {
                listOf(Screen.Home, Screen.Planning, Screen.Journal, Screen.More).forEach { item ->
                    NavigationBarItem(
                        selected = screen == item,
                        onClick = { screen = item },
                        icon = { Icon(when(item){ Screen.Home->Icons.Default.Home; Screen.Planning->Icons.Default.Map; Screen.Journal->Icons.Default.MenuBook; else->Icons.Default.MoreHoriz }, null) },
                        label = { Text(item.label) }
                    )
                }
            }
        }
    ) { padding ->
        when(screen) {
            Screen.Home -> HomeScreen(Modifier.padding(padding), { screen = Screen.Verify }, { screen = Screen.Gear })
            Screen.Gear -> EquipmentScreen(Modifier.padding(padding))
            Screen.Planning -> PlaceholderScreen("Planejamento", "Migração iniciada: formulário e análise do app original entram na próxima etapa.", Modifier.padding(padding))
            Screen.Journal -> PlaceholderScreen("Diário", "A estrutura visual nativa já está pronta para receber os registros persistidos.", Modifier.padding(padding))
            Screen.More -> MoreScreen(Modifier.padding(padding))
            Screen.Verify -> VerifyScreen({ screen = Screen.Home })
        }
    }
}

@Composable private fun Header(title:String, subtitle:String?=null) {
    Column(Modifier.fillMaxWidth().padding(bottom=18.dp)) {
        Text(title, fontSize=26.sp, fontWeight=FontWeight.Black)
        subtitle?.let { Text(it, color=Color(0xFFB6C0BA), fontSize=14.sp) }
    }
}

@Composable
private fun HomeScreen(modifier:Modifier, verify:()->Unit, gear:()->Unit) {
    LazyColumn(modifier.fillMaxSize().padding(horizontal=16.dp), contentPadding=PaddingValues(top=28.dp,bottom=24.dp), verticalArrangement=Arrangement.spacedBy(12.dp)) {
        item { Header("NÔMADE RAIZ", "Bora, cicloviajante!") }
        item {
            Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF17211E)), shape=RoundedCornerShape(20.dp)) {
                Column(Modifier.padding(20.dp), verticalArrangement=Arrangement.spacedBy(12.dp)) {
                    Text("Sua segurança começa antes da estrada.", fontSize=21.sp, fontWeight=FontWeight.Bold)
                    Text("Faça uma verificação rápida da bike, bagagem e itens essenciais antes de seguir viagem.", color=Color(0xFFB9C3BD))
                    Button(onClick=verify, modifier=Modifier.fillMaxWidth()) { Icon(Icons.Default.VerifiedUser,null); Spacer(Modifier.width(8.dp)); Text("VERIFICAR AGORA") }
                }
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement=Arrangement.spacedBy(10.dp)) {
                StatCard("20","itens",Modifier.weight(1f)); StatCard("0%","pronto",Modifier.weight(1f)); StatCard("5","checagens",Modifier.weight(1f))
            }
        }
        item { SectionCard("Equipamentos", "Organize tudo por categoria e acompanhe o que ainda falta.", "ABRIR EQUIPAMENTOS", gear) }
        item { SectionCard("Planejamento", "Distância, dias, água, alimentação, energia e orçamento.", "PLANEJAR VIAGEM") {} }
        item { SectionCard("Diário da viagem", "Registre quilômetros, clima, local e notas da estrada.", "NOVO REGISTRO") {} }
    }
}

@Composable private fun StatCard(value:String,label:String,modifier:Modifier=Modifier) {
    Card(modifier, colors=CardDefaults.cardColors(containerColor=Color(0xFF141E1E))) {
        Column(Modifier.padding(12.dp), horizontalAlignment=Alignment.CenterHorizontally) {
            Text(value, fontWeight=FontWeight.Bold, fontSize=20.sp); Text(label, fontSize=11.sp, color=Color(0xFF9FAAA5))
        }
    }
}

@Composable private fun SectionCard(title:String, body:String, action:String, click:()->Unit) {
    Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF111B1C))) {
        Column(Modifier.padding(16.dp), verticalArrangement=Arrangement.spacedBy(8.dp)) {
            Text(title, fontSize=18.sp, fontWeight=FontWeight.Bold)
            Text(body, color=Color(0xFFAFBAB4))
            TextButton(onClick=click) { Text(action) }
        }
    }
}

@Composable private fun EquipmentScreen(modifier:Modifier) {
    LazyColumn(modifier.fillMaxSize().padding(horizontal=16.dp), contentPadding=PaddingValues(top=24.dp,bottom=24.dp), verticalArrangement=Arrangement.spacedBy(10.dp)) {
        item { Header("Equipamentos","Categorias migradas da versão 1.0.26") }
        items(gearCategories) { cat ->
            Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF141E1E))) {
                Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment=Alignment.CenterVertically) {
                    Text(cat.icon, fontSize=28.sp); Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) { Text(cat.name,fontWeight=FontWeight.Bold); Text("${cat.total} itens",color=Color(0xFFAAB4AF),fontSize=12.sp) }
                    Text("${cat.ready}/${cat.total}",color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold)
                }
            }
        }
        item { Button(onClick={}, modifier=Modifier.fillMaxWidth()) { Icon(Icons.Default.Add,null); Text("  ADICIONAR ITEM") } }
    }
}

@Composable private fun VerifyScreen(back:()->Unit) {
    var checks by remember { mutableStateOf(quickChecks.associate { it.name to false }) }
    LazyColumn(Modifier.fillMaxSize().padding(horizontal=16.dp), contentPadding=PaddingValues(top=32.dp,bottom=32.dp), verticalArrangement=Arrangement.spacedBy(10.dp)) {
        item {
            Row(verticalAlignment=Alignment.CenterVertically) {
                IconButton(onClick=back){ Icon(Icons.Default.ArrowBack,null) }
                Text("VERIFICAR",fontWeight=FontWeight.Bold,fontSize=20.sp)
            }
        }
        item { Text("Antes de sair",fontSize=26.sp,fontWeight=FontWeight.Black); Text("Confirme os itens essenciais antes de pegar a estrada.",color=Color(0xFFB5BFBA)) }
        items(quickChecks) { item ->
            Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF141E1E))) {
                Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment=Alignment.CenterVertically) {
                    Checkbox(checked=checks[item.name] == true,onCheckedChange={v -> checks = checks + (item.name to v)})
                    Text(item.name,Modifier.weight(1f))
                    Text(if(checks[item.name] == true) "OK" else "Pendente",color=if(checks[item.name] == true) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,fontSize=12.sp)
                }
            }
        }
        item {
            val done = checks.values.count { it }
            LinearProgressIndicator(progress={done/quickChecks.size.toFloat()},modifier=Modifier.fillMaxWidth())
            Text("$done de ${quickChecks.size} itens verificados",fontSize=12.sp,color=Color(0xFFAAB4AF))
        }
    }
}

@Composable private fun MoreScreen(modifier:Modifier) {
    val entries=listOf("Calculadora","Pontos de apoio","Alertas","Manual da Bike","Dicas","Exportar / Backup","Configurações","Sobre")
    LazyColumn(modifier.fillMaxSize().padding(16.dp),contentPadding=PaddingValues(top=18.dp),verticalArrangement=Arrangement.spacedBy(8.dp)) {
        item { Header("Mais","Ferramentas e conteúdo do Nômade Raiz") }
        items(entries){ Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF141E1E))) { Row(Modifier.fillMaxWidth().padding(18.dp)){ Text(it,Modifier.weight(1f),fontWeight=FontWeight.SemiBold); Icon(Icons.Default.ChevronRight,null) } } }
    }
}

@Composable private fun PlaceholderScreen(title:String,body:String,modifier:Modifier) {
    Column(modifier.fillMaxSize().padding(24.dp),verticalArrangement=Arrangement.Center) {
        Header(title); Text(body,color=Color(0xFFB5BFBA))
    }
}
