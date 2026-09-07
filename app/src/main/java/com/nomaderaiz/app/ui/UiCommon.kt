package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.PlanningStatus

@Composable
internal fun Header(title:String,subtitle:String?=null){
    Column(Modifier.fillMaxWidth().padding(bottom=16.dp)){
        Text(text=title,fontSize=26.sp,fontWeight=FontWeight.Black)
        if(!subtitle.isNullOrBlank())Text(text=subtitle,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
internal fun SectionCard(title:String,content:@Composable ColumnScope.()->Unit){
    Card(Modifier.fillMaxWidth()){
        Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
            Text(text=title,fontWeight=FontWeight.Bold,fontSize=17.sp)
            content()
        }
    }
}

@Composable
internal fun NumericField(value:String,onValueChange:(String)->Unit,label:String,modifier:Modifier=Modifier.fillMaxWidth()){
    OutlinedTextField(value=value,onValueChange=onValueChange,label={Text(label)},modifier=modifier,singleLine=true)
}

@Composable
internal fun StatusBadge(status:PlanningStatus){
    val text=when(status){PlanningStatus.VERDE->"OK";PlanningStatus.AMARELO->"Atenção";PlanningStatus.VERMELHO->"Crítico"}
    val color=when(status){PlanningStatus.VERDE->Color(0xFF7CB342);PlanningStatus.AMARELO->Color(0xFFE5A638);PlanningStatus.VERMELHO->MaterialTheme.colorScheme.error}
    Text(text=text,color=color,fontWeight=FontWeight.Bold,fontSize=12.sp)
}

internal fun money(value:Double)=String.format(java.util.Locale("pt","BR"),"R$ %.2f",value)
