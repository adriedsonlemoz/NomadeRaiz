package com.nomaderaiz.app.data

enum class ItemStatus { PENDENTE, COMPRADO }
enum class Priority { BAIXO, MEDIO, URGENTE }
enum class FontScale { SM, MD, LG }
enum class ThemeMode { LIGHT, DARK }
enum class AppAccent(val label:String,val hex:Long) {
    RAIZ("Verde Raiz",0xFF91B51D),
    AZUL("Azul",0xFF4F8CFF),
    TURQUESA("Turquesa",0xFF22B8A7),
    LARANJA("Laranja",0xFFF08A24),
    ROXO("Roxo",0xFF9B6CFF),
    VERMELHO("Vermelho",0xFFE25A5A)
}
enum class TravelType(val id:String,val label:String,val icon:String,val reservePercent:Double,val shelter:ShelterNeed,val panelAfterDays:Int?,val batteryRecommended:Boolean) {
    CICLOVIAGEM("cicloviagem","Cicloviagem","🚲",0.10,ShelterNeed.CONDICIONAL,4,true),
    CAMPING("camping","Camping","🏕️",0.10,ShelterNeed.ESSENCIAL,3,true),
    BATE_VOLTA("bate-volta","Bate-volta","🧭",0.05,ShelterNeed.DISPENSAVEL,null,false),
    LONGA("longa","Longa duração","🛣️",0.15,ShelterNeed.ESSENCIAL,2,true)
}
enum class ShelterNeed { DISPENSAVEL, CONDICIONAL, ESSENCIAL }
enum class PlanningStatus { VERDE, AMARELO, VERMELHO }
enum class RecommendationType { OK, ATENCAO, ALERTA }

data class EquipmentCategory(val id:String,val label:String,val icon:String)
data class EquipmentItem(
    val id:String,
    val name:String,
    val categoryId:String,
    val status:ItemStatus=ItemStatus.PENDENTE,
    val priority:Priority=Priority.MEDIO,
    val quantity:Int=1,
    val price:Double=0.0,
    val notes:String="",
    val createdAt:Long=System.currentTimeMillis(),
    val updatedAt:Long=System.currentTimeMillis()
)
data class CheckDefinition(val id:String,val text:String,val tip:String="")
data class CheckMode(val id:String,val icon:String,val label:String,val description:String,val items:List<CheckDefinition>)
data class JournalEntry(val id:String,val local:String,val clima:String,val km:Double,val nota:String,val createdAt:Long)
data class SupportPoint(val id:String,val tipo:String,val nome:String,val referencia:String,val obs:String,val avaliacao:Int,val fechado:Boolean)
data class TravelTip(val id:String,val icon:String,val category:String,val title:String,val text:String)
data class AppSettings(val themeMode:ThemeMode=ThemeMode.DARK,val fontScale:FontScale=FontScale.MD,val startDate:Long?=null,val accent:AppAccent=AppAccent.RAIZ)

data class FoodUnitConfig(val id:String,val label:String,val defaultPrice:Double,val defaultDailyConsumption:Double)
data class FoodConfig(val id:String,val name:String,val icon:String,val units:List<FoodUnitConfig>)
data class FoodInput(val unitId:String?=null,val quantity:Double=0.0,val price:Double?=null,val dailyConsumption:Double?=null)
data class FoodLine(val config:FoodConfig,val unit:FoodUnitConfig,val quantity:Double,val price:Double,val consumption:Double,val value:Double,val days:Int?)
data class FoodResult(val valid:Boolean,val days:Int?,val totalQuantity:Double,val totalValue:Double,val bottleneck:FoodLine?)
data class FoodRequirementResult(val valid:Boolean,val requiredValue:Double,val missingValue:Double,val missingItems:Int)

data class PlanningRecommendation(val type:RecommendationType,val text:String)
data class PlanningSummaryItem(val id:String,val icon:String,val label:String,val status:PlanningStatus)
data class SafetyEssential(val key:String,val label:String,val item:EquipmentItem?,val bought:Boolean)
data class AutomaticEnergyResult(val hasPanel:Boolean,val hasBattery:Boolean,val selfSustaining:Boolean,val days:Double?,val dailyGenerationWh:Double,val dailyConsumptionWh:Double,val reserveWh:Double,val rechargeHours:Double?)
