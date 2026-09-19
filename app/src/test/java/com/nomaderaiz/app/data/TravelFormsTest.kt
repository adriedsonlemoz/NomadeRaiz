package com.nomaderaiz.app.data

import org.junit.Assert.*
import org.junit.Test

class TravelFormsTest {
    @Test fun acceptsBrazilianAndDecimalDotInputs(){
        assertEquals(12.5,"12,5".numberOrNull()!!,0.0)
        assertEquals(12.5,"12.5".numberOrNull()!!,0.0)
        assertEquals(1234.56,"1.234,56".numberOrNull()!!,0.0)
        assertEquals(0.25," 0,25 ".numberOrNull()!!,0.0)
        assertEquals(1.234,"1.234".numberOrNull()!!,0.0)
    }

    @Test fun rejectsInvalidInputsInsteadOfSilentlyTurningThemIntoZero(){
        listOf("abc","-2","NaN","Infinity","1,2,3","1.2.3","1,234.56","1e3","9".repeat(400)).forEach{assertNull(it.numberOrNull());assertNotNull(numberError(it))}
        assertNull("".numberOrNull())
        assertNull(numberError("")) // An optional empty field is different from malformed input.
        assertEquals(0.0,"0".numberOrNull()!!,0.0)
    }

    @Test fun peopleAndStockDoNotAcceptFractionalOrOverflowingIntegers(){
        assertEquals(2,"2".wholeNumberOrNull())
        listOf("2,5","2.0","-1","999999999999").forEach{assertNull(it.wholeNumberOrNull())}
        assertNotNull(numberError("0",whole=true,positive=true))
        assertNull(numberError("0",whole=true))
    }

    @Test fun dailyAverageAndRidingTargetAllowRestDays(){
        val draft=PlanningDraft(days="20",km="500",dailyKm="50")
        assertEquals(25.0,draft.pace.average!!,0.0)
        assertEquals(10.0,draft.pace.ridingDays!!,0.0)
        assertEquals(true,draft.pace.fits)
        assertTrue(draft.issues.isEmpty())
        assertEquals(false,draft.copy(days="5").pace.fits)
        assertNull(draft.copy(days="0").pace.average)
    }

    @Test fun generationExplainsMissingRequiredFieldsAndInvalidHiddenFood(){
        assertTrue(PlanningDraft().issues.any{it.contains("duração")})
        assertTrue(PlanningDraft(days="2",people="0").issues.any{it.contains("pessoa")})
        assertTrue(PlanningDraft(days="2",refill=true).issues.any{it.contains("intervalo")})
        val draft=PlanningDraft(days="2",foodForm=mapOf("arroz" to FoodFormValue(quantity="2",consumption="0")))
        assertTrue(draft.issues.any{it.contains("consumo")})
    }

    @Test fun planningKeepsOriginalResourceAndReserveRules(){
        val draft=PlanningDraft(days="10",people="2",km="500",dailyKm="50",availableMoney="200",waterLiters="6",refill=true,refillFrequency="1",waterPlaces="Mercado",
            foodForm=mapOf("arroz" to FoodFormValue("kg","2","7","0,2")))
        val equipment=listOf(EquipmentItem("test","Teste","ferramentas",quantity=2,price=30.0))
        val result=buildPlanningResult(draft,equipment)
        assertEquals(60.0,result.pendingCost,0.001)
        assertEquals(28.0,result.foodRequired,0.001)
        assertEquals(8.8,result.reserve,0.001)
        assertEquals(96.8,result.totalCost,0.001)
        assertEquals(5,result.food.days)
        assertEquals(6.0,result.water.consumoDia,0.0)
        assertTrue(result.water.suficientePorIntervalo)
        assertEquals(6,result.summary.size)
    }

    @Test fun calculatorUsesCommaValuesAcrossAllResources(){
        val draft=CalculatorDraft(
            fields=mapOf("people" to "1","speed" to "15,5","hours" to "4","days" to "2,5","waterLiters" to "7,5","available" to "100","dailyExpense" to "10","foodDailyCost" to "15,2","transport" to "20"),
            foodForm=mapOf("castanhas" to FoodFormValue("kg","0,5","24","0,1")),weightData=mapOf("test" to "1,5")
        )
        val result=calculateDraft(draft,listOf(EquipmentItem("test","Teste","ferramentas",quantity=2)))!!
        assertEquals(62.0,result.bike.kmDia,0.0)
        assertEquals(155.0,result.bike.distanciaTotal,0.0)
        assertEquals(2.5,result.water.dias,0.0)
        assertEquals(3.0,result.weight.total,0.0)
        assertEquals(58.0,result.tripCost.total,0.001)
        assertEquals(4,result.completedResources)
        assertNull(calculateDraft(draft.withField("speed","inválido"),emptyList()))
    }

    @Test fun emptyCalculatorDoesNotCountDefaultEnergyAsACompletedResource(){
        val result=calculateDraft(CalculatorDraft(),emptyList())!!
        assertEquals(0,result.completedResources)
        assertNull(result.general.days)
        assertFalse(result.energyEntered)
    }

    @Test fun alertsDistinguishUnconfiguredStockFromAdequateStock(){
        val pending=EquipmentItem("water","Água","agua",quantity=5)
        assertEquals(0,stockStatus(listOf(pending),emptyMap()).monitoredCount)
        assertEquals(0,stockStatus(listOf(pending),mapOf("water" to 0,"deleted" to 8)).monitoredCount)
        assertEquals(listOf(pending),stockStatus(listOf(pending),mapOf("water" to 2)).belowMinimum)
        val adequate=stockStatus(listOf(pending.copy(status=ItemStatus.COMPRADO)),mapOf("water" to 2))
        assertEquals(1,adequate.monitoredCount)
        assertTrue(adequate.belowMinimum.isEmpty())
    }
}
