package com.nomaderaiz.app.data

private val decimalPattern=Regex("[0-9]+([.,][0-9]+)?")
private val groupedPattern=Regex("[0-9]{1,3}(\\.[0-9]{3})+,[0-9]+")
private val integerPattern=Regex("[0-9]+")
/** Decimal dot or comma; thousands grouping is accepted only when unambiguous. */
fun String.numberOrNull(): Double? {
    val value = trim()
    val normalized = when {
        value.matches(decimalPattern) -> value.replace(',', '.')
        value.matches(groupedPattern) -> value.replace(".", "").replace(',', '.')
        else -> return null
    }
    return normalized.toDoubleOrNull()?.takeIf { it.isFinite() && it >= 0.0 }
}

fun String.wholeNumberOrNull(): Int? = trim().takeIf { it.matches(integerPattern) }?.toIntOrNull()

fun numberError(value: String, whole: Boolean = false, positive: Boolean = false): String? {
    if (value.isBlank()) return null
    val number = if (whole) value.wholeNumberOrNull()?.toDouble() else value.numberOrNull()
    return when {
        number == null -> if (whole) "Use um número inteiro, sem sinal." else "Use um número válido, como 12,5."
        positive && number <= 0.0 -> "Informe um valor maior que zero."
        else -> null
    }
}

data class RoutePace(val average: Double?, val ridingDays: Double?, val fits: Boolean?)

fun routePace(distance: Double?, days: Double?, target: Double?): RoutePace {
    val average = if (distance != null && distance > 0 && days != null && days > 0) distance / days else null
    val ridingDays = if (distance != null && distance > 0 && target != null && target > 0) distance / target else null
    return RoutePace(average, ridingDays, if (ridingDays != null && days != null && days > 0) ridingDays <= days else null)
}
