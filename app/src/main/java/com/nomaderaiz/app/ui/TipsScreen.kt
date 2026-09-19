package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.R
import com.nomaderaiz.app.data.TravelTip
import com.nomaderaiz.app.data.travelTips

@Composable
internal fun TipsScreen(favorites:Set<String>,save:(Set<String>)->Unit,back:()->Unit){
    var onlyFavorites by rememberSaveable{mutableStateOf(false)}
    var category by rememberSaveable{mutableStateOf<String?>(null)}
    var open by remember{mutableStateOf<TravelTip?>(null)}
    val categories=remember{travelTips.map{it.category}.distinct()}
    val list=remember(onlyFavorites,favorites,category){
        travelTips.filter{(!onlyFavorites||it.id in favorites)&&(category==null||it.category==category)}
    }
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),
        verticalArrangement=Arrangement.spacedBy(8.dp)
    ){
        item{ScreenHeader("Dicas","Conhecimento prático para a estrada",back)}
        item{
            Row(Modifier.horizontalScroll(rememberScrollState()),horizontalArrangement=Arrangement.spacedBy(6.dp)){
                FilterChip(selected=category==null&&!onlyFavorites,onClick={category=null;onlyFavorites=false},label={Text("Todas")})
                FilterChip(selected=onlyFavorites,onClick={onlyFavorites=!onlyFavorites},leadingIcon={Icon(Icons.Default.Star,null)},label={Text("Favoritas (${favorites.size})")})
                categories.forEach{value->FilterChip(selected=category==value&&!onlyFavorites,onClick={category=value;onlyFavorites=false},label={Text(value)})}
            }
        }
        items(list,key={it.id}){tip->
            Card(Modifier.fillMaxWidth().clickable{open=tip}){
                Row(Modifier.padding(9.dp),verticalAlignment=Alignment.CenterVertically){
                    val image=when(tip.id){
                        "chuva"->R.drawable.nr_dica_roupas_varal
                        "manutencao"->R.drawable.nr_dica_lubrificar_corrente
                        "comida"->R.drawable.nr_dica_alimentacao_trilha
                        "carga"->R.drawable.nr_dica_escolher_pneu
                        else->null
                    }
                    if(image!=null)RasterThumbnail(image,tip.title,Modifier.size(76.dp)) else Card(Modifier.size(76.dp)){Column(Modifier.fillMaxSize(),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.Center){AppSymbol(tip.icon)}}
                    Spacer(Modifier.width(11.dp))
                    Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(4.dp)){
                        SectionLabel(tip.category)
                        Text(tip.title,fontWeight=FontWeight.Bold,fontSize=13.sp,lineHeight=16.sp)
                        Text(tip.text.substringBefore(".")+".",fontSize=12.sp,maxLines=2)
                    }
                    IconButton(onClick={save(if(tip.id in favorites)favorites-tip.id else favorites+tip.id)}){Icon(if(tip.id in favorites)Icons.Default.Star else Icons.Default.StarBorder,"Favoritar")}
                }
            }
        }
        if(list.isEmpty())item{Card(Modifier.fillMaxWidth()){Text("Você ainda não marcou nenhuma dica como favorita.",Modifier.padding(18.dp))}}
    }
    open?.let{tip->AlertDialog(onDismissRequest={open=null},confirmButton={TextButton(onClick={open=null}){Text("FECHAR")}},title={Text("${tip.icon} ${tip.title}")},text={Text(tip.text)})}
}
