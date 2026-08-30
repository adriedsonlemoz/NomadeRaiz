package com.nomaderaiz.app.data

import kotlin.math.max

data class BikeCalc(val valid:Boolean,val kmDay:Double,val total:Double)
data class WaterCalc(val valid:Boolean,val days:Double,val consumptionDay:Double,val low:Boolean)
data class MoneyCalc(val valid:Boolean,val days:Double)
data class EnergyCalc(val valid:Boolean,val selfSustaining:Boolean,val days:Double,val generationWh:Double,val consumptionWh:Double,val reserveWh:Double)

fun bikeCalc(speed:Double,hours:Double,days:Double)=BikeCalc(speed>0&&hours>0,speed*hours,speed*hours*max(days,0.0))
fun waterCalc(liters:Double,people:Int=1):WaterCalc {
    val consumption=3.0*max(people,1); val d=if(consumption>0) liters/consumption else 0.0
    return WaterCalc(liters>0,d,consumption,liters>0&&liters<consumption)
}
fun moneyCalc(available:Double,daily:Double)=MoneyCalc(available>=0&&daily>0,if(daily>0) available/daily else 0.0)
fun energyCalc(panelW:Double,sunHours:Double,batteryWh:Double,powerbankWh:Double,consumptionWh:Double):EnergyCalc {
    val generation=panelW*sunHours*0.75; val reserve=batteryWh+powerbankWh
    val sustainable=consumptionWh>0&&generation>=consumptionWh
    val balance=consumptionWh-generation
    val days=if(sustainable) 999.0 else if(balance>0) max(0.0,reserve/balance) else 0.0
    return EnergyCalc(consumptionWh>0,sustainable,days,generation,consumptionWh,reserve)
}
fun tripCost(days:Double,foodPerDay:Double,transport:Double,maintenance:Double,other:Double)=days*foodPerDay+transport+maintenance+other
fun financialReserve(base:Double,type:String):Double = base * when(type){"bate-volta"->.05;"longa"->.15;else->.10}
