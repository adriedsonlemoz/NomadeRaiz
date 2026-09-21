package com.nomaderaiz.app.data

import org.junit.Assert.assertEquals
import org.junit.Test

class PlanningStateTest {
    @Test fun marginActionAlwaysUpdatesLatestSession(){
        val original=PlanningSession(draft=PlanningDraft(km="500",speedKmh="20",hoursPerDay="7"))
        val withMargin=reducePlanning(original,PlanningAction.SetSafetyMargin(20))
        assertEquals(20,withMargin.draft.safetyMarginPercent)
        assertEquals(PlanningPersistence.IMMEDIATE,persistenceFor(PlanningAction.SetSafetyMargin(20)))
    }

    @Test fun laterTextEditCannotEraseSelectedMargin(){
        val withMargin=reducePlanning(PlanningSession(),PlanningAction.SetSafetyMargin(20))
        val edited=reducePlanning(withMargin,PlanningAction.EditDraft{it.copy(destination="Serra",km="500")})
        assertEquals(20,edited.draft.safetyMarginPercent)
        assertEquals("Serra",edited.draft.destination)
        assertEquals(PlanningPersistence.DEBOUNCED,persistenceFor(PlanningAction.EditDraft{it}))
    }

    @Test fun generatedPlanKeepsMarginAndCurrentFields(){
        var session=PlanningSession()
        session=reducePlanning(session,PlanningAction.EditDraft{it.copy(km="500",speedKmh="20",hoursPerDay="7",foodDailyCost="40")})
        session=reducePlanning(session,PlanningAction.SetSafetyMargin(20))
        session=reducePlanning(session,PlanningAction.GeneratePlan)
        assertEquals(20,session.draft.safetyMarginPercent)
        assertEquals("5",session.draft.days)
        assertEquals(session.draft,session.lastGenerated)
        assertEquals(PlanningPersistence.IMMEDIATE,persistenceFor(PlanningAction.GeneratePlan))
    }
}
