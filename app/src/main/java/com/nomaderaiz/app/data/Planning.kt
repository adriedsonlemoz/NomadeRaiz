package com.nomaderaiz.app.data

import java.text.Normalizer
import kotlin.math.floor
import kotlin.math.round

object PlanningEngine {
    private val security = listOf(
        Triple("capacete","Capacete",listOf("capacete")),
        Triple("luz-bike","Luzes da bicicleta",listOf("luz da bicicleta","luzes da bicicleta","farol bicicleta","sinalizador bicicleta")),
        Triple("colete","Colete refletivo",listOf("colete refletivo","colete reflexivo","refletivo")),
        Triple("primeiros-socorros","Kit de primeiros socorros",listOf("primeiros socorros","primeiro socorro","kit socorros"))
    )

    fun requiresShelter(type:TravelType,days:Double):Boolean = when(type.shelter){
        ShelterNeed.ESSENCIAL->true
        ShelterNeed.DISPENSAVEL->false
        ShelterNeed.CONDICIONAL->days>1
    }

    fun financialReserve(baseCost:Double,type:TravelType):Double = round2(baseCost.coerceAtLeast(0.0)*type.reservePercent)

    fun automaticEnergy(items:List<EquipmentItem>,people:Int=1):AutomaticEnergyResult {
        val bought=items.filter{it.status==ItemStatus.COMPRADO&&it.quantity>0}
        val panels=bought.filter{matches(it.name,listOf("painel solar","solar"))}.sumOf{it.quantity.coerceAtLeast(0)}
        val batteries=bought.filter{matches(it.name,listOf("power bank","powerbank","bateria"))}.sumOf{it.quantity.coerceAtLeast(0)}
        val panelW=panels*20.0
        val generation=panelW*5.0*0.75
        val reserve=batteries*74.0
        val consumption=20.0*people.coerceAtLeast(1)
        val balance=consumption-generation
        val self=panels>0&&generation>=consumption
        val days=if(self)null else if(reserve>0)round1(reserve/kotlin.math.max(balance,consumption)) else 0.0
        val recharge=if(panels>0&&reserve>0)round1(reserve/kotlin.math.max(panelW*0.75,1.0)) else null
        return AutomaticEnergyResult(panels>0,batteries>0,self,days,generation,consumption,reserve,recharge)
    }

    fun safetyEssentials(items:List<EquipmentItem>):List<SafetyEssential> = security.map { (key,label,aliases) ->
        val direct=items.firstOrNull{it.id==key}
        val semantic=direct?:items.firstOrNull { item -> aliases.any { alias -> normalize(item.name).contains(normalize(alias)) } }
        SafetyEssential(key,label,semantic,semantic?.status==ItemStatus.COMPRADO&&(semantic.quantity>0))
    }

    fun statusByDays(available:Double?,needed:Double?):PlanningStatus {
        if(needed==null||needed<=0||available==null)return PlanningStatus.AMARELO
        if(available>=needed)return PlanningStatus.VERDE
        return if(available>=needed*0.65)PlanningStatus.AMARELO else PlanningStatus.VERMELHO
    }

    fun percentageStatus(ok:Int,total:Int):PlanningStatus = when {
        total<=0->PlanningStatus.AMARELO
        ok.toDouble()/total>=0.8->PlanningStatus.VERDE
        ok.toDouble()/total>=0.5->PlanningStatus.AMARELO
        else->PlanningStatus.VERMELHO
    }

    fun requiredItemsStatus(ok:Int,total:Int,required:Boolean):PlanningStatus {
        if(!required)return PlanningStatus.VERDE
        if(total<=0)return PlanningStatus.VERMELHO
        return percentageStatus(ok,total)
    }

    fun bikeStatus(km:Double,dailyAverage:Double,days:Double):PlanningStatus {
        if(km<=0||dailyAverage<=0||days<=0)return PlanningStatus.AMARELO
        val capacity=dailyAverage*days
        if(capacity>=km)return PlanningStatus.VERDE
        return if(capacity>=km*0.75)PlanningStatus.AMARELO else PlanningStatus.VERMELHO
    }

    fun waterStatus(water:WaterResult?,days:Double?):PlanningStatus {
        if(water?.reabastece==true){
            if(!water.suficientePorIntervalo)return PlanningStatus.AMARELO
            return if(water.pontosConfirmados==false)PlanningStatus.AMARELO else PlanningStatus.VERDE
        }
        return statusByDays(water?.dias,days)
    }

    fun moneyStatus(available:Double,cost:Double):PlanningStatus = when {
        cost<=0->PlanningStatus.AMARELO
        available>=cost->PlanningStatus.VERDE
        available>=cost*0.7->PlanningStatus.AMARELO
        else->PlanningStatus.VERMELHO
    }

    fun worst(vararg statuses:PlanningStatus):PlanningStatus = statuses.maxByOrNull { when(it){PlanningStatus.VERDE->0;PlanningStatus.AMARELO->1;PlanningStatus.VERMELHO->2} }?:PlanningStatus.AMARELO

    fun recommendations(
        tripDays:Double,
        foodDays:Int?,
        water:WaterResult,
        moneyAvailable:Double,
        totalCost:Double,
        energy:AutomaticEnergyResult,
        missingSafety:List<SafetyEssential>,
        travelType:TravelType,
        shelterRequired:Boolean,
        boughtShelter:Int,
        destination:String,
        people:Int
    ):List<PlanningRecommendation> {
        val r=mutableListOf<PlanningRecommendation>()
        fun add(type:RecommendationType,text:String){r+=PlanningRecommendation(type,text)}
        if(tripDays>0&&foodDays==null)add(RecommendationType.ATENCAO,"Defina a alimentação para calcular a autonomia de ${people.coerceAtLeast(1)} ${if(people==1)"pessoa" else "pessoas"}.")
        else if(foodDays!=null&&foodDays<tripDays)add(RecommendationType.ALERTA,"A alimentação informada não cobre o grupo durante toda a viagem; aumente as quantidades ou planeje pontos de compra.")
        if(!water.reabastece&&water.valido&&water.dias<tripDays)add(RecommendationType.ALERTA,"A água carregada não cobre toda a viagem; planeje pontos de reabastecimento.")
        if(water.reabastece&&!water.suficientePorIntervalo)add(RecommendationType.ATENCAO,"A reserva de água pode não cobrir o intervalo informado entre reabastecimentos.")
        if(water.reabastece&&water.suficientePorIntervalo&&water.pontosConfirmados==false)add(RecommendationType.ATENCAO,"Você pretende reabastecer água, mas ainda não informou onde. Registre ao menos um ponto de abastecimento previsto.")
        if(totalCost>0&&moneyAvailable<totalCost)add(RecommendationType.ALERTA,"O orçamento disponível está abaixo do custo estimado com a reserva recomendada para este tipo de viagem.")
        if(travelType.batteryRecommended&&!energy.hasBattery)add(RecommendationType.ATENCAO,"Considere levar uma reserva de energia, como power bank ou bateria.")
        if(travelType.panelAfterDays!=null&&!energy.hasPanel&&tripDays>=travelType.panelAfterDays)add(RecommendationType.ATENCAO,"Para ${travelType.label.lowercase()} com essa duração, um painel solar pode aumentar a autonomia de energia.")
        if(shelterRequired&&boughtShelter<=0)add(RecommendationType.ALERTA,"O tipo de viagem “${travelType.label}” exige planejamento de abrigo, mas nenhum item de abrigo está marcado como adquirido.")
        if(travelType==TravelType.BATE_VOLTA&&tripDays>1)add(RecommendationType.ATENCAO,"O tipo “Bate-volta” normalmente representa uma saída de um dia; revise o tipo ou a duração informada.")
        if(missingSafety.isNotEmpty())add(RecommendationType.ALERTA,"Faltam ${missingSafety.size} itens essenciais de segurança.")
        if(destination.isNotBlank()&&water.reabastece&&water.pontosConfirmados==false)add(RecommendationType.ATENCAO,"Antes de seguir para ${destination.trim()}, confirme pontos de água no trajeto e registre-os no planejamento.")
        if(r.isEmpty())add(RecommendationType.OK,"Os recursos principais estão compatíveis com a viagem planejada.")
        return r
    }

    private fun matches(name:String,terms:List<String>)=terms.any{normalize(name).contains(normalize(it))}
    private fun normalize(value:String):String = Normalizer.normalize(value,Normalizer.Form.NFD).replace("\\p{Mn}+".toRegex(),"").lowercase().replace("[^a-z0-9]+".toRegex()," ").trim()
    private fun round1(v:Double)=round(v*10)/10
    private fun round2(v:Double)=round(v*100)/100
}
