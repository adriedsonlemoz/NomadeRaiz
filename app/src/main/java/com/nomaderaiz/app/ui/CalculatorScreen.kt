package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*

@Composable
internal fun CalculatorScreen(equipment:List<EquipmentItem>,draft:CalculatorDraft,save:(CalculatorDraft)->Unit,back:()->Unit){
    val result=remember(draft,equipment){calculateDraft(draft,equipment)}
    val people=draft["people"].wholeNumberOrNull()?:1
    LazyColumn(
        Modifier.fillMaxSize().padding(horizontal=14.dp),
        contentPadding=PaddingValues(top=6.dp,bottom=20.dp),verticalArrangement=Arrangement.spacedBy(10.dp)
    ){
        item{ScreenHeader("Calculadora","Autonomia completa da sua viagem",back)}
        item{CalculatorSummary(result)}
        item{Text("Os campos ficam salvos automaticamente neste dispositivo.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)}
        item{SectionCard("Bike",Icons.Outlined.DirectionsBike){
            DraftNumber(draft,save,"speed","Velocidade média (km/h)")
            DraftNumber(draft,save,"hours","Horas pedalando/dia")
            DraftNumber(draft,save,"days","Dias")
            result?.bike?.let{Text("Distância/dia: ${decimal(it.kmDia)} km • Total: ${decimal(it.distanciaTotal)} km",fontWeight=FontWeight.SemiBold)}
        }}
        item{SectionCard("Comida",Icons.Outlined.Restaurant){
            DraftNumber(draft,save,"people","Pessoas",whole=true,positive=true)
            FoodEditor(draft.foodForm,{save(draft.copy(foodForm=it))},people)
            if(result?.food?.valid==true){
                Text("Autonomia: ${result.food.days} dia(s) • Valor: ${money(result.food.totalValue)}")
                if(result.need.valid)Text("Para ${draft["days"]} dias: ${money(result.need.requiredValue)} • faltante: ${money(result.need.missingValue)} (${result.need.missingItems} item(ns))")
            }
        }}
        item{SectionCard("Água",Icons.Outlined.WaterDrop){
            DraftNumber(draft,save,"waterLiters","Água carregada (L)")
            Row(verticalAlignment=Alignment.CenterVertically){Switch(draft.refill,{save(draft.copy(refill=it))});Text(" Haverá reabastecimento")}
            if(draft.refill)DraftNumber(draft,save,"freq","Intervalo entre pontos (dias)",positive=true)
            result?.water?.let{
                Text("Consumo: ${decimal(it.consumoDia)} L/dia • Autonomia: ${decimal(it.dias)} dia(s)")
                if(draft.refill)Text(if(it.suficientePorIntervalo)"Água suficiente até o próximo ponto." else "Água insuficiente para o intervalo.")
            }
        }}
        item{SectionCard("Energia",Icons.Outlined.Bolt){
            DraftNumber(draft,save,"panel","Painel solar (W)")
            DraftNumber(draft,save,"sun","Horas de sol/dia")
            DraftNumber(draft,save,"battery","Bateria (Wh)")
            DraftNumber(draft,save,"powerbank","Power bank (Wh)")
            Text("Consumo de referência: celular 12 Wh/dia e luzes 8 Wh/dia.",fontSize=12.sp)
            result?.let{r->
                if(r.energyEntered){
                    Text("Geração: ${decimal(r.energy.geracaoDiariaWh)} Wh/dia • Consumo: ${decimal(r.energy.consumoDiarioWh)} Wh/dia")
                    Text(if(r.energy.autossustentavel)"Sistema autossustentável" else "Autonomia estimada: ${decimal(r.energy.dias)} dia(s)")
                }else Text("Informe uma reserva de energia ou painel e horas de sol para calcular.",fontSize=12.sp)
            }
        }}
        item{SectionCard("Dinheiro",Icons.Outlined.Payments){
            DraftNumber(draft,save,"available","Disponível (R$)")
            DraftNumber(draft,save,"dailyExpense","Gasto por dia (R$)")
            result?.cash?.takeIf{it.valido}?.let{Text("Autonomia financeira: ${decimal(it.dias)} dia(s)")}
        }}
        item{SectionCard("Peso",Icons.Outlined.Backpack){Text("Informe o peso unitário dos itens do inventário. As quantidades cadastradas serão consideradas.",fontSize=13.sp)}}
        items(equipment,key={"weight-${it.id}"}){item->
            Card(Modifier.fillMaxWidth()){
                Column(Modifier.padding(10.dp),verticalArrangement=Arrangement.spacedBy(4.dp)){
                    Text("${item.name} ×${item.quantity}",fontSize=13.sp,fontWeight=FontWeight.SemiBold)
                    NumericField(draft.weightData[item.id].orEmpty(),{save(draft.copy(weightData=draft.weightData+(item.id to it)))},"Peso unitário (kg)")
                }
            }
        }
        item{result?.weight?.let{weight->SectionCard("Carga total"){
            Text("${decimal(weight.total)} kg / limite de referência 25 kg",fontWeight=FontWeight.Bold)
            if(weight.acimaDoLimite)Text("Acima do limite de referência.",color=MaterialTheme.colorScheme.error)
        }}}
        item{SectionCard("Custo da viagem",Icons.Outlined.ReceiptLong){
            DraftNumber(draft,save,"foodDailyCost","Alimentação por dia (R$)")
            DraftNumber(draft,save,"transport","Transporte (R$)")
            DraftNumber(draft,save,"maintenance","Manutenção (R$)")
            DraftNumber(draft,save,"other","Outros (R$)")
            result?.tripCost?.let{Text("Custo estimado: ${money(it.total)}",fontWeight=FontWeight.Bold)}
        }}
    }
}

@Composable
private fun DraftNumber(draft:CalculatorDraft,save:(CalculatorDraft)->Unit,key:String,label:String,whole:Boolean=false,positive:Boolean=false){
    NumericField(draft[key],{save(draft.withField(key,it))},label,whole=whole,positive=positive)
}

@Composable
private fun CalculatorSummary(result:CalculatorDraftResult?){
    SectionCard("Resultado",Icons.Outlined.Calculate){
        if(result==null){
            Text("Revise os campos informados",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.error)
            Text("Os resultados serão exibidos quando os valores estiverem válidos. Pessoas e intervalo de reabastecimento precisam ser maiores que zero.",fontSize=13.sp)
        }else{
            Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(14.dp)){
                Box(Modifier.size(72.dp),contentAlignment=Alignment.Center){
                    CircularProgressIndicator(progress={result.completedResources/5f},modifier=Modifier.fillMaxSize(),strokeWidth=7.dp)
                    Text("${result.completedResources}/5",fontWeight=FontWeight.Black)
                }
                Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(4.dp)){
                    Text("Autonomia da viagem",fontSize=13.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(result.general.days?.let{"${decimal(it)} dias"}?:"Complete os dados",fontSize=22.sp,fontWeight=FontWeight.Black)
                    Text(result.general.bottleneck?.let{"Limitante: ${it.name}"}?:"Bike, comida, água, energia e dinheiro",fontSize=12.sp)
                }
            }
            if(result.completedResources<5)Text("Resultado parcial: preencha os cinco recursos para comparar toda a viagem.",fontSize=12.sp)
        }
    }
}
