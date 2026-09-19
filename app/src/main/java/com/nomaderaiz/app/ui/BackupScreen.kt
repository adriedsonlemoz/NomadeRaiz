package com.nomaderaiz.app.ui

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.BuildConfig
import com.nomaderaiz.app.data.AppRepository
import com.nomaderaiz.app.data.EquipmentItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
internal fun BackupScreen(repo:AppRepository,equipment:List<EquipmentItem>,onRestored:()->Unit,back:()->Unit){
    val context=LocalContext.current
    val clipboard=LocalClipboardManager.current
    val scope=rememberCoroutineScope()
    var format by remember{mutableStateOf("resumo")}
    var restoreOpen by remember{mutableStateOf(false)}
    var restoreText by remember{mutableStateOf("")}
    var restoreError by remember{mutableStateOf("")}
    var pendingTextFile by remember{mutableStateOf("")}
    var pendingBackupFile by remember{mutableStateOf("")}
    var exportText by remember{mutableStateOf("")}
    var backupText by remember{mutableStateOf("")}
    var working by remember{mutableStateOf(false)}

    LaunchedEffect(equipment,format){
        exportText=withContext(Dispatchers.Default){repo.exportText(equipment,format)}
    }
    LaunchedEffect(equipment){
        backupText=withContext(Dispatchers.IO){repo.exportBackup(BuildConfig.VERSION_NAME)}
    }

    val saveTextLauncher=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/plain")){uri->
        if(uri!=null){
            val text=pendingTextFile
            scope.launch{
                working=true
                val result=withContext(Dispatchers.IO){runCatching{context.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use{it.write(text)}?:throw IllegalStateException("Não foi possível abrir o arquivo.")}}
                working=false
                result.onSuccess{Toast.makeText(context,"Lista salva.",Toast.LENGTH_SHORT).show()}.onFailure{Toast.makeText(context,it.message?:"Erro ao salvar.",Toast.LENGTH_LONG).show()}
            }
        }
    }
    val saveBackupLauncher=rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")){uri->
        if(uri!=null){
            val text=pendingBackupFile
            scope.launch{
                working=true
                val result=withContext(Dispatchers.IO){runCatching{context.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use{it.write(text)}?:throw IllegalStateException("Não foi possível abrir o arquivo.")}}
                working=false
                result.onSuccess{Toast.makeText(context,"Backup salvo.",Toast.LENGTH_SHORT).show()}.onFailure{Toast.makeText(context,it.message?:"Erro ao salvar.",Toast.LENGTH_LONG).show()}
            }
        }
    }
    val openBackupLauncher=rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()){uri->
        if(uri!=null){
            scope.launch{
                working=true
                val result=withContext(Dispatchers.IO){runCatching{
                    val text=context.contentResolver.openInputStream(uri)?.bufferedReader()?.use{it.readText()}
                        ?:throw IllegalStateException("Não foi possível ler o arquivo.")
                    repo.importBackup(text)
                }}
                working=false
                result.onSuccess{onRestored();Toast.makeText(context,"Backup restaurado.",Toast.LENGTH_SHORT).show()}
                    .onFailure{Toast.makeText(context,it.message?:"Backup inválido.",Toast.LENGTH_LONG).show()}
            }
        }
    }

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),
        verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item{ScreenHeader("Exportar / Backup","Copie, salve ou restaure seus dados",back)}
        if(working)item{Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.Center){CircularProgressIndicator()}}
        item{
            SectionCard("Exportar lista"){
                Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){listOf("resumo" to "Resumo","compras" to "Compras","completo" to "Completo").forEach{(id,label)->FilterChip(selected=format==id,onClick={format=id},label={Text(label)})}}
                Text(if(exportText.isBlank())"Preparando lista…" else exportText,fontSize=12.sp)
                Button(onClick={clipboard.setText(AnnotatedString(exportText))},enabled=exportText.isNotBlank()&&!working,modifier=Modifier.fillMaxWidth()){Text("COPIAR LISTA")}
                OutlinedButton(onClick={pendingTextFile=exportText;saveTextLauncher.launch("Nomade-Raiz-${format}.txt")},enabled=exportText.isNotBlank()&&!working,modifier=Modifier.fillMaxWidth()){Text("SALVAR LISTA EM ARQUIVO")}
            }
        }
        item{
            SectionCard("Backup completo"){
                Text("Inclui inventário, checklists persistentes, diário, pontos de apoio, aparência/configurações, nota rápida e favoritos.",fontSize=12.sp)
                Button(onClick={clipboard.setText(AnnotatedString(backupText))},enabled=backupText.isNotBlank()&&!working,modifier=Modifier.fillMaxWidth()){Text("COPIAR BACKUP JSON")}
                OutlinedButton(onClick={pendingBackupFile=backupText;saveBackupLauncher.launch("Nomade-Raiz-backup-${BuildConfig.VERSION_NAME}.json")},enabled=backupText.isNotBlank()&&!working,modifier=Modifier.fillMaxWidth()){Text("SALVAR BACKUP JSON")}
                OutlinedButton(onClick={openBackupLauncher.launch(arrayOf("application/json","text/plain","*/*"))},enabled=!working,modifier=Modifier.fillMaxWidth()){Text("ABRIR BACKUP DO DISPOSITIVO")}
                TextButton(onClick={restoreOpen=true},enabled=!working,modifier=Modifier.fillMaxWidth()){Text("COLAR BACKUP MANUALMENTE")}
            }
        }
    }

    if(restoreOpen)AlertDialog(
        onDismissRequest={if(!working)restoreOpen=false},
        title={Text("Restaurar backup")},
        text={Column{Text("Cole abaixo o JSON do backup.",fontSize=12.sp);OutlinedTextField(value=restoreText,onValueChange={restoreText=it;restoreError=""},enabled=!working,modifier=Modifier.fillMaxWidth(),minLines=8,label={Text("Backup JSON")});if(restoreError.isNotBlank())Text(restoreError,color=MaterialTheme.colorScheme.error,fontSize=12.sp)}},
        confirmButton={Button(onClick={
            val text=restoreText
            scope.launch{
                working=true
                val result=withContext(Dispatchers.IO){runCatching{repo.importBackup(text)}}
                working=false
                result.onSuccess{restoreOpen=false;restoreText="";restoreError="";onRestored();Toast.makeText(context,"Backup restaurado.",Toast.LENGTH_SHORT).show()}
                    .onFailure{restoreError=it.message?:"Backup inválido."}
            }
        },enabled=restoreText.isNotBlank()&&!working){Text(if(working)"RESTAURANDO…" else "RESTAURAR")}},
        dismissButton={TextButton(onClick={restoreOpen=false},enabled=!working){Text("CANCELAR")}}
    )
}
