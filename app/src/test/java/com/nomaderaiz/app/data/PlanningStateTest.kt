package com.nomaderaiz.app.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class PlanningStateTest {
    @Test fun marginActionAlwaysUpdatesLatestEditorDraft(){
        val original=PlanningWorkspace(editorDraft=PlanningDraft(km="500",speedKmh="20",hoursPerDay="7"))
        val withMargin=reducePlanning(original,PlanningAction.SetSafetyMargin(20))
        assertEquals(20,withMargin.editorDraft.safetyMarginPercent)
        assertEquals(PlanningPersistence.IMMEDIATE,persistenceFor(PlanningAction.SetSafetyMargin(20)))
    }

    @Test fun laterTextEditCannotEraseSelectedMargin(){
        val withMargin=reducePlanning(PlanningWorkspace(),PlanningAction.SetSafetyMargin(20))
        val edited=reducePlanning(withMargin,PlanningAction.EditDraft{it.copy(destination="Serra",km="500")})
        assertEquals(20,edited.editorDraft.safetyMarginPercent)
        assertEquals("Serra",edited.editorDraft.destination)
        assertEquals(PlanningPersistence.DEBOUNCED,persistenceFor(PlanningAction.EditDraft{it}))
    }

    @Test fun saveCreatesIndependentRouteAndResetsEditor(){
        var state=PlanningWorkspace()
        state=reducePlanning(state,PlanningAction.EditDraft{it.copy(destination="Serra",km="500",speedKmh="20",hoursPerDay="7",foodDailyCost="40")})
        state=reducePlanning(state,PlanningAction.SetSafetyMargin(20))
        state=reducePlanning(state,PlanningAction.SaveRoute("route-1",1000L))
        assertEquals(1,state.routes.size)
        assertEquals("route-1",state.routes.single().id)
        assertEquals(20,state.routes.single().plan.safetyMarginPercent)
        assertEquals("5",state.routes.single().plan.days)
        assertEquals(PlanningDraft(),state.editorDraft)
        assertNull(state.editingRouteId)
    }

    @Test fun editUpdatesOnlySelectedRoute(){
        val first=PlannedRoute("a",PlanningDraft(destination="A",km="100",speedKmh="20",hoursPerDay="5"),1,1)
        val second=PlannedRoute("b",PlanningDraft(destination="B",km="300",speedKmh="20",hoursPerDay="5"),1,1)
        var state=PlanningWorkspace(routes=listOf(first,second))
        state=reducePlanning(state,PlanningAction.StartEditRoute("b"))
        state=reducePlanning(state,PlanningAction.EditDraft{it.copy(destination="B2")})
        state=reducePlanning(state,PlanningAction.SaveRoute("ignored",10L))
        assertEquals("A",state.routes.first{it.id=="a"}.plan.destination)
        assertEquals("B2",state.routes.first{it.id=="b"}.plan.destination)
        assertEquals(10L,state.routes.first{it.id=="b"}.updatedAt)
    }

    @Test fun duplicateCreatesNewIndependentRoute(){
        val source=PlannedRoute("a",PlanningDraft(destination="Argentina",km="2000"),1,1)
        val state=reducePlanning(PlanningWorkspace(routes=listOf(source)),PlanningAction.DuplicateRoute("a","copy",20L))
        assertEquals(2,state.routes.size)
        assertEquals("Argentina (cópia)",state.routes.first{it.id=="copy"}.plan.destination)
    }
}
