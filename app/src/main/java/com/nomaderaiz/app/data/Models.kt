package com.nomaderaiz.app.data

enum class ItemStatus { PENDENTE, COMPRADO }
enum class Priority { BAIXO, MEDIO, URGENTE }

data class EquipmentCategory(val id:String,val label:String,val icon:String)
data class EquipmentItem(
    val id:String, val name:String, val categoryId:String,
    val status:ItemStatus=ItemStatus.PENDENTE, val priority:Priority=Priority.MEDIO,
    val quantity:Int=1, val price:Double=0.0, val notes:String=""
)
data class CheckDefinition(val id:String,val text:String,val tip:String="")
data class CheckMode(val id:String,val icon:String,val label:String,val description:String,val items:List<CheckDefinition>)
data class JournalEntry(val id:String,val local:String,val clima:String,val km:Double,val nota:String,val createdAt:Long)
data class SupportPoint(val id:String,val tipo:String,val nome:String,val referencia:String,val obs:String,val avaliacao:Int,val fechado:Boolean)
