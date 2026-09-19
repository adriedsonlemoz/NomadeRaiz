package com.nomaderaiz.app.data

data class StockStatus(val monitoredCount:Int,val belowMinimum:List<EquipmentItem>)

fun stockStatus(equipment:List<EquipmentItem>,minimums:Map<String,Int>):StockStatus {
    val monitored=equipment.filter{(minimums[it.id]?:0)>0}
    return StockStatus(monitored.size,monitored.filter{(if(it.status==ItemStatus.COMPRADO)it.quantity else 0)<minimums.getValue(it.id)})
}
