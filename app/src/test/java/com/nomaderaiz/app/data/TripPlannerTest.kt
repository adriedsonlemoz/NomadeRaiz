package com.nomaderaiz.app.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class TripPlannerTest {
    @Test fun longRouteSuggestionUsesBalancedSixHourReference(){
        val draft=PlanningDraft(km="2000",speedKmh="15",hoursPerDay="5",safetyMarginPercent=10)
        val suggestion=nomadRouteSuggestion(draft)
        assertNotNull(suggestion)
        assertEquals(6.0,suggestion!!.hoursPerDay,0.0)
        assertEquals(90.0,suggestion.estimate.dailyDistanceKm,0.0)
        assertEquals(25,suggestion.estimate.days)
    }

    @Test fun routeEstimateKeepsUserPaceSeparateFromSuggestion(){
        val draft=PlanningDraft(km="2000",speedKmh="15",hoursPerDay="5",safetyMarginPercent=10)
        assertEquals(30,draft.tripEstimate!!.days)
        assertEquals(25,nomadRouteSuggestion(draft)!!.estimate.days)
        assertEquals("5",draft.hoursPerDay)
    }
}
