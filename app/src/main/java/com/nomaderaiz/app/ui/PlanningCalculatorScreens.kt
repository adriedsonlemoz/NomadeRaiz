package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.R
import com.nomaderaiz.app.data.*
import kotlinx.coroutines.launch

@Composable
internal fun PlanningScreen(
    modifier:Modifier,equipment:List<EquipmentItem>,session:PlanningSession,save:(PlanningSession)->Unit,
    onPoints:()->Unit,onManual:()->Unit,back:(()->Unit)?=null
){
    val draft=session.draft
    val issues=remember(draft){draft.issues}
    val pace=remember(draft.km,draft.days,draft.dailyKm){draft.pace}
    val saved=session.lastGenerated
    val result=remember(saved,equipment){saved?.takeIf{it.issues.isEmpty()}?.let{buildPlanningResult(it,equipment)}}
    val scroll=rememberLazyListState()
    val scope=rememberCoroutineScope()
    val focus=LocalFocusManager.current

    Column(modifier.fillMaxSize()){
        LazyColumn(
            Modifier.weight(1f).fillMaxWidth().padding(horizontal=14.dp).testTag("planning-list"),
            state=scroll,contentPadding=PaddingValues(top=6.dp,bottom=16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)
        ){
            item{ScreenHeader("Planejamento","Rota, recursos e segurança",back)}
            item{
                HeroCard(R.drawable.nr_hero_planejamento_estrada,height=205.dp){
                    Column(Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(14.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){
                        Text("PRÓXIMA VIAGEM",fontSize=12.sp,fontWeight=FontWeight.Bold,color=Color.White)
                        Text(draft.destination.ifBlank{"Defina seu destino"},fontSize=20.sp,fontWeight=FontWeight.Black,color=Color.White,maxLines=2)
                        Row(Modifier.fillMaxWidth()){
                            Metric(draft.km.numberOrNull()?.let{"${decimal(it)} km"}?:"—","distância",Modifier.weight(1f),Color.White)
                            Metric(draft.days.numberOrNull()?.let(::decimal)?:"—","dias",Modifier.weight(1f),Color.White)
                            Metric(pace.average?.let{"${decimal(it)} km"}?:"—","média/dia",Modifier.weight(1f),Color.White)
                        }
                    }
                }
            }
            if(saved!=null&&result!=null){
                item{
                    SectionCard("Último planejamento",Icons.Outlined.Assignment){
                        Text("${saved.destination.ifBlank{"Viagem"}} • ${saved.days} dia(s) • ${saved.people} pessoa(s)",fontWeight=FontWeight.SemiBold)
                        Text(if(draft!=saved)"Você alterou os dados. Gere novamente para atualizar este resumo." else "Planejamento salvo neste dispositivo.",fontSize=12.sp)
                        Text("Os recursos consideram o inventário atual.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                        result.summary.forEach{s->
                            Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)){
                                AppSymbol(s.icon);Text(s.label,Modifier.weight(1f));StatusBadge(s.status)
                            }
                        }
                    }
                }
                item{PlanningResultDetails(saved,result,onManual)}
            }
            item{PlanningTripFields(draft,{save(session.copy(draft=it))})}
            item{
                val people=draft.people.wholeNumberOrNull()?:1
                val food=remember(draft.foodForm,people){Calculator.food(Calculator.buildFoodLines(foodConfigs,foodInputs(draft.foodForm),people))}
                SectionCard("Alimentação",Icons.Outlined.Restaurant){
                    FoodEditor(draft.foodForm,{save(session.copy(draft=draft.copy(foodForm=it)))},people)
                    if(foodFormErrors(draft.foodForm).isEmpty()&&food.valid)Text("Autonomia: ${food.days?:0} dia(s) • Valor carregado: ${money(food.totalValue)}",fontWeight=FontWeight.SemiBold,fontSize=13.sp)
                }
            }
            item{PlanningWaterFields(draft,{save(session.copy(draft=it))},onPoints)}
        }
        Surface(tonalElevation=2.dp,shadowElevation=2.dp){
            Column(Modifier.fillMaxWidth().padding(horizontal=14.dp,vertical=8.dp),verticalArrangement=Arrangement.spacedBy(4.dp)){
                Text(issues.firstOrNull()?:"Rascunho salvo automaticamente.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                Button(
                    onClick={focus.clearFocus();save(session.copy(lastGenerated=draft));scope.launch{scroll.animateScrollToItem(0)}},
                    enabled=issues.isEmpty(),modifier=Modifier.fillMaxWidth().testTag("generate-plan")
                ){Icon(Icons.Outlined.Explore,null);Spacer(Modifier.width(7.dp));Text("GERAR PLANEJAMENTO")}
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PlanningTripFields(draft:PlanningDraft,change:(PlanningDraft)->Unit){
    SectionCard("Dados da viagem",Icons.Outlined.Explore){
        OutlinedTextField(draft.destination,{change(draft.copy(destination=it))},label={Text("Destino (opcional)")},modifier=Modifier.fillMaxWidth())
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
            NumericField(draft.days,{change(draft.copy(days=it))},"Dias",Modifier.weight(1f),positive=true)
            NumericField(draft.people,{change(draft.copy(people=it))},"Pessoas",Modifier.weight(1f),whole=true,positive=true)
        }
        NumericField(draft.km,{change(draft.copy(km=it))},"Distância prevista (km)")
        NumericField(draft.dailyKm,{change(draft.copy(dailyKm=it))},"Meta nos dias de pedal (km/dia)",positive=true,helper="Opcional. Deixe em branco para usar a média calculada.")
        val pace=draft.pace
        pace.average?.let{Text("Média da viagem: ${decimal(it)} km/dia, incluindo dias de descanso.",fontSize=12.sp)}
        pace.ridingDays?.let{
            Text("Na sua meta: ${decimal(it)} dia(s) de pedal para cobrir a distância.",fontSize=12.sp,color=if(pace.fits==false)MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant)
            if(pace.fits==false)Text("A meta de pedal não cobre a distância no prazo previsto.",color=MaterialTheme.colorScheme.error,fontSize=12.sp)
        }
        NumericField(draft.availableMoney,{change(draft.copy(availableMoney=it))},"Dinheiro disponível (R$)")
        Text("Tipo de viagem",fontWeight=FontWeight.SemiBold)
        FlowRow(horizontalArrangement=Arrangement.spacedBy(6.dp)){
            TravelType.entries.forEach{travel->FilterChip(selected=draft.type==travel,onClick={change(draft.copy(type=travel))},label={Text(travel.label)})}
        }
    }
}

@Composable
private fun PlanningWaterFields(draft:PlanningDraft,change:(PlanningDraft)->Unit,onPoints:()->Unit){
    val water=remember(draft.waterLiters,draft.refill,draft.refillFrequency,draft.people){
        Calculator.water(draft.waterLiters.numberOrNull()?:0.0,draft.refill,draft.refillFrequency.numberOrNull()?:0.0,draft.people.wholeNumberOrNull()?:1)
    }
    SectionCard("Água",Icons.Outlined.WaterDrop){
        NumericField(draft.waterLiters,{change(draft.copy(waterLiters=it))},"Água carregada (L)")
        Row(verticalAlignment=Alignment.CenterVertically){Switch(draft.refill,{change(draft.copy(refill=it))});Text(" Planejo reabastecer")}
        if(draft.refill){
            NumericField(draft.refillFrequency,{change(draft.copy(refillFrequency=it))},"Intervalo entre reabastecimentos (dias)",positive=true)
            OutlinedTextField(draft.waterPlaces,{change(draft.copy(waterPlaces=it))},label={Text("Locais previstos para água")},modifier=Modifier.fillMaxWidth())
            OutlinedButton(onClick=onPoints,modifier=Modifier.fillMaxWidth()){Icon(Icons.Outlined.Place,null);Text(" PONTOS DE APOIO")}
        }
        if(numberError(draft.waterLiters)==null&&draft.people.wholeNumberOrNull()?.let{it>0}==true)Text("Consumo do grupo: ${decimal(water.consumoDia)} L/dia • autonomia carregada: ${decimal(water.dias)} dia(s)",fontSize=13.sp)
    }
}

@Composable
private fun PlanningResultDetails(draft:PlanningDraft,result:PlanningResult,onManual:()->Unit){
    var expanded by androidx.compose.runtime.saveable.rememberSaveable{mutableStateOf(false)}
    Column(verticalArrangement=Arrangement.spacedBy(10.dp)){
        OutlinedButton(onClick={expanded=!expanded},modifier=Modifier.fillMaxWidth()){Text(if(expanded)"RECOLHER DETALHES" else "VER CUSTOS E RECOMENDAÇÕES")}
        if(expanded){
            SectionCard("Custos e reservas",Icons.Outlined.Payments){
                Text("Equipamentos pendentes: ${money(result.pendingCost)}")
                Text("Alimentação necessária: ${money(result.foodRequired)}")
                if(result.foodNeed.missingValue>0)Text("Falta comprar em alimentação: ${money(result.foodNeed.missingValue)}")
                Text("Reserva financeira (${(draft.type.reservePercent*100).toInt()}%): ${money(result.reserve)}")
                Text("Custo total estimado: ${money(result.totalCost)}",fontWeight=FontWeight.Bold)
            }
            SectionCard("Energia automática",Icons.Outlined.Bolt){
                val energy=result.energy
                Text("Painel: ${if(energy.hasPanel)"sim" else "não"} • reserva: ${if(energy.hasBattery)"sim" else "não"}")
                Text("Consumo: ${decimal(energy.dailyConsumptionWh)} Wh/dia • geração: ${decimal(energy.dailyGenerationWh)} Wh/dia")
                Text(if(energy.selfSustaining)"Sistema autossustentável" else "Autonomia estimada: ${decimal(energy.days?:0.0)} dia(s)")
            }
            SectionCard("Segurança e abrigo",Icons.Outlined.Shield){
                result.safety.forEach{essential->
                    Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)){
                        Icon(if(essential.bought)Icons.Outlined.CheckCircle else Icons.Outlined.WarningAmber,null)
                        Text(essential.label)
                    }
                }
                Text("Abrigo: ${if(!result.shelterRequired)"dispensável para este perfil" else "${result.boughtShelter}/${result.shelterCount} adquirido(s)"}")
                OutlinedButton(onClick=onManual,modifier=Modifier.fillMaxWidth()){Text("ABRIR MANUAL DA BIKE")}
            }
            SectionCard("Recomendações",Icons.Outlined.Lightbulb){
                result.recommendations.forEach{r->
                    Text("• ${r.text}",color=if(r.type==RecommendationType.ALERTA)MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
                }
            }
        }
    }
}
