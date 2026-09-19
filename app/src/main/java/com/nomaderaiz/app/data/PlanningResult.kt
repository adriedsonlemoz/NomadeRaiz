package com.nomaderaiz.app.data

data class PlanningResult(
    val summary:List<PlanningSummaryItem>,val recommendations:List<PlanningRecommendation>,
    val food:FoodResult,val foodNeed:FoodRequirementResult,val water:WaterResult,val energy:AutomaticEnergyResult,
    val pendingCost:Double,val foodRequired:Double,val reserve:Double,val totalCost:Double,
    val safety:List<SafetyEssential>,val shelterRequired:Boolean,val boughtShelter:Int,val shelterCount:Int
)

fun buildPlanningResult(draft:PlanningDraft,equipment:List<EquipmentItem>):PlanningResult {
    require(draft.issues.isEmpty()) { "Corrija os campos antes de gerar o planejamento." }
    val days=draft.days.numberOrNull()!!
    val people=draft.people.wholeNumberOrNull()!!
    val km=draft.km.numberOrNull()?:0.0
    val daily=draft.dailyKm.numberOrNull()?:draft.pace.average?:0.0
    val money=draft.availableMoney.numberOrNull()?:0.0
    val lines=Calculator.buildFoodLines(foodConfigs,foodInputs(draft.foodForm),people)
    val food=Calculator.food(lines)
    val foodNeed=Calculator.foodRequirement(lines,days,people)
    val water=Calculator.water(draft.waterLiters.numberOrNull()?:0.0,draft.refill,draft.refillFrequency.numberOrNull()?:0.0,people,!draft.refill||draft.waterPlaces.isNotBlank())
    val energy=PlanningEngine.automaticEnergy(equipment,people)
    val pending=equipment.filter{it.status==ItemStatus.PENDENTE}.sumOf{it.price*it.quantity.coerceAtLeast(0)}
    val foodRequired=if(foodNeed.valid)foodNeed.requiredValue else food.totalValue
    val reserve=PlanningEngine.financialReserve(pending+foodRequired,draft.type)
    val total=pending+foodRequired+reserve
    val safety=PlanningEngine.safetyEssentials(equipment)
    val missing=safety.filter{!it.bought}
    val shelter=equipment.filter{it.categoryId=="abrigo"}
    val boughtShelter=shelter.count{it.status==ItemStatus.COMPRADO&&it.quantity>0}
    val shelterRequired=PlanningEngine.requiresShelter(draft.type,days)
    val summary=listOf(
        PlanningSummaryItem("bike","🚲","Bicicleta",PlanningEngine.worst(PlanningEngine.bikeStatus(km,daily,days),PlanningEngine.percentageStatus(safety.size-missing.size,safety.size))),
        PlanningSummaryItem("food","🍱","Alimentação",PlanningEngine.statusByDays(food.days?.toDouble(),days)),
        PlanningSummaryItem("water","💧","Água",PlanningEngine.waterStatus(water,days)),
        PlanningSummaryItem("energy","⚡","Energia",if(energy.selfSustaining)PlanningStatus.VERDE else PlanningEngine.statusByDays(energy.days,days)),
        PlanningSummaryItem("shelter","🏕️","Abrigo",PlanningEngine.requiredItemsStatus(boughtShelter,shelter.size,shelterRequired)),
        PlanningSummaryItem("money","💰","Dinheiro",PlanningEngine.moneyStatus(money,total))
    )
    val recommendations=PlanningEngine.recommendations(days,food.days,water,money,total,energy,missing,draft.type,shelterRequired,boughtShelter,draft.destination,people).toMutableList()
    if(draft.pace.fits==false)recommendations.add(0,PlanningRecommendation(RecommendationType.ATENCAO,"A meta de pedal informada não cobre a distância dentro da duração prevista. Revise o ritmo, a distância ou os dias."))
    return PlanningResult(summary,recommendations,food,foodNeed,water,energy,pending,foodRequired,reserve,total,safety,shelterRequired,boughtShelter,shelter.size)
}
