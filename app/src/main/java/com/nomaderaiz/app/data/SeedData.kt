package com.nomaderaiz.app.data

data class GearCategory(val name:String, val icon:String, val total:Int, val ready:Int)
data class CheckItem(val name:String, val state:String)

val gearCategories = listOf(
    GearCategory("Bike & Mobilidade","🚲",3,1),
    GearCategory("Abrigo","⛺",2,0),
    GearCategory("Cozinha","🍳",2,0),
    GearCategory("Água","💧",2,0),
    GearCategory("Energia","⚡",2,0),
    GearCategory("Ferramentas","🔧",5,1),
    GearCategory("Segurança","🦺",4,0),
    GearCategory("Vestuário","👕",1,0),
    GearCategory("Higiene & Saúde","🩹",1,0)
)
val quickChecks = listOf(
    CheckItem("Água abastecida","Pendente"),
    CheckItem("Luzes e celular carregados","Pendente"),
    CheckItem("Pressão dos pneus conferida","Pendente"),
    CheckItem("Freios funcionando","Pendente"),
    CheckItem("Documentos e dinheiro protegidos","Pendente")
)
