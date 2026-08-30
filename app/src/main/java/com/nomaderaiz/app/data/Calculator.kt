package com.nomaderaiz.app.data

data class BikeResult(val valido:Boolean,val kmDia:Double,val distanciaTotal:Double,val dias:Double)
data class WaterResult(val valido:Boolean,val litros:Double,val reabastece:Boolean,val dias:Double,val consumoDia:Double,val suficientePorIntervalo:Boolean,val baixo:Boolean,val frequenciaDias:Double=0.0,val pessoas:Int=1,val consumoPorPessoaDia:Double=3.0)
data class EnergyEquipment(val id:String,val nome:String,val consumoWhDia:Double,val ativo:Boolean=true)
data class EnergyResult(val valido:Boolean,val autossustentavel:Boolean,val dias:Double,val geracaoDiariaWh:Double,val consumoDiarioWh:Double,val reservaWh:Double)
data class MoneyResult(val valido:Boolean,val disponivel:Double,val gastoDia:Double,val dias:Double)
data class WeightResult(val total:Double,val limite:Double=25.0,val acimaDoLimite:Boolean=total>limite)
data class TripCostResult(val total:Double,val dias:Double)

object Calculator {
 fun bike(v:Double,h:Double,d:Double):BikeResult { val ok=v>0&&h>0;val kd=v*h;return BikeResult(ok,kd,kd*d.coerceAtLeast(0.0),d) }
 fun water(l:Double,re:Boolean,freq:Double,pessoas:Int=1):WaterResult { val p=pessoas.coerceAtLeast(1);val consumo=3.0*p;val aut=l/consumo;return WaterResult(l>0,l,re,round1(aut),consumo,re&&freq>0&&aut>=freq,l>0&&l<consumo,freq,p,3.0) }
 fun energy(painel:Double,sol:Double,bateria:Double,power:Double,equip:List<EnergyEquipment>):EnergyResult { val consumo=equip.filter{it.ativo}.sumOf{it.consumoWhDia};val ger=painel*sol*.75;val reserva=bateria+power;val saldo=consumo-ger;val auto=consumo>0&&ger>=consumo;val dias=if(auto)999.0 else if(saldo>0)reserva/saldo else 0.0;return EnergyResult(consumo>0,auto,round1(dias),ger,consumo,reserva) }
 fun money(disponivel:Double,gasto:Double)=MoneyResult(disponivel>=0&&gasto>0,disponivel,gasto,if(gasto>0)round1(disponivel/gasto)else 0.0)
 fun weight(lines:List<Pair<Double,Double>>):WeightResult=WeightResult(lines.sumOf{it.first*it.second})
 fun tripCost(dias:Double,alimentacao:Double,transporte:Double,manutencao:Double,outros:Double)=TripCostResult(dias.coerceAtLeast(0.0)*alimentacao.coerceAtLeast(0.0)+transporte.coerceAtLeast(0.0)+manutencao.coerceAtLeast(0.0)+outros.coerceAtLeast(0.0),dias)
 private fun round1(v:Double)=String.format(java.util.Locale.US,"%.1f",v).toDouble()
}
