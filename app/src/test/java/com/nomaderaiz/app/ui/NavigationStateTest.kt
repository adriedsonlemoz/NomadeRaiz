package com.nomaderaiz.app.ui

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NavigationStateTest {
    @Test
    fun planningToolsReturnThroughPlanningToMore(){
        var state=NavigationState().selectTopLevel(Screen.More).open(Screen.Planning).open(Screen.Points)
        state=state.back()
        assertEquals(Screen.Planning,state.current)
        assertTrue(state.canGoBack)
        state=state.open(Screen.Manual).back().back()
        assertEquals(Screen.More,state.current)
        assertFalse(state.canGoBack)
    }

    @Test
    fun homeMoreInternalBackReturnsToMore() {
        var state=NavigationState()

        state=state.selectTopLevel(Screen.More)
        state=state.open(Screen.Settings)

        assertEquals(Screen.Settings,state.current)
        assertEquals(listOf(Screen.More),state.backStack)

        state=state.back()

        assertEquals(Screen.More,state.current)
        assertFalse(state.canGoBack)
    }

    @Test
    fun everyMoreModuleCanOpenAndCloseRepeatedlyWithoutGrowingStack() {
        var state=NavigationState().selectTopLevel(Screen.More)

        repeat(100){
            moreMenuEntries.forEach{entry->
                state=state.open(entry.destination)
                assertTrue(state.canGoBack)
                state=state.back()
                assertEquals(Screen.More,state.current)
                assertTrue(state.backStack.isEmpty())
            }
        }
    }

    @Test
    fun openingAndClosingMoreRepeatedlyDoesNotCreateHistory() {
        var state=NavigationState()

        repeat(1_000){
            state=state.selectTopLevel(Screen.More)
            assertEquals(Screen.More,state.current)
            assertFalse(state.canGoBack)
            state=state.selectTopLevel(Screen.Home)
        }

        assertEquals(Screen.Home,state.current)
        assertTrue(state.backStack.isEmpty())
    }

    @Test
    fun moreKeepsEveryOriginalDestinationReachable() {
        assertEquals(
            setOf(
                Screen.Planning,
                Screen.Manual,
                Screen.Calculator,
                Screen.Points,
                Screen.Alerts,
                Screen.Backup,
                Screen.Tips,
                Screen.Settings,
                Screen.About
            ),
            moreMenuEntries.map{it.destination}.toSet()
        )
        assertEquals(moreMenuEntries.size,moreMenuEntries.map{it.destination}.distinct().size)
    }

    @Test
    fun selectingAnotherMainTabClearsPreviousDetailHistory() {
        var state=NavigationState().selectTopLevel(Screen.More).open(Screen.Manual)
        state=state.selectTopLevel(Screen.Home)

        assertEquals(Screen.Home,state.current)
        assertFalse(state.canGoBack)
    }
}
