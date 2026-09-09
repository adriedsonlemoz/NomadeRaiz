package com.nomaderaiz.app.ui

internal enum class Screen {
    Home,
    Gear,
    Planning,
    Journal,
    More,
    Verify,
    Calculator,
    Points,
    Alerts,
    Tips,
    Manual,
    Backup,
    Settings,
    About
}

internal val topLevelScreens = setOf(
    Screen.Home,
    Screen.Planning,
    Screen.Journal,
    Screen.More
)

/**
 * Estado de navegação pequeno e determinístico.
 *
 * A pilha substitui o antigo destino único de retorno. Assim, cada módulo volta
 * exatamente para a tela que o abriu e abrir o mesmo destino não acumula rotas.
 */
internal data class NavigationState(
    val current: Screen = Screen.Home,
    val backStack: List<Screen> = emptyList()
) {
    val canGoBack: Boolean get() = backStack.isNotEmpty()

    fun selectTopLevel(target: Screen): NavigationState {
        require(target in topLevelScreens) { "$target não é uma tela principal." }
        return if (current == target && backStack.isEmpty()) this
        else NavigationState(current = target)
    }

    fun open(target: Screen): NavigationState {
        if (target == current) return this
        return copy(current = target, backStack = backStack + current)
    }

    fun back(): NavigationState {
        if (backStack.isEmpty()) return this
        return NavigationState(
            current = backStack.last(),
            backStack = backStack.dropLast(1)
        )
    }
}
