package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.TravelTip
import com.nomaderaiz.app.data.travelTips

@Composable
internal fun TipsScreen(favorites:Set<String>,save:(Set<String>)->Unit,back:()->Unit){
    var onlyFavorites by remember{mutableStateOf(false)}
    var open by remember{mutableStateOf<TravelTip?>(null)}
    val list=remember(onlyFavorites,favorites){if(onlyFavorites)travelTips.filter{it.id in favorites}else travelTips}
    LazyColumn(Modifier.fillMaxSize().padding(16.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){IconButton(back){Icon(Icons.Default.ArrowBack,"Voltar")};Header("Dicas de Sobrevivência","Conhecimento prático do aplicativo original")}}
        item{Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){FilterChip(selected=!onlyFavorites,onClick={onlyFavorites=false},label={Text("Todas")});FilterChip(selected=onlyFavorites,onClick={onlyFavorites=true},label={Text("⭐ Favoritas (${favorites.size})")})}}
        items(list,key={it.id}){tip->
            Card(Modifier.fillMaxWidth().clickable{open=tip}){
                Row(Modifier.padding(14.dp),verticalAlignment=Alignment.CenterVertically){
                    Text(tip.icon,fontSize=25.sp)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)){Text(tip.category,fontSize=10.sp);Text(tip.title,fontWeight=FontWeight.Bold)}
                    IconButton(onClick={save(if(tip.id in favorites)favorites-tip.id else favorites+tip.id)}){Icon(if(tip.id in favorites)Icons.Default.Star else Icons.Default.StarBorder,"Favoritar")}
                }
            }
        }
        if(list.isEmpty())item{Card(Modifier.fillMaxWidth()){Text("Você ainda não marcou nenhuma dica como favorita.",Modifier.padding(18.dp))}}
    }
    open?.let{tip->AlertDialog(onDismissRequest={open=null},confirmButton={TextButton(onClick={open=null}){Text("FECHAR")}},title={Text("${tip.icon} ${tip.title}")},text={Text(tip.text)})}
}
