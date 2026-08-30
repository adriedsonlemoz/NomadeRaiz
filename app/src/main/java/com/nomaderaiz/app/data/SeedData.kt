package com.nomaderaiz.app.data

val equipmentCategories = listOf(
    EquipmentCategory("mobilidade","Bike & Mobilidade","🚲"), EquipmentCategory("abrigo","Abrigo","🏕️"),
    EquipmentCategory("cozinha","Cozinha","🍳"), EquipmentCategory("agua","Água","💧"),
    EquipmentCategory("energia","Energia","⚡"), EquipmentCategory("ferramentas","Ferramentas","🧰"),
    EquipmentCategory("seguranca","Segurança","🦺"), EquipmentCategory("vestuario","Vestuário","👕"),
    EquipmentCategory("higiene","Higiene & Saúde","🩹")
)
private fun seed(id:String,name:String,cat:String,p:Priority=Priority.MEDIO,q:Int=1)=EquipmentItem(id,name,cat,priority=p,quantity=q)
val seedItems = listOf(
    seed("camara","Câmara de ar reserva","mobilidade",Priority.URGENTE,2), seed("remendo","Kit de remendos","ferramentas",Priority.URGENTE),
    seed("bomba","Bomba de ar","ferramentas",Priority.URGENTE), seed("multitool","Multitool / jogo de chaves","ferramentas",Priority.URGENTE),
    seed("espátula","Espátulas de pneu","ferramentas",q=2), seed("elo","Elo rápido da corrente","ferramentas",q=2),
    seed("barraca","Barraca","abrigo",Priority.URGENTE), seed("isolante","Isolante térmico","abrigo"), seed("capa-chuva","Capa de chuva","vestuario"),
    seed("garrafa","Garrafa / reservatório de água","agua",Priority.URGENTE,2), seed("filtro-agua","Filtro ou purificador de água","agua"),
    seed("powerbank","Power bank","energia"), seed("painel-solar","Painel solar","energia",Priority.BAIXO), seed("lanterna","Lanterna","seguranca",Priority.URGENTE),
    seed("luz-bike","Luzes da bicicleta","seguranca",Priority.URGENTE), seed("colete","Colete refletivo","seguranca",Priority.URGENTE), seed("capacete","Capacete","seguranca",Priority.URGENTE),
    seed("primeiros-socorros","Kit de primeiros socorros","higiene",Priority.URGENTE), seed("fogareiro","Fogareiro","cozinha"), seed("panela","Panela/caneca","cozinha",Priority.BAIXO)
)
val checkModes = listOf(
    CheckMode("antes-sair","🎒","Antes de sair","Itens essenciais antes de pegar a estrada", listOf(CheckDefinition("agua","Água abastecida","Saia com água suficiente até o próximo ponto seguro."),CheckDefinition("luzes","Luzes e celular carregados"),CheckDefinition("pneus","Pressão dos pneus conferida"),CheckDefinition("freios","Freios funcionando"),CheckDefinition("documentos","Documentos e dinheiro protegidos"))),
    CheckMode("chuva","🌧️","Chuva","Preparação para pedalar e acampar molhado", listOf(CheckDefinition("capa","Capa de chuva acessível"),CheckDefinition("eletronicos","Eletrônicos protegidos"),CheckDefinition("freios","Freios testados em baixa velocidade"),CheckDefinition("abrigo","Abrigo seco ou local de parada definido"))),
    CheckMode("noite","🌙","Noite","Iluminação, visibilidade e acampamento", listOf(CheckDefinition("farol","Farol dianteiro funcionando"),CheckDefinition("traseira","Luz traseira funcionando"),CheckDefinition("refletivos","Refletivos visíveis"),CheckDefinition("rota","Rota e local de descanso definidos"))),
    CheckMode("manutencao","🔧","Bike","Checagem rápida da bicicleta", listOf(CheckDefinition("pneus","Pneus sem cortes ou objetos presos"),CheckDefinition("corrente","Corrente limpa e com tensão normal"),CheckDefinition("rodas","Rodas sem folga excessiva"),CheckDefinition("carga","Bagagem presa e equilibrada"))),
    CheckMode("emergencia","🆘","Emergência","Documentos, saúde e comunicação", listOf(CheckDefinition("socorros","Kit de primeiros socorros acessível"),CheckDefinition("contato","Contato de emergência disponível"),CheckDefinition("bateria","Reserva de bateria disponível"),CheckDefinition("localizacao","Alguém sabe sua rota aproximada")))
)
