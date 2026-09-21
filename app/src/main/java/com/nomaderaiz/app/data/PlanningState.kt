package com.nomaderaiz.app.data

/**
 * Ações centralizadas do Planejamento por rotas.
 *
 * A lista de rotas, o editor e a persistência usam uma única fonte de verdade.
 * Isso evita o antigo caminho paralelo draft/lastGenerated e reduz recomposições.
 */
sealed interface PlanningAction {
    data object StartNewRoute : PlanningAction
    data class StartEditRoute(val routeId: String) : PlanningAction
    class EditDraft(val transform: (PlanningDraft) -> PlanningDraft) : PlanningAction
    data class SetSafetyMargin(val percent: Int) : PlanningAction
    data class SaveRoute(val newRouteId: String, val now: Long) : PlanningAction
    data class DeleteRoute(val routeId: String) : PlanningAction
    data class DuplicateRoute(val routeId: String, val newRouteId: String, val now: Long) : PlanningAction
    data object CancelEditing : PlanningAction
}

enum class PlanningPersistence { DEBOUNCED, IMMEDIATE }

fun reducePlanning(workspace: PlanningWorkspace, action: PlanningAction): PlanningWorkspace = when (action) {
    PlanningAction.StartNewRoute -> workspace.copy(editorDraft = PlanningDraft(), editingRouteId = null)

    is PlanningAction.StartEditRoute -> {
        val route = workspace.routes.firstOrNull { it.id == action.routeId }
        if (route == null) workspace else workspace.copy(editorDraft = route.plan, editingRouteId = route.id)
    }

    is PlanningAction.EditDraft -> workspace.copy(editorDraft = action.transform(workspace.editorDraft))

    is PlanningAction.SetSafetyMargin -> workspace.copy(
        editorDraft = workspace.editorDraft.copy(safetyMarginPercent = action.percent.coerceIn(0, 50))
    )

    is PlanningAction.SaveRoute -> {
        val snapshot = workspace.editorDraft.snapshotForPlanning()
        val existingId = workspace.editingRouteId
        val updatedRoutes = if (existingId == null) {
            workspace.routes + PlannedRoute(action.newRouteId, snapshot, action.now, action.now)
        } else {
            workspace.routes.map { route ->
                if (route.id == existingId) route.copy(plan = snapshot, updatedAt = action.now) else route
            }
        }
        workspace.copy(routes = updatedRoutes, editorDraft = PlanningDraft(), editingRouteId = null)
    }

    is PlanningAction.DeleteRoute -> workspace.copy(
        routes = workspace.routes.filterNot { it.id == action.routeId },
        editorDraft = if (workspace.editingRouteId == action.routeId) PlanningDraft() else workspace.editorDraft,
        editingRouteId = if (workspace.editingRouteId == action.routeId) null else workspace.editingRouteId
    )

    is PlanningAction.DuplicateRoute -> {
        val source = workspace.routes.firstOrNull { it.id == action.routeId }
        if (source == null) workspace else {
            val duplicatedPlan = source.plan.copy(
                destination = source.plan.destination.trim().let { if (it.isBlank()) "Cópia da rota" else "$it (cópia)" }
            )
            workspace.copy(
                routes = workspace.routes + PlannedRoute(action.newRouteId, duplicatedPlan, action.now, action.now)
            )
        }
    }

    PlanningAction.CancelEditing -> workspace.copy(editorDraft = PlanningDraft(), editingRouteId = null)
}

fun persistenceFor(action: PlanningAction): PlanningPersistence = when (action) {
    is PlanningAction.EditDraft -> PlanningPersistence.DEBOUNCED
    PlanningAction.StartNewRoute,
    is PlanningAction.StartEditRoute,
    is PlanningAction.SetSafetyMargin,
    is PlanningAction.SaveRoute,
    is PlanningAction.DeleteRoute,
    is PlanningAction.DuplicateRoute,
    PlanningAction.CancelEditing -> PlanningPersistence.IMMEDIATE
}
