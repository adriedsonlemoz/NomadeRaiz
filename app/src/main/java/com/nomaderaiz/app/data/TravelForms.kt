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
    val days: String = "",
    val people: String = "1",
    val km: String = "",
    val dailyKm: String = "",
    val availableMoney: String = "",
    val type: TravelType = TravelType.CICLOVIAGEM,
    val foodForm: Map<String, FoodFormValue> = emptyMap(),
    val waterLiters: String = "",
    val refill: Boolean = false,
    val refillFrequency: String = "",
    val waterPlaces: String = ""
) {
    val pace: RoutePace get() = routePace(km.numberOrNull(), days.numberOrNull(), dailyKm.numberOrNull())
    val issues: List<String> get() = buildList {
        if (days.numberOrNull()?.let { it > 0 } != true) add("Informe a duração em dias, maior que zero.")
        if (people.wholeNumberOrNull()?.let { it > 0 } != true) add("Informe pelo menos uma pessoa, em número inteiro.")
        listOf("Distância" to km, "Meta de pedal" to dailyKm, "Dinheiro" to availableMoney, "Água" to waterLiters).forEach { (label, value) ->
            numberError(value, positive = label == "Meta de pedal")?.let { add("$label: $it") }
        }
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
