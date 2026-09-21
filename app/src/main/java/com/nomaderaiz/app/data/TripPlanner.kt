package com.nomaderaiz.app.data

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.round

/** Resultado leve e determinístico do planejamento por ritmo. */
data class TripEstimate(
    val distanceKm: Double,
    val speedKmh: Double,
    val hoursPerDay: Double,
    val safetyMarginPercent: Int,
    val theoreticalHours: Double,
    val plannedHours: Double,
    val dailyDistanceKm: Double,
    val days: Int,
    val lastDayHours: Double
)

data class TripScenario(
    val label: String,
    val hoursPerDay: Double,
    val dailyDistanceKm: Double,
    val days: Int,
    val lastDayHours: Double
)

data class EssentialResourceEstimate(
    val days: Int,
    val people: Int,
    val foodCost: Double?,
    val waterLiters: Double?,
    val energyWh: Double?
)

fun estimateTrip(distanceKm: Double?, speedKmh: Double?, hoursPerDay: Double?, safetyMarginPercent: Int = 0): TripEstimate? {
    if (distanceKm == null || speedKmh == null || hoursPerDay == null) return null
    if (!distanceKm.isFinite() || !speedKmh.isFinite() || !hoursPerDay.isFinite()) return null
    if (distanceKm <= 0.0 || speedKmh <= 0.0 || hoursPerDay <= 0.0) return null

    val margin = safetyMarginPercent.coerceIn(0, 50)
    val theoreticalHours = distanceKm / speedKmh
    val plannedHours = theoreticalHours * (1.0 + margin / 100.0)
    val dayEstimate = ceil(plannedHours / hoursPerDay)
    if (!theoreticalHours.isFinite() || !plannedHours.isFinite() || !dayEstimate.isFinite() || dayEstimate > Int.MAX_VALUE) return null
    val days = max(1, dayEstimate.toInt())
    val completedBeforeLast = (days - 1) * hoursPerDay
    val lastDayHours = (plannedHours - completedBeforeLast).coerceIn(0.0, hoursPerDay)

    return TripEstimate(
        distanceKm = round1(distanceKm),
        speedKmh = round1(speedKmh),
        hoursPerDay = round1(hoursPerDay),
        safetyMarginPercent = margin,
        theoreticalHours = round1(theoreticalHours),
        plannedHours = round1(plannedHours),
        dailyDistanceKm = round1(speedKmh * hoursPerDay),
        days = days,
        lastDayHours = round1(if (lastDayHours == 0.0) hoursPerDay else lastDayHours)
    )
}

fun planningScenarios(distanceKm: Double?, speedKmh: Double?, safetyMarginPercent: Int): List<TripScenario> {
    val speed = speedKmh?.takeIf { it.isFinite() && it > 0.0 } ?: return emptyList()
    return listOf(
        "Leve" to 4.0,
        "Equilibrado" to 6.0,
        "Longo" to 8.0
    ).mapNotNull { (label, hours) ->
        estimateTrip(distanceKm, speed, hours, safetyMarginPercent)?.let {
            TripScenario(label, hours, it.dailyDistanceKm, it.days, it.lastDayHours)
        }
    }
}

fun essentialResourceEstimate(draft: PlanningDraft): EssentialResourceEstimate? {
    val days = draft.planningDays?.let { ceil(it).toInt() }?.takeIf { it > 0 } ?: return null
    val people = draft.people.wholeNumberOrNull()?.takeIf { it > 0 } ?: return null
    val foodDaily = draft.foodDailyCost.numberOrNull()?.takeIf { it > 0.0 }
    val waterDaily = draft.waterDailyPerPerson.numberOrNull()?.takeIf { it > 0.0 }
    val energyDaily = draft.energyDailyWh.numberOrNull()?.takeIf { it > 0.0 }
    return EssentialResourceEstimate(
        days = days,
        people = people,
        foodCost = foodDaily?.times(people)?.times(days),
        waterLiters = waterDaily?.times(people)?.times(days),
        energyWh = energyDaily?.times(days)
    )
}

private val isoDateFormatter: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE
private val brDateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")

fun parsePlanningDate(value: String): LocalDate? = try {
    if (value.isBlank()) null else LocalDate.parse(value, isoDateFormatter)
} catch (_: DateTimeParseException) {
    null
}

fun formatPlanningDate(value: String): String = parsePlanningDate(value)?.format(brDateFormatter).orEmpty()

fun estimatedArrivalDate(departureDate: String, days: Int): LocalDate? {
    val start = parsePlanningDate(departureDate) ?: return null
    if (days <= 0) return null
    return runCatching { start.plusDays((days - 1).toLong()) }.getOrNull()
}

fun formatPlanningDate(value: LocalDate?): String = value?.format(brDateFormatter).orEmpty()

private fun round1(value: Double): Double = round(value * 10.0) / 10.0

/** Sugestão simples de ritmo para servir como ponto de partida, não como limite físico. */
data class NomadRouteSuggestion(
    val hoursPerDay: Double,
    val estimate: TripEstimate,
    val reason: String
)

fun nomadRouteSuggestion(draft: PlanningDraft): NomadRouteSuggestion? {
    val distance = draft.km.numberOrNull()?.takeIf { it.isFinite() && it > 0 } ?: return null
    val speed = draft.speedKmh.numberOrNull()?.takeIf { it.isFinite() && it > 0 } ?: return null
    val suggestedHours = when {
        distance <= 120.0 -> 4.0
        distance <= 500.0 -> 5.0
        else -> 6.0
    }
    val estimate = estimateTrip(distance, speed, suggestedHours, draft.safetyMarginPercent) ?: return null
    val reason = when {
        distance <= 120.0 -> "Para uma rota curta, 4 h/dia deixa mais espaço para paradas e ajustes no caminho."
        distance <= 500.0 -> "Para essa distância, 5 h/dia é um ponto de partida equilibrado entre avanço e tempo fora da bicicleta."
        else -> "Em uma rota longa, 6 h/dia oferece uma referência equilibrada sem transformar 8 h/dia em padrão obrigatório."
    }
    return NomadRouteSuggestion(suggestedHours, estimate, reason)
}
