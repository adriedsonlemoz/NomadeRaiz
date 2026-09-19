package com.nomaderaiz.app.ui

import androidx.annotation.DrawableRes
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.PlanningStatus
import com.nomaderaiz.app.data.numberError

@Composable
internal fun Header(title:String,subtitle:String?=null){
    Column(Modifier.fillMaxWidth().padding(bottom=6.dp),verticalArrangement=Arrangement.spacedBy(2.dp)){
        Text(text=title,fontSize=22.sp,fontWeight=FontWeight.Black)
        if(!subtitle.isNullOrBlank())Text(text=subtitle,fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
internal fun ScreenHeader(
    title:String,
    subtitle:String?=null,
    back:(()->Unit)?=null,
    trailing:@Composable RowScope.()->Unit={}
){
    Row(
        Modifier.fillMaxWidth().heightIn(min=56.dp).padding(vertical=2.dp),
        verticalAlignment=Alignment.CenterVertically
    ){
        if(back!=null){
            IconButton(onClick=back){Icon(Icons.Default.ArrowBack,contentDescription="Voltar")}
        }
        Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(1.dp)){
            Text(title,fontSize=19.sp,fontWeight=FontWeight.Black)
            if(!subtitle.isNullOrBlank())Text(subtitle,fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
        trailing()
    }
}

@Composable
internal fun SectionCard(title:String,icon:androidx.compose.ui.graphics.vector.ImageVector?=null,content:@Composable ColumnScope.()->Unit){
    Card(
        Modifier.fillMaxWidth(),
        colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant.copy(alpha=.78f)),
        border=BorderStroke(1.dp,MaterialTheme.colorScheme.outlineVariant)
    ){
        Column(Modifier.padding(14.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
            Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)){
                if(icon!=null)Icon(icon,contentDescription=null,tint=MaterialTheme.colorScheme.primary,modifier=Modifier.size(21.dp))
                Text(text=title,fontWeight=FontWeight.Bold,fontSize=15.sp)
            }
            content()
        }
    }
}

@Composable
internal fun HeroCard(
    @DrawableRes imageRes:Int,
    modifier:Modifier=Modifier,
    height:Dp=210.dp,
    contentScale:ContentScale=ContentScale.Crop,
    alignment:Alignment=Alignment.Center,
    content:@Composable BoxScope.()->Unit={}
){
    Card(
        modifier.fillMaxWidth().height(height),
        shape=RoundedCornerShape(18.dp),
        border=BorderStroke(1.dp,MaterialTheme.colorScheme.outlineVariant)
    ){
        Box(Modifier.fillMaxSize()){
            Image(
                painter=painterResource(imageRes),
                contentDescription=null,
                modifier=Modifier.fillMaxSize(),
                contentScale=contentScale,
                alignment=alignment
            )
            Box(
                Modifier.fillMaxSize().background(
                    Brush.verticalGradient(
                        listOf(Color(0x22000000),Color(0x44030A0A),Color(0xE6071213))
                    )
                )
            )
            content()
        }
    }
}

@Composable
internal fun SectionLabel(text:String,modifier:Modifier=Modifier){
    Text(
        text=text.uppercase(),
        modifier=modifier,
        color=MaterialTheme.colorScheme.onSurfaceVariant,
        fontSize=12.sp,
        fontWeight=FontWeight.Bold,
        letterSpacing=.8.sp
    )
}

@Composable
internal fun Metric(value:String,label:String,modifier:Modifier=Modifier,color:Color=Color.Unspecified){
    val resolvedColor=if(color==Color.Unspecified)MaterialTheme.colorScheme.onSurface else color
    Column(modifier,horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(1.dp)){
        Text(value,fontWeight=FontWeight.Black,fontSize=17.sp,color=resolvedColor)
        Text(label,fontSize=12.sp,color=resolvedColor.copy(alpha=.86f))
    }
}

@Composable
internal fun RasterThumbnail(@DrawableRes imageRes:Int,description:String,modifier:Modifier=Modifier){
    Image(
        painter=painterResource(imageRes),
        contentDescription=description,
        contentScale=ContentScale.Crop,
        modifier=modifier.clip(RoundedCornerShape(12.dp))
    )
}

@Composable
internal fun NumericField(
    value:String,onValueChange:(String)->Unit,label:String,modifier:Modifier=Modifier.fillMaxWidth(),
    whole:Boolean=false,positive:Boolean=false,helper:String?=null
){
    val focus=LocalFocusManager.current
    val error=numberError(value,whole,positive)
    OutlinedTextField(
        value=value,onValueChange=onValueChange,label={Text(label)},modifier=modifier,singleLine=true,
        isError=error!=null,
        supportingText=if(error!=null||helper!=null){{Text(error?:helper.orEmpty())}}else null,
        keyboardOptions=KeyboardOptions(keyboardType=if(whole)KeyboardType.Number else KeyboardType.Decimal,imeAction=ImeAction.Next),
        keyboardActions=KeyboardActions(onNext={if(!focus.moveFocus(FocusDirection.Down))focus.clearFocus()},onDone={focus.clearFocus()})
    )
}

@Composable
internal fun StatusBadge(status:PlanningStatus){
    val text=when(status){PlanningStatus.VERDE->"OK";PlanningStatus.AMARELO->"Atenção";PlanningStatus.VERMELHO->"Crítico"}
    val color=when(status){PlanningStatus.VERDE->Color(0xFF7CB342);PlanningStatus.AMARELO->Color(0xFFE5A638);PlanningStatus.VERMELHO->MaterialTheme.colorScheme.error}
    Text(text=text,color=color,fontWeight=FontWeight.Bold,fontSize=12.sp)
}

internal fun money(value:Double)=String.format(java.util.Locale("pt","BR"),"R$ %.2f",value)
internal fun decimal(value:Double)=java.text.DecimalFormat("0.#",java.text.DecimalFormatSymbols(java.util.Locale("pt","BR"))).format(value)
