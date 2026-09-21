package com.nomaderaiz.app.ui

import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import kotlin.math.abs
import kotlin.math.ceil

@Composable
internal fun PlanningScreen(
    modifier:Modifier,equipment:List<EquipmentItem>,session:PlanningSession,
    updateDraft:((PlanningDraft)->PlanningDraft)->Unit,
    setSafetyMargin:(Int)->Unit,
    commitCurrent:()->Unit,onPoints:()->Unit,onManual:()->Unit,back:(()->Unit)?=null
){
    val draft=session.draft
    val issues=remember(draft){draft.issues}
    val estimate=remember(draft.km,draft.speedKmh,draft.hoursPerDay,draft.safetyMarginPercent){draft.tripEstimate}
    val essentials=remember(draft){essentialResourceEstimate(draft)}
    val scenarios=remember(draft.km,draft.speedKmh,draft.safetyMarginPercent){
        planningScenarios(draft.km.numberOrNull(),draft.speedKmh.numberOrNull(),draft.safetyMarginPercent)
    }
    val saved=session.lastGenerated
    val savedCanBuild=remember(saved){saved?.issues?.isEmpty()==true}
    var advanced by rememberSaveable{mutableStateOf(false)}
    var savedDetails by rememberSaveable{mutableStateOf(false)}
    val result=remember(saved,equipment,savedDetails,savedCanBuild){
        if(savedDetails&&savedCanBuild) saved?.let{buildPlanningResult(it,equipment)} else null
    }
    var saveFeedback by rememberSaveable{mutableStateOf(false)}
    val scroll=rememberLazyListState()
    val scope=rememberCoroutineScope()
    val focus=LocalFocusManager.current

    Column(modifier.fillMaxSize()){
        LazyColumn(
            Modifier.weight(1f).fillMaxWidth().padding(horizontal=14.dp).testTag("planning-list"),
            state=scroll,contentPadding=PaddingValues(top=6.dp,bottom=16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)
        ){
            item{ScreenHeader("Planejar","Destino, ritmo e autonomia",back)}

            if(saved!=null){
                item{
                    LastSavedPlanCard(saved,savedCanBuild,savedDetails,{savedDetails=!savedDetails})
                }
                if(savedDetails&&result!=null){
                    item{PlanningResultDetails(saved,result,onManual)}
                }
            }

            item{
                PlanningTripFields(draft){transform->
                    saveFeedback=false
                    updateDraft(transform)
                }
            }
            item{
                PlanningRideFields(
                    draft=draft,
                    change={transform->
                        saveFeedback=false
                        updateDraft(transform)
                    },
                    setSafetyMargin={value->
                        saveFeedback=false
                        setSafetyMargin(value)
                    }
                )
            }
            item{LivePlanCard(draft,estimate)}
            if(scenarios.isNotEmpty()){
                item{
                    ScenarioSuggestions(draft,scenarios){hours->
                        saveFeedback=false
                        updateDraft{it.copy(hoursPerDay=hours.toInt().toString())}
                    }
                }
            }
            item{
                EssentialResourcesCard(draft,essentials){transform->
                    saveFeedback=false
                    updateDraft(transform)
                }
            }

            item{
                OutlinedButton(onClick={advanced=!advanced},modifier=Modifier.fillMaxWidth().testTag("planning-advanced-toggle")){
                    Icon(Icons.Outlined.Tune,contentDescription=null)
                    Spacer(Modifier.width(7.dp))
                    Text(if(advanced)"RECOLHER DETALHES OPCIONAIS" else "DETALHES OPCIONAIS E CHECKLIST")
                }
            }

            if(advanced){
                item{AdvancedPlanningFields(draft,updateDraft)}
                item{
                    val people=draft.people.wholeNumberOrNull()?:1
                    val food=remember(draft.foodForm,people){Calculator.food(Calculator.buildFoodLines(foodConfigs,foodInputs(draft.foodForm),people))}
                    SectionCard("Alimentação detalhada",Icons.Outlined.Restaurant){
                        Text("Opcional. Use apenas se quiser controlar os alimentos individualmente; o cálculo rápido acima usa gasto por pessoa/dia.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                        FoodEditor(draft.foodForm,{food->updateDraft{it.copy(foodForm=food)}},people)
                        if(foodFormErrors(draft.foodForm).isEmpty()&&food.valid){
                            Text("Autonomia do inventário: ${food.days?:0} dia(s) • valor carregado: ${money(food.totalValue)}",fontWeight=FontWeight.SemiBold,fontSize=13.sp)
                        }
                    }
                }
                item{PlanningWaterFields(draft,updateDraft,onPoints)}
            }
        }

        Surface(tonalElevation=2.dp,shadowElevation=2.dp){
            Column(Modifier.fillMaxWidth().padding(horizontal=14.dp,vertical=8.dp),verticalArrangement=Arrangement.spacedBy(4.dp)){
                Text(
                    when{
                        issues.isNotEmpty()->issues.first()
                        saveFeedback->"Planejamento salvo neste dispositivo."
                        else->"Estimativas atualizadas automaticamente. O rascunho também é salvo."
                    },
                    fontSize=12.sp,color=if(issues.isNotEmpty())MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                )
                Button(
                    onClick={
                        focus.clearFocus()
                        commitCurrent()
                        saveFeedback=true
                        scope.launch{scroll.animateScrollToItem(0)}
                    },
                    enabled=issues.isEmpty(),modifier=Modifier.fillMaxWidth().testTag("generate-plan")
                ){
                    Icon(Icons.Outlined.CheckCircle,contentDescription=null)
                    Spacer(Modifier.width(7.dp))
                    Text("SALVAR PLANEJAMENTO")
                }
            }
        }
    }
}

@Composable
private fun LastSavedPlanCard(saved:PlanningDraft,canOpenDetails:Boolean,expanded:Boolean,toggle:()->Unit){
    val days=saved.tripEstimate?.days ?: saved.days.numberOrNull()?.let{ceil(it).toInt()}
    OutlinedCard(Modifier.fillMaxWidth()){
        Row(
            Modifier.fillMaxWidth().padding(horizontal=12.dp,vertical=10.dp),
            verticalAlignment=Alignment.CenterVertically,
            horizontalArrangement=Arrangement.spacedBy(9.dp)
        ){
            Icon(Icons.Outlined.Assignment,contentDescription=null,tint=MaterialTheme.colorScheme.primary,modifier=Modifier.size(20.dp))
            Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(2.dp)){
                Text("Último planejamento",fontSize=11.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.onSurfaceVariant)
                Text(
                    buildString{
                        append(saved.destination.ifBlank{"Viagem"})
                        saved.km.numberOrNull()?.let{append(" • ${decimal(it)} km")}
                        days?.let{append(" • $it dia(s)")}
                    },
                    fontWeight=FontWeight.SemiBold,fontSize=13.sp,maxLines=2
                )
                saved.tripEstimate?.let{
                    Text("${decimal(it.speedKmh)} km/h • ${decimal(it.hoursPerDay)} h/dia • margem ${it.safetyMarginPercent}%",fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                }
                if(!canOpenDetails){
                    Text("Plano antigo preservado; configure o novo ritmo quando quiser.",fontSize=11.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            if(canOpenDetails){
                IconButton(onClick=toggle){
                    Icon(if(expanded)Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore,contentDescription=if(expanded)"Ocultar detalhes do último planejamento" else "Ver detalhes do último planejamento")
                }
            }
        }
    }
}

@Composable
private fun PlanningTripFields(draft:PlanningDraft,change:((PlanningDraft)->PlanningDraft)->Unit){
    val context=LocalContext.current
    SectionCard("1. Para onde você vai?",Icons.Outlined.Explore){
        OutlinedTextField(
            draft.destination,{value->change{it.copy(destination=value)}},
            label={Text("Destino (opcional)")},modifier=Modifier.fillMaxWidth(),singleLine=true
        )
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
            NumericField(draft.km,{value->change{it.copy(km=value)}},"Distância prevista",Modifier.weight(1.35f),positive=true,unit="km")
            NumericField(draft.people,{value->change{it.copy(people=value)}},"Pessoas",Modifier.weight(.75f),whole=true,positive=true)
        }
        Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)){
            OutlinedButton(
                onClick={
                    val base=parsePlanningDate(draft.departureDate)?:LocalDate.now()
                    DatePickerDialog(
                        context,
                        {_,year,month,day->change{it.copy(departureDate=LocalDate.of(year,month+1,day).toString())}},
                        base.year,base.monthValue-1,base.dayOfMonth
                    ).show()
                },
                modifier=Modifier.weight(1f)
            ){
                Icon(Icons.Outlined.CalendarMonth,contentDescription=null)
                Spacer(Modifier.width(7.dp))
                Text(if(draft.departureDate.isBlank())"DATA DE SAÍDA (OPCIONAL)" else formatPlanningDate(draft.departureDate))
            }
            if(draft.departureDate.isNotBlank()){
                IconButton(onClick={change{it.copy(departureDate="")}}){Icon(Icons.Outlined.Close,contentDescription="Remover data de saída")}
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PlanningRideFields(
    draft:PlanningDraft,
    change:((PlanningDraft)->PlanningDraft)->Unit,
    setSafetyMargin:(Int)->Unit
){
    SectionCard("2. Como quer pedalar?",Icons.Outlined.DirectionsBike){
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
            NumericField(draft.speedKmh,{value->change{it.copy(speedKmh=value)}},"Velocidade média",Modifier.weight(1f),positive=true,unit="km/h")
            NumericField(draft.hoursPerDay,{value->change{it.copy(hoursPerDay=value)}},"Horas/dia",Modifier.weight(1f),positive=true,unit="h")
        }
        Text("Use a velocidade média que você espera manter enquanto estiver pedalando. Paradas entram na margem, não na velocidade.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Margem de segurança",fontWeight=FontWeight.SemiBold,fontSize=13.sp)
        FlowRow(
            modifier=Modifier.selectableGroup(),
            horizontalArrangement=Arrangement.spacedBy(6.dp),
            verticalArrangement=Arrangement.spacedBy(6.dp)
        ){
            listOf(0 to "Sem margem",10 to "+10%",20 to "+20%").forEach{(value,label)->
                PlanningMarginChoice(
                    value=value,
                    label=label,
                    selected=draft.safetyMarginPercent==value,
                    onSelect={setSafetyMargin(value)}
                )
            }
        }
        Text("A margem acrescenta tempo ao planejamento para imprevistos, sem alterar a distância real da rota.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}


@Composable
private fun PlanningMarginChoice(value:Int,label:String,selected:Boolean,onSelect:()->Unit){
    // Padrão recomendado para grupos de rádio no Compose: a linha inteira é o único
    // alvo clicável/selecionável e o RadioButton interno é apenas o indicador visual.
    // Isso evita depender da área pequena do círculo ou de nós semânticos internos.
    val shape=MaterialTheme.shapes.small
    val backgroundColor=if(selected) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surface
    val contentColor=if(selected) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurface
    val outlineColor=if(selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
    Row(
        modifier=Modifier
            .heightIn(min=48.dp)
            .clip(shape)
            .background(backgroundColor)
            .border(1.dp,outlineColor,shape)
            .selectable(selected=selected,onClick=onSelect,role=Role.RadioButton)
            .testTag("planning-margin-$value")
            .padding(horizontal=10.dp,vertical=4.dp),
        verticalAlignment=Alignment.CenterVertically,
        horizontalArrangement=Arrangement.spacedBy(2.dp)
    ){
        RadioButton(selected=selected,onClick=null)
        // O texto permanece estável quando a seleção muda. Antes, prefixar "✓ "
        // aumentava a largura da opção selecionada e podia fazê-la quebrar para outra
        // linha do FlowRow justamente após o clique, deslocando o alvo para fora da
        // viewport. O RadioButton e o estado Selected já comunicam a seleção.
        Text(
            label,
            color=contentColor,
            fontWeight=FontWeight.Medium,
            fontSize=13.sp
        )
    }
}

@Composable
private fun LivePlanCard(draft:PlanningDraft,estimate:TripEstimate?){
    SectionCard("Seu plano",Icons.Outlined.Assessment){
        if(estimate==null){
            Text("Informe distância, velocidade média e horas por dia para receber a estimativa instantânea.",color=MaterialTheme.colorScheme.onSurfaceVariant)
            return@SectionCard
        }
        Text("${estimate.days} dia(s) estimado(s)",fontSize=22.sp,fontWeight=FontWeight.Black,color=MaterialTheme.colorScheme.primary)
        Row(Modifier.fillMaxWidth()){
            Metric("${decimal(estimate.dailyDistanceKm)} km","por dia",Modifier.weight(1f))
            Metric("${decimal(estimate.theoreticalHours)} h","pedal efetivo",Modifier.weight(1f))
            Metric("${decimal(estimate.lastDayHours)} h","último dia",Modifier.weight(1f))
        }
        Text(
            "Pedalando a ${decimal(estimate.speedKmh)} km/h por até ${decimal(estimate.hoursPerDay)} h/dia, você percorre cerca de ${decimal(estimate.dailyDistanceKm)} km por dia.",
            fontSize=13.sp
        )
        if(estimate.safetyMarginPercent>0){
            Text(
                "A rota exige ${decimal(estimate.theoreticalHours)} h de pedal. Com +${estimate.safetyMarginPercent}% de margem, o planejamento reserva ${decimal(estimate.plannedHours)} h.",
                fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        estimatedArrivalDate(draft.departureDate,estimate.days)?.let{arrival->
            Text("Saindo em ${formatPlanningDate(draft.departureDate)}, chegada estimada em ${formatPlanningDate(arrival)}.",fontWeight=FontWeight.SemiBold,fontSize=13.sp)
        }
    }
}

@Composable
private fun ScenarioSuggestions(draft:PlanningDraft,scenarios:List<TripScenario>,select:(Double)->Unit){
    SectionCard("Compare ritmos",Icons.Outlined.Schedule){
        Text("Toque em um cenário para usar aquelas horas por dia. A velocidade média e a margem permanecem iguais.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        val selectedHours=draft.hoursPerDay.numberOrNull()
        scenarios.forEach{scenario->
            val selected=selectedHours?.let{abs(it-scenario.hoursPerDay)<0.01}==true
            if(selected){
                FilledTonalButton(onClick={select(scenario.hoursPerDay)},modifier=Modifier.fillMaxWidth()){
                    ScenarioButtonContent(scenario,true)
                }
            }else{
                OutlinedButton(onClick={select(scenario.hoursPerDay)},modifier=Modifier.fillMaxWidth()){
                    ScenarioButtonContent(scenario,false)
                }
            }
        }
    }
}

@Composable
private fun RowScope.ScenarioButtonContent(scenario:TripScenario,selected:Boolean){
    Column(Modifier.weight(1f),horizontalAlignment=Alignment.Start){
        Text(scenario.label,fontWeight=FontWeight.Bold)
        Text("${decimal(scenario.hoursPerDay)} h/dia • ${decimal(scenario.dailyDistanceKm)} km/dia",fontSize=12.sp)
    }
    Text("${scenario.days} dias${if(selected)" ✓" else ""}",fontWeight=FontWeight.Bold)
}

@Composable
private fun EssentialResourcesCard(draft:PlanningDraft,estimate:EssentialResourceEstimate?,change:((PlanningDraft)->PlanningDraft)->Unit){
    SectionCard("3. Essenciais da viagem",Icons.Outlined.Backpack){
        Text("Preencha só o que quiser estimar. Os totais acompanham automaticamente a duração calculada.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        NumericField(
            draft.foodDailyCost,{value->change{it.copy(foodDailyCost=value)}},
            "Alimentação por pessoa/dia",money=true,positive=true,
            helper=estimate?.foodCost?.let{"Total para a viagem: ${money(it)}"}
        )
        NumericField(
            draft.waterDailyPerPerson,{value->change{it.copy(waterDailyPerPerson=value)}},
            "Água por pessoa/dia",positive=true,unit="L/pessoa/dia",
            helper=estimate?.waterLiters?.let{"Total planejado: ${decimal(it)} L"}
        )
        NumericField(
            draft.energyDailyWh,{value->change{it.copy(energyDailyWh=value)}},
            "Consumo de energia do grupo",positive=true,unit="Wh/dia",
            helper=estimate?.energyWh?.let{"Necessidade para a viagem: ${decimal(it)} Wh"}
        )
        if(estimate!=null&&listOf(estimate.foodCost,estimate.waterLiters,estimate.energyWh).all{it==null}){
            Text("A viagem está estimada em ${estimate.days} dia(s). Informe alimentação, água ou energia para calcular os totais.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun AdvancedPlanningFields(draft:PlanningDraft,change:((PlanningDraft)->PlanningDraft)->Unit){
    SectionCard("Detalhes opcionais",Icons.Outlined.Tune){
        Text("Esses campos mantêm os controles avançados das versões anteriores sem deixar a tela principal pesada.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        NumericField(draft.availableMoney,{value->change{it.copy(availableMoney=value)}},"Dinheiro disponível",money=true)
        Text("Tipo de viagem",fontWeight=FontWeight.SemiBold)
        FlowRow(horizontalArrangement=Arrangement.spacedBy(6.dp)){
            TravelType.entries.forEach{travel->
                FilterChip(selected=draft.type==travel,onClick={change{it.copy(type=travel)}},label={Text(travel.label)})
            }
        }
        NumericField(
            draft.dailyKm,{value->change{it.copy(dailyKm=value)}},"Meta manual de km/dia",positive=true,
            helper="Compatibilidade com planos antigos. O cálculo principal usa velocidade e horas por dia.",unit="km/dia"
        )
        NumericField(
            draft.days,{value->change{it.copy(days=value)}},"Duração manual",positive=true,
            helper="Compatibilidade com planos antigos. É substituída pela estimativa quando o ritmo está preenchido.",unit="dias"
        )
    }
}

@Composable
private fun PlanningWaterFields(draft:PlanningDraft,change:((PlanningDraft)->PlanningDraft)->Unit,onPoints:()->Unit){
    val water=remember(draft.waterLiters,draft.refill,draft.refillFrequency,draft.people,draft.waterDailyPerPerson){
        Calculator.water(
            draft.waterLiters.numberOrNull()?:0.0,
            draft.refill,
            draft.refillFrequency.numberOrNull()?:0.0,
            draft.people.wholeNumberOrNull()?:1,
            litersPerPersonDay=draft.waterDailyPerPerson.numberOrNull()?.takeIf{it>0}?:Calculator.WATER_PER_PERSON_DAY
        )
    }
    SectionCard("Água carregada e reabastecimento",Icons.Outlined.WaterDrop){
        Text("Opcional. Aqui você compara a água que realmente levará com o consumo diário informado no cálculo principal.",fontSize=12.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
        NumericField(draft.waterLiters,{value->change{it.copy(waterLiters=value)}},"Água carregada",unit="L")
        Row(verticalAlignment=Alignment.CenterVertically){Switch(draft.refill,{value->change{it.copy(refill=value)}});Text(" Planejo reabastecer")}
        if(draft.refill){
            NumericField(draft.refillFrequency,{value->change{it.copy(refillFrequency=value)}},"Intervalo entre reabastecimentos",positive=true,unit="dias")
            OutlinedTextField(draft.waterPlaces,{value->change{it.copy(waterPlaces=value)}},label={Text("Locais previstos para água")},modifier=Modifier.fillMaxWidth())
            OutlinedButton(onClick=onPoints,modifier=Modifier.fillMaxWidth()){Icon(Icons.Outlined.Place,null);Text(" PONTOS DE APOIO")}
        }
        if(numberError(draft.waterLiters)==null&&draft.waterLiters.isNotBlank()&&draft.people.wholeNumberOrNull()?.let{it>0}==true){
            Text("Consumo do grupo: ${decimal(water.consumoDia)} L/dia • autonomia carregada: ${decimal(water.dias)} dia(s)",fontSize=13.sp)
        }
    }
}

@Composable
private fun PlanningResultDetails(draft:PlanningDraft,result:PlanningResult,onManual:()->Unit){
    Column(verticalArrangement=Arrangement.spacedBy(10.dp)){
        result.essential?.let{essential->
            SectionCard("Resumo essencial",Icons.Outlined.Assessment){
                Text("Duração usada: ${essential.days} dia(s) • ${essential.people} pessoa(s)",fontSize=13.sp)
                essential.foodCost?.let{Text("Alimentação: ${money(it)}")}
                essential.waterLiters?.let{Text("Água planejada: ${decimal(it)} L")}
                essential.energyWh?.let{Text("Energia planejada: ${decimal(it)} Wh")}
            }
        }
        SectionCard("Custos e reservas",Icons.Outlined.Payments){
            Text("Equipamentos pendentes: ${money(result.pendingCost)}")
            Text("Alimentação necessária: ${money(result.foodRequired)}")
            if(result.foodNeed.missingValue>0&&result.essential?.foodCost==null)Text("Falta comprar em alimentação: ${money(result.foodNeed.missingValue)}")
            Text("Reserva financeira (${(draft.type.reservePercent*100).toInt()}%): ${money(result.reserve)}")
            Text("Custo total estimado: ${money(result.totalCost)}",fontWeight=FontWeight.Bold)
        }
        SectionCard("Energia pelo inventário",Icons.Outlined.Bolt){
            val energy=result.energy
            Text("Painel: ${if(energy.hasPanel)"sim" else "não"} • reserva: ${if(energy.hasBattery)"sim" else "não"}")
            Text("Consumo automático: ${decimal(energy.dailyConsumptionWh)} Wh/dia • geração: ${decimal(energy.dailyGenerationWh)} Wh/dia")
            Text(if(energy.selfSustaining)"Sistema autossustentável" else "Autonomia estimada do inventário: ${decimal(energy.days?:0.0)} dia(s)")
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
