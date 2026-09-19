package com.nomaderaiz.app.data

import org.junit.Assert.*
import org.junit.Test

class TravelFormJsonTest {
    @Test fun planningRoundTripPreservesDraftAndLastGeneratedIndependently(){
        val generated=PlanningDraft(
            destination="Serra do Rio do Rastro",days="20",people="2",km="500",dailyKm="50",availableMoney="1.500,50",type=TravelType.LONGA,
            foodForm=mapOf("arroz" to FoodFormValue("kg","3,5","7,25","0,2")),waterLiters="6,5",refill=true,refillFrequency="1,5",waterPlaces="Mercado\nCamping",
            speedKmh="18,5",hoursPerDay="6",safetyMarginPercent=20,departureDate="2026-10-03",foodDailyCost="45",waterDailyPerPerson="3,5",energyDailyWh="28"
        )
        val session=PlanningSession(generated.copy(destination="Novo destino",days="2,"),generated)
        val restored=TravelFormJson.decodePlanning(TravelFormJson.encodePlanning(session))
        assertEquals(session,restored)
        assertEquals("2,",restored.draft.days)
        assertEquals("20",restored.lastGenerated!!.days)
        assertEquals("18,5",restored.lastGenerated!!.speedKmh)
        assertEquals(20,restored.lastGenerated!!.safetyMarginPercent)
        assertEquals("2026-10-03",restored.lastGenerated!!.departureDate)
    }

    @Test fun oldPlanningJsonKeepsLegacyDurationWithoutInventingPace(){
        val restored=TravelFormJson.decodePlanning("""{"schemaVersion":1,"draft":{"destination":"Legado","days":"10","people":"1","km":"300","dailyKm":"30"}}""")
        assertEquals("Legado",restored.draft.destination)
        assertEquals("10",restored.draft.days)
        assertEquals("",restored.draft.speedKmh)
        assertEquals("",restored.draft.hoursPerDay)
        assertEquals(10.0,restored.draft.planningDays!!,0.0)
        assertTrue(restored.draft.issues.isEmpty())
    }

    @Test fun calculatorRoundTripPreservesFoodWeightsAndIncompleteValues(){
        val draft=CalculatorDraft(mapOf("people" to "3","panel" to "20","available" to "15,"),mapOf("macarrao" to FoodFormValue("pct","3","5,5","0,5")),mapOf("item id" to "0,75"),true)
        assertEquals(draft,TravelFormJson.decodeCalculator(TravelFormJson.encodeCalculator(draft)))
    }

    @Test fun firstInstallOrMalformedDraftDoesNotCrashTheApplication(){
        listOf(null,"", "broken json").forEach{
            assertEquals(PlanningSession(),TravelFormJson.decodePlanning(it))
            assertEquals(CalculatorDraft(),TravelFormJson.decodeCalculator(it))
        }
    }

    @Test fun missingOptionalFieldsUseSafeLegacyDefaults(){
        val session=TravelFormJson.decodePlanning("""{"draft":{"destination":"Teste","type":"unknown","days":"2","km":"50"}}""")
        assertEquals("Teste",session.draft.destination)
        assertEquals(TravelType.CICLOVIAGEM,session.draft.type)
        assertEquals("1",session.draft.people)
        assertEquals("",session.draft.speedKmh)
        assertEquals("",session.draft.hoursPerDay)
        assertNull(session.lastGenerated)
    }
}
