package com.nomaderaiz.app.data

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class DraftPersistenceTest {
    @Test fun draftWritesPreserveExistingPreferenceValues(){
        val context=InstrumentationRegistry.getInstrumentation().targetContext
        val prefs=context.getSharedPreferences("nomade_raiz",0)
        prefs.edit().clear().commit()
        val repo=AppRepository(context)
        repo.saveItems(listOf(EquipmentItem("own","Minha bicicleta","mobilidade",ItemStatus.COMPRADO,quantity=1,price=1500.5)))
        repo.saveJournal(listOf(JournalEntry("day","Serra","☀️",52.5,"Registro",1000)))
        repo.savePoints(listOf(SupportPoint("stop","agua","Água","Mercado","Aberto",3,false)))
        repo.saveChecks("antes-sair",mapOf("agua" to true))
        repo.saveMinimums(mapOf("own" to 1))
        repo.saveFavoriteTips(setOf("agua"))
        repo.saveFavoriteManual(setOf("peca:quadro"))
        repo.saveMasteredSkills(setOf("peca:quadro"))
        repo.saveSettings(AppSettings(accent=AppAccent.LARANJA))
        repo.saveQuickNote("Minha nota")
        val before=prefs.all.toMap()
        val planning=PlanningSession(PlanningDraft(days="20",km="500",dailyKm="50"),PlanningDraft(days="10"))
        val calculator=CalculatorDraft(fields=mapOf("people" to "2","available" to "10,50"))
        repo.savePlanningSession(planning)
        repo.saveCalculatorDraft(calculator)
        before.forEach{(key,value)->assertEquals("Existing key: $key",value,prefs.all[key])}
        val reopened=AppRepository(context)
        assertEquals(planning,reopened.loadPlanningSession())
        assertEquals(calculator,reopened.loadCalculatorDraft())
        reopened.clearAll()
        assertEquals(PlanningSession(),reopened.loadPlanningSession())
        assertEquals(CalculatorDraft(),reopened.loadCalculatorDraft())
    }
}
