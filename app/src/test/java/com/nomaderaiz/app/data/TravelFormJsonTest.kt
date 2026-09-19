package com.nomaderaiz.app.data

import org.junit.Assert.*
import org.junit.Test

class TravelFormJsonTest {
    @Test fun planningRoundTripPreservesDraftAndLastGeneratedIndependently(){
        val generated=PlanningDraft("Serra do Rio do Rastro","20","2","500","50","1.500,50",TravelType.LONGA,
            mapOf("arroz" to FoodFormValue("kg","3,5","7,25","0,2")),"6,5",true,"1,5","Mercado\nCamping")
        val session=PlanningSession(generated.copy(destination="Novo destino",days="2,"),generated)
        val restored=TravelFormJson.decodePlanning(TravelFormJson.encodePlanning(session))
        assertEquals(session,restored)
        assertEquals("2,",restored.draft.days)
        assertEquals("20",restored.lastGenerated!!.days)
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

    @Test fun missingOptionalFieldsUseSafeDefaults(){
        val session=TravelFormJson.decodePlanning("""{"draft":{"destination":"Teste","type":"unknown"}}""")
        assertEquals("Teste",session.draft.destination)
        assertEquals(TravelType.CICLOVIAGEM,session.draft.type)
        assertEquals("1",session.draft.people)
        assertNull(session.lastGenerated)
    }
}
