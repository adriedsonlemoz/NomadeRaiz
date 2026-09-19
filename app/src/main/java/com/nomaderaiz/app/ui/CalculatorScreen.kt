package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bolt
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.WaterDrop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*

/**
 * Calculadora intencionalmente enxuta para uso na estrada.
 * Os campos antigos continuam no CalculatorDraft/SharedPreferences para preservar dados de versões anteriores,
 * mas a interface concentra somente os três recursos úteis durante a cicloviagem.
 */
@Composable
internal fun CalculatorScreen(draft:CalculatorDraft,save:(CalculatorDraft)->Unit,back:()->Unit){
    val days=draft["days"].numberOrNull()
    val foodPerDay=draft["foodDailyCost"].numberOrNull()
    val waterCarried=draft["waterLiters"].numberOrNull()
    val waterPerDay=draft["waterDailyLiters"].numberOrNull()
    val energyStored=draft["energyStoredWh"].numberOrNull()
    val energyPerDay=draft["energyDailyWh"].numberOrNull()

    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),
        verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item{ScreenHeader("Calculadora","Alimentação, água e energia",back)}
        item{Text("Só o essencial para consultar rápido durante a viagem. Os valores ficam salvos automaticamente.",fontSize=13.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)}
        item{SectionCard("Viagem"){
            DraftNumber(draft,save,"days","Dias de viagem",unit="dias")
        }}
        item{SectionCard("Alimentação",Icons.Outlined.Restaurant){
            DraftNumber(draft,save,"foodDailyCost","Gasto por dia",money=true)
            if(days!=null&&days>0&&foodPerDay!=null&&foodPerDay>=0){
                Text("Total estimado: ${money(days*foodPerDay)}",fontWeight=FontWeight.Bold)
            }
        }}
        item{SectionCard("Água",Icons.Outlined.WaterDrop){
            DraftNumber(draft,save,"waterLiters","Água carregada",unit="L")
            DraftNumber(draft,save,"waterDailyLiters","Consumo por dia",unit="L/dia")
            if(waterCarried!=null&&waterCarried>=0&&waterPerDay!=null&&waterPerDay>0){
                Text("Autonomia: ${decimal(waterCarried/waterPerDay)} dia(s)",fontWeight=FontWeight.Bold)
                if(days!=null&&days>0) Text("Necessário para a viagem: ${decimal(days*waterPerDay)} L",fontSize=13.sp)
            }
        }}
        item{SectionCard("Energia",Icons.Outlined.Bolt){
            DraftNumber(draft,save,"energyStoredWh","Energia disponível",unit="Wh")
            DraftNumber(draft,save,"energyDailyWh","Consumo por dia",unit="Wh/dia")
            if(energyStored!=null&&energyStored>=0&&energyPerDay!=null&&energyPerDay>0){
                Text("Autonomia: ${decimal(energyStored/energyPerDay)} dia(s)",fontWeight=FontWeight.Bold)
                if(days!=null&&days>0) Text("Necessário para a viagem: ${decimal(days*energyPerDay)} Wh",fontSize=13.sp)
            }
        }}
    }
}

@Composable
private fun DraftNumber(draft:CalculatorDraft,save:(CalculatorDraft)->Unit,key:String,label:String,money:Boolean=false,unit:String?=null){
    NumericField(draft[key],{save(draft.withField(key,it))},label,money=money,unit=unit)
}
