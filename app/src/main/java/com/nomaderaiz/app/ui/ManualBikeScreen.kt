package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*
import java.text.Normalizer

private fun norm(value:String)=Normalizer.normalize(value,Normalizer.Form.NFD).replace("\\p{Mn}+".toRegex(),"").lowercase()
private fun containsTerm(term:String,vararg values:Any):Boolean = values.any{value->when(value){is String->norm(value).contains(term);is List<*>->value.filterIsInstance<String>().any{norm(it).contains(term)};else->false}}

@Composable
internal fun ManualBikeScreen(equipment:List<EquipmentItem>,favorites:Set<String>,mastered:Set<String>,saveFavorites:(Set<String>)->Unit,saveMastered:(Set<String>)->Unit,back:()->Unit){
    var query by remember{mutableStateOf("")};var pieceOpen by remember{mutableStateOf<BikePiece?>(null)};var problemOpen by remember{mutableStateOf<BikeProblem?>(null)};var tipOpen by remember{mutableStateOf<BikeQuickTip?>(null)}
    val term=norm(query.trim())
    val pieces=if(term.isBlank())bikePieces else bikePieces.filter{containsTerm(term,it.name,it.function,it.commonProblems,it.warningSigns,it.tools,it.maintenance,it.steps)}
    val problems=if(term.isBlank())bikeProblems else bikeProblems.filter{containsTerm(term,it.name,it.causes,it.diagnosis,it.tools,it.steps,it.temporary,it.definitive,it.doNot,it.canContinue)}
    val glossary=if(term.isBlank())bikeGlossary else bikeGlossary.filter{containsTerm(term,it.term,it.definition)}
    val tools=bikeTools.map{tool->tool to bikeToolEquipmentIds[tool.id]?.let{id->equipment.firstOrNull{it.id==id}?.status}}
    val tracked=tools.count{it.second!=null};val owned=tools.count{it.second==ItemStatus.COMPRADO}

    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Manual da Bike","Diagnóstico, manutenção e reparos de estrada")}}
        item{OutlinedTextField(query,{query=it},label={Text("Buscar peça, problema ou termo")},modifier=Modifier.fillMaxWidth(),singleLine=true)}
        if(term.isBlank()){
            item{SectionCard("🧠 Dicas rápidas de oficina na estrada"){Text("Use estas regras para diagnosticar com segurança antes de desmontar a bicicleta.",fontSize=12.sp);bikeQuickTips.forEach{tip->Card(Modifier.fillMaxWidth().clickable{tipOpen=tip}){Row(Modifier.padding(10.dp)){Text(tip.icon,fontSize=22.sp);Spacer(Modifier.width(8.dp));Column{Text(tip.title,fontWeight=FontWeight.Bold);Text(tip.summary,fontSize=11.sp)}}}}}}
            bikeAreas.forEach{area->item{SectionCard("${area.icon} ${area.label}"){bikePieces.filter{it.area==area.id}.forEach{piece->ManualRow(piece.icon,piece.name,levelIcon(piece.level),"peca:${piece.id}" in mastered,{pieceOpen=piece})}}}}
            item{SectionCard("🛠️ Problemas na estrada"){bikeProblems.forEach{problem->ManualRow(problem.icon,problem.name,severityIcon(problem.severity),"problema:${problem.id}" in mastered,{problemOpen=problem})}}}
        }else{
            item{Text("Resultados da busca",fontWeight=FontWeight.Bold)}
            if(pieces.isEmpty()&&problems.isEmpty()&&glossary.isEmpty())item{Card(Modifier.fillMaxWidth()){Text("Nenhum resultado encontrado.",Modifier.padding(16.dp))}}
            if(pieces.isNotEmpty())item{SectionCard("Peças (${pieces.size})"){pieces.forEach{piece->ManualRow(piece.icon,piece.name,levelIcon(piece.level),"peca:${piece.id}" in mastered,{pieceOpen=piece})}}}
            if(problems.isNotEmpty())item{SectionCard("Problemas (${problems.size})"){problems.forEach{problem->ManualRow(problem.icon,problem.name,severityIcon(problem.severity),"problema:${problem.id}" in mastered,{problemOpen=problem})}}}
        }
        item{SectionCard("📖 Glossário de termos"){glossary.forEach{g->Column(Modifier.padding(vertical=5.dp)){Text(g.term,fontWeight=FontWeight.Bold);Text(g.definition,fontSize=12.sp)}}}}
        if(term.isBlank())item{SectionCard("🧰 Kit mínimo de ferramentas"){Text("Já confirmados: $owned/$tracked rastreados",fontWeight=FontWeight.SemiBold);tools.forEach{(tool,status)->Row(Modifier.fillMaxWidth().padding(vertical=4.dp),verticalAlignment=Alignment.Top){Text(tool.icon);Spacer(Modifier.width(8.dp));Column(Modifier.weight(1f)){Text(tool.name,fontWeight=FontWeight.Bold);Text(tool.reason,fontSize=11.sp)};Text(when(status){ItemStatus.COMPRADO->"✅ Tenho";ItemStatus.PENDENTE->"⚠️ Falta";null->"— Não rastreado"},fontSize=11.sp)}}}}
    }

    pieceOpen?.let{piece->
        val key="peca:${piece.id}"
        AlertDialog(onDismissRequest={pieceOpen=null},title={Text("${piece.icon} ${piece.name}")},text={LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){item{Text(piece.function)};item{ManualList("Problemas comuns",piece.commonProblems)};item{ManualList("Sinais de atenção",piece.warningSigns)};item{ManualList("Ferramentas",piece.tools)};item{ManualList("Antes de mexer",piece.before)};item{Text("Manutenção",fontWeight=FontWeight.Bold);Text(piece.maintenance)};item{ManualList("Como resolver",piece.steps,true)};item{Text("Quando parar",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.error);Text(piece.whenStop)}}},confirmButton={Row{IconButton(onClick={saveFavorites(if(key in favorites)favorites-key else favorites+key)}){Icon(if(key in favorites)Icons.Default.Star else Icons.Default.StarBorder,"Favorito")};TextButton(onClick={saveMastered(if(key in mastered)mastered-key else mastered+key)}){Text(if(key in mastered)"REMOVER DOMÍNIO" else "MARCAR DOMINADO")};TextButton(onClick={pieceOpen=null}){Text("FECHAR")}}})
    }
    problemOpen?.let{problem->
        val key="problema:${problem.id}"
        AlertDialog(onDismissRequest={problemOpen=null},title={Text("${problem.icon} ${problem.name}")},text={LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){item{ManualList("Causas",problem.causes)};item{ManualList("Diagnóstico",problem.diagnosis,true)};item{ManualList("Ferramentas",problem.tools)};item{ManualList("Passos",problem.steps,true)};item{Text("Solução temporária",fontWeight=FontWeight.Bold);Text(problem.temporary)};item{Text("Solução definitiva",fontWeight=FontWeight.Bold);Text(problem.definitive)};item{ManualList("Não faça",problem.doNot)};item{Text("Pode continuar?",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.error);Text(problem.canContinue)}}},confirmButton={Row{IconButton(onClick={saveFavorites(if(key in favorites)favorites-key else favorites+key)}){Icon(if(key in favorites)Icons.Default.Star else Icons.Default.StarBorder,"Favorito")};TextButton(onClick={saveMastered(if(key in mastered)mastered-key else mastered+key)}){Text(if(key in mastered)"REMOVER DOMÍNIO" else "MARCAR DOMINADO")};TextButton(onClick={problemOpen=null}){Text("FECHAR")}}})
    }
    tipOpen?.let{tip->AlertDialog(onDismissRequest={tipOpen=null},title={Text("${tip.icon} ${tip.title}")},text={Column{Text(tip.summary,fontWeight=FontWeight.Bold);Spacer(Modifier.height(8.dp));tip.details.forEach{Text("• $it")}}},confirmButton={TextButton(onClick={tipOpen=null}){Text("FECHAR")}})}
}

@Composable
private fun ManualRow(icon:String,name:String,badge:String,mastered:Boolean,onClick:()->Unit){Card(Modifier.fillMaxWidth().clickable(onClick=onClick)){Row(Modifier.padding(10.dp),verticalAlignment=Alignment.CenterVertically){Text(icon,fontSize=22.sp);Spacer(Modifier.width(8.dp));Text(name,Modifier.weight(1f),fontWeight=FontWeight.SemiBold);if(mastered)Text("✅ ");Text(badge)}}}
private fun levelIcon(level:String)=when(level){"basico"->"🟢";"intermediario"->"🟡";else->"🔴"}
private fun severityIcon(level:String)=when(level){"baixa"->"🟢";"media"->"🟡";else->"🔴"}
@Composable private fun ManualList(title:String,values:List<String>,numbered:Boolean=false){Text(title,fontWeight=FontWeight.Bold);values.forEachIndexed{i,v->Text("${if(numbered)"${i+1}." else "•"} $v")}}
