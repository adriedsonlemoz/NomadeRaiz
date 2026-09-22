package com.nomaderaiz.app.data

val equipmentCategories = listOf(
    EquipmentCategory("mobilidade","Bike & Mobilidade","🚲"), EquipmentCategory("abrigo","Abrigo","🏕️"),
    EquipmentCategory("cozinha","Cozinha","🍳"), EquipmentCategory("agua","Água","💧"),
    EquipmentCategory("energia","Energia","⚡"), EquipmentCategory("tecnologia","Tecnologia & Câmeras","📷"),
    EquipmentCategory("ferramentas","Ferramentas","🧰"), EquipmentCategory("seguranca","Segurança","🦺"),
    EquipmentCategory("vestuario","Vestuário","👕"), EquipmentCategory("higiene","Higiene & Saúde","🩹")
)
private fun seed(
    id:String,
    name:String,
    cat:String,
    p:Priority=Priority.MEDIO,
    q:Int=1,
    price:Double=0.0,
    notes:String=""
)=EquipmentItem(id,name,cat,priority=p,quantity=q,price=price,notes=notes)

/**
 * Catálogo econômico de referência para cicloviagem.
 * Os valores são estimativas de anúncios online pesquisados em 21/09/2026 e podem variar.
 * Preços já informados pelo usuário nunca são sobrescritos; valor de referência só preenche zero.
 */
val seedItems = listOf(
    seed("camara","Câmara de ar reserva","mobilidade",Priority.URGENTE,2,16.99,"Referência econômica por unidade; confirme aro, largura e tipo de válvula."),
    seed("remendo","Kit de remendos","ferramentas",Priority.URGENTE,1,11.90,"Kit básico com remendos, cola e lixa."),
    seed("bomba","Bomba de ar portátil","ferramentas",Priority.URGENTE,1,25.64,"Mini bomba manual; confira compatibilidade Presta/Schrader."),
    seed("multitool","Multitool / jogo de chaves","ferramentas",Priority.URGENTE,1,28.09,"Referência de multitool de bike com múltiplas funções."),
    seed("espátula","Espátulas de pneu","ferramentas",Priority.MEDIO,2,6.09,"Preço unitário aproximado com base em par econômico."),
    seed("elo","Elo rápido da corrente","ferramentas",Priority.MEDIO,2,14.71,"Confirme o número de velocidades da corrente antes de comprar."),
    seed("barraca","Barraca","abrigo",Priority.URGENTE),
    seed("saco-dormir","Saco de dormir","abrigo",Priority.URGENTE,1,94.90,"Referência de modelo adulto compacto; escolha faixa térmica adequada ao clima."),
    seed("lona","Lona impermeável 3x4 m","abrigo",Priority.MEDIO,1,78.37,"Lona multiuso para cobertura/abrigo; peso e espessura variam bastante."),
    seed("isolante","Isolante térmico","abrigo"),
    seed("capa-chuva","Capa de chuva","vestuario"),
    seed("garrafa","Garrafa / reservatório de água","agua",Priority.URGENTE,2),
    seed("filtro-agua","Filtro ou purificador de água","agua"),
    seed("powerbank","Power bank 20.000 mAh","energia",Priority.URGENTE,1,45.98,"Referência econômica; confirme capacidade real, USB-C e potência antes da compra."),
    seed("painel-solar","Painel solar portátil 20 W USB","energia",Priority.MEDIO,1,53.71,"Referência econômica; potência real depende de sol, ângulo e controlador."),
    seed("lanterna-cabeca","Lanterna de cabeça USB","seguranca",Priority.URGENTE,1,16.88,"Recarregável; boa como iluminação mãos-livres."),
    seed("lanterna","Lanterna de mão USB","seguranca",Priority.MEDIO,1,17.90,"Referência de lanterna portátil recarregável."),
    seed("luz-bike","Kit de luzes da bicicleta","seguranca",Priority.URGENTE,1,16.90,"Dianteira/traseira; confirme autonomia e resistência à chuva."),
    seed("colete","Colete refletivo","seguranca",Priority.URGENTE),
    seed("capacete","Capacete","seguranca",Priority.URGENTE),
    seed("primeiros-socorros","Kit de primeiros socorros","higiene",Priority.URGENTE),
    seed("fogareiro","Fogareiro portátil","cozinha",Priority.MEDIO,1,25.90,"Referência de modelo dobrável a gás; combustível não incluído."),
    seed("panela","Panela/caneca","cozinha",Priority.BAIXO),
    seed("camera-esp32","ESP32-CAM com câmera OV2640","tecnologia",Priority.MEDIO,1,67.44,"Opção econômica para câmera frontal/projeto Vigia; exige alimentação e integração própria."),
    seed("camera-acao","Mini câmera de ação 1080p","tecnologia",Priority.BAIXO,1,151.05,"Opção dedicada de gravação; confira estabilização, bateria e cartão microSD."),
    seed("esp32","Placa ESP32 DevKit","tecnologia",Priority.BAIXO,1,38.99,"Base para sensores da bicicleta e telemetria."),
    seed("sensor-hall","Sensor Hall A3144 / KY-003","tecnologia",Priority.BAIXO,1,14.99,"Pode medir rotação/velocidade com ímã na roda; normalmente um sensor já basta para velocidade."),
    seed("sensor-temperatura","Sensor de temperatura DS18B20","tecnologia",Priority.BAIXO,1,19.00,"Compatível com ESP32; prefira versão protegida para uso externo.")
)

internal fun mergeEquipmentCatalog(stored:List<EquipmentItem>):List<EquipmentItem>{
    if(stored.isEmpty()) return seedItems
    val defaults=seedItems.associateBy{it.id}
    val merged=stored.map{item->
        val reference=defaults[item.id]
        if(reference!=null && item.price<=0.0 && reference.price>0.0){
            item.copy(
                price=reference.price,
                notes=if(item.notes.isBlank()) reference.notes else item.notes
            )
        } else item
    }
    val present=merged.asSequence().map{it.id}.toHashSet()
    return merged + seedItems.filterNot{it.id in present}
}

val planningGearIds = listOf(
    "bomba","camara","remendo","multitool","espátula","elo",
    "powerbank","painel-solar","lanterna-cabeca","luz-bike",
    "saco-dormir","lona","fogareiro","camera-esp32","camera-acao",
    "esp32","sensor-hall","sensor-temperatura"
)

val checkModes = listOf(
    CheckMode("antes-sair","🎒","Antes de sair","Itens essenciais antes de pegar a estrada", listOf(CheckDefinition("agua","Água abastecida","Saia com água suficiente até o próximo ponto seguro."),CheckDefinition("luzes","Luzes e celular carregados"),CheckDefinition("pneus","Pressão dos pneus conferida"),CheckDefinition("freios","Freios funcionando"),CheckDefinition("documentos","Documentos e dinheiro protegidos"))),
    CheckMode("chuva","🌧️","Chuva","Preparação para pedalar e acampar molhado", listOf(CheckDefinition("capa","Capa de chuva acessível"),CheckDefinition("eletronicos","Eletrônicos protegidos"),CheckDefinition("freios","Freios testados em baixa velocidade"),CheckDefinition("abrigo","Abrigo seco ou local de parada definido"))),
    CheckMode("noite","🌙","Noite","Iluminação, visibilidade e acampamento", listOf(CheckDefinition("farol","Farol dianteiro funcionando"),CheckDefinition("traseira","Luz traseira funcionando"),CheckDefinition("refletivos","Refletivos visíveis"),CheckDefinition("rota","Rota e local de descanso definidos"))),
    CheckMode("manutencao","🔧","Bike","Checagem rápida da bicicleta", listOf(CheckDefinition("pneus","Pneus sem cortes ou objetos presos"),CheckDefinition("corrente","Corrente limpa e com tensão normal"),CheckDefinition("rodas","Rodas sem folga excessiva"),CheckDefinition("carga","Bagagem presa e equilibrada"))),
    CheckMode("emergencia","🆘","Emergência","Documentos, saúde e comunicação", listOf(CheckDefinition("socorros","Kit de primeiros socorros acessível"),CheckDefinition("contato","Contato de emergência disponível"),CheckDefinition("bateria","Reserva de bateria disponível"),CheckDefinition("localizacao","Alguém sabe sua rota aproximada")))
)
val persistentCheckModes=setOf("antes-sair","manutencao")
val suggestedMinimums = mapOf("camara" to 1,"remendo" to 1,"elo" to 1,"garrafa" to 1,"primeiros-socorros" to 1)
val foodConfigs = listOf(
    FoodConfig("arroz","Arroz","🍚",listOf(FoodUnitConfig("kg","kg",7.0,0.2))),
    FoodConfig("aveia","Aveia","🥣",listOf(FoodUnitConfig("kg","kg",14.0,0.12))),
    FoodConfig("macarrao","Macarrão","🍝",listOf(FoodUnitConfig("pct","pacote",5.0,0.5),FoodUnitConfig("kg","kg",10.0,0.2))),
    FoodConfig("sardinha","Sardinha / proteína","🥫",listOf(FoodUnitConfig("un","un.",7.0,1.0))),
    FoodConfig("castanhas","Castanhas / amendoim","🥜",listOf(FoodUnitConfig("kg","kg",24.0,0.1)))
)
val travelTips = listOf(
    TravelTip("agua","💧","Água","Nunca dependa de um único ponto de água","Mantenha sempre uma pequena reserva e reabasteça antes de ficar no limite. Marque uma alternativa de reabastecimento e aumente a margem em regiões quentes, isoladas ou com muita subida."),
    TravelTip("peso","⚖️","Bagagem","Menos peso significa mais autonomia","Revise a bagagem e elimine duplicações. Peso desnecessário aumenta esforço, consumo de água, desgaste da bicicleta e cansaço acumulado."),
    TravelTip("carga","🎒","Bike","Distribua a carga na bicicleta","Mantenha itens pesados baixos e equilibrados entre os lados. Teste a bicicleta carregada antes da viagem."),
    TravelTip("chuva","🌧️","Clima","Proteja primeiro eletrônicos e roupa seca","Priorize celular, documentos, power bank, medicamentos e pelo menos uma troca de roupa seca."),
    TravelTip("rota","🗺️","Navegação","Tenha rota e referências offline","Baixe mapas e salve cidades, mercados, unidades de saúde, oficinas, água e locais de parada antes de ficar sem sinal."),
    TravelTip("energia","🔋","Energia","Não espere a bateria chegar ao fim","Recarregue quando houver oportunidade. Celular, iluminação e navegação podem virar itens de segurança."),
    TravelTip("comida","🍱","Alimentação","Planeje comida por consumo, não só por peso","Compare a quantidade carregada com o consumo diário real para saber quantos dias o alimento vai durar."),
    TravelTip("manutencao","🔧","Manutenção","Resolva pequenos sinais antes que virem pane","Ruídos novos, folgas, marcha pulando e freio diferente do normal merecem atenção. Inspecione pneus, corrente, freios e fixações."),
    TravelTip("ritmo","🚲","Ritmo","Planeje distância com margem para imprevistos","Considere subida, vento, chuva, trânsito, paradas e cansaço acumulado. Não dependa do seu melhor desempenho todos os dias."),
    TravelTip("seguranca","🛡️","Segurança","Tenha um plano B antes de precisar dele","Antes de um trecho isolado, saiba onde parar, pedir ajuda ou mudar a rota e mantenha documentos, dinheiro e comunicação acessíveis.")
)
