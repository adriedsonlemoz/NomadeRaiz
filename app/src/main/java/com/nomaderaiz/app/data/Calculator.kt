package com.nomaderaiz.app.data

import kotlin.math.floor

data class BikeResult(val valido:Boolean,val kmDia:Double,val distanciaTotal:Double,val dias:Double)
data class WaterResult(
    val valido:Boolean,
    val litros:Double,
    val reabastece:Boolean,
    val dias:Double,
    val autonomiaCarregada:Double,
    val consumoDia:Double,
    val consumoPorPessoaDia:Double,
    val pessoas:Int,
    val suficientePorIntervalo:Boolean,
    val frequenciaDias:Double,
    val baixo:Boolean,
    val pontosConfirmados:Boolean?=null
)
data class EnergyEquipment(val id:String,val nome:String,val consumoWhDia:Double,val ativo:Boolean=true)
data class EnergyResult(val valido:Boolean,val autossustentavel:Boolean,val dias:Double,val geracaoDiariaWh:Double,val consumoDiarioWh:Double,val reservaWh:Double)
data class MoneyResult(val valido:Boolean,val disponivel:Double,val gastoDia:Double,val dias:Double)
data class WeightResult(val total:Double,val limite:Double=25.0,val acimaDoLimite:Boolean=total>limite)
data class TripCostResult(val total:Double,val dias:Double)
data class GeneralResource(val name:String,val days:Double?,val neutral:Boolean=false)
data class GeneralIndexResult(val days:Double?,val bottleneck:GeneralResource?)

object Calculator {
    const val WATER_PER_PERSON_DAY = 3.0

    fun bike(speed:Double,hours:Double,days:Double):BikeResult {
        val valid=speed>0&&hours>0
        val kmDay=speed*hours
        return BikeResult(valid,kmDay,kmDay*days.coerceAtLeast(0.0),days.coerceAtLeast(0.0))
    }

    fun water(liters:Double,refill:Boolean,frequency:Double,people:Int=1,pointsConfirmed:Boolean?=null,litersPerPersonDay:Double=WATER_PER_PERSON_DAY):WaterResult {
        val peopleSafe=people.coerceAtLeast(1)
        val perPerson=litersPerPersonDay.takeIf{it.isFinite()&&it>0.0}?:WATER_PER_PERSON_DAY
        val daily=perPerson*peopleSafe
        val autonomy=if(daily>0)liters.coerceAtLeast(0.0)/daily else 0.0
        val rounded=round1(autonomy)
        return WaterResult(
            valido=liters>0,
            litros=liters.coerceAtLeast(0.0),
            reabastece=refill,
            dias=rounded,
            autonomiaCarregada=rounded,
            consumoDia=daily,
            consumoPorPessoaDia=perPerson,
            pessoas=peopleSafe,
            suficientePorIntervalo=refill&&frequency>0&&autonomy>=frequency,
            frequenciaDias=frequency.coerceAtLeast(0.0),
            baixo=liters>0&&liters<daily,
            pontosConfirmados=pointsConfirmed
        )
    }

    fun energy(panel:Double,sunHours:Double,battery:Double,powerbank:Double,equipment:List<EnergyEquipment>):EnergyResult {
        val consumption=equipment.filter{it.ativo}.sumOf{it.consumoWhDia.coerceAtLeast(0.0)}
        val generation=panel.coerceAtLeast(0.0)*sunHours.coerceAtLeast(0.0)*0.75
        val reserve=battery.coerceAtLeast(0.0)+powerbank.coerceAtLeast(0.0)
        val balance=consumption-generation
        val self=consumption>0&&generation>=consumption
        val days=if(self)999.0 else if(balance>0)(reserve/balance).coerceAtLeast(0.0) else 0.0
        return EnergyResult(consumption>0,self,round1(days),generation,consumption,reserve)
    }

    fun money(available:Double,dailyExpense:Double):MoneyResult = MoneyResult(
        valido=available>=0&&dailyExpense>0,
        disponivel=available.coerceAtLeast(0.0),
        gastoDia=dailyExpense.coerceAtLeast(0.0),
        dias=if(dailyExpense>0)round1(available.coerceAtLeast(0.0)/dailyExpense) else 0.0
    )

    fun weight(lines:List<Pair<Double,Double>>):WeightResult = WeightResult(lines.sumOf{it.first.coerceAtLeast(0.0)*it.second.coerceAtLeast(0.0)})

    fun tripCost(days:Double,foodPerDay:Double,transport:Double,maintenance:Double,other:Double):TripCostResult {
        val d=days.coerceAtLeast(0.0)
        return TripCostResult(d*foodPerDay.coerceAtLeast(0.0)+transport.coerceAtLeast(0.0)+maintenance.coerceAtLeast(0.0)+other.coerceAtLeast(0.0),d)
    }

    fun buildFoodLines(config:List<FoodConfig>,data:Map<String,FoodInput>,people:Int=1):List<FoodLine> {
        val peopleSafe=people.coerceAtLeast(1)
        return config.map { food ->
            val raw=data[food.id]?:FoodInput()
            val unit=food.units.firstOrNull{it.id==raw.unitId}?:food.units.first()
            val quantity=raw.quantity.coerceAtLeast(0.0)
            val price=(raw.price?:unit.defaultPrice).coerceAtLeast(0.0)
            val consumption=(raw.dailyConsumption?:unit.defaultDailyConsumption).coerceAtLeast(0.0)
            val days=if(quantity>0&&consumption>0)floor(quantity/(consumption*peopleSafe)).toInt() else null
            FoodLine(food,unit,quantity,price,consumption,quantity*price,days)
        }
    }

    fun food(lines:List<FoodLine>):FoodResult {
        val active=lines.filter{it.quantity>0}
        val withDays=active.filter{it.days!=null}
        val bottleneck=withDays.minByOrNull{it.days?:Int.MAX_VALUE}
        return FoodResult(active.isNotEmpty(),bottleneck?.days,active.sumOf{it.quantity},round2(active.sumOf{it.value}),bottleneck)
    }

    fun foodRequirement(lines:List<FoodLine>,days:Double,people:Int=1):FoodRequirementResult {
        val d=days.coerceAtLeast(0.0)
        val peopleSafe=people.coerceAtLeast(1)
        val active=lines.filter{it.quantity>0&&it.consumption>0}
        var requiredValue=0.0
        var missingValue=0.0
        var missingItems=0
        active.forEach { line ->
            val required=line.consumption*peopleSafe*d
            val missing=(required-line.quantity).coerceAtLeast(0.0)
            requiredValue+=required*line.price
            missingValue+=missing*line.price
            if(missing>0)missingItems++
        }
        return FoodRequirementResult(active.isNotEmpty()&&d>0,round2(requiredValue),round2(missingValue),missingItems)
    }

    fun generalIndex(resources:List<GeneralResource>):GeneralIndexResult {
        val candidates=resources.filter{!it.neutral&&it.days!=null&&it.days.isFinite()}
        val bottleneck=candidates.minByOrNull{it.days?:Double.MAX_VALUE}
        return GeneralIndexResult(bottleneck?.days,bottleneck)
    }

    private fun round1(v:Double)=kotlin.math.round(v*10.0)/10.0
    private fun round2(v:Double)=kotlin.math.round(v*100.0)/100.0
}
