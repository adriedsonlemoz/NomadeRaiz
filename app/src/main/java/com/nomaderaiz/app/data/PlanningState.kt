package com.nomaderaiz.app.data

/**
 * Ações do Planejamento centralizadas em um único redutor.
 *
 * A UI não grava mais campos ou margem por caminhos paralelos. Toda mudança entra
 * aqui, sempre usando o PlanningSession mais recente como fonte de verdade.
 */
sealed interface PlanningAction {
    class EditDraft(val transform: (PlanningDraft) -> PlanningDraft) : PlanningAction
    data class SetSafetyMargin(val percent: Int) : PlanningAction
    data object GeneratePlan : PlanningAction
}

enum class PlanningPersistence { DEBOUNCED, IMMEDIATE }

fun reducePlanning(session: PlanningSession, action: PlanningAction): PlanningSession = when (action) {
    is PlanningAction.EditDraft -> session.copy(draft = action.transform(session.draft))
    is PlanningAction.SetSafetyMargin -> session.copy(
        draft = session.draft.copy(safetyMarginPercent = action.percent.coerceIn(0, 50))
    )
    PlanningAction.GeneratePlan -> {
        val snapshot = session.draft.snapshotForPlanning()
        session.copy(draft = snapshot, lastGenerated = snapshot)
    }
}

fun persistenceFor(action: PlanningAction): PlanningPersistence = when (action) {
    is PlanningAction.EditDraft -> PlanningPersistence.DEBOUNCED
    is PlanningAction.SetSafetyMargin, PlanningAction.GeneratePlan -> PlanningPersistence.IMMEDIATE
}
