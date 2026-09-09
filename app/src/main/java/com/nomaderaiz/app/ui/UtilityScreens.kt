package com.nomaderaiz.app.ui

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.BuildConfig
import com.nomaderaiz.app.data.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
internal fun VerifyScreen(repo:AppRepository,initialMode:String,onModeChanged:(String)->Unit,back:()->Unit){
    var mode by remember(initialMode){mutableStateOf(checkModes.firstOrNull{it.id==initialMode}?:checkModes.first())}
    var checks by remember(mode.id){mutableStateOf(repo.loadChecks(mode.id))}
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Verificar",mode.description)}}
        item{Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(5.dp)){checkModes.forEach{m->FilterChip(selected=mode.id==m.id,onClick={mode=m;onModeChanged(m.id)},label={Text("${m.icon} ${m.label}")})}}}
        items(mode.items){definition->
            Card(Modifier.fillMaxWidth()){
                Row(Modifier.padding(10.dp),verticalAlignment=Alignment.CenterVertically){
                    Checkbox(checked=checks[definition.id]==true,onCheckedChange={checked->checks=checks+(definition.id to checked);repo.saveChecks(mode.id,checks)})
                    Column{Text(definition.text);if(definition.tip.isNotBlank())Text(definition.tip,fontSize=11.sp)}
                }
            }
        }
        item{Text(if(mode.id in persistentCheckModes)"Esta checagem fica salva." else "Esta checagem é temporária e será limpa ao sair.",fontSize=11.sp)}
        item{TextButton(onClick={checks=emptyMap();repo.saveChecks(mode.id,checks)}){Text("LIMPAR CHECAGEM")}}
    }
}

@Composable
internal fun JournalScreen(modifier:Modifier,entries:List<JournalEntry>,save:(List<JournalEntry>)->Unit,repo:AppRepository){
    var add by remember{mutableStateOf(false)}
    var editing by remember{mutableStateOf<JournalEntry?>(null)}
    val totalKm=entries.sumOf{it.km}
    val dateFormat=remember{SimpleDateFormat("dd/MM/yyyy",Locale("pt","BR"))}

    LazyColumn(modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Header("Diário da viagem","Registre e edite os dias da jornada")}
        item{
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){
                StatCard(entries.size.toString(),"registros",Modifier.weight(1f))
                StatCard("%.1f km".format(totalKm),"pedalados",Modifier.weight(1f))
            }
        }
        item{Button(onClick={add=true},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Text(" NOVO REGISTRO")}}
        if(entries.isEmpty())item{Card(Modifier.fillMaxWidth()){Text("Nenhum registro ainda.",Modifier.padding(18.dp))}}
        items(entries,key={it.id}){entry->
            Card(Modifier.fillMaxWidth().clickable{editing=entry}){
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.Top){
                    Column(Modifier.weight(1f)){
                        Text("${entry.clima} ${entry.local}",fontWeight=FontWeight.Bold)
                        Text("${entry.km} km • ${dateFormat.format(Date(entry.createdAt))}",fontSize=11.sp)
                        if(entry.nota.isNotBlank())Text(entry.nota)
                        Text("Toque para editar",fontSize=10.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    IconButton(onClick={save(entries.filterNot{it.id==entry.id})}){Icon(Icons.Default.Delete,"Excluir")}
                }
            }
        }
    }

    if(add)JournalDialog(null,{add=false}){local,weather,km,note->
        save(listOf(JournalEntry(repo.id(),local,weather,km,note,System.currentTimeMillis()))+entries);add=false
    }
    editing?.let{old->JournalDialog(old,{editing=null}){local,weather,km,note->
        val updated=old.copy(local=local,clima=weather,km=km,nota=note)
        save(entries.map{if(it.id==old.id)updated else it});editing=null
    }}
}

@Composable
private fun StatCard(value:String,label:String,modifier:Modifier){
    Card(modifier){Column(Modifier.padding(10.dp),horizontalAlignment=Alignment.CenterHorizontally){Text(value,fontWeight=FontWeight.Bold);Text(label,fontSize=10.sp)}}
}

@Composable
private fun JournalDialog(entry:JournalEntry?,dismiss:()->Unit,done:(String,String,Double,String)->Unit){
    var local by remember(entry?.id){mutableStateOf(entry?.local?:"")}
    var weather by remember(entry?.id){mutableStateOf(entry?.clima?:"☀️")}
    var km by remember(entry?.id){mutableStateOf(entry?.km?.takeIf{it>0}?.toString()?:"")}
    var note by remember(entry?.id){mutableStateOf(entry?.nota?:"")}
    val weathers=listOf("☀️","⛅","☁️","🌧️","⛈️","🌬️")
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button(onClick={done(local.trim(),weather,km.toDoubleOrNull()?.coerceAtLeast(0.0)?:0.0,note)},enabled=local.isNotBlank()){Text("SALVAR")}},
        dismissButton={TextButton(dismiss){Text("CANCELAR")}},
        title={Text(if(entry==null)"Novo registro" else "Editar registro")},
        text={Column(verticalArrangement=Arrangement.spacedBy(8.dp)){
            OutlinedTextField(local,{local=it},label={Text("Local")},modifier=Modifier.fillMaxWidth())
            Row(Modifier.horizontalScroll(rememberScrollState())){weathers.forEach{w->FilterChip(selected=weather==w,onClick={weather=w},label={Text(w)},modifier=Modifier.padding(end=4.dp))}}
            NumericField(km,{km=it},"Km pedalados")
            OutlinedTextField(note,{note=it},label={Text("Nota")},modifier=Modifier.fillMaxWidth(),minLines=3)
        }}
    )
}

@Composable
internal fun MoreScreen(modifier:Modifier,open:(String)->Unit){
    val entries=listOf("Calculadora","Pontos de apoio","Alertas","Manual da Bike","Dicas","Exportar / Backup","Configurações","Sobre")
    LazyColumn(modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Header("Mais","Ferramentas do Nômade Raiz")}
        items(entries){entry->Card(Modifier.fillMaxWidth().clickable{open(entry)}){Row(Modifier.padding(18.dp),verticalAlignment=Alignment.CenterVertically){Text(entry,Modifier.weight(1f));Icon(Icons.Default.ChevronRight,null)}}}
    }
}

private val supportTypes=listOf("agua" to "💧 Água","mercado" to "🛒 Mercado","camping" to "⛺ Camping","saude" to "🏥 Saúde","oficina" to "🔧 Oficina","outro" to "📍 Outro")

@Composable
internal fun PointsScreen(points:List<SupportPoint>,save:(List<SupportPoint>)->Unit,repo:AppRepository,back:()->Unit){
    var edit by remember{mutableStateOf<SupportPoint?>(null)}
    var add by remember{mutableStateOf(false)}
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Pontos de apoio","Referências úteis da rota")}}
        item{Button(onClick={add=true},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.Add,null);Text(" NOVO PONTO")}}
        if(points.isEmpty())item{Card(Modifier.fillMaxWidth()){Text("Nenhum ponto cadastrado.",Modifier.padding(18.dp))}}
        items(points,key={it.id}){point->
            Card(Modifier.fillMaxWidth().clickable{edit=point}){
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.Top){
                    Text(supportTypes.firstOrNull{it.first==point.tipo}?.second?.substringBefore(" ")?:"📍",fontSize=24.sp);Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)){
                        Row{Text(point.nome,fontWeight=FontWeight.Bold);if(point.fechado)Text(" • Fechado",color=MaterialTheme.colorScheme.error,fontSize=11.sp)}
                        if(point.referencia.isNotBlank())Text("📌 ${point.referencia}",fontSize=12.sp)
                        if(point.obs.isNotBlank())Text(point.obs,fontSize=12.sp)
                        Text("⭐".repeat(point.avaliacao),fontSize=12.sp)
                    }
                    IconButton(onClick={save(points.filterNot{it.id==point.id})}){Icon(Icons.Default.Delete,"Excluir")}
                }
            }
        }
    }
    if(add)PointDialog(SupportPoint(repo.id(),"agua","","","",2,false),{add=false}){save(points+it);add=false}
    edit?.let{old->PointDialog(old,{edit=null}){new->save(points.map{if(it.id==new.id)new else it});edit=null}}
}

@Composable
private fun PointDialog(point:SupportPoint,dismiss:()->Unit,done:(SupportPoint)->Unit){
    var type by remember{mutableStateOf(point.tipo)}
    var name by remember{mutableStateOf(point.nome)}
    var reference by remember{mutableStateOf(point.referencia)}
    var note by remember{mutableStateOf(point.obs)}
    var rating by remember{mutableIntStateOf(point.avaliacao)}
    var closed by remember{mutableStateOf(point.fechado)}
    AlertDialog(
        onDismissRequest=dismiss,
        confirmButton={Button(onClick={done(point.copy(tipo=type,nome=name.trim(),referencia=reference,obs=note,avaliacao=rating,fechado=closed))},enabled=name.isNotBlank()){Text("SALVAR")}},
        dismissButton={TextButton(dismiss){Text("CANCELAR")}},
        title={Text(if(point.nome.isBlank())"Novo ponto" else "Editar ponto")},
        text={LazyColumn(verticalArrangement=Arrangement.spacedBy(7.dp)){
            item{Row(Modifier.horizontalScroll(rememberScrollState())){supportTypes.forEach{t->FilterChip(selected=type==t.first,onClick={type=t.first},label={Text(t.second)},modifier=Modifier.padding(end=4.dp))}}}
            item{OutlinedTextField(name,{name=it},label={Text("Nome / descrição")},modifier=Modifier.fillMaxWidth())}
            item{OutlinedTextField(reference,{reference=it},label={Text("Referência de localização")},modifier=Modifier.fillMaxWidth())}
            item{OutlinedTextField(note,{note=it},label={Text("Observações")},modifier=Modifier.fillMaxWidth())}
            item{Row(verticalAlignment=Alignment.CenterVertically){Text("Avaliação: ");(1..3).forEach{n->FilterChip(selected=rating>=n,onClick={rating=n},label={Text("⭐")},modifier=Modifier.padding(end=4.dp))}}}
            item{Row(verticalAlignment=Alignment.CenterVertically){Switch(checked=closed,onCheckedChange={closed=it});Text(if(closed)" Fechado" else " Aberto")}}
        }}
    )
}

@Composable
internal fun AlertsScreen(equipment:List<EquipmentItem>,minimums:Map<String,Int>,save:(Map<String,Int>)->Unit,back:()->Unit){
    var editing by remember{mutableStateOf<String?>(null)}
    var editValue by remember{mutableStateOf("")}
    fun owned(item:EquipmentItem)=if(item.status==ItemStatus.COMPRADO)item.quantity else 0
    val alerts=equipment.filter{item->minimums[item.id]?.let{owned(item)<it}==true}
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Alertas de Reposição","Estoque e mínimos por item")}}
        item{Card(Modifier.fillMaxWidth()){Column(Modifier.padding(14.dp)){Text(if(alerts.isEmpty())"✅ Tudo dentro do mínimo" else "⚠️ ${alerts.size} ${if(alerts.size==1)"item precisa" else "itens precisam"} de reposição",fontWeight=FontWeight.Bold,color=if(alerts.isEmpty())LocalContentColor.current else MaterialTheme.colorScheme.error);alerts.forEach{Text("${it.name}: ${owned(it)} disponível / mín ${minimums[it.id]}",fontSize=12.sp)}}}}
        item{OutlinedButton(onClick={save(minimums+suggestedMinimums.filterKeys{minimums[it]==null})},modifier=Modifier.fillMaxWidth()){Text("💡 APLICAR MÍNIMOS SUGERIDOS")}}
        items(equipment,key={it.id}){item->
            val min=minimums[item.id]
            val below=min!=null&&owned(item)<min
            Card(Modifier.fillMaxWidth()){
                Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically){
                    Column(Modifier.weight(1f)){Text(item.name,fontWeight=FontWeight.SemiBold);Text("Disponível: ${owned(item)}${if(item.status==ItemStatus.PENDENTE&&item.quantity>0)" • planejado: ${item.quantity}" else ""}",fontSize=11.sp,color=if(below)MaterialTheme.colorScheme.error else LocalContentColor.current)}
                    if(editing==item.id){
                        OutlinedTextField(editValue,{editValue=it},modifier=Modifier.width(80.dp),singleLine=true)
                        TextButton(onClick={val n=editValue.toIntOrNull();if(n!=null&&n>=0)save(minimums+(item.id to n));editing=null}){Text("OK")}
                    }else TextButton(onClick={editing=item.id;editValue=(min?:0).toString()}){Text(if(min==null)"+ definir" else "mín $min")}
                }
            }
        }
    }
}

@Composable
internal fun TipsScreen(favorites:Set<String>,save:(Set<String>)->Unit,back:()->Unit){
    var onlyFavorites by remember{mutableStateOf(false)}
    var open by remember{mutableStateOf<TravelTip?>(null)}
    val list=if(onlyFavorites)travelTips.filter{it.id in favorites}else travelTips
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Dicas de Sobrevivência","Conhecimento prático do aplicativo original")}}
        item{Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){FilterChip(selected=!onlyFavorites,onClick={onlyFavorites=false},label={Text("Todas")});FilterChip(selected=onlyFavorites,onClick={onlyFavorites=true},label={Text("⭐ Favoritas (${favorites.size})")})}}
        items(list,key={it.id}){tip->Card(Modifier.fillMaxWidth().clickable{open=tip}){Row(Modifier.padding(14.dp),verticalAlignment=Alignment.CenterVertically){Text(tip.icon,fontSize=25.sp);Spacer(Modifier.width(10.dp));Column(Modifier.weight(1f)){Text(tip.category,fontSize=10.sp);Text(tip.title,fontWeight=FontWeight.Bold)};IconButton(onClick={save(if(tip.id in favorites)favorites-tip.id else favorites+tip.id)}){Icon(if(tip.id in favorites)Icons.Default.Star else Icons.Default.StarBorder,null)}}}}
    }
    open?.let{tip->AlertDialog(onDismissRequest={open=null},confirmButton={TextButton(onClick={open=null}){Text("FECHAR")}},title={Text("${tip.icon} ${tip.title}")},text={Text(tip.text)})}
}

@Composable
internal fun SettingsScreen(settings:AppSettings,itemCount:Int,journalCount:Int,pointCount:Int,save:(AppSettings)->Unit,clearAll:()->Unit,back:()->Unit){
    var confirmClear by remember{mutableStateOf(false)}
    var confirmReset by remember{mutableStateOf(false)}
    val days=settings.startDate?.let{((System.currentTimeMillis()-it)/(24*60*60*1000L)).toInt()+1}?:0

    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Configurações")}}
        item{
            SectionCard("Aparência"){
                Row(verticalAlignment=Alignment.CenterVertically){Text("Modo escuro",Modifier.weight(1f));Switch(checked=settings.themeMode==ThemeMode.DARK,onCheckedChange={save(settings.copy(themeMode=if(it)ThemeMode.DARK else ThemeMode.LIGHT))})}
                Text("Cor do aplicativo",fontWeight=FontWeight.SemiBold)
                Text("Altera botões, seleção, navegação e destaques.",fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    AppAccent.entries.forEach{accent->
                        FilterChip(
                            selected=settings.accent==accent,
                            onClick={save(settings.copy(accent=accent))},
                            label={Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(5.dp)){Text("●",color=Color(accent.hex),fontSize=20.sp);Text(accent.label)}}
                        )
                    }
                }
                Text("Tamanho da fonte",fontWeight=FontWeight.SemiBold)
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                    FontScale.entries.forEach{scale->FilterChip(selected=settings.fontScale==scale,onClick={save(settings.copy(fontScale=scale))},label={Text(when(scale){FontScale.SM->"A pequeno";FontScale.MD->"A médio";FontScale.LG->"A grande"})})}
                }
                OutlinedButton(onClick={save(settings.copy(themeMode=ThemeMode.DARK,fontScale=FontScale.MD,accent=AppAccent.RAIZ))},modifier=Modifier.fillMaxWidth()){Text("RESTAURAR APARÊNCIA PADRÃO")}
            }
        }
        item{SectionCard("Viagem"){Text("Dias na estrada: ${if(days>0)days else "—"}",fontWeight=FontWeight.Bold);Button(onClick={if(settings.startDate!=null)confirmReset=true else save(settings.copy(startDate=System.currentTimeMillis()))},modifier=Modifier.fillMaxWidth()){Text(if(settings.startDate!=null)"🔄 Reiniciar viagem" else "🚀 Iniciar viagem")};if(settings.startDate!=null)OutlinedButton(onClick={save(settings.copy(startDate=null))},modifier=Modifier.fillMaxWidth()){Text("Zerar contador")}}}
        item{SectionCard("Dados"){Text("Itens no inventário: $itemCount");Text("Entradas no diário: $journalCount");Text("Pontos de apoio: $pointCount");Button(onClick={confirmClear=true},modifier=Modifier.fillMaxWidth(),colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.error)){Text("🗑️ Apagar todos os dados")}}}
    }

    if(confirmClear)AlertDialog(onDismissRequest={confirmClear=false},title={Text("Apagar todos os dados?")},text={Text("Isso apagará inventário, checklists, diário, pontos, configurações, nota rápida e favoritos salvos neste dispositivo.")},confirmButton={Button(onClick={confirmClear=false;clearAll()},colors=ButtonDefaults.buttonColors(containerColor=MaterialTheme.colorScheme.error)){Text("APAGAR")}},dismissButton={TextButton(onClick={confirmClear=false}){Text("CANCELAR")}})
    if(confirmReset)AlertDialog(onDismissRequest={confirmReset=false},title={Text("Reiniciar viagem?")},text={Text("Isso vai resetar o contador de dias.")},confirmButton={Button(onClick={confirmReset=false;save(settings.copy(startDate=System.currentTimeMillis()))}){Text("REINICIAR")}},dismissButton={TextButton(onClick={confirmReset=false}){Text("CANCELAR")}})
}

@Composable
internal fun BackupScreen(repo:AppRepository,equipment:List<EquipmentItem>,onRestored:()->Unit,back:()->Unit){
    val context=LocalContext.current
    val clipboard=LocalClipboardManager.current
    var format by remember{mutableStateOf("resumo")}
    var restoreOpen by remember{mutableStateOf(false)}
    var restoreText by remember{mutableStateOf("")}
    var error by remember{mutableStateOf("")}
    var pendingTextFile by remember{mutableStateOf("")}
    var pendingBackupFile by remember{mutableStateOf("")}
    val exportText=remember(equipment,format){repo.exportText(equipment,format)}
    val backupText=remember(equipment){repo.exportBackup(BuildConfig.VERSION_NAME)}

    val saveTextLauncher=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/plain")){uri->
        if(uri!=null)runCatching{context.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use{it.write(pendingTextFile)}?:error("Não foi possível abrir o arquivo.")}.onSuccess{Toast.makeText(context,"Lista salva.",Toast.LENGTH_SHORT).show()}.onFailure{Toast.makeText(context,it.message?:"Erro ao salvar.",Toast.LENGTH_LONG).show()}
    }
    val saveBackupLauncher=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")){uri->
        if(uri!=null)runCatching{context.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use{it.write(pendingBackupFile)}?:error("Não foi possível abrir o arquivo.")}.onSuccess{Toast.makeText(context,"Backup salvo.",Toast.LENGTH_SHORT).show()}.onFailure{Toast.makeText(context,it.message?:"Erro ao salvar.",Toast.LENGTH_LONG).show()}
    }
    val openBackupLauncher=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){uri->
        if(uri!=null){
            runCatching{context.contentResolver.openInputStream(uri)?.bufferedReader()?.use{it.readText()}?:error("Não foi possível ler o arquivo.")}
                .onSuccess{text->runCatching{repo.importBackup(text)}.onSuccess{onRestored();Toast.makeText(context,"Backup restaurado.",Toast.LENGTH_SHORT).show()}.onFailure{Toast.makeText(context,it.message?:"Backup inválido.",Toast.LENGTH_LONG).show()}}
                .onFailure{Toast.makeText(context,it.message?:"Erro ao ler backup.",Toast.LENGTH_LONG).show()}
        }
    }

    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Exportar / Backup","Copie, salve ou restaure seus dados")}}
        item{
            SectionCard("Exportar lista"){
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){listOf("resumo" to "Resumo","compras" to "Compras","completo" to "Completo").forEach{(id,label)->FilterChip(selected=format==id,onClick={format=id},label={Text(label)})}}
                Text(exportText,fontSize=12.sp)
                Button(onClick={clipboard.setText(AnnotatedString(exportText))},modifier=Modifier.fillMaxWidth()){Text("COPIAR LISTA")}
                OutlinedButton(onClick={pendingTextFile=exportText;saveTextLauncher.launch("Nomade-Raiz-${format}.txt")},modifier=Modifier.fillMaxWidth()){Text("SALVAR LISTA EM ARQUIVO")}
            }
        }
        item{
            SectionCard("Backup completo"){
                Text("Inclui inventário, checklists persistentes, diário, pontos de apoio, aparência/configurações, nota rápida e favoritos.",fontSize=12.sp)
                Button(onClick={clipboard.setText(AnnotatedString(backupText))},modifier=Modifier.fillMaxWidth()){Text("COPIAR BACKUP JSON")}
                OutlinedButton(onClick={pendingBackupFile=backupText;saveBackupLauncher.launch("Nomade-Raiz-backup-${BuildConfig.VERSION_NAME}.json")},modifier=Modifier.fillMaxWidth()){Text("SALVAR BACKUP JSON")}
                OutlinedButton(onClick={openBackupLauncher.launch(arrayOf("application/json","text/plain","*/*"))},modifier=Modifier.fillMaxWidth()){Text("ABRIR BACKUP DO DISPOSITIVO")}
                TextButton(onClick={restoreOpen=true},modifier=Modifier.fillMaxWidth()){Text("COLAR BACKUP MANUALMENTE")}
            }
        }
    }

    if(restoreOpen)AlertDialog(
        onDismissRequest={restoreOpen=false},
        title={Text("Restaurar backup")},
        text={Column{Text("Cole abaixo o JSON do backup.",fontSize=12.sp);OutlinedTextField(value=restoreText,onValueChange={restoreText=it;error=""},modifier=Modifier.fillMaxWidth(),minLines=8,label={Text("Backup JSON")});if(error.isNotBlank())Text(error,color=MaterialTheme.colorScheme.error,fontSize=12.sp)}},
        confirmButton={Button(onClick={runCatching{repo.importBackup(restoreText)}.onSuccess{restoreOpen=false;restoreText="";onRestored()}.onFailure{error=it.message?:"Backup inválido."}},enabled=restoreText.isNotBlank()){Text("RESTAURAR")}},
        dismissButton={TextButton(onClick={restoreOpen=false}){Text("CANCELAR")}}
    )
}

@Composable
internal fun AboutScreen(back:()->Unit){
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Sobre","Nômade Raiz ${BuildConfig.VERSION_NAME}")}}
        item{SectionCard("Nômade Raiz"){Text("Planejamento, equipamentos e autonomia para quem vive a estrada sobre duas rodas.");Text("Android nativo • Kotlin • Jetpack Compose",fontWeight=FontWeight.SemiBold)}}
        item{SectionCard("Versão"){Text("versionName: ${BuildConfig.VERSION_NAME}");Text("versionCode: ${BuildConfig.VERSION_CODE}");Text("applicationId: ${BuildConfig.APPLICATION_ID}",fontSize=12.sp)}}
        item{SectionCard("Migração Kotlin"){Text("Esta versão preserva dados e regras do aplicativo original enquanto substitui a base web por Android nativo.",fontSize=13.sp)}}
    }
}
