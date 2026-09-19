package com.nomaderaiz.app.data

data class FoodFormValue(val unitId: String? = null, val quantity: String = "", val price: String = "", val consumption: String = "")

fun foodInputs(form: Map<String, FoodFormValue>): Map<String, FoodInput> = form.mapValues { (_, v) ->
    FoodInput(v.unitId, v.quantity.numberOrNull() ?: 0.0, v.price.numberOrNull(), v.consumption.numberOrNull())
}

fun foodFormErrors(form: Map<String, FoodFormValue>): List<String> = foodConfigs.flatMap { food ->
    val value = form[food.id] ?: return@flatMap emptyList()
    listOfNotNull(
        numberError(value.quantity)?.let { "${food.name}: quantidade" },
        numberError(value.price)?.let { "${food.name}: preço" },
        numberError(value.consumption, positive = true)?.let { "${food.name}: consumo" }
    )
}

data class PlanningDraft(
    val destination: String = "",
    /** Campo legado preservado para compatibilidade. Novos planos usam o cálculo por ritmo. */
    val days: String = "",
    val people: String = "1",
    val km: String = "",
    /** Meta antiga de km/dia, mantida para não descartar dados de versões anteriores. */
    val dailyKm: String = "",
    val availableMoney: String = "",
    val type: TravelType = TravelType.CICLOVIAGEM,
    val foodForm: Map<String, FoodFormValue> = emptyMap(),
    val waterLiters: String = "",
    val refill: Boolean = false,
    val refillFrequency: String = "",
    val waterPlaces: String = "",
    val speedKmh: String = "20",
    val hoursPerDay: String = "7",
    val safetyMarginPercent: Int = 0,
    /** ISO yyyy-MM-dd. Vazio significa que a data ainda não foi definida. */
    val departureDate: String = "",
    val foodDailyCost: String = "",
    val waterDailyPerPerson: String = "",
    val energyDailyWh: String = ""
) {
    val tripEstimate: TripEstimate?
        get() = estimateTrip(km.numberOrNull(), speedKmh.numberOrNull(), hoursPerDay.numberOrNull(), safetyMarginPercent)

    val planningDays: Double?
        get() = tripEstimate?.days?.toDouble() ?: days.numberOrNull()?.takeIf { it > 0.0 }

    val pace: RoutePace
        get() = routePace(
            km.numberOrNull(),
            planningDays,
            dailyKm.numberOrNull() ?: tripEstimate?.dailyDistanceKm
        )

    fun snapshotForPlanning(): PlanningDraft = copy(days = tripEstimate?.days?.toString() ?: days)

    val issues: List<String>
        get() = buildList {
            val legacyPlan = speedKmh.isBlank() && hoursPerDay.isBlank() && days.numberOrNull()?.let { it > 0 } == true
            if (km.numberOrNull()?.let { it > 0 } != true) add("Informe a distância da viagem, maior que zero.")
            if (!legacyPlan && speedKmh.numberOrNull()?.let { it > 0 } != true) add("Informe a velocidade média de pedal, maior que zero.")
            if (!legacyPlan && hoursPerDay.numberOrNull()?.let { it > 0 } != true) add("Informe quantas horas pretende pedalar por dia.")
            if (people.wholeNumberOrNull()?.let { it > 0 } != true) add("Informe pelo menos uma pessoa, em número inteiro.")

            listOf(
                Triple("Distância", km, true),
                Triple("Velocidade", if (legacyPlan) "" else speedKmh, true),
                Triple("Horas por dia", if (legacyPlan) "" else hoursPerDay, true),
                Triple("Meta de pedal", dailyKm, true),
                Triple("Dinheiro", availableMoney, false),
                Triple("Água carregada", waterLiters, false),
                Triple("Alimentação por dia", foodDailyCost, true),
                Triple("Consumo de água", waterDailyPerPerson, true),
                Triple("Consumo de energia", energyDailyWh, true)
            ).forEach { (label, value, positive) ->
                numberError(value, positive = positive)?.let { add("$label: $it") }
            }
            if (!legacyPlan && km.numberOrNull()?.let { it > 0 } == true && speedKmh.numberOrNull()?.let { it > 0 } == true && hoursPerDay.numberOrNull()?.let { it > 0 } == true && tripEstimate == null) {
                add("Os valores de distância e ritmo são altos demais para calcular com segurança.")
            }
            if (safetyMarginPercent !in 0..50) add("A margem de segurança precisa ficar entre 0% e 50%.")
            if (departureDate.isNotBlank() && parsePlanningDate(departureDate) == null) add("A data de saída informada é inválida.")
            if (refill && refillFrequency.numberOrNull()?.let { it > 0 } != true) add("Informe o intervalo entre reabastecimentos, maior que zero.")
            addAll(foodFormErrors(foodForm).map { "Corrija $it." })
        }
}

data class PlanningSession(val draft: PlanningDraft = PlanningDraft(), val lastGenerated: PlanningDraft? = null)

/** Text is retained verbatim, including incomplete edits, so returning never loses input. */
data class CalculatorDraft(
    val fields: Map<String, String> = mapOf("people" to "1"),
    val foodForm: Map<String, FoodFormValue> = emptyMap(),
    val weightData: Map<String, String> = emptyMap(),
    val refill: Boolean = false
) {
    operator fun get(key: String): String = fields[key].orEmpty()
    fun withField(key: String, value: String) = copy(fields = fields + (key to value))
    val issues: List<String> get() = buildList {
        fields.forEach { (key, value) ->
            if (key != "freq" || refill) numberError(value, whole = key == "people", positive = key in setOf("people", "freq"))?.let { add(key) }
        }
        if (this@CalculatorDraft["people"].wholeNumberOrNull()?.let { it > 0 } != true) add("people")
        if (refill && this@CalculatorDraft["freq"].numberOrNull()?.let { it > 0 } != true) add("freq")
        addAll(foodFormErrors(foodForm))
        weightData.forEach { (id, value) -> if (numberError(value) != null) add(id) }
    }
}
