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

/**
 * Mantém no estado somente o valor numérico cru. A separação de milhares é
 * apenas visual, evitando que "100.000" passe a significar 100 durante a edição.
 */
fun normalizeNumericInput(value: String, whole: Boolean = false, previous: String = ""): String {
    if (value.isBlank()) return ""
    val cleaned = value.filter { it.isDigit() || it == ',' || it == '.' }
    if (whole) return cleaned.filter(Char::isDigit)
    if (cleaned.isBlank()) return ""

    // Durante digitação normal (uma inserção/remoção por vez), o separador que o
    // usuário começou a usar continua sendo decimal. Isso evita transformar 1,234
    // em 1234 quando o terceiro decimal é digitado.
    val incremental = previous.isNotEmpty() && kotlin.math.abs(cleaned.length - previous.length) <= 1
    if (incremental) {
        val out = StringBuilder(cleaned.length)
        var separatorSeen = false
        cleaned.forEach { char ->
            when {
                char.isDigit() -> out.append(char)
                !separatorSeen -> {
                    if (out.isEmpty()) out.append('0')
                    out.append(char)
                    separatorSeen = true
                }
            }
        }
        return out.toString()
    }

    val commaIndexes = cleaned.indices.filter { cleaned[it] == ',' }
    val dotIndexes = cleaned.indices.filter { cleaned[it] == '.' }
    val separators = commaIndexes + dotIndexes
    if (separators.isEmpty()) return cleaned.filter(Char::isDigit)

    val decimalIndex = when {
        commaIndexes.isNotEmpty() && dotIndexes.isNotEmpty() -> separators.maxOrNull()
        separators.size > 1 -> {
            val parts = cleaned.split(if (commaIndexes.isNotEmpty()) ',' else '.')
            if (parts.drop(1).all { it.length == 3 }) null else separators.maxOrNull()
        }
        else -> {
            val index = separators.single()
            val before = cleaned.substring(0, index).count(Char::isDigit)
            val after = cleaned.substring(index + 1).count(Char::isDigit)
            if (after == 3 && before in 1..3 && before + after > 3) null else index
        }
    }

    if (decimalIndex == null) return cleaned.filter(Char::isDigit)
    val integer = cleaned.substring(0, decimalIndex).filter(Char::isDigit).ifEmpty { "0" }
    val fraction = cleaned.substring(decimalIndex + 1).filter(Char::isDigit)
    val separator = cleaned[decimalIndex]
    return integer + separator + fraction
}


/** Formata somente para exibição em pt-BR, sem alterar o valor persistido. */
fun groupedNumberForDisplay(value: String): String {
    if (value.isEmpty()) return value
    val separatorIndex = value.indexOfFirst { it == ',' || it == '.' }.let { if (it < 0) value.length else it }
    val integer = value.substring(0, separatorIndex)
    val fraction = if (separatorIndex < value.length) value.substring(separatorIndex + 1) else null
    val grouped = integer.reversed().chunked(3).joinToString(".").reversed()
    return if (fraction != null) "$grouped,$fraction" else grouped
}

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
