package com.nomaderaiz.app.ui

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.nomaderaiz.app.MainActivity
import com.nomaderaiz.app.data.*
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NavigationUiTest {
    @get:Rule val compose=createAndroidComposeRule<MainActivity>()

    @Before fun freshInstall(){
        val context=InstrumentationRegistry.getInstrumentation().targetContext
        context.getSharedPreferences("nomade_raiz",0).edit().clear().commit()
        compose.activityRule.scenario.recreate()
        compose.waitForIdle()
    }

    private fun assertScreen(name:String){compose.onNodeWithTag("screen-root-$name").assertIsDisplayed()}
    private fun back(){
        compose.activityRule.scenario.onActivity{it.onBackPressedDispatcher.onBackPressed()}
        compose.waitForIdle()
    }
    private fun openMoreModule(name:String){
        compose.onNodeWithTag("more-grid").performScrollToNode(hasTestTag("more-$name"))
        compose.onNodeWithTag("more-$name").performClick()
        assertScreen(name)
    }

    @Test fun repeatedMoreNavigationAndEveryIncludedModuleRemainResponsive(){
        repeat(5){
            compose.onNodeWithTag("nav-More").performClick()
            listOf("Planning","Manual","Calculator","Points","Alerts","Tips","Settings","About").forEach{name->
                openMoreModule(name)
                back()
                assertScreen("More")
            }
            compose.onNodeWithTag("nav-Home").performClick()
            assertScreen("Home")
        }
        repeat(50){
            compose.onNodeWithTag("nav-More").performClick();assertScreen("More")
            compose.onNodeWithTag("nav-Home").performClick();assertScreen("Home")
        }
    }

    private fun openPlanning(){
        compose.onNodeWithTag("nav-More").performClick()
        openMoreModule("Planning")
        compose.onNodeWithTag("planning-routes-list").assertIsDisplayed()
    }

    private fun startNewRoute(){
        compose.onNodeWithTag("planning-create-route").assertIsDisplayed().performClick()
        compose.onNodeWithTag("planning-editor").assertIsDisplayed()
    }

    private fun enterPlanningField(label:String,value:String){
        val matcher=hasSetTextAction() and hasText(label)
        compose.onNodeWithTag("planning-list").performScrollToNode(matcher)
        compose.onNode(matcher).performTextReplacement(value)
    }

    @Test fun planningMarginButtonsPersistImmediatelyInsideNewRoute(){
        openPlanning();startNewRoute()
        val context=InstrumentationRegistry.getInstrumentation().targetContext

        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-margin-20"))
        compose.onNodeWithTag("planning-margin-20").assertHasClickAction().performClick()
        compose.waitUntil(5_000){AppRepository(context).loadPlanningWorkspace().editorDraft.safetyMarginPercent==20}
        assertEquals(20,AppRepository(context).loadPlanningWorkspace().editorDraft.safetyMarginPercent)
        compose.onNodeWithTag("planning-margin-current").assertTextEquals("Margem atual: +20%").assertIsDisplayed()

        compose.onNodeWithTag("planning-margin-10").assertHasClickAction().performClick()
        compose.waitUntil(5_000){AppRepository(context).loadPlanningWorkspace().editorDraft.safetyMarginPercent==10}
        assertEquals(10,AppRepository(context).loadPlanningWorkspace().editorDraft.safetyMarginPercent)
        compose.onNodeWithTag("planning-margin-current").assertTextEquals("Margem atual: +10%").assertIsDisplayed()
    }

    @Test fun savedRouteReturnsToListAndSurvivesActivityRecreation(){
        openPlanning();startNewRoute()
        enterPlanningField("Destino (opcional)","Serra do Rio do Rastro")
        enterPlanningField("Distância prevista","500")
        enterPlanningField("Velocidade média","20")
        enterPlanningField("Horas/dia","7")

        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-margin-20"))
        compose.onNodeWithTag("planning-margin-20").performClick()
        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-resources-toggle"))
        compose.onNodeWithTag("planning-resources-toggle").assertIsDisplayed().performClick()
        enterPlanningField("Alimentação por pessoa/dia","40")
        enterPlanningField("Água por pessoa/dia","3")
        enterPlanningField("Consumo de energia do grupo","25")

        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-advanced-toggle"))
        compose.onNodeWithTag("planning-advanced-toggle").performClick()
        enterPlanningField("Dinheiro disponível","1.500,50")
        compose.onNodeWithTag("save-route").assertIsEnabled().performClick()
        compose.waitForIdle()

        val context=InstrumentationRegistry.getInstrumentation().targetContext
        compose.waitUntil(5_000){AppRepository(context).loadPlanningWorkspace().routes.size==1}
        val before=AppRepository(context).loadPlanningWorkspace()
        assertEquals(1,before.routes.size)
        val route=before.routes.single()

        compose.onNodeWithTag("planning-routes-list").assertIsDisplayed()
        compose.onNodeWithTag("planning-routes-list")
            .performScrollToNode(hasTestTag("planning-route-${route.id}"))
        compose.onNodeWithTag("planning-route-${route.id}").assertIsDisplayed()
        compose.onNodeWithText("Serra do Rio do Rastro").assertIsDisplayed()
        assertEquals(20,route.plan.safetyMarginPercent)
        assertEquals(5,route.plan.tripEstimate!!.days)
        assertEquals("5",route.plan.days)
        assertEquals(1500.5,route.plan.availableMoney.numberOrNull()!!,0.0)
        assertEquals(40.0,route.plan.foodDailyCost.numberOrNull()!!,0.0)
        assertEquals(3.0,route.plan.waterDailyPerPerson.numberOrNull()!!,0.0)
        assertEquals(25.0,route.plan.energyDailyWh.numberOrNull()!!,0.0)

        compose.activityRule.scenario.recreate();compose.waitForIdle()
        assertScreen("Planning")
        compose.onNodeWithTag("planning-routes-list").assertIsDisplayed()
        val after=AppRepository(context).loadPlanningWorkspace()
        assertEquals(before.routes,after.routes)

        compose.onNodeWithTag("planning-routes-list")
            .performScrollToNode(hasTestTag("planning-route-${route.id}"))
        compose.onNodeWithTag("planning-route-${route.id}").assertIsDisplayed().performClick()
        compose.onNodeWithTag("planning-details").assertIsDisplayed()
        compose.onNodeWithTag("planning-details").performScrollToNode(hasText("Resumo da rota"))
        compose.onNodeWithText("Resumo da rota").assertIsDisplayed()
        compose.onNodeWithTag("planning-details").performScrollToNode(hasTestTag("edit-route"))
        compose.onNodeWithTag("edit-route").assertIsDisplayed().performClick()
        compose.onNodeWithTag("planning-editor").assertIsDisplayed()
        compose.onNodeWithTag("planning-list")
            .performScrollToNode(hasTestTag("planning-margin-current"))
        compose.onNodeWithTag("planning-margin-current")
            .assertTextEquals("Margem atual: +20%")
            .assertIsDisplayed()
    }

    @Test fun routeListSupportsMultipleRoutesAndDuplicate(){
        openPlanning();startNewRoute()
        enterPlanningField("Destino (opcional)","Canastra")
        enterPlanningField("Distância prevista","300")
        compose.onNodeWithTag("save-route").assertIsEnabled().performClick()
        compose.waitUntil(5_000){
            AppRepository(InstrumentationRegistry.getInstrumentation().targetContext).loadPlanningWorkspace().routes.size==1
        }

        startNewRoute()
        enterPlanningField("Destino (opcional)","Argentina")
        enterPlanningField("Distância prevista","2000")
        enterPlanningField("Velocidade média","15")
        enterPlanningField("Horas/dia","5")
        compose.onNodeWithTag("save-route").assertIsEnabled().performClick()
        compose.waitUntil(5_000){
            AppRepository(InstrumentationRegistry.getInstrumentation().targetContext).loadPlanningWorkspace().routes.size==2
        }

        val repo=AppRepository(InstrumentationRegistry.getInstrumentation().targetContext)
        val workspace=repo.loadPlanningWorkspace()
        assertEquals(2,workspace.routes.size)
        val argentina=workspace.routes.first{it.plan.destination=="Argentina"}
        compose.onNodeWithTag("planning-routes-list").performScrollToNode(hasTestTag("planning-route-${argentina.id}"))
        compose.onNodeWithTag("planning-route-${argentina.id}").assertIsDisplayed().performClick()
        compose.onNodeWithTag("duplicate-route").performClick()
        compose.waitUntil(5_000){repo.loadPlanningWorkspace().routes.size==3}
        assertEquals(3,repo.loadPlanningWorkspace().routes.size)
        compose.onNodeWithText("Argentina (cópia)").assertIsDisplayed()
    }

    @Test fun equipmentCategoryBackAndOtherMainScreensWork(){
        compose.onNodeWithText("INVENTÁRIO DA VIAGEM").performScrollTo().performClick()
        assertScreen("Gear")
        compose.onNodeWithContentDescription("Abrir Bike & Mobilidade").performClick()
        compose.onNodeWithText("Itens, prioridades e custos").assertIsDisplayed()
        back();compose.onNodeWithText("Organize a carga para a estrada").assertIsDisplayed()
        back();assertScreen("Home")
        compose.onNodeWithTag("nav-Journal").performClick();assertScreen("Journal")
        compose.onNodeWithTag("nav-Home").performClick()
        compose.onNodeWithText("VERIFICAR AGORA").performScrollTo().performClick();assertScreen("Verify")
        back();assertScreen("Home")
    }

    @Test fun settingsAccentFontAndEmptyAlertsRemainUsable(){
        compose.onNodeWithTag("nav-More").performClick()
        openMoreModule("Alerts")
        compose.onNodeWithText("Nenhum mínimo configurado").assertIsDisplayed()
        compose.onNodeWithText("Tudo dentro do mínimo").assertDoesNotExist()
        back();openMoreModule("Settings")
        compose.onNodeWithText("Laranja").performScrollTo().performClick()
        compose.onNodeWithText("A grande").performScrollTo().performClick()
        back();compose.onNodeWithTag("nav-Home").assertIsDisplayed().performClick()
        compose.onNodeWithTag("nav-More").assertIsDisplayed().performClick();openMoreModule("Manual")
        back();assertScreen("More")
    }
}
