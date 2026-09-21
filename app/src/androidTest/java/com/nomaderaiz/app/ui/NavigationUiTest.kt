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
            compose.onNodeWithTag("nav-More").performClick()
            assertScreen("More")
            compose.onNodeWithTag("nav-Home").performClick()
            assertScreen("Home")
        }
    }

    @Test fun planningAssistantFieldsSavedPlanAndAdvancedDataSurviveNavigationAndRecreation(){
        compose.onNodeWithTag("nav-More").performClick()
        openMoreModule("Planning")
        compose.onNodeWithTag("generate-plan").assertIsNotEnabled()
        fun enter(label:String,value:String){
            val matcher=hasSetTextAction() and hasText(label)
            compose.onNodeWithTag("planning-list").performScrollToNode(matcher)
            compose.onNode(matcher).performTextReplacement(value)
        }
        enter("Destino (opcional)","Serra do Rio do Rastro")
        enter("Distância prevista","500")
        enter("Velocidade média","20")
        enter("Horas/dia","7")
        enter("Alimentação por pessoa/dia","40")
        enter("Água por pessoa/dia","3")
        enter("Consumo de energia do grupo","25")
        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-margin-20"))
        // A margem é uma escolha discreta: o estado visual deve mudar na mesma
        // interação e o repositório deve enxergar 20 imediatamente. SharedPreferences
        // apply() atualiza a memória de processo antes de retornar, então não há razão
        // para mascarar uma regressão real com polling de cinco segundos.
        compose.onNodeWithTag("planning-margin-20").assertHasClickAction().performClick()
        compose.waitForIdle()
        val context=InstrumentationRegistry.getInstrumentation().targetContext
        // Primeiro prova o efeito funcional do gesto. Assim, se houver nova falha, o
        // log diferencia persistência de uma eventual questão apenas visual/semântica.
        assertEquals("O clique em +20% não atualizou/persistiu a margem",20,AppRepository(context).loadPlanningSession().draft.safetyMarginPercent)
        // A opção selecionada mantém largura/texto estáveis. Reposicionamos o próprio
        // alvo após a recomposição para provar que ele segue visível e selecionado sem
        // depender de um Text filho que possa mudar de linha dentro do FlowRow.
        compose.onNodeWithTag("planning-margin-20")
            .performScrollTo()
            .assertIsDisplayed()
            .assertTextContains("+20%")
            .assertIsSelected()
        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-advanced-toggle"))
        compose.onNodeWithTag("planning-advanced-toggle").performClick()
        enter("Dinheiro disponível","1.500,50")
        compose.onNodeWithTag("generate-plan").assertIsEnabled().performClick()
        compose.waitForIdle()
        back()
        assertScreen("More")
        openMoreModule("Planning")
        compose.activityRule.scenario.recreate()
        compose.waitForIdle()
        assertScreen("Planning")
        val repo=AppRepository(InstrumentationRegistry.getInstrumentation().targetContext)
        val saved=repo.loadPlanningSession()
        assertEquals("Serra do Rio do Rastro",saved.draft.destination)
        assertEquals(1500.5,saved.draft.availableMoney.numberOrNull()!!,0.0)
        assertEquals(20.0,saved.draft.speedKmh.numberOrNull()!!,0.0)
        assertEquals(7.0,saved.draft.hoursPerDay.numberOrNull()!!,0.0)
        assertEquals(20,saved.draft.safetyMarginPercent)
        assertEquals(5,saved.draft.tripEstimate!!.days)
        assertEquals("5",saved.draft.days)
        assertEquals(40.0,saved.draft.foodDailyCost.numberOrNull()!!,0.0)
        assertEquals(3.0,saved.draft.waterDailyPerPerson.numberOrNull()!!,0.0)
        assertEquals(25.0,saved.draft.energyDailyWh.numberOrNull()!!,0.0)
        assertEquals(saved.draft,saved.lastGenerated)
        // Depois de Activity.recreate(), validamos novamente o próprio nó estável da
        // margem. A opção precisa reaparecer visível, clicável e selecionada, enquanto
        // as outras duas opções permanecem explicitamente desmarcadas.
        compose.onNodeWithTag("planning-list").performScrollToNode(hasTestTag("planning-margin-20"))
        compose.waitForIdle()
        compose.onNodeWithTag("planning-margin-20")
            .performScrollTo()
            .assertIsDisplayed()
            .assertHasClickAction()
            .assertTextContains("+20%")
            .assertIsSelected()
        compose.onNodeWithTag("planning-margin-10").assertIsNotSelected()
        compose.onNodeWithTag("planning-margin-0").assertIsNotSelected()
        compose.onNodeWithTag("planning-list").performScrollToIndex(0)
        compose.onNodeWithContentDescription("Voltar").performClick()
        assertScreen("More")
    }

    @Test fun equipmentCategoryBackAndOtherMainScreensWork(){
        compose.onNodeWithText("INVENTÁRIO DA VIAGEM").performScrollTo().performClick()
        assertScreen("Gear")
        compose.onNodeWithContentDescription("Abrir Bike & Mobilidade").performClick()
        compose.onNodeWithText("Itens, prioridades e custos").assertIsDisplayed()
        back()
        compose.onNodeWithText("Organize a carga para a estrada").assertIsDisplayed()
        back()
        assertScreen("Home")
        compose.onNodeWithTag("nav-Journal").performClick()
        assertScreen("Journal")
        compose.onNodeWithTag("nav-Home").performClick()
        compose.onNodeWithText("VERIFICAR AGORA").performScrollTo().performClick()
        assertScreen("Verify")
        back()
        assertScreen("Home")
    }

    @Test fun settingsAccentFontAndEmptyAlertsRemainUsable(){
        compose.onNodeWithTag("nav-More").performClick()
        openMoreModule("Alerts")
        compose.onNodeWithText("Nenhum mínimo configurado").assertIsDisplayed()
        compose.onNodeWithText("Tudo dentro do mínimo").assertDoesNotExist()
        back()
        openMoreModule("Settings")
        compose.onNodeWithText("Laranja").performScrollTo().performClick()
        compose.onNodeWithText("A grande").performScrollTo().performClick()
        back()
        compose.onNodeWithTag("nav-Home").assertIsDisplayed().performClick()
        compose.onNodeWithTag("nav-More").assertIsDisplayed().performClick()
        openMoreModule("Manual")
        back()
        assertScreen("More")
    }
}
