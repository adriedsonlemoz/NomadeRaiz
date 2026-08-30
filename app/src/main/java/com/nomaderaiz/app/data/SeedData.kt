package com.nomaderaiz.app.data

data class GearItem(val id:String,val name:String,val category:String,val priority:String="medio",val quantity:Int=1,val price:Double=0.0)
data class GearCategory(val id:String,val name:String,val icon:String)
data class CheckMode(val id:String,val icon:String,val title:String,val description:String,val checks:List<String>)
data class JournalEntry(val id:Long,val place:String,val weather:String,val km:Double,val note:String,val createdAt:Long)
data class SupportPoint(val id:Long,val type:String,val name:String,val reference:String,val note:String,val rating:Int,val closed:Boolean)

val gearCategories=listOf(
 GearCategory("mobilidade","Bike & Mobilidade","🚲"), GearCategory("abrigo","Abrigo","🏕️"),
 GearCategory("cozinha","Cozinha","🍳"), GearCategory("agua","Água","💧"), GearCategory("energia","Energia","⚡"),
 GearCategory("ferramentas","Ferramentas","🧰"), GearCategory("seguranca","Segurança","🦺"),
 GearCategory("vestuario","Vestuário","👕"), GearCategory("higiene","Higiene & Saúde","🩹")
)
val seedItems=listOf(
 GearItem("camara","Câmara de ar reserva","mobilidade","urgente",2), GearItem("remendo","Kit de remendos","ferramentas","urgente"),
 GearItem("bomba","Bomba de ar","ferramentas","urgente"), GearItem("multitool","Multitool / jogo de chaves","ferramentas","urgente"),
 GearItem("espatula","Espátulas de pneu","ferramentas","medio",2), GearItem("elo","Elo rápido da corrente","ferramentas","medio",2),
 GearItem("barraca","Barraca","abrigo","urgente"), GearItem("isolante","Isolante térmico","abrigo"), GearItem("capa-chuva","Capa de chuva","vestuario"),
 GearItem("garrafa","Garrafa / reservatório de água","agua","urgente",2), GearItem("filtro-agua","Filtro ou purificador de água","agua"),
 GearItem("powerbank","Power bank","energia"), GearItem("painel-solar","Painel solar","energia","baixo"), GearItem("lanterna","Lanterna","seguranca","urgente"),
 GearItem("luz-bike","Luzes da bicicleta","seguranca","urgente"), GearItem("colete","Colete refletivo","seguranca","urgente"),
 GearItem("capacete","Capacete","seguranca","urgente"), GearItem("primeiros-socorros","Kit de primeiros socorros","higiene","urgente"),
 GearItem("fogareiro","Fogareiro","cozinha"), GearItem("panela","Panela/caneca","cozinha","baixo")
)
val checkModes=listOf(
 CheckMode("antes-sair","🎒","Antes de sair","Itens essenciais antes de pegar a estrada",listOf("Água abastecida","Luzes e celular carregados","Pressão dos pneus conferida","Freios funcionando","Documentos e dinheiro protegidos")),
 CheckMode("chuva","🌧️","Chuva","Preparação para pedalar e acampar molhado",listOf("Capa de chuva acessível","Eletrônicos protegidos","Freios testados em baixa velocidade","Abrigo seco ou local de parada definido")),
 CheckMode("noite","🌙","Noite","Iluminação, visibilidade e acampamento",listOf("Farol dianteiro funcionando","Luz traseira funcionando","Refletivos visíveis","Rota e local de descanso definidos")),
 CheckMode("manutencao","🔧","Bike","Checagem rápida da bicicleta",listOf("Pneus sem cortes ou objetos presos","Corrente limpa e com tensão normal","Rodas sem folga excessiva","Bagagem presa e equilibrada")),
 CheckMode("emergencia","🆘","Emergência","Documentos, saúde e comunicação",listOf("Kit de primeiros socorros acessível","Contato de emergência disponível","Reserva de bateria disponível","Alguém sabe sua rota aproximada"))
)
