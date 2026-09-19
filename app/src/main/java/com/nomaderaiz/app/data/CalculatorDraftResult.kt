package com.nomaderaiz.app.data

data class CalculatorDraftResult(
    val bike:BikeResult,val food:FoodResult,val need:FoodRequirementResult,val water:WaterResult,
    val energy:EnergyResult,val cash:MoneyResult,val weight:WeightResult,val tripCost:TripCostResult,
    val general:GeneralIndexResult,val completedResources:Int,val energyEntered:Boolean
)

fun calculateDraft(draft:CalculatorDraft,equipment:List<EquipmentItem>):CalculatorDraftResult? {
    if(draft.issues.isNotEmpty())return null
    fun n(key:String)=draft[key].numberOrNull()?:0.0
    val days=n("days")
    val people=draft["people"].wholeNumberOrNull()?:1
    val bike=Calculator.bike(n("speed"),n("hours"),days)
    val lines=Calculator.buildFoodLines(foodConfigs,foodInputs(draft.foodForm),people)
    val food=Calculator.food(lines)
    val need=Calculator.foodRequirement(lines,days,people)
    val water=Calculator.water(n("waterLiters"),draft.refill,n("freq"),people)
    val energy=Calculator.energy(n("panel"),n("sun"),n("battery"),n("powerbank"),listOf(EnergyEquipment("celular","Celular",12.0),EnergyEquipment("luzes","Luzes",8.0),EnergyEquipment("gps","GPS",5.0,false)))
    val energyEntered=(n("panel")>0&&n("sun")>0)||n("battery")>0||n("powerbank")>0
    val cash=Calculator.money(n("available"),n("dailyExpense"))
    val weight=Calculator.weight(equipment.map{it.quantity.toDouble() to (draft.weightData[it.id]?.numberOrNull()?:0.0)})
    val cost=Calculator.tripCost(days,n("foodDailyCost"),n("transport"),n("maintenance"),n("other"))
    val bikeEntered=bike.valido&&days>0
    val general=Calculator.generalIndex(listOf(
        GeneralResource("Bike",if(bikeEntered)bike.dias else null),GeneralResource("Comida",food.days?.toDouble()),
        GeneralResource("Água",if(water.valido)water.dias else null),
        GeneralResource("Energia",if(energyEntered)energy.dias else null,energyEntered&&energy.autossustentavel),
        GeneralResource("Dinheiro",if(cash.valido)cash.dias else null)
    ))
    val count=listOf(bikeEntered,food.valid,water.valido,energyEntered,cash.valido).count{it}
    return CalculatorDraftResult(bike,food,need,water,energy,cash,weight,cost,general,count,energyEntered)
}
